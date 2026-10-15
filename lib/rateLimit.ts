import 'server-only';

import { sql } from 'drizzle-orm';
import { headers } from 'next/headers';
import { getDb } from './db';

let rateLimitTableInitialized = false;

// Fast in-memory edge isolate cache
const memoryRateLimits = new Map<string, { count: number; resetAt: number }>();

/**
 * Ensures rate_limits table exists in Cloudflare D1.
 */
async function ensureRateLimitTable(db: ReturnType<typeof getDb>) {
  if (rateLimitTableInitialized) return;
  try {
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS rate_limits (
        key TEXT PRIMARY KEY NOT NULL,
        count INTEGER NOT NULL DEFAULT 1,
        reset_at INTEGER NOT NULL
      )
    `);
    await db.run(sql`
      CREATE INDEX IF NOT EXISTS idx_rate_limits_reset ON rate_limits(reset_at)
    `);
    rateLimitTableInitialized = true;
  } catch {
    // Ignore if table exists
  }
}

/**
 * Extracts real client IP address from Cloudflare and edge proxy headers.
 */
export async function getClientIp(): Promise<string> {
  try {
    const reqHeaders = await headers();
    const cfIp = reqHeaders.get('cf-connecting-ip');
    if (cfIp) return cfIp.trim();

    const xForwarded = reqHeaders.get('x-forwarded-for');
    if (xForwarded) {
      const firstIp = xForwarded.split(',')[0].trim();
      if (firstIp) return firstIp;
    }

    const xReal = reqHeaders.get('x-real-ip');
    if (xReal) return xReal.trim();
  } catch {}

  return '127.0.0.1';
}

export interface RateLimitResult {
  success: boolean;
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

/**
 * Checks and increments rate limit counter for a specific key.
 * Uses atomic D1 queries and in-memory isolate caching.
 *
 * @param key Unique rate limit key (e.g. `login:192.168.1.1` or `pwd_reset:user@domain.com`)
 * @param limit Maximum allowed attempts within the window
 * @param windowSeconds Time window in seconds
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const now = Date.now();
  const resetAt = now + windowSeconds * 1000;

  // 1. Check in-memory isolate cache first
  const memEntry = memoryRateLimits.get(key);
  if (memEntry) {
    if (now < memEntry.resetAt) {
      if (memEntry.count >= limit) {
        return {
          success: false,
          allowed: false,
          limit,
          remaining: 0,
          resetAt: memEntry.resetAt,
        };
      }
      memEntry.count += 1;
    } else {
      memEntry.count = 1;
      memEntry.resetAt = resetAt;
    }
  } else {
    memoryRateLimits.set(key, { count: 1, resetAt });
  }

  // Clean stale in-memory items periodically (cap cache size)
  if (memoryRateLimits.size > 2000) {
    for (const [k, v] of memoryRateLimits.entries()) {
      if (now >= v.resetAt) memoryRateLimits.delete(k);
    }
  }

  // 2. Persist & sync across Cloudflare D1 distributed database
  try {
    const db = getDb();
    await ensureRateLimitTable(db);

    const record = await db.all<{ key: string; count: number; reset_at: number }>(sql`
      SELECT key, count, reset_at FROM rate_limits WHERE key = ${key} LIMIT 1
    `);

    if (record && record.length > 0) {
      const current = record[0];
      if (now < current.reset_at) {
        if (current.count >= limit) {
          return {
            success: false,
            allowed: false,
            limit,
            remaining: 0,
            resetAt: current.reset_at,
          };
        }

        // Increment count
        await db.run(sql`
          UPDATE rate_limits SET count = count + 1 WHERE key = ${key}
        `);

        return {
          success: true,
          allowed: true,
          limit,
          remaining: Math.max(0, limit - (current.count + 1)),
          resetAt: current.reset_at,
        };
      } else {
        // Reset window expired
        await db.run(sql`
          UPDATE rate_limits SET count = 1, reset_at = ${resetAt} WHERE key = ${key}
        `);

        return {
          success: true,
          allowed: true,
          limit,
          remaining: limit - 1,
          resetAt,
        };
      }
    } else {
      // First attempt
      await db.run(sql`
        INSERT INTO rate_limits (key, count, reset_at) VALUES (${key}, 1, ${resetAt})
      `);

      return {
        success: true,
        allowed: true,
        limit,
        remaining: limit - 1,
        resetAt,
      };
    }
  } catch (err) {
    // If D1 query encounters a transient error, rely on in-memory result to maintain availability
    const fallbackCount = memoryRateLimits.get(key)?.count || 1;
    const isAllowed = fallbackCount <= limit;
    return {
      success: isAllowed,
      allowed: isAllowed,
      limit,
      remaining: Math.max(0, limit - fallbackCount),
      resetAt,
    };
  }
}
