# Kynov | Agile Velocity & Sprint Tracking

Next-generation Agile Velocity & Sprint Tracking engine for high-output software engineering teams.

## Overview

Kynov provides enterprise-grade Jira-style tracking with Linear-grade speed:
- **Interactive Kanban Boards**: Real-time drag-and-drop with optimistic updates, WIP limits, and sound effects.
- **Sprint Backlogs & Planning**: Drag-and-drop reordering using distributed fractional indexing.
- **Velocity Metrics**: Built-in velocity charts, burndown indicators, and scope health monitoring.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions (Admin, Member, Viewer, Guest) with approval queues.
- **Serverless Edge Architecture**: Powered by Next.js 16, Cloudflare Pages/Workers, Cloudflare D1 (SQLite), and Cloudflare R2 object storage.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run type check
npm run typecheck

# Run test suites
npm run test:ranking

# Local database migration & seeding
npm run db:migrate:local
npm run db:seed:local
```

## Production Deployment

Deploy seamlessly to Cloudflare Workers / Pages using OpenNext:

```bash
npm run deploy
```
