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
  '<!-- ========================================================================= -->
<!-- APEXTRACK LIVING DOCUMENTATION MANIFEST & OPERATIONS HANDBOOK             -->
<!-- Automatically generated and verified by scripts/generate-docs-manifest.ts -->
<!-- ========================================================================= -->

# ApexTrack User Operations Manual & Visual Handbook

> **Living Documentation Status**: Active & Synchronized  
> **Release Version**: `v0.1.0`  
> **Target Deployment Environment**: `Cloudflare Pages Edge (V8 Serverless Isolates)`  
> **Database Engine**: `Cloudflare D1 Distributed SQLite`  
> **Object Storage**: `Cloudflare R2 Zero-Egress Storage`  
> **Last Synchronized**: `2026-10-06 22:57:43 UTC`  

## Active Application Route Inventory

| Route Path | Type | Functional Purpose |
| :--- | :--- | :--- |
| `/` | `Page` | Main Workspace Dashboard, Kanban Board, Documents, Backlog & Reports |
| `/login` | `Page` | User Authentication, Persona Fast-Switcher & Gateway |
| `/login?tab=register` | `Page` | Self-Service User Registration & Onboarding Portal |
| `/forgot-password` | `Page` | Self-Service Password Recovery Request via Resend Email |
| `/reset-password` | `Page` | Cryptographic HMAC Token Password Reset & Update Form |
| `/awaiting-approval` | `Page` | Holding Room for New Accounts Pending Administrator Review |
| `/api/auth/logout` | `API` | Secure Session Invalidation & Cookie Revocation |
| `/api/health` | `API` | Edge Runtime & Database Health Check Endpoint |

---

## 1. Welcome to ApexTrack (The 30-Second Overview)

### What is ApexTrack?
ApexTrack is your team''s central workspace for managing agile software delivery, tracking tickets, and publishing architecture documentation. Unlike traditional enterprise issue trackers that require heavy servers and expensive per-seat subscriptions, ApexTrack is built directly on Cloudflare''s serverless edge network. It delivers sub-20 millisecond response times globally and has zero per-user licensing fees.

### The 3-Step Work Lifecycle

```
  +--------------------+        +---------------------+        +--------------------+
  |  1. CAPTURE WORK   |  --->  |  2. MOVE ON BOARD   |  --->  | 3. MEASURE VELOCITY|
  | Stories, Bugs, ADRs|        | To Do -> Done Lanes |        | Burndown & Health  |
  +--------------------+        +---------------------+        +--------------------+
```

1. **Capture Work**: Log User Stories, Bugs, Epics, Tasks, and Confluence-style Knowledge Base documents with rich markdown and attachments.
2. **Move on Board**: Drag cards across customizable Kanban swimlanes to provide instant visual transparency on active progress.
3. **Measure Delivery**: Monitor automated completion metrics, story point burndown charts, and Work-In-Progress (WIP) safety caps in real time.

---

## 2. Getting Started & Authentication Flows (Step-by-Step with Visuals)

```
+-------------------------------------------------------------------------------------------------------------+
|                                    FLOW 2: AUTHENTICATION & ACCESS LIFECYCLE                                |
|                                                                                                             |
|  [ 2.1 Register ]  ----->  [ 2.2 Holding Room ]  ----->  [ 2.3 Sign In ]  ----->  [ 2.4 Password Reset ]    |
|  Enter name, email          Status: PENDING               Session Cookie           15-min Tokenized Email   |
|  & strong password          Awaiting Admin Review         Admin / Member / Viewer  via Resend Integration   |
+-------------------------------------------------------------------------------------------------------------+
```

### Flow 2.1: Creating Your Account
1. Open the login portal and click the **Create Account** tab (or navigate directly to `/login?tab=register`).
2. Fill in your details:
   - **Full Name**: Your first and last name (e.g., `Jordan Vance`).
   - **Work Email Address**: Your corporate email (e.g., `jordan.v@company.com`).
   - **Password**: A secure password (minimum 6 characters).
   - **Department**: Your team (e.g., `Frontend`, `Backend`, `QA`, `DevOps`, `Product`).
3. Click **Create Account & Enter Approval Queue**.

![Create Account - Registration Form](/docs/assets/screenshots/01-create-account.png)

```
+----------------------------------------------------------------------+
| [ApexTrack Logo]                                                     |
| Sign In  |  [ Create Account ]                                       |
|----------------------------------------------------------------------|
| Full Name:         [ Jordan Vance                                  ] |
| Work Email:        [ jordan.v@company.com                          ] |
| Password:          [ ••••••••••••                               👁️ ] |
| Department:        [ Frontend Engineering                          ] |
| [🔒 Gated Security: New accounts require Administrator approval]     |
| [  Create Account & Enter Approval Queue                           ] |
+----------------------------------------------------------------------+
```

