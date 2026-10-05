-- ApexTrack seed data (ported from the reference prototype + Getting Started Runbook).
-- Apply: npm.cmd run db:seed:local
-- Note: no BEGIN/COMMIT here; D1 runs each file as one batch and rejects explicit transactions.

DELETE FROM attachments; DELETE FROM issue_history; DELETE FROM comments; DELETE FROM issue_labels;
DELETE FROM labels; DELETE FROM issues; DELETE FROM documents; DELETE FROM sprints;
DELETE FROM swimlanes; DELETE FROM projects; DELETE FROM project_counters; DELETE FROM users;

-- Users -------------------------------------------------------------
INSERT INTO users (id, name, email, role, status, department, avatar_url, approved_at) VALUES
 ('u1','Alex Chen','alex.chen@apextrack.io','Admin','APPROVED','Engineering Leadership','https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80', unixepoch('2026-09-01')*1000),
 ('u2','Sarah Jenkins','s.jenkins@apextrack.io','Member','APPROVED','Frontend Engineering','https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80', unixepoch('2026-09-01')*1000),
 ('u3','Marcus Brody','marcus.b@apextrack.io','Member','APPROVED','Backend & Cloud','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80', unixepoch('2026-09-01')*1000),
 ('u4','Elena Rostova','elena.qa@apextrack.io','Member','APPROVED','QA & Automation','https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80', unixepoch('2026-09-01')*1000),
 ('u5','Devin Vance','devin.v@clientpartner.org','Viewer','APPROVED','External Stakeholder','https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80', unixepoch('2026-09-01')*1000),
 ('u6','Priya Natarajan','priya.n@apextrack.io','Viewer','PENDING','Product Management',NULL,NULL);

UPDATE users SET approved_by_id = 'u1' WHERE status = 'APPROVED';

-- Projects ----------------------------------------------------------
INSERT INTO projects (id, key, name, description, category, lead_id, status) VALUES
 ('proj-apex', 'APEX', 'ApexTrack Platform', 'Core enterprise agile tracking and architecture knowledge base.', 'Software', 'u1', 'active'),
 ('proj-core', 'CORE', 'Core Cloud Infrastructure', 'Zero-trust edge proxy, distributed object storage, and microservices.', 'Infrastructure', 'u3', 'active');

