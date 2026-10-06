-- ApexTrack seed data (ported from the reference prototype + Getting Started Runbook).
-- Apply: npm.cmd run db:seed:local
-- Note: no BEGIN/COMMIT here; D1 runs each file as one batch and rejects explicit transactions.

DELETE FROM attachments; DELETE FROM issue_history; DELETE FROM comments; DELETE FROM issue_labels;
DELETE FROM labels; DELETE FROM issues; DELETE FROM documents; DELETE FROM sprints;
DELETE FROM swimlanes; DELETE FROM projects; DELETE FROM project_counters; DELETE FROM users;

-- Users -------------------------------------------------------------
INSERT INTO users (id, name, email, role, status, department, avatar_url, approved_at) VALUES
 ('u0','Haris Arshad','harisarshad235@gmail.com','Admin','APPROVED','Executive Engineering','https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80', unixepoch('2026-09-01')*1000),
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
 ('doc-4','ApexTrack System Architecture, RBAC & Operations Manual','Architecture',
  '# ApexTrack System Architecture, RBAC & Operations Manual

> **Executive Summary**: ApexTrack is an enterprise-grade, serverless alternative to Jira Software and Atlassian Confluence built on Cloudflare Workers, Cloudflare D1 distributed SQLite, and Cloudflare R2 zero-egress object storage.

---

## 1. Visual UI Map & Workspace Layout Guide

Below is the complete ASCII wireframe layout map of the ApexTrack Workspace interface:

```
+-------------------------------------------------------------------------------------------------------------+
|                                           APEXTRACK WORKSPACE HEADER                                        |
| [Logo] ApexTrack  [Search: "APEX-101, bug, label..."]   [Theme]  [🔔 (2)]  [+ Create Issue]  [+ New Doc]  (Avatar) |
+------------------+------------------------------------------------------------------------------------------+
| SIDEBAR          | TOP METRICS BAR                                                                          |
|                  | [Completion Rate: 75%]  [Velocity: 28/35 pts]  [In Flight: 5]  [Open Defects: 2]           |
| [Proj: APEX v]   +------------------------------------------------------------------------------------------+
|                  | KANBAN QUICK FILTERS                                                                     |
| > Board          | [⚡ Only My Issues]  [🚩 Flagged Blockers]  [⏳ Recently Updated]                           |
| > Backlog        +------------------------------------------------------------------------------------------+
| > Documents      | KANBAN BOARD                                                                             |
| > Team & Access  | +-------------------+ +-------------------+ +-------------------+ +-------------------+ |
| > Velocity Reports| | TO DO          [3]| | IN PROGRESS [WIP 5]| | IN REVIEW  [WIP 4]| | DONE           [8]| |
|                  | | 0 pts             | | 12 pts            | | 7 pts             | | 28 pts            | |
|                  | SPRINT STATS     | +-------------------+ +-------------------+ +-------------------+ +-------------------+ |
| Sprint 24        | | [Story]  APEX-103 | | [Bug] 🚩 APEX-101 | | [Task]   APEX-102 | | [Story]  APEX-104 | |
| 80% Complete     | | Knowledge Base    | | D1 Database schema| | Kanban drag fix   | | RBAC Auth logic   | |
|                  | | 8 pts    (Assignee)| | 5 pts    (Assignee)| | 3 pts    (Assignee)| | 5 pts    (Assignee)| |
| PERSONA SWITCH   | +-------------------+ +-------------------+ +-------------------+ +-------------------+ |
| [ Alex Chen (Admin) v ]                |                                                                    |
+------------------+------------------------------------------------------------------------------------------+
```

### SLIDE-OUT ISSUE DETAIL DRAWER (Triggers on ticket click, e.g. APEX-101):

```
+-------------------------------------------------------------------------------------------------------------+
| ISSUE DETAIL DRAWER                                                                                  [X]    |
+-------------------------------------------------------------------------------------------------------------+
| [Type: Bug v]  APEX-101  [Status: In Progress v]                           [🚩 Add Flag] [🗑️ Delete Issue]   |
+-------------------------------------------------------------------------------------------------------------+
| TITLE: Design and connect Cloudflare D1 distributed edge database schema                                    |
| METADATA: Assignee: Marcus Brody | Reporter: Alex Chen | Priority: ▲▲ Critical | Points: [5 pts]            |
+-------------------------------------------------------------------------------------------------------------+
| DESCRIPTION                                                                                                 |
| Integrate Cloudflare D1 with Drizzle ORM bindings to support global read caching and localized writes.    |
+-------------------------------------------------------------------------------------------------------------+
| SUBTASKS CHECKLIST                                                                      (2 of 3 completed) |
| [==========------------------] 66%                                                                          |
| [x] Define Drizzle ORM SQLite tables in db/schema.ts                                                        |
| [x] Generate D1 migration scripts via drizzle-kit                                                           |
| [ ] Benchmark edge response times across Anycast PoPs                                                       |
| [+ Add a subtask and press Enter...]                                                                        |
+-------------------------------------------------------------------------------------------------------------+
| LINKED ISSUES (2)                                                                                           |
| (blocks) [● APEX-102] Kanban drag-and-drop focus drops [In Review] [X]                                      |
| (relates to) [● CORE-101] Anycast DNS failover [Dev Implementation] [X]                                     |
| [Type: blocks v] [Select issue e.g. APEX-105 v] [+ Link]                                                    |
+-------------------------------------------------------------------------------------------------------------+
| ATTACHMENTS (2)                                                                         [+ Attach File]     |
| 📁 d1_schema_v2.sql (14.5 KB) [⬇️]    📁 edge_latency_benchmark.pdf (1.8 MB) [⬇️]                            |
+-------------------------------------------------------------------------------------------------------------+
| ACTIVITY:  [Comments (4)]  [History (6)]                                                                    |
| (Avatar) Alex Chen • 2026-10-03 14:20                                                                      |
| "Ensure we test D1 local emulator fallback mode in CI/CD pipeline. CC @marcus.b"                            |
| [+ Add a comment... (use @name to mention)]                                                                |
+-------------------------------------------------------------------------------------------------------------+
```

### Visual UI Callouts & Badges Index:
- **🚩 Flagged (Amber Tint & Badge)**: Indicates an issue marked as an impediment or blocker.
- **[WIP 5/5] (Red Pulsing Header)**: Triggered when column issue count exceeds Work-In-Progress limit (colIssues > limit).
- **[⚡ Only My Issues]**: One-click filter to display tickets assigned to your active account.
- **[🚩 Flagged Blockers]**: Filters board to display only blocked/flagged tickets.
- **[⏳ Recently Updated]**: Sorts cards by latest history audit timestamp.
- **🔔 (2) (Notification Bell)**: Header bell badge showing unread @mention alerts.

---

## 2. User Flows by Persona (Step-by-Step Practical Guides)

### 2.1 For All Members & Viewers

#### A. Sign Up & Holding Screen (PENDING Status)
1. Navigate to /login?tab=register or click Register.
2. Fill in your Name, Email, and Password. Upon submitting, your account is created with status = PENDING.
3. You will automatically land on the /awaiting-approval holding page.
4. Edge middleware enforces security by restricting pending users from viewing workspace telemetry until an Administrator approves your account.

#### B. Navigating the Kanban Board & WIP Limits
1. Access the Board tab from the left sidebar.
2. Columns reflect dynamic swimlanes (To Do, In Progress, In Review, Done).
3. Drag cards between swimlanes to update issue status instantly.
4. **WIP Limits**: Swimlane headers set safety caps (In Progress: 5, In Review: 4). If a column exceeds its WIP limit, the issue counter badge turns bold red (bg-red-500 text-white animate-pulse) to alert team members to clear bottlenecks.

#### C. Using the Issue Detail Drawer
1. Click on any ticket card key (e.g. APEX-101) to slide out the Issue Detail Drawer.
2. **Story Points**: Edit the story point value (0-100) to feed velocity tracking.
3. **Subtask Checklist**: Type a subtask name in the text box and press Enter to create item checklist. Check off completed items to update the progress bar (X of Y completed).
4. **Issue Linking**: Relate tickets by picking a relationship type (blocks, is_blocked_by, relates_to), typing the target key (e.g., APEX-102), and clicking Link.
5. **Flagging Impediments**: Click 🚩 Add Flag in the drawer header. The ticket card turns amber (bg-amber-500/10 border-amber-500/60) and displays a flag badge on the board.

#### D. Mentioning Teammates & Notifications
1. In the Issue Drawer comments box, type a comment containing @name (e.g., @alex, @sarah, @marcus).
2. When posted, ApexTrack parses the mention, identifies the target user, and inserts a notification into notifications.
3. The tagged user receives an unread badge count on the Notification Bell (🔔) in the top navigation bar. Clicking the bell opens a popover to preview mentions and jump directly to the issue.

---

## 2.2 For Project Leads & Technical PMs

#### A. Sprint Backlog Management
1. Click Backlog in the sidebar.
2. Review unassigned tickets in the global backlog pool vs. active sprint queues (Sprint 24, Sprint 25).
3. Assign backlog items to upcoming sprints and set target story points before sprint kickoff.

#### B. Reading Velocity Reports & Sprint Burndown
1. Click Velocity Reports in the sidebar.
2. **Metric Cards**: Monitor Overall Completion Rate %, Total Velocity Points Burned vs Committed, Active In-Flight tickets, and Open Defect counts.
3. **Sprint Burndown Chart**:
   - **Ideal Burn (Dashed Line)**: Plots linear progress from total committed story points at sprint start down to 0 at sprint end date.
   - **Actual Burn (Solid Blue Line)**: Plots actual remaining story points day-by-day based on tickets moved to Done.
   - **Trajectory Analysis**: If the solid line is above the dashed line, the sprint is behind schedule; if below, the sprint is ahead of schedule.

---

## 2.3 For Workspace Administrators

#### A. In-App User Approvals & Role Management
1. Click Team & Access in the left sidebar.
2. Under Pending User Approvals, locate new registrations (status = PENDING).
3. Select the appropriate role from the dropdown: Admin, Member, or Viewer.
4. Click Approve to activate the user account immediately.

#### B. Emergency Direct Database Promotion (Cloudflare D1 Console)
If an Admin account is accidentally locked out or emergency access is needed via CLI:
```bash
wrangler d1 execute apextrack_db --remote --command="UPDATE users SET status=''APPROVED'', role=''Admin'' WHERE email=''admin@apextrack.io'';"
```

---

## 3. Beginner-Friendly Edge Infrastructure Explainer

### 3.1 Plain-English Cloudflare Edge Stack Architecture

| Cloudflare Technology | What It Is | Why It Outperforms Traditional Jira |
| :--- | :--- | :--- |
| **Next.js on Cloudflare Pages** | Serverless Web Application framework running on V8 edge isolates across 300+ global data centers. | Eliminates centralized origin servers; pages load in <20ms globally without server cold starts. |
| **Cloudflare D1 SQLite** | Serverless distributed SQL database natively integrated into edge functions. | Zero database server management, zero port configurations, sub-15ms edge read caching. |
| **Cloudflare R2 Storage** | High-performance object storage for issue and document file attachments. | S3-compatible file storage with **zero bandwidth egress fees**, saving thousands in bandwidth costs. |

### 3.2 Comparison Table: Per-Seat Jira vs. ApexTrack Edge Platform

| Feature / Dimension | Traditional Per-Seat Jira | ApexTrack Edge Architecture |
| :--- | :--- | :--- |
| **Pricing Model** | $8 - $16 per user / month (Expensive scaling) | Open Source / Zero per-seat fee (Cloudflare free/usage tier) |
| **Global Latency** | 200ms - 1500ms (Centralized US/EU AWS regions) | Sub-20ms worldwide (Anycast Edge deployment) |
| **Database Architecture** | Heavy PostgreSQL / MySQL instances | Cloudflare D1 distributed edge SQLite |
| **File Storage Egress** | Charged per GB downloaded (AWS S3 fees) | Cloudflare R2 ($0 Egress Bandwidth Fees) |
| **User Onboarding** | Manual enterprise license provisioning | Self-serve registration + In-App Admin Approval |
| **UI Responsiveness** | Heavy SPA bundle with slow initial load | Lightweight Next.js Server Components + Optimistic UI |',
  'u1','u1', unixepoch('2026-10-06 01:00')*1000, unixepoch('2026-10-06 01:00')*1000);