---

### Flow 2.2: The Holding Room (Awaiting Admin Approval)
**Why can''t I see tasks immediately?**  
To protect organization privacy and enforce zero-trust governance, new accounts are created with a `PENDING` status and `Viewer` role. You will land on the holding page (`/awaiting-approval`).

1. Once your registration is submitted, an automated notification is dispatched to your workspace administrator.
2. The administrator reviews and approves your account from the **Team & Access** panel.
3. Once approved, you can immediately sign in and access the full workspace.

![Awaiting Approval - Holding Room](/docs/assets/screenshots/02-awaiting-approval.png)

```
+----------------------------------------------------------------------+
| [ ⏳ Clock Icon - Amber Glow ]                                       |
| Account Pending Administrator Approval                               |
|----------------------------------------------------------------------|
| Welcome, Jordan Vance! Your account has been securely created.       |
| Organization administrators have been notified. Once approved, you   |
| will have full access to your team''s workspace.                      |
|                                                                      |
| [ Check Approval Status ]            [ Sign In with Another Account ]|
+----------------------------------------------------------------------+
```

---

### Flow 2.3: Signing In & Secure Sessions
1. Navigate to `/login` (or click **Sign In**).
2. Enter your work email and password.
3. Click **Sign In to Workspace**.
4. ApexTrack generates an encrypted session cookie and directs you to your active project board.

![Sign In - Authentication Portal](/docs/assets/screenshots/03-sign-in.png)

```
+----------------------------------------------------------------------+
| [ApexTrack Logo] ApexTrack [v1.0]                                    |
| [ Sign In ]  |  Create Account                                       |
|----------------------------------------------------------------------|
| Work Email:        [ harisarshad235@gmail.com                      ] |
| Password:          [ ••••••••••••                               👁️ ] |
|                    [ Forgot password?                              ] |
| [  Sign In to Workspace                                            ] |
+----------------------------------------------------------------------+
```

---

### Flow 2.4: Self-Service Password Recovery
If you forget your password, you can reset it in seconds without contacting IT support:

1. Click **Forgot password?** on the sign-in form (or visit `/forgot-password`).
2. Enter your work email address and click **Send Reset Link**.
3. Check your email inbox for a message from `ApexTrack <notifications@harisarshad.site>`.
4. Click the **Reset Password** button inside the email (valid for **15 minutes**).
5. Enter your new password, confirm it, and click **Save New Password**.
6. Sign in immediately with your new credentials.

![Password Reset - Recovery Request and Reset](/docs/assets/screenshots/04-password-reset.png)

```
+----------------------------------------------------------------------+
| Password Recovery -> Email Link -> Set New Password                  |
|----------------------------------------------------------------------|
| 1. Enter email:    [ name@company.com ] -> [ Send Reset Link ]       |
| 2. Check Inbox:    "Reset your ApexTrack password" (15 min link)     |
| 3. Set Password:   New Password:     [ •••••••••••• ]                |
|                    Confirm Password: [ •••••••••••• ]                |
|                    [ Save New Password ]                             |
+----------------------------------------------------------------------+
```

---

