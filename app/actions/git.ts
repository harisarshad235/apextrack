'use server';

import { revalidatePath } from 'next/cache';
import { eq, desc, and } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { ensureEnterpriseSchema } from '@/lib/schemaInit';
import { issues, issueGitLinks } from '@/db/schema';
import { logIssueAudit } from './issues';

export interface GitRefInput {
  issueId: string;
  provider?: string;
  repoFullName: string;
  refType: 'BRANCH' | 'PULL_REQUEST' | 'COMMIT';
  refName: string;
  url: string;
  status?: 'OPEN' | 'MERGED' | 'CLOSED';
}

export async function getIssueGitLinksAction(issueId: string) {
  try {
    const db = getDb();
    await ensureEnterpriseSchema(db);

    const links = await db
      .select()
      .from(issueGitLinks)
      .where(eq(issueGitLinks.issueId, issueId))
      .orderBy(desc(issueGitLinks.createdAt));

    return { success: true, links };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch git links', links: [] };
  }
}

export async function linkGitRefAction(data: GitRefInput) {
  try {
    const currentUser = await requireRole(['Admin', 'Member']);
    const db = getDb();
    await ensureEnterpriseSchema(db);

    const targetIssue = await db.query.issues.findFirst({
      where: eq(issues.key, data.issueId.toUpperCase()),
    });

    if (!targetIssue) {
      return { success: false, error: `Issue ${data.issueId} not found.` };
    }

    const id = `git-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    // Upsert or insert git link
    const existing = await db
      .select()
      .from(issueGitLinks)
      .where(
        and(
          eq(issueGitLinks.issueId, targetIssue.key),
          eq(issueGitLinks.repoFullName, data.repoFullName),
          eq(issueGitLinks.refName, data.refName)
        )
      );

    if (existing.length > 0) {
      await db
        .update(issueGitLinks)
        .set({
          status: data.status || existing[0].status,
          url: data.url,
        })
        .where(eq(issueGitLinks.id, existing[0].id));
    } else {
      await db.insert(issueGitLinks).values({
        id,
        issueId: targetIssue.key,
        provider: data.provider || 'GITHUB',
        repoFullName: data.repoFullName,
        refType: data.refType,
        refName: data.refName,
        url: data.url,
        status: data.status || 'OPEN',
      });
    }

    await logIssueAudit(db, {
      issueId: targetIssue.key,
      actorId: currentUser.id,
      fieldChanged: 'git_link_added',
      oldValue: null,
      newValue: `${data.refType}: ${data.refName} (${data.status || 'OPEN'})`,
    });

    revalidatePath('/');
    return { success: true, message: `Linked ${data.refType} "${data.refName}" to ${targetIssue.key}` };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to link git ref' };
  }
}

export async function unlinkGitRefAction(gitLinkId: string) {
  try {
    await requireRole(['Admin', 'Member']);
    const db = getDb();
    await ensureEnterpriseSchema(db);

    await db.delete(issueGitLinks).where(eq(issueGitLinks.id, gitLinkId));

    revalidatePath('/');
    return { success: true, message: 'Git link removed.' };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to remove git link' };
  }
}

/**
 * Ingest GitHub webhooks:
 * Parses issue keys matching regex `[A-Z]{2,10}-[0-9]+` from branch names, commit messages, and PR titles.
 * Upserts records into issue_git_links and logs branch creation / PR status changes in the issue audit trail.
 */
export async function syncGithubWebhookAction(payload: any) {
  try {
    const db = getDb();
    await ensureEnterpriseSchema(db);

    const KEY_REGEX = /([A-Z]{2,10}-[0-9]+)/g;
    const repoFullName = payload.repository?.full_name || 'unknown/repo';

    const affectedKeys = new Set<string>();

    // 1. Branch creation
    if (payload.ref_type === 'branch' && payload.ref) {
      const branchName = payload.ref;
      const matches = branchName.match(KEY_REGEX);
      if (matches) {
        matches.forEach((k: string) => affectedKeys.add(k.toUpperCase()));
        for (const issueKey of matches) {
          const keyUpper = issueKey.toUpperCase();
          const targetIssue = await db.query.issues.findFirst({
            where: eq(issues.key, keyUpper),
          });
          if (targetIssue) {
            await db.insert(issueGitLinks).values({
              id: `git-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              issueId: keyUpper,
              provider: 'GITHUB',
              repoFullName,
              refType: 'BRANCH',
              refName: branchName,
              url: payload.repository?.html_url ? `${payload.repository.html_url}/tree/${branchName}` : branchName,
              status: 'OPEN',
            });

            await logIssueAudit(db, {
              issueId: keyUpper,
              actorId: targetIssue.reporterId || 'system-github',
              fieldChanged: 'github_branch_created',
              oldValue: null,
              newValue: `Branch ${branchName}`,
            });
          }
        }
      }
    }

    // 2. Pull Request event
    if (payload.pull_request) {
      const pr = payload.pull_request;
      const prTitle = pr.title || '';
      const headBranch = pr.head?.ref || '';
      const textToScan = `${prTitle} ${headBranch}`;
      const matches = textToScan.match(KEY_REGEX);

      if (matches) {
        const prStatus = pr.merged ? 'MERGED' : pr.state === 'closed' ? 'CLOSED' : 'OPEN';
        for (const issueKey of matches) {
          const keyUpper = issueKey.toUpperCase();
          const targetIssue = await db.query.issues.findFirst({
            where: eq(issues.key, keyUpper),
          });

          if (targetIssue) {
            const existing = await db
              .select()
              .from(issueGitLinks)
              .where(
                and(
                  eq(issueGitLinks.issueId, keyUpper),
                  eq(issueGitLinks.refName, `#${pr.number}`)
                )
              );

            if (existing.length > 0) {
              await db
                .update(issueGitLinks)
                .set({
                  status: prStatus,
                  url: pr.html_url || existing[0].url,
                })
                .where(eq(issueGitLinks.id, existing[0].id));
            } else {
              await db.insert(issueGitLinks).values({
                id: `git-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                issueId: keyUpper,
                provider: 'GITHUB',
                repoFullName,
                refType: 'PULL_REQUEST',
                refName: `#${pr.number} - ${prTitle.slice(0, 50)}`,
                url: pr.html_url,
                status: prStatus,
              });
            }

            await logIssueAudit(db, {
              issueId: keyUpper,
              actorId: targetIssue.assigneeId || targetIssue.reporterId || 'system-github',
              fieldChanged: 'github_pr_updated',
              oldValue: null,
              newValue: `PR #${pr.number} (${prStatus}): ${prTitle}`,
            });
          }
        }
      }
    }

    // 3. Commits (push event)
    if (Array.isArray(payload.commits)) {
      for (const commit of payload.commits) {
        const commitMsg = commit.message || '';
        const matches = commitMsg.match(KEY_REGEX);
        if (matches) {
          for (const issueKey of matches) {
            const keyUpper = issueKey.toUpperCase();
            const targetIssue = await db.query.issues.findFirst({
              where: eq(issues.key, keyUpper),
            });
            if (targetIssue) {
              const shortId = (commit.id || '').substring(0, 7);
              await db.insert(issueGitLinks).values({
                id: `git-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                issueId: keyUpper,
                provider: 'GITHUB',
                repoFullName,
                refType: 'COMMIT',
                refName: shortId,
                url: commit.url || '',
                status: 'MERGED',
              });

              await logIssueAudit(db, {
                issueId: keyUpper,
                actorId: targetIssue.assigneeId || 'system-github',
                fieldChanged: 'github_commit_pushed',
                oldValue: null,
                newValue: `${shortId}: ${commitMsg.slice(0, 80)}`,
              });
            }
          }
        }
      }
    }

    revalidatePath('/');
    return { success: true, count: affectedKeys.size };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to sync webhook' };
  }
}
