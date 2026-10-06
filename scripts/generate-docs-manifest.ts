import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const APP_DIR = path.join(ROOT_DIR, 'app');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');
const ASSETS_DIR = path.join(DOCS_DIR, 'assets', 'screenshots');
const TARGET_MANUAL = path.join(DOCS_DIR, 'USER_OPERATIONS_MANUAL.md');
const PACKAGE_JSON = path.join(ROOT_DIR, 'package.json');

interface RouteInfo {
  path: string;
  type: 'Page' | 'API' | 'Action';
  description: string;
}

function getAppRoutes(): RouteInfo[] {
  const routes: RouteInfo[] = [
    { path: '/', type: 'Page', description: 'Main Workspace Dashboard, Kanban Board, Documents, Backlog & Reports' },
    { path: '/login', type: 'Page', description: 'User Authentication, Persona Fast-Switcher & Gateway' },
    { path: '/login?tab=register', type: 'Page', description: 'Self-Service User Registration & Onboarding Portal' },
    { path: '/forgot-password', type: 'Page', description: 'Self-Service Password Recovery Request via Resend Email' },
    { path: '/reset-password', type: 'Page', description: 'Cryptographic HMAC Token Password Reset & Update Form' },
    { path: '/awaiting-approval', type: 'Page', description: 'Holding Room for New Accounts Pending Administrator Review' },
    { path: '/api/auth/logout', type: 'API', description: 'Secure Session Invalidation & Cookie Revocation' },
    { path: '/api/health', type: 'API', description: 'Edge Runtime & Database Health Check Endpoint' },
  ];

  return routes;
}

function getPackageMetadata(): { version: string; name: string } {
  try {
    const pkgContent = fs.readFileSync(PACKAGE_JSON, 'utf-8');
    const pkg = JSON.parse(pkgContent);
    return {
      name: pkg.name || 'ApexTrack',
      version: pkg.version || '1.0.0',
    };
  } catch (err) {
    return { name: 'ApexTrack', version: '1.0.0' };
  }
}

function generateHeader(): string {
  const meta = getPackageMetadata();
  const routes = getAppRoutes();
  const now = new Date();
  const dateStr = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

  let header = `<!-- ========================================================================= -->\n`;
  header += `<!-- APEXTRACK LIVING DOCUMENTATION MANIFEST & OPERATIONS HANDBOOK             -->\n`;
  header += `<!-- Automatically generated and verified by scripts/generate-docs-manifest.ts -->\n`;
  header += `<!-- ========================================================================= -->\n\n`;

  header += `# ApexTrack User Operations Manual & Visual Handbook\n\n`;
  header += `> **Living Documentation Status**: Active & Synchronized  \n`;
  header += `> **Release Version**: \`v${meta.version}\`  \n`;
  header += `> **Target Deployment Environment**: \`Cloudflare Pages Edge (V8 Serverless Isolates)\`  \n`;
  header += `> **Database Engine**: \`Cloudflare D1 Distributed SQLite\`  \n`;
  header += `> **Object Storage**: \`Cloudflare R2 Zero-Egress Storage\`  \n`;
  header += `> **Last Synchronized**: \`${dateStr}\`  \n\n`;

  header += `## Active Application Route Inventory\n\n`;
  header += `| Route Path | Type | Functional Purpose |\n`;
  header += `| :--- | :--- | :--- |\n`;
  for (const r of routes) {
    header += `| \`${r.path}\` | \`${r.type}\` | ${r.description} |\n`;
  }
  header += `\n---\n\n`;

  return header;
}