-- Attachment metadata (R2 objects are uploaded in Phase 4) -----------
INSERT INTO attachments (id, issue_key, document_id, file_name, content_type, size_bytes, r2_key, uploaded_by_id, created_at) VALUES
 ('att-1','APEX-101',NULL,'d1_schema_v2.sql','application/sql',14541,'issues/APEX-101/att-1-d1_schema_v2.sql','u3', unixepoch('2026-10-02')*1000),
 ('att-2','APEX-101',NULL,'edge_latency_benchmark.pdf','application/pdf',1887437,'issues/APEX-101/att-2-edge_latency_benchmark.pdf','u3', unixepoch('2026-10-03')*1000),
 ('att-3','APEX-102',NULL,'a11y-audit-report.png','image/png',430080,'issues/APEX-102/att-3-a11y-audit-report.png','u4', unixepoch('2026-10-04')*1000),
 ('att-d1',NULL,'doc-1','latency-breakdown.csv','text/csv',28672,'documents/doc-1/att-d1-latency-breakdown.csv','u1', unixepoch('2026-10-04')*1000),
 ('att-d2',NULL,'doc-3','rollback-procedure.md','text/markdown',4608,'documents/doc-3/att-d2-rollback-procedure.md','u4', unixepoch('2026-09-30')*1000);
