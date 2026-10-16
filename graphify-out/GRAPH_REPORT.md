# Graph Report - ApexTrack  (2026-10-17)

## Corpus Check
- 131 files · ~188,683 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 2, .ico 2, .css 1)

## Summary
- 2578 nodes · 4026 edges · 192 communities (43 shown, 149 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `eccddf09`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- cloudflare-env.d.ts
- react
- schema.ts
- ServiceWorkerGlobalScope
- Event
- Workspace.tsx
- getDb
- oauth.ts
- projects.ts
- DashboardOverview.tsx
- next
- db.ts
- types.ts
- fractionalIndexing.ts
- User
- generate-docs-manifest.ts
- Console
- package.json
- TransformStream
- URL
- compilerOptions
- sprints.ts
- ArtifactsRepo
- URLSearchParams
- scripts
- Container
- DurableObjectStorage
- Element
- Headers
- SubtleCrypto
- DocumentReaderModal.tsx
- dependencies
- Blob
- Body
- BrowserRun
- FormData
- URLPattern
- DurableObjectState
- WorkerEntrypoint
- StreamError
- devDependencies
- Flagship
- R2ObjectBody
- BoardFilters.tsx
- middleware.ts
- AgentMemoryProfile
- ByteLengthQueuingStrategy
- WritableStream
- DurableObject
- DurableObjectTransaction
- ReadableStream
- Socket
- WorkflowInstance
- WritableStreamDefaultWriter
- manifest.json
- Ai
- AiSearchInstance
- DurableObjectNamespace
- R2Bucket
- Span
- SqlStorageCursor
- Vectorize
- AiSearchNamespace
- ReadableStreamBYOBReader
- VectorizeIndex
- Kynov User Operations Manual & Visual Handbook
- allowScripts
- AiSearchItem
- AiSearchItems
- Artifacts
- D1Database
- D1PreparedStatement
- ImageHandle
- KVNamespace
- ReadableByteStreamController
- ReadableStreamDefaultReader
- TextDecoder
- AiGateway
- Comment
- DurableObjectFacets
- ForwardableEmailMessage
- HostedImagesBinding
- HTMLRewriter
- HTMLRewriterDocumentContentHandlers
- ReadableStreamBYOBRequest
- ReadableStreamDefaultController
- StreamScopedCaptions
- StreamVideoHandle
- StreamWatermarks
- SyncKvStorage
- Table
- Text
- TextEncoder
- Tracing
- TransformStreamDefaultController
- Workflow
- AbortController
- AiSearchJob
- AiSearchJobs
- AutoRAG
- Cache
- Crypto
- D1DatabaseSession
- EndTag
- ExecProcess
- ExecutionContext
- HTMLRewriterElementContentHandlers
- ImagesBinding
- ImageTransformationResult
- ImageTransformer
- MediaTransformationResult
- Module
- Performance
- Queue
- R2MultipartUpload
- StreamBinding
- StreamScopedDownloads
- WebSocketRequestResponsePair
- WorkflowEntrypoint
- AgentMemoryNamespace
- __BaseEnv_CloudflareEnv
- BasicImageTransformations
- ColoLocalActorNamespace
- DOMException
- DurableObjectId
- Global
- HelloWorldBinding
- HyperdriveDynamicApi
- MediaTransformer
- Memory
- Message
- MessageBatch
- NodeStyleServer
- PipelineTransformationEntrypoint
- RequestInitCfPropertiesVaryHeader
- SqlStorage
- ToMarkdownService
- WorkerLoader
- WorkerStub
- WorkflowStep
- WritableStreamDefaultController
- AnalyticsEngineDataset
- AnalyticsSQLBinding
- CacheContext
- CacheStorage
- CloudflareAccessContext
- CompileError
- DispatchNamespace
- DocumentEnd
- EventListenerObject
- Hyperdrive
- IncomingRequestCfPropertiesBotManagement
- Instance
- JsonWebKey
- MediaBinding
- MediaTransformationGenerator
- MessageChannel
- Navigator
- NonRetryableError
- Pipeline
- ProcessEnv
- R2Checksums
- RateLimit
- ResponseFunctionToolCall
- RpcTarget
- RuntimeError
- ScheduledController
- Scheduler
- SecretsStoreSecret
- SendEmail
- StreamVideos
- TraceItemFetchEventInfoRequest
- UnsafeTraceMetrics
- WebSearch
- postcss.config.mjs
- Base_Ai_Cf_Google_Gemma_4_26B_A4B_It
- __DURABLE_OBJECT_BRAND
- onRequest
- __RPC_STUB_BRAND
- __RPC_TARGET_BRAND
- __WORKER_ENTRYPOINT_BRAND
- __WORKFLOW_ENTRYPOINT_BRAND
- schemas.ts
- TeamManagement.tsx
- email.ts
- generate-brand-icons.js
- app/layout.tsx
- [...nextauth]/route.ts
- README.md
- AGENTS.md
- screenshots/README.md

## God Nodes (most connected - your core abstractions)
1. `getDb` - 102 edges
2. `react` - 55 edges
3. `requireRole()` - 54 edges
4. `User` - 52 edges
5. `next` - 48 edges
6. `lucide-react` - 46 edges
7. `Workspace()` - 40 edges
8. `ensureEnterpriseSchema()` - 40 edges
9. `FullIssue` - 38 edges
10. `getCurrentUser()` - 34 edges

## Surprising Connections (you probably didn't know these)
- `ProjectLayout()` --calls--> `verifyProjectAccess()`  [EXTRACTED]
  app/(workspace)/projects/[projectId]/layout.tsx → lib/rbac.ts
- `ProjectReportsPage()` --calls--> `getCurrentUser()`  [EXTRACTED]
  app/(workspace)/projects/[projectId]/reports/page.tsx → lib/auth.ts
- `ProjectReportsPage()` --calls--> `verifyProjectAccess()`  [EXTRACTED]
  app/(workspace)/projects/[projectId]/reports/page.tsx → lib/rbac.ts
- `ProjectSettingsPage()` --calls--> `getCurrentUser()`  [EXTRACTED]
  app/(workspace)/projects/[projectId]/settings/page.tsx → lib/auth.ts
- `ProjectSettingsPage()` --calls--> `getDb`  [EXTRACTED]
  app/(workspace)/projects/[projectId]/settings/page.tsx → lib/db.ts

## Import Cycles
- None detected.

## Communities (192 total, 149 thin omitted)

### Community 0 - "cloudflare-env.d.ts"
Cohesion: 0.00
Nodes (931): AgentMemoryGetSummaryOptions, AgentMemoryGetSummaryResponse, AgentMemoryIncomingMemory, AgentMemoryIngestOptions, AgentMemoryListMemoriesOptions, AgentMemoryListMemoriesResult, AgentMemoryMemory, AgentMemoryMemoryListEntry (+923 more)

### Community 1 - "react"
Cohesion: 0.11
Nodes (33): LoginContent(), LoginPage(), SignupContent(), SignupPage(), AwaitingApprovalPage(), dynamic, ForgotPasswordPage(), ExplicitLandingPage() (+25 more)

### Community 2 - "schema.ts"
Cohesion: 0.04
Nodes (50): AGILE_ISSUE_TYPES, attachmentsRelations, commentsRelations, DOC_CATEGORIES, documents, documentsRelations, ENTERPRISE_LINK_TYPES, GIT_LINK_PROVIDERS (+42 more)

### Community 3 - "ServiceWorkerGlobalScope"
Cohesion: 0.04
Nodes (7): AbortSignal, EventSource, EventTarget, MessagePort, ServiceWorkerGlobalScope, WebSocket, WorkerGlobalScope

### Community 4 - "Event"
Cohesion: 0.04
Nodes (12): CloseEvent, CustomEvent, EmailEvent, ErrorEvent, Event, ExtendableEvent, FetchEvent, MessageEvent (+4 more)

### Community 5 - "Workspace.tsx"
Cohesion: 0.16
Nodes (29): createDocument(), deleteDocument(), updateDocument(), addComment(), deleteIssue(), moveIssueStatus(), createSwimlane(), deleteSwimlane() (+21 more)

### Community 6 - "getDb"
Cohesion: 0.09
Nodes (53): addCommentAction(), extractAndFilterMentionTargets(), getIssueGitLinksAction(), GitRefInput, linkGitRefAction(), syncGithubWebhookAction(), unlinkGitRefAction(), addIssueLink() (+45 more)

### Community 7 - "oauth.ts"
Cohesion: 0.11
Nodes (36): loginAction(), loginUser(), logoutUser(), registerUser(), requestPasswordReset(), resetPassword(), POST(), dynamic (+28 more)

### Community 8 - "projects.ts"
Cohesion: 0.34
Nodes (15): assignUserToProject(), canManageProjectMembersAction(), createProject(), deleteProject(), getProjectMembersAction(), getUserProjectsAction(), removeUserFromProject(), updateProject() (+7 more)

### Community 9 - "DashboardOverview.tsx"
Cohesion: 0.18
Nodes (11): dynamic, GET(), dynamic, ProjectReportsPage(), DashboardOverviewProps, MetricsReportView(), MetricsReportViewProps, FilterBarProps (+3 more)

### Community 10 - "next"
Cohesion: 0.20
Nodes (15): getMyNotifications(), markNotificationsRead(), clearNotificationAction(), EnrichedNotification, getUserNotificationsAction(), markAllNotificationsAsReadAction(), markNotificationAsReadAction(), dynamic (+7 more)

### Community 11 - "db.ts"
Cohesion: 0.13
Nodes (18): AddCommentResult, DELETE(), GET(), ProjectSettingsPageProps, attachments, comments, notifications, users (+10 more)

### Community 12 - "types.ts"
Cohesion: 0.17
Nodes (17): AgileIssueType, Attachment, Comment, Document, HistoryEntry, Issue, IssueAuditLog, IssueComment (+9 more)

### Community 13 - "fractionalIndexing.ts"
Cohesion: 0.26
Nodes (10): BASE_62, decrementInteger(), DEFAULT_NUMERIC_STEP, generateKeyBetween(), generateNKeysBetween(), getIntegerLength(), getIntegerPart(), incrementInteger() (+2 more)

### Community 14 - "User"
Cohesion: 0.11
Nodes (25): DashboardPage(), WorkspaceData, BacklogViewProps, KanbanBoardProps, CommandPaletteProps, DashboardSkeleton(), CreateDocModalProps, DocumentReaderModalProps (+17 more)

### Community 15 - "generate-docs-manifest.ts"
Cohesion: 0.11
Nodes (19): APP_DIR, ASSETS_DIR, buildManualContent(), DOCS_DIR, generateHeader(), getAppRoutes(), scan(), getPackageMetadata() (+11 more)

### Community 17 - "package.json"
Cohesion: 0.10
Nodes (18): eslintConfig, description, name, private, version, drizzle-kit, eslint, eslint-config-next (+10 more)

### Community 18 - "TransformStream"
Cohesion: 0.10
Nodes (7): CompressionStream, DecompressionStream, FixedLengthStream, IdentityTransformStream, TextDecoderStream, TextEncoderStream, TransformStream

### Community 20 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 21 - "sprints.ts"
Cohesion: 0.06
Nodes (66): ActiveSprintMetrics, completeSprintAction(), createSprintAction(), deleteSprintAction(), ensureSprintTables(), getActiveSprintAction(), getActiveSprintMetricsAction(), getProjectSprintsAction() (+58 more)

### Community 22 - "ArtifactsRepo"
Cohesion: 0.11
Nodes (5): ArtifactsRepo, Disposable, HyperdriveDynamic, StubBase, WorkflowInstanceSubscription

### Community 24 - "scripts"
Cohesion: 0.12
Nodes (16): scripts, build, build:next, cf-typegen, db:generate, db:migrate:local, db:migrate:remote, db:seed:local (+8 more)

### Community 30 - "DocumentReaderModal.tsx"
Cohesion: 0.28
Nodes (11): DocumentReaderModal(), VisualAdminApprovalsMockup(), VisualBacklogMockup(), VisualDrawerMockup(), VisualHoldingRoomMockup(), VisualPasswordResetMockup(), VisualRegisterMockup(), VisualSignInMockup() (+3 more)

### Community 31 - "dependencies"
Cohesion: 0.14
Nodes (14): dependencies, drizzle-orm, framer-motion, lucide-react, next, next-themes, @opennextjs/cloudflare, react (+6 more)

### Community 33 - "Body"
Cohesion: 0.15
Nodes (3): Body, Request, Response

### Community 39 - "StreamError"
Cohesion: 0.18
Nodes (11): AlreadyUploadedError, BadRequestError, ForbiddenError, InternalError, InvalidURLError, MaxFileSizeError, NotFoundError, QuotaReachedError (+3 more)

### Community 41 - "devDependencies"
Cohesion: 0.18
Nodes (11): devDependencies, drizzle-kit, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node, @types/react (+3 more)

### Community 44 - "BoardFilters.tsx"
Cohesion: 0.29
Nodes (6): BoardFilters(), BoardFiltersProps, BoardFiltersState, PRIORITIES, FilterRibbon(), FilterRibbonProps

### Community 45 - "middleware.ts"
Cohesion: 0.42
Nodes (8): ALLOWED_ORIGINS, DEV_ALLOWED_ORIGINS, getCorsHeaders(), handleApiCors(), isAllowedOrigin(), config, middleware(), withSecurityHeaders()

### Community 47 - "ByteLengthQueuingStrategy"
Cohesion: 0.22
Nodes (3): ByteLengthQueuingStrategy, CountQueuingStrategy, QueuingStrategy

### Community 55 - "manifest.json"
Cohesion: 0.22
Nodes (8): background_color, description, display, icons, name, short_name, start_url, theme_color

### Community 66 - "Kynov User Operations Manual & Visual Handbook"
Cohesion: 0.07
Nodes (26): 1. Welcome to Kynov (The 30-Second Overview), 2. Getting Started & Authentication Flows (Step-by-Step with Visuals), 3. Daily Work & The Agile Board (For Team Members & Viewers), 4. Sprint Planning & Delivery (For Project Managers & Leads), 5. Team Management & Governance (For Workspace Admins), 6. Architecture Explained in 2 Minutes (Layman Edition), 7. Visual Screenshot Asset Catalog & Placeholder Index, Flow 2.1: Creating Your Account (+18 more)

### Community 67 - "allowScripts"
Cohesion: 0.29
Nodes (7): allowScripts, esbuild@0.18.20, esbuild@0.25.4, esbuild@0.28.1, esbuild@0.28.2, unrs-resolver@1.12.2, workerd@1.20261001.1

### Community 122 - "__BaseEnv_CloudflareEnv"
Cohesion: 0.67
Nodes (3): __BaseEnv_CloudflareEnv, CloudflareEnv, env

### Community 123 - "BasicImageTransformations"
Cohesion: 0.67
Nodes (3): BasicImageTransformations, RequestInitCfPropertiesImage, RequestInitCfPropertiesImageDraw

### Community 136 - "RequestInitCfPropertiesVaryHeader"
Cohesion: 0.67
Nodes (3): RequestInitCfPropertiesVaryAcceptHeader, RequestInitCfPropertiesVaryAcceptLanguageHeader, RequestInitCfPropertiesVaryHeader

### Community 185 - "schemas.ts"
Cohesion: 0.19
Nodes (12): sanitizeMarkdown(), sanitizePlainText(), createDocumentSchema, createIssueSchema, inviteUserSchema, loginSchema, passwordResetConfirmSchema, passwordResetRequestSchema (+4 more)

### Community 186 - "TeamManagement.tsx"
Cohesion: 0.60
Nodes (3): AddUserModalProps, TeamManagementViewProps, UserRole

### Community 187 - "email.ts"
Cohesion: 0.39
Nodes (7): RFC-2046, getEnvVar(), sendAdminNewUserAlert(), sendEmail(), SendEmailParams, sendMentionNotificationEmail(), sendPasswordResetEmail()

### Community 190 - "generate-brand-icons.js"
Cohesion: 0.22
Nodes (6): readEnvFromFile(), { execSync }, fs, path, run(), sharp

### Community 191 - "app/layout.tsx"
Cohesion: 0.28
Nodes (6): geistMono, inter, jsonLd, metadata, RootLayout(), ThemeProvider()

### Community 192 - "[...nextauth]/route.ts"
Cohesion: 0.67
Nodes (3): dynamic, GET(), POST()

### Community 193 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

## Knowledge Gaps
- **19 isolated node(s):** `RFC-5246`, `RFC-2253`, `RFC-9440`, `RFC-3339`, `RFC-2046` (+14 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1892 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **149 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `EventSource` connect `ServiceWorkerGlobalScope` to `cloudflare-env.d.ts`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `RFC-5246`, `RFC-2253`, `RFC-9440` to the rest of the system?**
  _19 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `cloudflare-env.d.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0021390374331550803 - nodes in this community are weakly interconnected._
- **Why does `AgentMemoryProfile` connect `AgentMemoryProfile` to `cloudflare-env.d.ts`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.10761705101327743 - nodes in this community are weakly interconnected._
- **Why does `Console` connect `Console` to `cloudflare-env.d.ts`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Should `schema.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.041928721174004195 - nodes in this community are weakly interconnected._