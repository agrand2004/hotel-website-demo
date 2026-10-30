# Hotel Rheinblick — demo site

Fictitious hotel booking website used as the target of the MCP creator demo
(see [AGENTS.md](AGENTS.md)). Monorepo managed with pnpm workspaces.

| Path | Role |
|---|---|
| `apps/web` | Vite + React + Tailwind SPA |
| `apps/api` | Hono REST API + Prisma (PostgreSQL) |
| `packages/shared` | Zod schemas shared by both apps |

## Getting started

```bash
pnpm install
pnpm db:up        # PostgreSQL in Docker
pnpm db:migrate   # apply Prisma migrations
pnpm db:seed      # fictitious rooms
pnpm dev          # web on :5173, api on :3001
```
