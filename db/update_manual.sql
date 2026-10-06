-- ApexTrack Operations Manual & User Guide Update Script
-- To apply to local D1:  npx wrangler d1 execute apextrack_db --local --file=./db/update_manual.sql
-- To apply to remote D1: npx wrangler d1 execute apextrack_db --remote --file=./db/update_manual.sql

UPDATE documents
SET title = 'ApexTrack System Architecture, RBAC & Operations Manual',
    content = '# ApexTrack System Architecture, RBAC & Operations Manual

> **Executive Overview**: ApexTrack is an enterprise-grade, zero-per-seat-cost serverless alternative to Jira Software and Atlassian Confluence. It is architected from the ground up on Cloudflare edge primitives (Next.js 16 App Router on Cloudflare Workers, Cloudflare D1 distributed SQLite, and Cloudflare R2 zero-egress object storage).

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
- **[WIP 5/5] (Red Pulsing Header)**: Triggered when column issue count exceeds Work-In-Progress limit (`colIssues > limit`).
- **[⚡ Only My Issues]**: One-click filter to display tickets assigned to your active account.
- **[🚩 Flagged Blockers]**: Filters board to display only blocked/flagged tickets.
- **[⏳ Recently Updated]**: Sorts cards by latest history audit timestamp.
- **🔔 (2) (Notification Bell)**: Header bell badge showing unread @mention alerts.

---

## 2. End-to-End User Guide by Persona

### 2.1 For All Members & Viewers

#### A. Sign Up & Holding Screen (`PENDING` Status)
1. Navigate to `/login?tab=register` or click **Register**.
2. Fill in your Name, Email, and Password. Upon submitting, your account is created with `status = PENDING`.
3. You will automatically land on the `/awaiting-approval` holding page.
4. Edge middleware enforces security by restricting pending users from viewing workspace telemetry until an Administrator approves your account.

#### B. Navigating the Kanban Board & WIP Limits
1. Access the **Board** tab from the left sidebar.
2. Columns reflect dynamic swimlanes (`To Do`, `In Progress`, `In Review`, `Done`).
3. Drag cards between swimlanes to update issue status instantly.
4. **WIP Limits**: Swimlane headers set safety caps (`In Progress`: 5, `In Review`: 4). If a column exceeds its WIP limit, the issue counter badge turns bold red (`bg-red-500 text-white animate-pulse`) to alert team members to clear bottlenecks.

#### C. Using the Issue Detail Drawer
1. Click on any ticket card key (e.g. `APEX-101`) to slide out the Issue Detail Drawer.
2. **Story Points**: Edit the story point value (0-100) to feed velocity tracking.
3. **Subtask Checklist**: Type a subtask name in the text box and press `Enter` to create item checklist. Check off completed items to update the progress bar (`X of Y completed`).
4. **Issue Linking**: Relate tickets by picking a relationship type (`blocks`, `is_blocked_by`, `relates_to`), typing the target key (e.g., `APEX-102`), and clicking **Link**.
5. **Flagging Impediments**: Click `🚩 Add Flag` in the drawer header. The ticket card turns amber (`bg-amber-500/10 border-amber-500/60`) and displays a flag badge on the board.

#### D. Mentioning Teammates & Notifications
1. In the Issue Drawer comments box, type a comment containing `@name` (e.g., `@alex`, `@sarah`, `@marcus`).
2. When posted, ApexTrack parses the mention, identifies the target user, and inserts a notification into `notifications`.
3. The tagged user receives an unread badge count on the **Notification Bell (`🔔`)** in the top navigation bar. Clicking the bell opens a popover to preview mentions and jump directly to the issue.

---

### 2.2 For Project Leads & Technical PMs

#### A. Sprint Backlog Management
1. Click **Backlog** in the sidebar.
2. Review unassigned tickets in the global backlog pool vs. active sprint queues (`Sprint 24`, `Sprint 25`).
3. Assign backlog items to upcoming sprints and set target story points before sprint kickoff.

#### B. Reading Velocity Reports & Sprint Burndown
1. Click **Velocity Reports** in the sidebar.
2. **Metric Cards**: Monitor Overall Completion Rate %, Total Velocity Points Burned vs Committed, Active In-Flight tickets, and Open Defect counts.
3. **Sprint Burndown Chart**:
   - **Ideal Burn (Dashed Line)**: Plots linear progress from total committed story points at sprint start down to 0 at sprint end date.
   - **Actual Burn (Solid Blue Line)**: Plots actual remaining story points day-by-day based on tickets moved to `Done`.
   - **Trajectory Analysis**: If the solid line is above the dashed line, the sprint is behind schedule; if below, the sprint is ahead of schedule.

---

### 2.3 For Workspace Administrators

#### A. In-App User Approvals & Role Management
1. Click **Team & Access** in the left sidebar.
2. Under **Pending User Approvals**, locate new registrations (`status = PENDING`).
3. Select the appropriate role from the dropdown (`Admin`, `Member`, or `Viewer`).
4. Click **Approve** to activate the user account immediately.

#### B. Emergency Direct Database Promotion (Cloudflare D1 Console)
If an Admin account is accidentally locked out or emergency access is needed via CLI:
```bash
npx wrangler d1 execute apextrack_db --remote --command="UPDATE users SET status=''APPROVED'', role=''Admin'' WHERE email=''admin@apextrack.io'';"
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
| **UI Responsiveness** | Heavy SPA bundle with slow initial load | Lightweight Next.js Server Components + Optimistic UI |'
WHERE title LIKE '%Operations Manual%' OR id = 'doc-4';