-- Swimlanes (Dynamic Board Columns) ---------------------------------
INSERT INTO swimlanes (id, project_id, name, status_key, color, sort_order) VALUES
 ('lane-apex-1', 'proj-apex', 'To Do', 'To Do', 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50', 0),
 ('lane-apex-2', 'proj-apex', 'In Progress', 'In Progress', 'border-blue-400 bg-blue-50/50 dark:bg-blue-950/20', 1),
 ('lane-apex-3', 'proj-apex', 'In Review', 'In Review', 'border-purple-400 bg-purple-50/50 dark:bg-purple-950/20', 2),
 ('lane-apex-4', 'proj-apex', 'Done', 'Done', 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20', 3),
 ('lane-core-1', 'proj-core', 'Backlog Queue', 'Backlog Queue', 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50', 0),
 ('lane-core-2', 'proj-core', 'Dev Implementation', 'Dev Implementation', 'border-blue-400 bg-blue-50/50 dark:bg-blue-950/20', 1),
 ('lane-core-3', 'proj-core', 'Infra Testing', 'Infra Testing', 'border-purple-400 bg-purple-50/50 dark:bg-purple-950/20', 2),
 ('lane-core-4', 'proj-core', 'Shipped', 'Shipped', 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20', 3);

-- Sprints & counters ------------------------------------------------
INSERT INTO sprints (id, name, state, goal, start_date, end_date) VALUES
 ('s24','Sprint 24','active','Edge data layer + RBAC','2026-10-01','2026-10-15'),
 ('s25','Sprint 25','upcoming','Identity hardening','2026-10-16','2026-10-30');

INSERT INTO project_counters (project_key, next_seq) VALUES ('APEX', 106), ('CORE', 103);

-- Issues ------------------------------------------------------------
INSERT INTO issues (key,project_id,title,description,type,priority,status,assignee_id,reporter_id,sprint_id,story_points,due_date,rank,created_at,updated_at) VALUES
 ('APEX-101','proj-apex','Design and connect Cloudflare D1 distributed edge database schema','Integrate Cloudflare D1 with Drizzle ORM bindings to support global read caching and localized write consistency across serverless edge functions.','Story','Critical','In Progress','u3','u1','s24',5,'2026-10-14',1000, unixepoch('2026-10-01 10:00')*1000, unixepoch('2026-10-02 11:30')*1000),
 ('APEX-102','proj-apex','Kanban drag-and-drop drops focus during keyboard navigation','When moving cards between lanes with keyboard arrow triggers (WCAG standard), focus drops to document root instead of maintaining active column index.','Bug','High','In Review','u2','u4','s24',3,'2026-10-08',2000, unixepoch('2026-10-03 16:45')*1000, unixepoch('2026-10-04 17:00')*1000),
 ('APEX-103','proj-apex','Build Confluence-style Knowledge Base documents editor','Engineering teams require markdown document repository for architecture decision records (ADRs), API specifications, and team runbooks.','Epic','Medium','To Do','u2','u1','s24',8,'2026-10-20',3000, unixepoch('2026-10-02 09:00')*1000, unixepoch('2026-10-02 09:00')*1000),
 ('APEX-104','proj-apex','Implement Role-Based Access Control (Admin / Member / Viewer)','Enforce strict RBAC permissions so viewers cannot create or modify tickets, and only admins can invite or dismiss team users.','Task','High','Done','u1','u1','s24',5,'2026-10-05',4000, unixepoch('2026-10-01 12:00')*1000, unixepoch('2026-10-04 19:00')*1000),
 ('APEX-105','proj-apex','Zero Trust SSO identity sync webhook payload schema validation','Malformed payloads from upstream IdP should trigger HTTP 422 with structured schema validation errors.','Bug','Lowest','To Do','u3','u4','s25',2,'2026-10-28',5000, unixepoch('2026-10-04 08:00')*1000, unixepoch('2026-10-04 08:00')*1000),
 ('CORE-101','proj-core','Deploy global Anycast DNS failover healthcheck probes','Ensure sub-second routing switches across Cloudflare points of presence.','Task','High','Dev Implementation','u3','u1',NULL,5,'2026-10-18',6000, unixepoch('2026-10-02')*1000, unixepoch('2026-10-02')*1000),
 ('CORE-102','proj-core','Benchmark R2 bucket streaming throughput and egress latency','Run stress tests with 10k concurrent image payloads to measure p99 edge response times.','Story','Critical','Backlog Queue','u2','u3',NULL,8,'2026-10-22',7000, unixepoch('2026-10-03')*1000, unixepoch('2026-10-03')*1000);

-- Labels ------------------------------------------------------------
INSERT INTO labels (name) VALUES ('Architecture'),('Database'),('Cloudflare'),('Accessibility'),('UI/UX'),('Docs'),('Feature'),('Security'),('Auth'),('Admin');

-- One statement per issue: D1 caps compound SELECT terms, so no UNION ALL chains.
INSERT INTO issue_labels (issue_key, label_id) SELECT 'APEX-101', id FROM labels WHERE name IN ('Architecture','Database','Cloudflare');
INSERT INTO issue_labels (issue_key, label_id) SELECT 'APEX-102', id FROM labels WHERE name IN ('Accessibility','UI/UX');
INSERT INTO issue_labels (issue_key, label_id) SELECT 'APEX-103', id FROM labels WHERE name IN ('Docs','Feature');
INSERT INTO issue_labels (issue_key, label_id) SELECT 'APEX-104', id FROM labels WHERE name IN ('Security','Auth','Admin');
INSERT INTO issue_labels (issue_key, label_id) SELECT 'APEX-105', id FROM labels WHERE name IN ('Auth','Security');

-- Comments ----------------------------------------------------------
INSERT INTO comments (id, issue_key, author_id, body, created_at) VALUES
 ('c-1','APEX-101','u1','Ensure we test D1 local emulator fallback mode in CI/CD pipeline.', unixepoch('2026-10-03 14:20')*1000),
 ('c-2','APEX-101','u3','Checked. Local SQLite matches production D1 dialect with zero deviation.', unixepoch('2026-10-04 09:15')*1000),
 ('c-3','APEX-102','u4','Reproducible on Chromium 128+ on macOS and Linux.', unixepoch('2026-10-04 11:00')*1000),
 ('c-4','APEX-104','u1','Auth middleware & simulated user token switcher deployed.', unixepoch('2026-10-04 18:30')*1000);

-- History -----------------------------------------------------------
INSERT INTO issue_history (id, issue_key, actor_id, actor_name, action, field, from_value, to_value, created_at) VALUES
 ('h-1','APEX-101','u1','Alex Chen','Created issue',NULL,NULL,NULL, unixepoch('2026-10-01 10:00')*1000),
 ('h-2','APEX-101','u3','Marcus Brody','Changed status from To Do to In Progress','status','To Do','In Progress', unixepoch('2026-10-02 11:30')*1000),
 ('h-3','APEX-102','u4','Elena Rostova','Created bug report',NULL,NULL,NULL, unixepoch('2026-10-03 16:45')*1000),
 ('h-4','APEX-102','u2','Sarah Jenkins','Moved to In Review','status','In Progress','In Review', unixepoch('2026-10-04 17:00')*1000),
 ('h-5','APEX-103','u1','Alex Chen','Created epic',NULL,NULL,NULL, unixepoch('2026-10-02 09:00')*1000),
 ('h-6','APEX-104','u1','Alex Chen','Resolved and marked Done','status','In Review','Done', unixepoch('2026-10-04 19:00')*1000);

-- Documents ---------------------------------------------------------
INSERT INTO documents (id, title, category, content, author_id, updated_by_id, created_at, updated_at) VALUES
 ('doc-1','ADR-04: Migration to Cloudflare D1 Edge Architecture','Architecture',
  '# ADR-04: Serverless Edge Database Migration' || char(10) || char(10) || '## Context' || char(10) || 'Our global web application requires low-latency read performance for remote teams without hosting expensive dedicated multi-region read replicas.' || char(10) || char(10) || '## Decision' || char(10) || 'We adopt **Cloudflare D1** paired with **Drizzle ORM**. Migration scripts live in `/drizzle` and are verified against binding schemas.' || char(10) || char(10) || '## Consequences' || char(10) || '- Sub-15ms edge read times worldwide.' || char(10) || '- Zero idle server compute costs.' || char(10) || '- Simplified CI/CD execution.',
  'u1','u1', unixepoch('2026-10-04 15:40')*1000, unixepoch('2026-10-04 15:40')*1000),
 ('doc-2','Product Requirement Document: Sprint Velocity Insights','Product Specs',
  '# PRD: Sprint Insights & Metrics Bar' || char(10) || char(10) || '## Overview' || char(10) || 'Provide immediate visual feedback on sprint health, overdue defect counts, and workload distribution across all team members.' || char(10) || char(10) || '## Key Metrics' || char(10) || '1. Active Issue Count vs Total Scope.' || char(10) || '2. Story Points Burned.' || char(10) || '3. Defect Ratio (Bugs vs Stories).',
  'u2','u2', unixepoch('2026-10-03 11:20')*1000, unixepoch('2026-10-03 11:20')*1000),
 ('doc-3','Incident Response & Release Checklist','Runbooks',
  '# Release Runbook' || char(10) || char(10) || '1. Ensure all CI/CD integration tests pass.' || char(10) || '2. Verify zero Critical/High severity bugs in **In Progress** or **In Review**.' || char(10) || '3. Execute edge database migrations.' || char(10) || '4. Notify on-call engineer in Slack channel `#releases`.',
  'u4','u4', unixepoch('2026-09-30 08:45')*1000, unixepoch('2026-09-30 08:45')*1000),
 ('doc-4','ApexTrack System Architecture, RBAC & Cloudflare Operations Manual','Architecture',
  '# ApexTrack System Architecture, RBAC & Cloudflare Operations Manual

> **Executive Summary**: ApexTrack is an enterprise-grade, self-hosted alternative to Jira Software and Atlassian Confluence, architected entirely on Cloudflare edge computing primitives (Next.js 16 App Router on Cloudflare Workers, Cloudflare D1 distributed SQLite, and Cloudflare R2 object storage).

---

## Section 1: User Guide

### 1.1 Navigating Kanban Boards & Dynamic Swimlanes
- **Multi-Project Workspaces**: Switch between projects (e.g., `APEX` Platform vs. `CORE` Infrastructure) from the sidebar dropdown or open the Project Manager modal.
- **Dynamic Swimlanes**: Columns are no longer static hardcoded states. Each project defines custom swimlanes. Click **+ Add Swimlane** to introduce specialized phases (e.g., `Security Review`, `QA Automation`). Double-click or click the edit icon on any column header to rename lanes inline.
- **Fluid Drag-and-Drop**: Drag issue cards across columns to update lifecycle status optimistically with instant server synchronization.

### 1.2 Backlog Management & Story Point Velocity
- **Sprint Planning**: Move issues between the active sprint queue and the global unassigned backlog.
- **Story Point Estimation**: Log Fibonacci points (1, 2, 3, 5, 8, 13) to measure velocity and burnout rates across the sprint cycle.

### 1.3 Filing Defects & Logging Issue History
- **Issue Types**: File Epics, User Stories, Engineering Tasks, or critical Bugs with severity rankings (Lowest to Critical).
- **Interactive Slide-Out Drawer**: Click any ticket key (e.g. `APEX-101`) to open the slide-out detail drawer to edit descriptions in rich text, adjust assignees, upload attachments, and post threaded comments with audit timestamps.

---

## Section 2: Security & RBAC Governance

### 2.1 Role-Based Access Control (RBAC) Permissions Matrix

| Capability / Permission | Administrator (Admin) | Team Member (Member) | Stakeholder (Viewer) |
| :--- | :---: | :---: | :---: |
| **Browse Boards & Backlogs** | Full Access | Full Access | Read-Only |
| **Create & Update Issues** | Full Access | Full Access | Disabled |
| **Move Kanban Swimlane Cards** | Full Access | Full Access | Disabled |
| **Upload R2 Bucket Attachments**| Full Access | Full Access | Disabled |
| **Publish & Edit ADR Documents**| Full Access | Full Access | Disabled |
| **Invite Team Members** | Full Access | Denied | Denied |
| **Approve / Reject PENDING Users**| Full Access | Denied | Denied |
| **Promote / Change User Roles** | Full Access | Denied | Denied |
| **Create & Archive Projects** | Full Access | Denied | Denied |

### 2.2 User Registration & Approval Pipeline
1. **Self-Serve Registration**: New users sign up via `/login?tab=register` or `/register`.
2. **Strict Gated Holding State (`PENDING`)**: New registrations default to `status = PENDING` and are immediately routed to `/awaiting-approval`. Edge middleware blocks access to workspace endpoints.
3. **Administrator Review**: Organization Admins navigate to **Team & Access -> Pending Approvals**.
4. **Role Assignment & Activation**: Admins select a role (`Member`, `Viewer`, or `Admin`) and click **Approve** (updating D1 status to `APPROVED`) or **Reject**.

---

## Section 3: Cloudflare Edge Infrastructure for Beginners

### 3.1 How Cloudflare D1 Operates: Local Dev vs. Global Edge
- **Local Development (Wrangler SQLite)**: In local development, Cloudflare Wrangler emulates D1 using an isolated local SQLite file located in `.wrangler/state/v3/d1/miniflare-D1DatabaseObject/`. All Drizzle ORM migrations run locally with identical syntax to production.
- **Global Edge Deployment**: In production, Cloudflare D1 distributes read replicas across 300+ Anycast edge data centers worldwide. Read queries execute within 10-15ms of the client, while writes route through Cloudflare''s primary consensus coordinator.
- **Zero Server Maintenance**: There are no database clusters to patch, no connection pools to manage, and no idle compute costs.

### 3.2 Cloudflare R2: Zero-Egress Serverless Object Storage
- **S3 Compatibility without AWS Egress Fees**: Cloudflare R2 provides full S3 API compatibility without charging bandwidth egress fees. Attachments uploaded to tickets or documents stream directly through Worker routes (`/api/attachments/[id]`).
- **Direct Object Binding**: The Worker interacts with R2 via the `env.ATTACHMENTS` binding, streaming binary payloads with Content-Type headers directly to clients.

### 3.3 Serverless Edge Workers Runtime
- Rather than executing in traditional Node.js containers that incur 2-5 second cold starts, ApexTrack compiles into V8 isolates running directly on Cloudflare Workers, achieving <5ms initialization times globally.',
  'u1','u1', unixepoch('2026-10-06 01:00')*1000, unixepoch('2026-10-06 01:00')*1000);

-- Attachment metadata (R2 objects are uploaded in Phase 4) -----------
INSERT INTO attachments (id, issue_key, document_id, file_name, content_type, size_bytes, r2_key, uploaded_by_id, created_at) VALUES
 ('att-1','APEX-101',NULL,'d1_schema_v2.sql','application/sql',14541,'issues/APEX-101/att-1-d1_schema_v2.sql','u3', unixepoch('2026-10-02')*1000),
 ('att-2','APEX-101',NULL,'edge_latency_benchmark.pdf','application/pdf',1887437,'issues/APEX-101/att-2-edge_latency_benchmark.pdf','u3', unixepoch('2026-10-03')*1000),
 ('att-3','APEX-102',NULL,'a11y-audit-report.png','image/png',430080,'issues/APEX-102/att-3-a11y-audit-report.png','u4', unixepoch('2026-10-04')*1000),
 ('att-d1',NULL,'doc-1','latency-breakdown.csv','text/csv',28672,'documents/doc-1/att-d1-latency-breakdown.csv','u1', unixepoch('2026-10-04')*1000),
 ('att-d2',NULL,'doc-3','rollback-procedure.md','text/markdown',4608,'documents/doc-3/att-d2-rollback-procedure.md','u4', unixepoch('2026-09-30')*1000);
