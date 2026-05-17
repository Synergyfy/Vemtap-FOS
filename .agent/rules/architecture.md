# Architecture

- **Monorepo** driven by **pnpm workspaces** + **Turborepo**
- `apps/api` — NestJS 11 REST API (Express)
- `apps/web` — Next.js 16 dashboard (PWA)
- `packages/shared-types` — shared TS types (entities, DTOs, enums)
- `packages/config-typescript` — tsconfig presets
- `packages/config-eslint` — shared ESLint config

## Data flow

```
Web (Next.js) → HTTP fetch → API (NestJS) → Prisma → PostgreSQL
```

- Web never accesses the database directly
- All shared types live in `packages/shared-types` and use zod for validation
