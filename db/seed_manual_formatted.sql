-- ApexTrack Formatted Operations Manual & System Architecture Seed File
-- Remote D1 Execution Command:
-- npx wrangler d1 execute apextrack_db --remote --file=./db/seed_manual_formatted.sql

UPDATE documents
SET title = 'ApexTrack System Architecture, RBAC & Operations Manual',
    content = '# ApexTrack System Architecture, RBAC & Operations Manual

> [!NOTE]
> **Executive Summary**: ApexTrack is an enterprise-grade, zero-per-seat-cost serverless alternative to Jira Software and Atlassian Confluence. Built from the ground up on Cloudflare edge primitives (Next.js 16 App Router on Cloudflare Workers, Cloudflare D1 distributed SQLite, and Cloudflare R2 zero-egress object storage), ApexTrack delivers sub-20ms global response times worldwide without per-user licensing fees.

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
| SPRINT STATS     | +-------------------+ +-------------------+ +-------------------+ +-------------------+ |
| Sprint 24        | | [Story]  APEX-103 | | [Bug] 🚩 APEX-101 | | [Task]   APEX-102 | | [Story]  APEX-104 | |
| 80% Complete     | | Knowledge Base    | | D1 Database schema| | Kanban drag fix   | | RBAC Auth logic   | |
|                  | | 8 pts    (Assignee)| | 5 pts    (Assignee)| | 3 pts    (Assignee)| | 5 pts    (Assignee)| |
| PERSONA SWITCH   | +-------------------+ +-------------------+ +-------------------+ +-------------------+ |
| [ Alex Chen (Admin) v ]                |                                                                    |
+------------------+------------------------------------------------------------------------------------------+
```

### 1.1 Visual Ticket Representation

In ApexTrack documentation and live Kanban lanes, issues are styled as structured cards:

```kanban
key: APEX-101
title: Design and connect Cloudflare D1 edge database schema
status: In Progress
assignee: Marcus Brody
avatar: https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80
points: 5 pts
flagged: true
```

> [!WARNING]
> **Work-In-Progress (WIP) Limits**: When a Kanban lane''s ticket count exceeds its configured WIP cap (e.g. 5 tickets in `IN PROGRESS`), the swimlane header flashes bold red to warn project managers of operational bottlenecks.

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
4. **WIP Limits**: Swimlane headers set safety caps (`In Progress`: 5, `In Review`: 4). If a column exceeds its WIP limit, the issue counter badge alerts team members to clear bottlenecks.

#### C. Using the Issue Detail Drawer
1. Click on any ticket card key (e.g. `APEX-101`) to slide out the Issue Detail Drawer.
2. **Story Points**: Edit the story point value (0-100) to feed velocity tracking.
3. **Subtask Checklist**: Type a subtask name in the text box and press `Enter` to create item checklist. Check off completed items to update the progress bar (`X of Y completed`).
4. **Issue Linking**: Relate tickets by picking a relationship type (`blocks`, `is_blocked_by`, `relates_to`), typing the target key (e.g., `APEX-102`), and clicking **Link**.
5. **Flagging Impediments**: Click `🚩 Add Flag` in the drawer header. The ticket card turns amber and displays a flag badge on the board.

#### D. Mentioning Teammates & Notifications
1. In the Issue Drawer comments box, type a comment containing `@name` (e.g., `@alex`, `@sarah`, `@marcus`).
2. When posted, ApexTrack parses the mention, identifies the target user, and inserts a notification into `notifications`.
3. The tagged user receives an unread badge count on the **Notification Bell (`🔔`)** in the top navigation bar.

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

---

### 2.3 For Workspace Administrators

#### A. In-App User Approvals & Role Management
1. Click **Team & Access** in the left sidebar.
2. Under **Pending User Approvals**, locate new registrations (`status = PENDING`).
3. Select the appropriate role from the dropdown (`Admin`, `Member`, or `Viewer`).
4. Click **Approve** to activate the user account immediately.

#### B. Emergency Direct Database Promotion (Cloudflare D1 Console)
> [!TIP]
> If an Admin account is accidentally locked out or emergency access is needed via CLI, execute this direct D1 command:
> ```bash
> npx wrangler d1 execute apextrack_db --remote --command="UPDATE users SET status=''APPROVED'', role=''Admin'' WHERE email=''admin@apextrack.io'';"
> ```

---

## 3. Edge Stack Architecture & Benchmark Comparison

### 3.1 Plain-English Cloudflare Edge Stack Architecture

| Cloudflare Technology | What It Is | Why It Outperforms Traditional Jira |
| :--- | :--- | :--- |
| **Next.js on Cloudflare Pages** | Serverless Web Application framework running on V8 edge isolates across 300+ global data centers. | Eliminates centralized origin servers; pages load in <20ms globally without server cold starts. |
| **Cloudflare D1 SQLite** | Serverless distributed SQL database natively integrated into edge functions. | Zero database server management, zero port configurations, sub-15ms edge read caching. |
| **Cloudflare R2 Storage** | High-performance object storage for issue and document file attachments. | S3-compatible file storage with **zero bandwidth egress fees**, saving thousands in bandwidth costs. |

### 3.2 Feature Comparison: Per-Seat Jira vs. ApexTrack Edge Platform

| Feature / Dimension | Traditional Per-Seat Jira | ApexTrack Edge Architecture |
| :--- | :--- | :--- |
| **Pricing Model** | $8 - $16 per user / month (Expensive scaling) | Open Source / Zero per-seat fee (Cloudflare free/usage tier) |
| **Global Latency** | 200ms - 1500ms (Centralized US/EU AWS regions) | Sub-20ms worldwide (Anycast Edge deployment) |
| **Database Architecture** | Heavy PostgreSQL / MySQL instances | Cloudflare D1 distributed edge SQLite |
| **File Storage Egress** | Charged per GB downloaded (AWS S3 fees) | Cloudflare R2 ($0 Egress Bandwidth Fees) |
| **User Onboarding** | Manual enterprise license provisioning | Self-serve registration + In-App Admin Approval |
| **UI Responsiveness** | Heavy SPA bundle with slow initial load | Lightweight Next.js Server Components + Optimistic UI |
'
WHERE title LIKE '%Operations Manual%' OR id = 'doc-4';
