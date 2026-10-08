'use server';

import { eq, ne } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { comments, issueComments, issues, notifications, users, issueAuditLogs } from '@/db/schema';
import { ensureEnterpriseSchema } from '@/lib/schemaInit';
import { verifyProjectAccess } from '@/lib/rbac';
import { sendMentionNotificationEmail } from '@/lib/email';

export interface AddCommentResult {
  success: boolean;
  message?: string;
  error?: string;
  commentId?: string;
}

/**
 * Extracts and parses @mentions (both @username and user@domain.com) from comment text.
 * Performs edge case validation:
 * - Self-mention exclusion
 * - Deduplication
 * - Invalid user filtering
 * - Project access verification
 */
export async function extractAndFilterMentionTargets({
  body,
  currentUserId,
  projectId,
}: {
  body: string;
  currentUserId: string;
  projectId?: string | null;
}) {
  const db = getDb();
  await ensureEnterpriseSchema(db);

  // 1. Extract raw matches using required regex patterns
  // Full email addresses
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  // Usernames prefixed with @
  const usernameRegex = /@([a-zA-Z0-9._-]+)/g;

  const foundEmails = Array.from(body.matchAll(emailRegex)).map((m) => m[0].toLowerCase());
  const foundHandles = Array.from(body.matchAll(usernameRegex)).map((m) =>
    m[1].toLowerCase().replace(/[.-]+$/, '')
  );

  if (foundEmails.length === 0 && foundHandles.length === 0) {
    return [];
  }

  // 2. Fetch active candidates from database
  const activeUsers = await db
    .select()
    .from(users)
    .where(ne(users.status, 'SUSPENDED'));

  // 3. Match against users
  const matchedUsersMap = new Map<string, typeof users.$inferSelect>();

  for (const u of activeUsers) {
    const userEmail = u.email.toLowerCase();
    const userEmailLocal = userEmail.split('@')[0];
    const userFullName = u.name.toLowerCase().replace(/\s+/g, '');
    const userDottedName = u.name.toLowerCase().replace(/\s+/g, '.');
    const userFirstName = u.name.toLowerCase().split(/\s+/)[0];

    const isEmailMatch = foundEmails.includes(userEmail);
    const isHandleMatch = foundHandles.some(
      (h) =>
        h === userEmail ||
        h === userEmailLocal ||
        h === userFullName ||
        h === userDottedName ||
        h === userFirstName
    );

    if (isEmailMatch || isHandleMatch) {
      matchedUsersMap.set(u.id, u);
    }
  }

  // 4. Edge Cases:
  // - Self-Mention Exclusion: If author.id === targetUser.id, omit them immediately.
  matchedUsersMap.delete(currentUserId);

  if (matchedUsersMap.size === 0) {
    return [];
  }

  // - Project Access Verification: Only users who are members of the issue's project (or Workspace Admins/CTO) receive notifications
  const verifiedTargets: (typeof users.$inferSelect)[] = [];

  for (const targetUser of Array.from(matchedUsersMap.values())) {
    if (projectId) {
      try {
        const hasAccess = await verifyProjectAccess(targetUser.id, projectId);
        if (!hasAccess) {
          continue;
        }
      } catch {
        const roleStr = String(targetUser.role || '');
        const isAdmin = roleStr.toUpperCase() === 'ADMIN';
        if (!isAdmin) continue;
      }
    }
    verifiedTargets.push(targetUser);
  }

  return verifiedTargets;
}

/**
 * Server action to post a comment on an issue, dispatch in-app notifications,
 * and asynchronously trigger email delivery for @mentioned members.
 */
export async function addCommentAction(issueKey: string, body: string): Promise<AddCommentResult> {
  try {
    const currentUser = await requireRole(['Admin', 'Member']);
    const trimmedBody = body.trim();
    if (!trimmedBody) {
      return { success: false, error: 'Comment body cannot be empty' };
    }

    const db = getDb();
    await ensureEnterpriseSchema(db);

    // 1. Fetch issue metadata
    const issue = await db.query.issues.findFirst({
      where: eq(issues.key, issueKey),
    });

    if (!issue) {
      return { success: false, error: `Issue ${issueKey} not found` };
    }

    const commentId = `c-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date();
    const nowIso = now.toISOString();

    // 2. Persist comment to both comments and issueComments tables for schema compatibility
    try {
      await db.insert(comments).values({
        id: commentId,
        issueKey,
        authorId: currentUser.id,
        body: trimmedBody,
        createdAt: now,
      });
    } catch {
      // Table may vary by migration
    }

    try {
      await db.insert(issueComments).values({
        id: commentId,
        issueId: issueKey,
        authorId: currentUser.id,
        body: trimmedBody,
        createdAt: now,
        updatedAt: now,
      });
    } catch {
      // Table may vary by migration
    }

    // 3. Log audit event
    try {
      await db.insert(issueAuditLogs).values({
        id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        issueId: issueKey,
        actorId: currentUser.id,
        fieldChanged: 'Comment Added',
        oldValue: null,
        newValue: trimmedBody.slice(0, 100),
        createdAt: now,
      });
    } catch {
      // Ignore
    }

    // 4. Parse mentions & resolve valid targets
    const validTargets = await extractAndFilterMentionTargets({
      body: trimmedBody,
      currentUserId: currentUser.id,
      projectId: issue.projectId,
    });

    const commentSnippet =
      trimmedBody.length > 150 ? `${trimmedBody.slice(0, 147)}...` : trimmedBody;

    // 5. In-App Notifications
    if (validTargets.length > 0) {
      const notifRows = validTargets.map((target) => ({
        id: `n-${Date.now()}-${target.id.slice(0, 5)}-${Math.random().toString(36).substring(2, 6)}`,
        userId: target.id,
        authorId: currentUser.id,
        issueId: issueKey,
        title: `${currentUser.name} mentioned you on ${issueKey}`,
        message: `${currentUser.name} mentioned you in ${issueKey}: "${commentSnippet}"`,
        linkUrl: `/?issue=${issueKey}`,
        read: false,
        createdAt: nowIso,
      }));

      for (const row of notifRows) {
        try {
          await db.insert(notifications).values(row);
        } catch (nErr) {
          console.warn('[NotificationInsert] Error inserting notification row:', nErr);
        }
      }

      // 6. Asynchronous / Non-Blocking Email Dispatch
      const baseUrl =
        process.env.NEXTAUTH_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        'https://apex.harisarshad.site';
      const issueUrl = `${baseUrl.replace(/\/$/, '')}/?issue=${issueKey}`;

      // Fire and forget in the background; never blocks comment creation or in-app notification
      (async () => {
        try {
          await Promise.allSettled(
            validTargets.map(async (target) => {
              try {
                await sendMentionNotificationEmail({
                  to: target.email,
                  recipientName: target.name,
                  actorName: currentUser.name,
                  issueKey,
                  issueTitle: issue.title || issueKey,
                  commentSnippet,
                  issueUrl,
                });
              } catch (sendErr) {
                console.error(`[MentionEmail] Failed to send to ${target.email}:`, sendErr);
              }
            })
          );
        } catch (dispatchErr) {
          console.error('[MentionEmail] Background dispatch error:', dispatchErr);
        }
      })();
    }

    revalidatePath('/');
    return { success: true, message: 'Comment saved', commentId };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to add comment';
    return { success: false, error: message };
  }
}

// Export alias
export { addCommentAction as addComment };
