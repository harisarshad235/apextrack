# Graph Report - ApexTrack  (2026-10-17)

## Corpus Check
- 135 files · ~190,399 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 2, .ico 2, .css 1)

## Summary
- 2618 nodes · 4066 edges · 199 communities (50 shown, 149 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `560123a6`
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
- getCurrentUser
- next
- getCurrentUser
- lib/auth.ts
- KanbanBoard.tsx
- test-ranking.ts
- User
- generate-docs-manifest.ts
- Console
- package.json
- TransformStream
- URL
- compilerOptions
- getDb
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
- Issue tracker: GitHub
- devDependencies
- Flagship
- R2ObjectBody
- UserAvatar
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
- Domain Docs
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
- next
- schemas.ts
- triage-labels.md
- types.ts
- Sprint
- LandingPage.tsx
- generate-brand-icons.js
- login/page.tsx
- EditSprintModal.tsx
- Kynov | Agile Velocity & Sprint Tracking
- Agent skills
- screenshots/README.md
- app/layout.tsx
- StartSprintModal.tsx

## God Nodes (most connected - your core abstractions)
1. `getDb` - 102 edges
2. `react` - 55 edges
3. `requireRole()` - 54 edges
4. `User` - 52 edges
5. `next` - 48 edges
6. `lucide-react` - 46 edges
7. `Workspace()` - 41 edges
8. `ensureEnterpriseSchema()` - 40 edges
9. `FullIssue` - 38 edges
10. `getCurrentUser()` - 34 edges

## Surprising Connections (you probably didn't know these)
- `CreateDocModalProps` --references--> `FullDocument`  [EXTRACTED]
  components/docs/CreateDocModal.tsx → lib/types.ts
- `DocumentReaderModalProps` --references--> `FullDocument`  [EXTRACTED]
  components/docs/DocumentReaderModal.tsx → lib/types.ts
- `LandingHeroProps` --references--> `User`  [EXTRACTED]
  components/landing/LandingHero.tsx → db/schema.ts
- `LandingNavbarProps` --references--> `User`  [EXTRACTED]
  components/landing/LandingNavbar.tsx → db/schema.ts
- `LandingPageProps` --references--> `User`  [EXTRACTED]
  components/landing/LandingPage.tsx → db/schema.ts

## Import Cycles
- None detected.

## Communities (199 total, 149 thin omitted)

### Community 0 - "cloudflare-env.d.ts"
Cohesion: 0.00
Nodes (931): AgentMemoryGetSummaryOptions, AgentMemoryGetSummaryResponse, AgentMemoryIncomingMemory, AgentMemoryIngestOptions, AgentMemoryListMemoriesOptions, AgentMemoryListMemoriesResult, AgentMemoryMemory, AgentMemoryMemoryListEntry (+923 more)

### Community 1 - "react"
Cohesion: 0.15
Nodes (22): logoutUser(), resetPassword(), AwaitingApprovalPage(), dynamic, ForgotPasswordPage(), ResetPasswordForm(), ResetPasswordPage(), ApexLogo() (+14 more)

### Community 2 - "schema.ts"
Cohesion: 0.03
Nodes (66): AddCommentResult, BurndownDay, CFDDayMetric, getCumulativeFlowDiagramAction(), getSprintBurndownAction(), getVelocityReportAction(), VelocitySprintMetric, AGILE_ISSUE_TYPES (+58 more)

### Community 3 - "ServiceWorkerGlobalScope"
Cohesion: 0.04
Nodes (7): AbortSignal, EventSource, EventTarget, MessagePort, ServiceWorkerGlobalScope, WebSocket, WorkerGlobalScope

### Community 4 - "Event"
Cohesion: 0.04
Nodes (12): CloseEvent, CustomEvent, EmailEvent, ErrorEvent, Event, ExtendableEvent, FetchEvent, MessageEvent (+4 more)

### Community 5 - "Workspace.tsx"
Cohesion: 0.15
Nodes (25): createDocument(), deleteDocument(), updateDocument(), addComment(), deleteIssue(), createSwimlane(), deleteSwimlane(), updateSwimlane() (+17 more)

### Community 6 - "getDb"
Cohesion: 0.12
Nodes (40): getIssueGitLinksAction(), GitRefInput, linkGitRefAction(), unlinkGitRefAction(), addIssueLink(), addSubtask(), createIssue(), deleteSubtask() (+32 more)

### Community 7 - "oauth.ts"
Cohesion: 0.17
Nodes (19): loginAction(), loginUser(), requestPasswordReset(), LoginForm(), RFC-2046, bytesToHex(), createPasswordResetToken(), createSessionToken() (+11 more)

### Community 8 - "getCurrentUser"
Cohesion: 0.26
Nodes (18): assignUserToProject(), canManageProjectMembersAction(), createProject(), deleteProject(), getProjectMembersAction(), getUserProjectsAction(), removeUserFromProject(), updateProject() (+10 more)

### Community 9 - "next"
Cohesion: 0.18
Nodes (20): syncGithubWebhookAction(), dynamic, GET(), dynamic, GET(), dynamic, GET(), dynamic (+12 more)

### Community 10 - "getCurrentUser"
Cohesion: 0.16
Nodes (19): clearNotificationAction(), EnrichedNotification, getUserNotificationsAction(), markAllNotificationsAsReadAction(), markNotificationAsReadAction(), dynamic, GET(), GET() (+11 more)

### Community 11 - "lib/auth.ts"
Cohesion: 0.21
Nodes (12): DELETE(), GET(), POST(), dynamic, attachments, users, Db, getBucket (+4 more)

### Community 12 - "KanbanBoard.tsx"
Cohesion: 0.14
Nodes (23): BacklogView(), formatDateDisplay(), DEFAULT_WIP_LIMITS, getColBadgeColor(), getDotColor(), KanbanBoardView(), VelocityMetricsWidget(), VelocityMetricsWidgetProps (+15 more)

### Community 13 - "test-ranking.ts"
Cohesion: 0.08
Nodes (29): BASE_62, decrementInteger(), DEFAULT_NUMERIC_STEP, generateKeyBetween(), generateNKeysBetween(), getIntegerLength(), getIntegerPart(), incrementInteger() (+21 more)

### Community 14 - "User"
Cohesion: 0.17
Nodes (18): DashboardPage(), WorkspaceData, DashboardOverviewProps, DashboardSkeleton(), DocumentsViewProps, ProjectSwitcherProps, MetricsReportViewProps, ProjectMembersPanelProps (+10 more)

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

### Community 21 - "getDb"
Cohesion: 0.34
Nodes (13): addCommentAction(), extractAndFilterMentionTargets(), completeSprintAction(), createSprintAction(), deleteSprintAction(), ensureSprintTables(), getActiveSprintAction(), getProjectSprintsAction() (+5 more)

### Community 22 - "ArtifactsRepo"
Cohesion: 0.11
Nodes (5): ArtifactsRepo, Disposable, HyperdriveDynamic, StubBase, WorkflowInstanceSubscription

### Community 24 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, build:next, cf-typegen, db:generate, db:migrate:local, db:migrate:remote, db:seed:local (+9 more)

### Community 30 - "DocumentReaderModal.tsx"
Cohesion: 0.25
Nodes (12): DocumentReaderModal(), DocumentReaderModalProps, VisualAdminApprovalsMockup(), VisualBacklogMockup(), VisualDrawerMockup(), VisualHoldingRoomMockup(), VisualPasswordResetMockup(), VisualRegisterMockup() (+4 more)

### Community 31 - "dependencies"
Cohesion: 0.14
Nodes (14): dependencies, drizzle-orm, framer-motion, lucide-react, next, next-themes, @opennextjs/cloudflare, react (+6 more)

### Community 33 - "Body"
Cohesion: 0.15
Nodes (3): Body, Request, Response

### Community 39 - "StreamError"
Cohesion: 0.18
Nodes (11): AlreadyUploadedError, BadRequestError, ForbiddenError, InternalError, InvalidURLError, MaxFileSizeError, NotFoundError, QuotaReachedError (+3 more)

### Community 40 - "Issue tracker: GitHub"
Cohesion: 0.29
Nodes (6): Conventions, Issue tracker: GitHub, Pull requests as a triage surface, Wayfinding operations, When a skill says "fetch the relevant ticket", When a skill says "publish to the issue tracker"

### Community 41 - "devDependencies"
Cohesion: 0.18
Nodes (11): devDependencies, drizzle-kit, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node, @types/react (+3 more)

### Community 44 - "UserAvatar"
Cohesion: 0.14
Nodes (17): ActiveSprintMetrics, getActiveSprintMetricsAction(), ProjectSwitcher(), UserProfileModal(), UserProfileModalProps, Sidebar(), loadMetrics(), AddUserModalProps (+9 more)

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

### Community 78 - "Domain Docs"
Cohesion: 0.33
Nodes (5): Before exploring, read these, Domain Docs, File structure, Flag ADR conflicts, Use the glossary's vocabulary

### Community 122 - "__BaseEnv_CloudflareEnv"
Cohesion: 0.67
Nodes (3): __BaseEnv_CloudflareEnv, CloudflareEnv, env

### Community 123 - "BasicImageTransformations"
Cohesion: 0.67
Nodes (3): BasicImageTransformations, RequestInitCfPropertiesImage, RequestInitCfPropertiesImageDraw

### Community 136 - "RequestInitCfPropertiesVaryHeader"
Cohesion: 0.67
Nodes (3): RequestInitCfPropertiesVaryAcceptHeader, RequestInitCfPropertiesVaryAcceptLanguageHeader, RequestInitCfPropertiesVaryHeader

### Community 184 - "next"
Cohesion: 0.15
Nodes (7): dynamic, GET(), POST(), cspHeader, nextConfig, securityHeaders, next

### Community 185 - "schemas.ts"
Cohesion: 0.18
Nodes (13): documents, sanitizeMarkdown(), sanitizePlainText(), createDocumentSchema, createIssueSchema, inviteUserSchema, loginSchema, passwordResetConfirmSchema (+5 more)

### Community 187 - "types.ts"
Cohesion: 0.17
Nodes (17): BoardFilters(), BoardFiltersProps, BoardFiltersState, PRIORITIES, FilterRibbon(), FilterRibbonProps, CommandPaletteProps, Attachment (+9 more)

### Community 188 - "Sprint"
Cohesion: 0.19
Nodes (14): UpdateSprintResult, BacklogViewProps, formatDateDisplay(), formatTimelineRange(), SprintHeader(), SprintHeaderProps, KanbanBoardProps, CreateIssueModalProps (+6 more)

### Community 189 - "LandingPage.tsx"
Cohesion: 0.25
Nodes (9): ExplicitLandingPage(), HomePage(), SessionRedirector(), FeatureGrid(), InteractivePreview(), LandingHero(), LandingHeroProps, LandingPage() (+1 more)

### Community 190 - "generate-brand-icons.js"
Cohesion: 0.22
Nodes (6): readEnvFromFile(), { execSync }, fs, path, run(), sharp

### Community 191 - "login/page.tsx"
Cohesion: 0.35
Nodes (8): registerUser(), LoginContent(), LoginPage(), SignupContent(), SignupPage(), RegisterForm(), RegisterFormProps, SocialAuthButtons()

### Community 192 - "EditSprintModal.tsx"
Cohesion: 0.35
Nodes (10): addDaysToDate(), calculateDayDiff(), detectPreset(), DURATION_DAYS_MAP, DurationPreset, EditSprintModal(), EditSprintModalProps, formatYMD() (+2 more)

### Community 193 - "Kynov | Agile Velocity & Sprint Tracking"
Cohesion: 0.40
Nodes (4): Development, Kynov | Agile Velocity & Sprint Tracking, Overview, Production Deployment

### Community 194 - "Agent skills"
Cohesion: 0.33
Nodes (5): Agent skills, Domain docs, Issue tracker, This is NOT the Next.js you know, Triage labels

### Community 197 - "app/layout.tsx"
Cohesion: 0.24
Nodes (7): geistMono, inter, jsonLd, metadata, RootLayout(), ThemeProvider(), next-themes

### Community 198 - "StartSprintModal.tsx"
Cohesion: 0.43
Nodes (6): addDays(), DURATION_DAYS_MAP, DurationPreset, formatYMD(), StartSprintModal(), StartSprintModalProps

## Knowledge Gaps
- **19 isolated node(s):** `RFC-5246`, `RFC-2253`, `RFC-9440`, `RFC-3339`, `RFC-2046` (+14 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1927 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
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
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.14616755793226383 - nodes in this community are weakly interconnected._
- **Why does `Console` connect `Console` to `cloudflare-env.d.ts`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Should `schema.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.03482003129890454 - nodes in this community are weakly interconnected._