## 3. Daily Work & The Agile Board (For Team Members & Viewers)

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
|                  | +-------------------+ +-------------------+ +-------------------+ +-------------------+ |
| Sprint 24        | | [Story]  APEX-103 | | [Bug] 🚩 APEX-101 | | [Task]   APEX-102 | | [Story]  APEX-104 | |
| 80% Complete     | | Knowledge Base    | | D1 Database schema| | Kanban drag fix   | | RBAC Auth logic   | |
|                  | | 8 pts    (Assignee)| | 5 pts    (Assignee)| | 3 pts    (Assignee)| | 5 pts    (Assignee)| |
| PERSONA SWITCH   | +-------------------+ +-------------------+ +-------------------+ +-------------------+ |
| [ Alex Chen v ]  |                                                                                          |
+------------------+------------------------------------------------------------------------------------------+
```

### Flow 3.1: Understanding the Board Swimlanes
Your project board is organized into four intuitive stages:
1. **To Do**: Work scheduled for the current sprint that is ready for an engineer to pick up.
2. **In Progress**: Tasks actively being coded or developed right now.
3. **In Review**: Pull requests, quality assurance audits, and peer code reviews.
4. **Done**: Tested, approved, and shipped functionality.

---

### Flow 3.2: Moving Cards & Drag-and-Drop Etiquette
- **Drag a Card**: Click and hold any ticket card, then drag it across columns. When released, the issue status updates instantly across all connected clients.
- **Keyboard Navigation**: Click a card and use arrow keys to navigate and reposition cards with full WCAG accessibility.
- **Quick Filters**:
  - **⚡ Only My Issues**: Filters the board to show only tickets assigned to your user account.
  - **🚩 Flagged Blockers**: Highlights cards marked as impediments needing immediate team unblocking.
  - **⏳ Recently Updated**: Sorts cards by latest activity timestamp.

---

### Flow 3.3: Understanding WIP (Work-In-Progress) Limits
**Why does a column header turn red and pulse?**  
Work-In-Progress (WIP) caps prevent teams from taking on too many parallel tasks at once, ensuring high quality and steady delivery.

- In Progress is capped at **5 issues**.
- In Review is capped at **4 issues**.
- If a team member drags an extra ticket into a full column, the count badge turns **bold red with a pulsing alert** (`[WIP 6/5]`). This reminds the team to help review or finish existing cards before starting new work.

![Kanban WIP Limit Alert - Red Pulsing Header](/docs/assets/screenshots/05-kanban-wip-alert.png)

```
+-----------------------+   +-----------------------+
| IN PROGRESS  [WIP 3/5]|   | IN REVIEW    [WIP 5/4]|  <-- Red Pulsing Header!
| 12 pts                |   | 14 pts (WIP Exceeded) |
+-----------------------+   +-----------------------+
```

---

### Flow 3.4: Working with the Issue Detail Drawer
Click any ticket key (such as `APEX-101`) to slide out the comprehensive ticket drawer.

![Issue Detail Drawer - Full Feature View](/docs/assets/screenshots/06-issue-drawer-full.png)

```
+-----------------------------------------------------------------------------+
| ISSUE DETAIL DRAWER                                                  [ X ]  |
|-----------------------------------------------------------------------------|
| [Type: Bug v]  APEX-101  [Status: In Progress v]   [🚩 Add Flag] [🗑️ Delete] |
| TITLE: Design and connect Cloudflare D1 distributed edge database schema    |
| METADATA: Assignee: Marcus Brody | Reporter: Alex Chen | Points: [ 5 pts ]  |
|-----------------------------------------------------------------------------|
| DESCRIPTION                                                                 |
| Integrate Cloudflare D1 with Drizzle ORM bindings for serverless caching.   |
|-----------------------------------------------------------------------------|
| SUBTASKS CHECKLIST                                       (2 of 3 completed) |
| [===================---------] 66%                                          |
| [x] Define Drizzle ORM SQLite tables in db/schema.ts                        |
| [x] Generate D1 migration scripts via drizzle-kit                           |
| [ ] Benchmark edge response times across Anycast PoPs                       |
| [+ Add a subtask and press Enter...]                                        |
|-----------------------------------------------------------------------------|
| LINKED ISSUES (2)                                                           |
| (blocks)    [● APEX-102] Kanban drag focus drops [In Review] [X]             |
| (relates to)[● CORE-101] Anycast DNS failover [Dev Implementation] [X]      |
| [Type: blocks v] [Select target issue v] [+ Link Issue]                     |
|-----------------------------------------------------------------------------|
| ATTACHMENTS (2)                                         [+ Attach File]     |
| 📁 d1_schema_v2.sql (14.5 KB) [⬇️]  📁 latency_report.pdf (1.8 MB) [⬇️]     |
|-----------------------------------------------------------------------------|
| ACTIVITY: Comments (4) | History (6)                                        |
| Alex Chen • 2 hours ago:                                                    |
| "Ensure we test D1 local emulator in CI/CD pipeline. CC @marcus.b"          |
| [+ Add a comment... (use @name to mention colleagues)]                      |
+-----------------------------------------------------------------------------+
```

- **Story Points**: Enter estimated complexity (e.g., 1, 2, 3, 5, 8, 13) to feed velocity burndown charts.
- **Subtask Checklist**: Type an item name and hit Enter. Checking off boxes updates the live percentage progress bar.
- **Flagging Impediments**: Click **🚩 Add Flag**. The card displays an amber badge on the board so leads can step in to unblock you.
- **Linking Issues**: Relate dependencies using `blocks`, `is_blocked_by`, or `relates_to` relationships.
- **Colleague Mentions & Notification Bell (🔔)**: Type `@name` (e.g. `@sarah`, `@marcus`) in comments. The tagged colleague receives an unread counter on their notification bell in the top navigation bar.

---

## 4. Sprint Planning & Delivery (For Project Managers & Leads)

### Flow 4.1: Managing the Global Backlog vs. Active Sprint Pools
1. Click **Backlog** in the left sidebar navigation.
2. The backlog screen separates work into:
   - **Active Sprint (Sprint 24)**: Committed tickets currently under execution.
   - **Upcoming Sprint (Sprint 25)**: Scope staged for next sprint''s kickoff.
   - **Product Backlog Pool**: Unscheduled tickets, feature ideas, and technical debt.
3. Drag tickets from the backlog pool into an upcoming sprint and verify total planned story points before starting the sprint.

![Backlog & Sprint Planning View](/docs/assets/screenshots/07-backlog-sprint-planning.png)

---

### Flow 4.2: Reading Velocity Reports & Burndown Charts
Click **Velocity Reports** in the left sidebar to access team analytics.

![Velocity Reports & Sprint Burndown Chart](/docs/assets/screenshots/08-velocity-burndown.png)

```
+-----------------------------------------------------------------------------+
| SPRINT 24 BURNDOWN & VELOCITY DASHBOARD                                     |
|-----------------------------------------------------------------------------|
| [Completion Rate: 75%]  [Velocity: 28/35 pts]  [In Flight: 5] [Defects: 2]  |
|                                                                             |
| Story                                                                       |
| Points                                                                      |
|  35 | *                                                                     |
|  28 |   *                                                                  |
|  21 |     *   (Ideal Burn - Dashed Line)                                   |
|  14 |       *=====                                                        |
|   7 |         *     ===== (Actual Burn - Solid Blue Line)                  |
|   0 +----------*-----------*---------------------------------------> Day    |
|    Day 1      Day 5       Day 10                                  Day 14    |
+-----------------------------------------------------------------------------+
```

- **Metric Cards**:
  - **Completion Rate**: Percentage of committed story points moved to Done.
  - **Velocity**: Story points completed out of total sprint scope (e.g., 28 of 35 pts).
  - **In Flight**: Count of issues currently undergoing active engineering.
  - **Open Defects**: Active bug tickets requiring resolution before release.
- **Burndown Chart Interpretation**:
  - **Dashed Line (Ideal Burn)**: Linear guide showing where the team should be if work is completed evenly every day.
  - **Solid Blue Line (Actual Burn)**: Real-time points remaining.
  - **Trajectory Rule**: If the solid blue line is **below** the dashed line, the team is **ahead of schedule**; if **above**, the team is **behind schedule**.

---

## 5. Team Management & Governance (For Workspace Admins)

### Flow 5.1: The In-App Approval Center (`/team`)
Administrators have exclusive access to the **Team & Access** panel to oversee team membership:

1. Click **Team & Access** in the left sidebar.
2. Review new registrations in the **Pending User Approvals** table.
3. Choose the appropriate role from the dropdown:
   - **Admin**: Full access to settings, user approvals, and project configuration.
   - **Member**: Standard team member who can create, edit, drag, and comment on tickets.
   - **Viewer**: Read-only stakeholder who can inspect tickets, read documents, and comment.
4. Click **Approve** to activate the user immediately.

![Admin Team Approvals - Role Assignment](/docs/assets/screenshots/09-admin-team-approvals.png)

---

### Flow 5.2: Role Permission Matrix (Plain English Breakdown)

| Feature / Action | Admin | Member | Viewer |
| :--- | :---: | :---: | :---: |
| **Sign In & View Kanban Board** | ✅ | ✅ | ✅ |
| **Read Knowledge Base Documents** | ✅ | ✅ | ✅ |
| **View Sprint Velocity Reports** | ✅ | ✅ | ✅ |
| **Comment on Issues & Mention Colleagues** | ✅ | ✅ | ✅ |
| **Create New Issues & User Stories** | ✅ | ✅ | ❌ |
| **Drag & Drop Cards Across Swimlanes** | ✅ | ✅ | ❌ |
| **Edit Story Points, Estimates & Subtasks** | ✅ | ✅ | ❌ |
| **Create & Edit Knowledge Base Docs** | ✅ | ✅ | ❌ |
| **Delete Issues or Documents** | ✅ | ❌ | ❌ |
| **Approve Pending Users & Manage Roles** | ✅ | ❌ | ❌ |
| **Configure Project Settings & WIP Caps** | ✅ | ❌ | ❌ |

---

### Flow 5.3: Emergency Access & Cloudflare D1 Console Recovery
If an administrator is ever locked out of their account or requires CLI emergency access, they can directly approve and promote any account using Wrangler:

```bash
# Direct Administrator Promotion via Cloudflare D1
npx wrangler d1 execute apextrack_db --remote --command="UPDATE users SET status=''APPROVED'', role=''Admin'' WHERE email=''harisarshad235@gmail.com'';"
```

---

## 6. Architecture Explained in 2 Minutes (Layman Edition)

### What is "The Edge"?
Traditional apps host their servers and databases in a single data center (such as Northern Virginia or Frankfurt). If a team member in London, Tokyo, or Sydney accesses the site, requests must travel thousands of miles across undersea cables, causing slow page loads.

ApexTrack runs on **Cloudflare Pages and Workers**, which deploy your code to over **300 global data centers**. When you open ApexTrack, you connect to a server within a few miles of your physical location, resulting in instant page loads and zero lag.

### Where Data and Files Live

| Technology | What It Stores | Why It Matters |
| :--- | :--- | :--- |
| **Cloudflare D1 (SQLite)** | Issues, Sprints, Comments, User Profiles, Documents | Ultra-fast distributed database running queries in sub-15ms. |
| **Cloudflare R2 Storage** | Attachments, PDFs, Image Screenshots, Log Files | High-speed file storage with **zero egress bandwidth fees**. |
| **Resend API** | Transactional Password Reset & Admin Alert Emails | Reliable sub-second email delivery without managing SMTP servers. |

---

## 7. Visual Screenshot Asset Catalog & Placeholder Index

The manual is pre-configured with standard visual placeholders. Team members capturing screenshots can save high-resolution PNGs to `/docs/assets/screenshots/` matching these exact slugs:

| Slug | Image File Path | Target Interface View |
| :--- | :--- | :--- |
| `01-create-account` | `/docs/assets/screenshots/01-create-account.png` | Registration form with validation fields |
| `02-awaiting-approval` | `/docs/assets/screenshots/02-awaiting-approval.png` | Holding page for PENDING users |
| `03-sign-in` | `/docs/assets/screenshots/03-sign-in.png` | Sign-in dialog with email and password |
| `04-password-reset` | `/docs/assets/screenshots/04-password-reset.png` | Password recovery request & new password form |
| `05-kanban-wip-alert` | `/docs/assets/screenshots/05-kanban-wip-alert.png` | Kanban board with red pulsing WIP limit alert |
| `06-issue-drawer-full` | `/docs/assets/screenshots/06-issue-drawer-full.png` | Slide-out drawer with subtasks and comments |
| `07-backlog-sprint-planning` | `/docs/assets/screenshots/07-backlog-sprint-planning.png` | Backlog queue and sprint staging view |
| `08-velocity-burndown` | `/docs/assets/screenshots/08-velocity-burndown.png` | Velocity report and sprint burndown chart |
| `09-admin-team-approvals` | `/docs/assets/screenshots/09-admin-team-approvals.png` | Team management approval table with role selectors |

---

*© 2026 ApexTrack Systems. All rights reserved. Generated automatically via `npm run docs:sync`.*
',
  'u1','u1', unixepoch('2026-10-06 01:00')*1000, unixepoch('2026-10-06 01:00')*1000);

-- Attachment metadata (R2 objects are uploaded in Phase 4) -----------
INSERT INTO attachments (id, issue_key, document_id, file_name, content_type, size_bytes, r2_key, uploaded_by_id, created_at) VALUES
 ('att-1','APEX-101',NULL,'d1_schema_v2.sql','application/sql',14541,'issues/APEX-101/att-1-d1_schema_v2.sql','u3', unixepoch('2026-10-02')*1000),
 ('att-2','APEX-101',NULL,'edge_latency_benchmark.pdf','application/pdf',1887437,'issues/APEX-101/att-2-edge_latency_benchmark.pdf','u3', unixepoch('2026-10-03')*1000),
 ('att-3','APEX-102',NULL,'a11y-audit-report.png','image/png',430080,'issues/APEX-102/att-3-a11y-audit-report.png','u4', unixepoch('2026-10-04')*1000),
 ('att-d1',NULL,'doc-1','latency-breakdown.csv','text/csv',28672,'documents/doc-1/att-d1-latency-breakdown.csv','u1', unixepoch('2026-10-04')*1000),
 ('att-d2',NULL,'doc-3','rollback-procedure.md','text/markdown',4608,'documents/doc-3/att-d2-rollback-procedure.md','u4', unixepoch('2026-09-30')*1000);
