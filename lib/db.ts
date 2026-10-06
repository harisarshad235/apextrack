import 'server-only';
import { cache } from 'react';
import { drizzle } from 'drizzle-orm/d1';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import * as schema from '@/db/schema';

/**
 * Per-request Drizzle client bound to the Cloudflare D1 `apextrack_db` binding.
 * Works in `next dev` (via initOpenNextCloudflareForDev → local Miniflare D1)
 * and in production on Cloudflare Workers/Pages.
 */
export const getDb = cache(() => {
  const { env } = getCloudflareContext();
  const d1 = (env as any).apextrack_db || (env as any).DB;
  return drizzle(d1, { schema });
});

export const getBucket = cache(() => {
  const { env } = getCloudflareContext();
  return (env as any).ATTACHMENTS;
});

export type Db = ReturnType<typeof getDb>;