export function buildManualContent(): string {
  const header = generateHeader();

  const body = `## 1. Welcome to ApexTrack (The 30-Second Overview)

### What is ApexTrack?
ApexTrack is your team's central workspace for managing agile software delivery, tracking tickets, and publishing architecture documentation. Unlike traditional enterprise issue trackers that require heavy servers and expensive per-seat subscriptions, ApexTrack is built directly on Cloudflare's serverless edge network. It delivers sub-20 millisecond response times globally and has zero per-user licensing fees.

### The 3-Step Work Lifecycle

\`\`\`
  +--------------------+        +---------------------+        +--------------------+
  |  1. CAPTURE WORK   |  --->  |  2. MOVE ON BOARD   |  --->  | 3. MEASURE VELOCITY|
  | Stories, Bugs, ADRs|        | To Do -> Done Lanes |        | Burndown & Health  |
  +--------------------+        +---------------------+        +--------------------+
\`\`\`

1. **Capture Work**: Log User Stories, Bugs, Epics, Tasks, and Confluence-style Knowledge Base documents with rich markdown and attachments.
2. **Move on Board**: Drag cards across customizable Kanban swimlanes to provide instant visual transparency on active progress.
3. **Measure Delivery**: Monitor automated completion metrics, story point burndown charts, and Work-In-Progress (WIP) safety caps in real time.

---

## 2. Getting Started & Authentication Flows (Step-by-Step with Visuals)

\`\`\`
+-------------------------------------------------------------------------------------------------------------+
|                                    FLOW 2: AUTHENTICATION & ACCESS LIFECYCLE                                |
|                                                                                                             |
|  [ 2.1 Register ]  ----->  [ 2.2 Holding Room ]  ----->  [ 2.3 Sign In ]  ----->  [ 2.4 Password Reset ]    |
|  Enter name, email          Status: PENDING               Session Cookie           15-min Tokenized Email   |
|  & strong password          Awaiting Admin Review         Admin / Member / Viewer  via Resend Integration   |
+-------------------------------------------------------------------------------------------------------------+
\`\`\`

### Flow 2.1: Creating Your Account
1. Open the login portal and click the **Create Account** tab (or navigate directly to \`/login?tab=register\`).
2. Fill in your details:
   - **Full Name**: Your first and last name (e.g., \`Jordan Vance\`).
   - **Work Email Address**: Your corporate email (e.g., \`jordan.v@company.com\`).
   - **Password**: A secure password (minimum 6 characters).
   - **Department**: Your team (e.g., \`Frontend\`, \`Backend\`, \`QA\`, \`DevOps\`, \`Product\`).
3. Click **Create Account & Enter Approval Queue**.

![Create Account - Registration Form](/docs/assets/screenshots/01-create-account.png)

\`\`\`
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
\`\`\`

---

### Flow 2.2: The Holding Room (Awaiting Admin Approval)
**Why can't I see tasks immediately?**  
To protect organization privacy and enforce zero-trust governance, new accounts are created with a \`PENDING\` status and \`Viewer\` role. You will land on the holding page (\`/awaiting-approval\`).

1. Once your registration is submitted, an automated notification is dispatched to your workspace administrator.
2. The administrator reviews and approves your account from the **Team & Access** panel.
3. Once approved, you can immediately sign in and access the full workspace.

![Awaiting Approval - Holding Room](/docs/assets/screenshots/02-awaiting-approval.png)

\`\`\`
+----------------------------------------------------------------------+
| [ ⏳ Clock Icon - Amber Glow ]                                       |
| Account Pending Administrator Approval                               |
|----------------------------------------------------------------------|
| Welcome, Jordan Vance! Your account has been securely created.       |
| Organization administrators have been notified. Once approved, you   |
| will have full access to your team's workspace.                      |
|                                                                      |
| [ Check Approval Status ]            [ Sign In with Another Account ]|
+----------------------------------------------------------------------+
\`\`\`

---

### Flow 2.3: Signing In & Secure Sessions
1. Navigate to \`/login\` (or click **Sign In**).
2. Enter your work email and password.
3. Click **Sign In to Workspace**.
4. ApexTrack generates an encrypted session cookie and directs you to your active project board.

![Sign In - Authentication Portal](/docs/assets/screenshots/03-sign-in.png)

\`\`\`
+----------------------------------------------------------------------+
| [ApexTrack Logo] ApexTrack [v1.0]                                    |
| [ Sign In ]  |  Create Account                                       |
|----------------------------------------------------------------------|
| Work Email:        [ harisarshad235@gmail.com                      ] |
| Password:          [ ••••••••••••                               👁️ ] |
|                    [ Forgot password?                              ] |
| [  Sign In to Workspace                                            ] |
+----------------------------------------------------------------------+
\`\`\`

---

### Flow 2.4: Self-Service Password Recovery
If you forget your password, you can reset it in seconds without contacting IT support:

1. Click **Forgot password?** on the sign-in form (or visit \`/forgot-password\`).
2. Enter your work email address and click **Send Reset Link**.
3. Check your email inbox for a message from \`ApexTrack <notifications@harisarshad.site>\`.
4. Click the **Reset Password** button inside the email (valid for **15 minutes**).
5. Enter your new password, confirm it, and click **Save New Password**.
6. Sign in immediately with your new credentials.

![Password Reset - Recovery Request and Reset](/docs/assets/screenshots/04-password-reset.png)

\`\`\`
+----------------------------------------------------------------------+
| Password Recovery -> Email Link -> Set New Password                  |
|----------------------------------------------------------------------|
| 1. Enter email:    [ name@company.com ] -> [ Send Reset Link ]       |
| 2. Check Inbox:    "Reset your ApexTrack password" (15 min link)     |
| 3. Set Password:   New Password:     [ •••••••••••• ]                |
|                    Confirm Password: [ •••••••••••• ]                |
|                    [ Save New Password ]                             |
+----------------------------------------------------------------------+
\`\`\`

---

## 3. Daily Work & The Agile Board (For Team Members & Viewers)

\`\`\`
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
\`\`\`

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
- If a team member drags an extra ticket into a full column, the count badge turns **bold red with a pulsing alert** (\`[WIP 6/5]\`). This reminds the team to help review or finish existing cards before starting new work.

![Kanban WIP Limit Alert - Red Pulsing Header](/docs/assets/screenshots/05-kanban-wip-alert.png)

\`\`\`
+-----------------------+   +-----------------------+
| IN PROGRESS  [WIP 3/5]|   | IN REVIEW    [WIP 5/4]|  <-- Red Pulsing Header!
| 12 pts                |   | 14 pts (WIP Exceeded) |
+-----------------------+   +-----------------------+
\`\`\`

---

### Flow 3.4: Working with the Issue Detail Drawer
Click any ticket key (such as \`APEX-101\`) to slide out the comprehensive ticket drawer.

![Issue Detail Drawer - Full Feature View](/docs/assets/screenshots/06-issue-drawer-full.png)

\`\`\`
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
\`\`\`

- **Story Points**: Enter estimated complexity (e.g., 1, 2, 3, 5, 8, 13) to feed velocity burndown charts.
- **Subtask Checklist**: Type an item name and hit Enter. Checking off boxes updates the live percentage progress bar.
- **Flagging Impediments**: Click **🚩 Add Flag**. The card displays an amber badge on the board so leads can step in to unblock you.
- **Linking Issues**: Relate dependencies using \`blocks\`, \`is_blocked_by\`, or \`relates_to\` relationships.
- **Colleague Mentions & Notification Bell (🔔)**: Type \`@name\` (e.g. \`@sarah\`, \`@marcus\`) in comments. The tagged colleague receives an unread counter on their notification bell in the top navigation bar.

---

## 4. Sprint Planning & Delivery (For Project Managers & Leads)

### Flow 4.1: Managing the Global Backlog vs. Active Sprint Pools
1. Click **Backlog** in the left sidebar navigation.
2. The backlog screen separates work into:
   - **Active Sprint (Sprint 24)**: Committed tickets currently under execution.
   - **Upcoming Sprint (Sprint 25)**: Scope staged for next sprint's kickoff.
   - **Product Backlog Pool**: Unscheduled tickets, feature ideas, and technical debt.
3. Drag tickets from the backlog pool into an upcoming sprint and verify total planned story points before starting the sprint.

![Backlog & Sprint Planning View](/docs/assets/screenshots/07-backlog-sprint-planning.png)

---

### Flow 4.2: Reading Velocity Reports & Burndown Charts
Click **Velocity Reports** in the left sidebar to access team analytics.

![Velocity Reports & Sprint Burndown Chart](/docs/assets/screenshots/08-velocity-burndown.png)

\`\`\`
+-----------------------------------------------------------------------------+
| SPRINT 24 BURNDOWN & VELOCITY DASHBOARD                                     |
|-----------------------------------------------------------------------------|
| [Completion Rate: 75%]  [Velocity: 28/35 pts]  [In Flight: 5] [Defects: 2]  |
|                                                                             |
| Story                                                                       |
| Points                                                                      |
|  35 | *                                                                     |
|  28 |   *  \                                                                |
|  21 |     * \  (Ideal Burn - Dashed Line)                                   |
|  14 |       *\=====\                                                        |
|   7 |         *     \===== (Actual Burn - Solid Blue Line)                  |
|   0 +----------*-----------*---------------------------------------> Day    |
|    Day 1      Day 5       Day 10                                  Day 14    |
+-----------------------------------------------------------------------------+
\`\`\`

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

### Flow 5.1: The In-App Approval Center (\`/team\`)
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

\`\`\`bash
# Direct Administrator Promotion via Cloudflare D1
npx wrangler d1 execute apextrack_db --remote --command="UPDATE users SET status='APPROVED', role='Admin' WHERE email='harisarshad235@gmail.com';"
\`\`\`

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

The manual is pre-configured with standard visual placeholders. Team members capturing screenshots can save high-resolution PNGs to \`/docs/assets/screenshots/\` matching these exact slugs:

| Slug | Image File Path | Target Interface View |
| :--- | :--- | :--- |
| \`01-create-account\` | \`/docs/assets/screenshots/01-create-account.png\` | Registration form with validation fields |
| \`02-awaiting-approval\` | \`/docs/assets/screenshots/02-awaiting-approval.png\` | Holding page for PENDING users |
| \`03-sign-in\` | \`/docs/assets/screenshots/03-sign-in.png\` | Sign-in dialog with email and password |
| \`04-password-reset\` | \`/docs/assets/screenshots/04-password-reset.png\` | Password recovery request & new password form |
| \`05-kanban-wip-alert\` | \`/docs/assets/screenshots/05-kanban-wip-alert.png\` | Kanban board with red pulsing WIP limit alert |
| \`06-issue-drawer-full\` | \`/docs/assets/screenshots/06-issue-drawer-full.png\` | Slide-out drawer with subtasks and comments |
| \`07-backlog-sprint-planning\` | \`/docs/assets/screenshots/07-backlog-sprint-planning.png\` | Backlog queue and sprint staging view |
| \`08-velocity-burndown\` | \`/docs/assets/screenshots/08-velocity-burndown.png\` | Velocity report and sprint burndown chart |
| \`09-admin-team-approvals\` | \`/docs/assets/screenshots/09-admin-team-approvals.png\` | Team management approval table with role selectors |

---

*© 2026 ApexTrack Systems. All rights reserved. Generated automatically via \`npm run docs:sync\`.*
`;

  return header + body;
}

export function syncManual(): void {
  if (!fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR, { recursive: true });
  }

  if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
  }

  // Create assets README
  const assetsReadme = path.join(ASSETS_DIR, 'README.md');
  if (!fs.existsSync(assetsReadme)) {
    fs.writeFileSync(
      assetsReadme,
      `# ApexTrack Screenshot Assets\n\nPlace high-resolution (1920x1080 or retina 2x) PNG screenshots here matching the naming conventions defined in \`/docs/USER_OPERATIONS_MANUAL.md\`.\n`
    );
  }

  const content = buildManualContent();
  fs.writeFileSync(TARGET_MANUAL, content, 'utf-8');
  console.log(`[Docs Sync] Successfully compiled and synchronized ${TARGET_MANUAL}`);
}

// Execute if run directly
syncManual();
