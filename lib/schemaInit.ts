import 'server-only';
import { sql } from 'drizzle-orm';
import { getDb } from './db';

let enterpriseSchemaInitialized = false;

/**
 * Ensures enterprise Jira schemas, tables, columns, and indexes exist in Cloudflare D1.
 * Self-healing edge SQLite migration for zero-downtime deployment.
 */
export async function ensureEnterpriseSchema(dbInstance?: ReturnType<typeof getDb>) {
  if (enterpriseSchemaInitialized) return;
  const db = dbInstance || getDb();

  // 1. Column additions to `issues` table
  const columnsToAdd = [
    sql`ALTER TABLE issues ADD COLUMN parent_issue_id TEXT`,
    sql`ALTER TABLE issues ADD COLUMN issue_type TEXT NOT NULL DEFAULT 'TASK'`,
    sql`ALTER TABLE issues ADD COLUMN epic_color TEXT DEFAULT '#3B82F6'`,
    sql`ALTER TABLE issues ADD COLUMN original_estimate_hours REAL`,
    sql`ALTER TABLE issues ADD COLUMN remaining_estimate_hours REAL`,
    sql`ALTER TABLE issue_links ADD COLUMN link_type TEXT NOT NULL DEFAULT 'RELATES_TO'`,
    sql`ALTER TABLE issue_links ADD COLUMN created_at INTEGER DEFAULT (unixepoch() * 1000)`,
    sql`ALTER TABLE notifications ADD COLUMN title TEXT`,
    sql`ALTER TABLE notifications ADD COLUMN link_url TEXT`,
    sql`ALTER TABLE users ADD COLUMN auth_provider TEXT DEFAULT 'CREDENTIALS'`,
    sql`ALTER TABLE users ADD COLUMN provider_id TEXT`,
  ];

  for (const alterSql of columnsToAdd) {
    try {
      await db.run(alterSql);
    } catch {
      // Column may already exist
    }
  }

  // 2. Table creations
  try {
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS issue_comments (
        id TEXT PRIMARY KEY NOT NULL,
        issue_id TEXT NOT NULL REFERENCES issues(key) ON DELETE CASCADE,
        author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        body TEXT NOT NULL,
        created_at INTEGER DEFAULT (unixepoch() * 1000) NOT NULL,
        updated_at INTEGER DEFAULT (unixepoch() * 1000) NOT NULL
      )
    `);
  } catch {
    // Ignore
  }

  try {
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS issue_audit_logs (
        id TEXT PRIMARY KEY NOT NULL,
        issue_id TEXT NOT NULL REFERENCES issues(key) ON DELETE CASCADE,
        actor_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        field_changed TEXT NOT NULL,
        old_value TEXT,
        new_value TEXT,
        created_at INTEGER DEFAULT (unixepoch() * 1000) NOT NULL
      )
    `);
  } catch {
    // Ignore
  }

  try {
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS project_workflow_statuses (
        id TEXT PRIMARY KEY NOT NULL,
        project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'TODO',
        position INTEGER NOT NULL DEFAULT 0,
        wip_limit INTEGER NOT NULL DEFAULT 0,
        is_initial INTEGER NOT NULL DEFAULT 0,
        is_final INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER DEFAULT (unixepoch() * 1000) NOT NULL
      )
    `);
  } catch {
    // Ignore
  }

  try {
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS workflow_transition_rules (
        id TEXT PRIMARY KEY NOT NULL,
        project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        from_status_id TEXT,
        to_status_id TEXT NOT NULL,
        require_assignee INTEGER NOT NULL DEFAULT 0,
        require_all_subtasks_complete INTEGER NOT NULL DEFAULT 0,
        require_resolution_comment INTEGER NOT NULL DEFAULT 0
      )
    `);
  } catch {
    // Ignore
  }

  try {
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS issue_git_links (
        id TEXT PRIMARY KEY NOT NULL,
        issue_id TEXT NOT NULL REFERENCES issues(key) ON DELETE CASCADE,
        provider TEXT NOT NULL DEFAULT 'GITHUB',
        repo_full_name TEXT NOT NULL,
        ref_type TEXT NOT NULL,
        ref_name TEXT NOT NULL,
        url TEXT NOT NULL,
        status TEXT DEFAULT 'OPEN',
        created_at INTEGER DEFAULT (unixepoch() * 1000) NOT NULL
      )
    `);
  } catch {
    // Ignore
  }

  try {
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        author_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        issue_id TEXT REFERENCES issues(key) ON DELETE CASCADE,
        title TEXT,
        message TEXT NOT NULL,
        link_url TEXT,
        read INTEGER DEFAULT 0 NOT NULL,
        created_at TEXT NOT NULL
      )
    `);
  } catch {
    // Ignore
  }

  // 3. Performance Indexes
  const indexes = [
    sql`CREATE INDEX IF NOT EXISTS idx_issues_parent ON issues(parent_issue_id)`,
    sql`CREATE INDEX IF NOT EXISTS idx_issue_links_source ON issue_links(source_issue_id)`,
    sql`CREATE INDEX IF NOT EXISTS idx_issue_links_target ON issue_links(target_issue_id)`,
    sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_issue_links_source_target_type_uq ON issue_links(source_issue_id, target_issue_id, link_type)`,
    sql`CREATE INDEX IF NOT EXISTS idx_audit_issue ON issue_audit_logs(issue_id)`,
    sql`CREATE INDEX IF NOT EXISTS idx_comments_issue ON issue_comments(issue_id)`,
    sql`CREATE INDEX IF NOT EXISTS idx_workflow_project ON project_workflow_statuses(project_id)`,
    sql`CREATE INDEX IF NOT EXISTS idx_transition_rules_project ON workflow_transition_rules(project_id)`,
    sql`CREATE INDEX IF NOT EXISTS idx_git_links_issue ON issue_git_links(issue_id)`,
    sql`CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read)`,
    sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_provider ON users(auth_provider, provider_id)`,
  ];

  for (const idxSql of indexes) {
    try {
      await db.run(idxSql);
    } catch {
      // Ignore
    }
  }

  // 4. Default workflow statuses seeding if empty for existing projects
  try {
    const existingProjects = await db.all<{ id: string }>(sql`SELECT id FROM projects`);
    if (existingProjects && existingProjects.length > 0) {
      for (const proj of existingProjects) {
        const statuses = await db.all<{ count: number }>(
          sql`SELECT count(*) as count FROM project_workflow_statuses WHERE project_id = ${proj.id}`
        );
        if (!statuses || statuses[0]?.count === 0) {
          const defaults = [
            { id: `ws-${proj.id}-todo`, name: 'To Do', category: 'TODO', pos: 0, initial: 1, final: 0, wip: 0 },
            { id: `ws-${proj.id}-prog`, name: 'In Progress', category: 'IN_PROGRESS', pos: 1, initial: 0, final: 0, wip: 5 },
            { id: `ws-${proj.id}-rev`, name: 'In Review', category: 'IN_PROGRESS', pos: 2, initial: 0, final: 0, wip: 4 },
            { id: `ws-${proj.id}-done`, name: 'Done', category: 'DONE', pos: 3, initial: 0, final: 1, wip: 0 },
          ];
          for (const s of defaults) {
            await db.run(sql`
              INSERT OR IGNORE INTO project_workflow_statuses (id, project_id, name, category, position, wip_limit, is_initial, is_final)
              VALUES (${s.id}, ${proj.id}, ${s.name}, ${s.category}, ${s.pos}, ${s.wip}, ${s.initial}, ${s.final})
            `);
          }

          // Default transition rule: Moving to Done requires all subtasks to be complete
          const doneStatusId = `ws-${proj.id}-done`;
          await db.run(sql`
            INSERT OR IGNORE INTO workflow_transition_rules (id, project_id, from_status_id, to_status_id, require_assignee, require_all_subtasks_complete, require_resolution_comment)
            VALUES (${'wtr-' + proj.id + '-to-done'}, ${proj.id}, NULL, ${doneStatusId}, 1, 1, 0)
          `);
        }
      }
    }
  } catch {
    // Ignore
  }

  enterpriseSchemaInitialized = true;
}
