'use server';

import { eq, and, desc, inArray, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { notifications, users } from '@/db/schema';
import { ensureEnterpriseSchema } from '@/lib/schemaInit';

export interface EnrichedNotification {
  id: string;
  userId: string;
  authorId: string | null;
  issueId: string | null;
  title: string | null;
  message: string;
  linkUrl: string | null;
  read: boolean;
  createdAt: string;
  author?: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    role: string;
  } | null;
}

/**
 * Queries in-app notifications for the authenticated user ordered by created_at DESC.
 * Returns unread count and enriched notification list.
 */
export async function getUserNotificationsAction({
  limit = 20,
  unreadOnly = false,
}: {
  limit?: number;
  unreadOnly?: boolean;
} = {}): Promise<{
  success: boolean;
  error?: string;
  notifications: EnrichedNotification[];
  unreadCount: number;
}> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized', notifications: [], unreadCount: 0 };
    }

    const db = getDb();
    await ensureEnterpriseSchema(db);

    // 1. Calculate unread count
    const unreadRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(eq(notifications.userId, user.id), eq(notifications.read, false)));
    const unreadCount = Number(unreadRes[0]?.count || 0);

    // 2. Fetch notifications list
    const conditions = [eq(notifications.userId, user.id)];
    if (unreadOnly) {
      conditions.push(eq(notifications.read, false));
    }

    const rows = await db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);

    // 3. Enrich with author info for avatars
    const authorIds = Array.from(new Set(rows.map((r) => r.authorId).filter(Boolean))) as string[];
    let authorMap = new Map<string, typeof users.$inferSelect>();
    if (authorIds.length > 0) {
      const authorList = await db.select().from(users).where(inArray(users.id, authorIds));
      authorMap = new Map(authorList.map((u) => [u.id, u]));
    }

    const enriched: EnrichedNotification[] = rows.map((n) => {
      const author = n.authorId ? authorMap.get(n.authorId) : null;
      return {
        id: n.id,
        userId: n.userId,
        authorId: n.authorId,
        issueId: n.issueId,
        title: n.title || (n.issueId ? `Mentioned on ${n.issueId}` : 'ApexTrack Alert'),
        message: n.message,
        linkUrl: n.linkUrl || (n.issueId ? `/?issue=${n.issueId}` : '/'),
        read: Boolean(n.read),
        createdAt: n.createdAt,
        author: author
          ? {
              id: author.id,
              name: author.name,
              email: author.email,
              avatarUrl: author.avatarUrl,
              role: author.role,
            }
          : null,
      };
    });

    return {
      success: true,
      notifications: enriched,
      unreadCount,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch notifications';
    return { success: false, error: msg, notifications: [], unreadCount: 0 };
  }
}

/**
 * Marks a specific notification as read.
 */
export async function markNotificationAsReadAction(
  notificationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const db = getDb();
    await ensureEnterpriseSchema(db);

    await db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, user.id)));

    revalidatePath('/');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update notification';
    return { success: false, error: msg };
  }
}

/**
 * Marks all unread notifications for current user as read.
 */
export async function markAllNotificationsAsReadAction(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const db = getDb();
    await ensureEnterpriseSchema(db);

    await db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.userId, user.id), eq(notifications.read, false)));

    revalidatePath('/');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to mark all as read';
    return { success: false, error: msg };
  }
}

/**
 * Deletes / clears the specified notification record.
 */
export async function clearNotificationAction(
  notificationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const db = getDb();
    await ensureEnterpriseSchema(db);

    await db
      .delete(notifications)
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, user.id)));

    revalidatePath('/');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete notification';
    return { success: false, error: msg };
  }
}
