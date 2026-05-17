<!-- BEGIN:vemtap-fos-monorepo-rules -->

# Vemtap FOS — Monorepo Rules

## Architecture

- **Monorepo** driven by pnpm workspaces + Turborepo
- `apps/api` — NestJS 11 REST API (Express platform)
- `apps/web` — Next.js 16 dashboard (PWA, client-heavy)
- `packages/shared-types` — TypeScript types shared across apps
- `packages/config-typescript` — Shared tsconfig presets
- `packages/config-eslint` — Shared ESLint config

## Package naming

- All packages use `@vemtap-fos/*` scope
- Import workspace packages via `workspace:*` protocol in `package.json`
- Never pin to a version for internal packages
- Example: `"@vemtap-fos/shared-types": "workspace:*"`

## TypeScript conventions

- Use the shared tsconfig presets (`@vemtap-fos/tsconfig/nestjs.json` or `nextjs.json`)
- `strict: true` is enforced — no exceptions
- Prefer `interface` over `type` for object shapes, `type` for unions/primitives
- Use `as const` for literal constants, `satisfies` for type narrowing
- Avoid `any` — use `unknown` and narrow with type guards
- All public API signatures must be typed explicitly

## Shared types (`@vemtap-fos/shared-types`)

- Place all types shared between API and Web here
- Organise by domain: `src/entities/`, `src/dtos/`, `src/enums/`, `src/common/`
- Export from `src/index.ts` via barrel
- Use `zod` schemas for runtime validation AND type inference (see Prisma section)
- Never duplicate a type across apps — put it here

Example structure:
```
packages/shared-types/src/
  entities/
    user.ts
    business.ts
  dtos/
    create-user.dto.ts
  enums/
    role.enum.ts
  common/
    api-response.ts
    pagination.ts
  index.ts
```

## NestJS API conventions (`apps/api`)

- Feature-based modules: `src/<feature>/` with `module.ts`, `controller.ts`, `service.ts`, `dto/`
- Controllers are thin — validation, serialisation only
- Services contain all business logic
- Use `@nestjs/config` for env vars with validated `ConfigService`
- Use pipes (`ValidationPipe`) with `whitelist: true`, `transform: true`
- Expose DTOs via `@nestjs/swagger` decorators for OpenAPI docs
- Error handling: throw `HttpException` subclasses from services
- Never import Prisma from a controller — abstract behind a service

## Next.js Web conventions (`apps/web`)

- Prefer server components by default; add `"use client"` only when interactivity is needed
- API calls go through a thin client layer in `src/lib/api-client.ts` (use `fetch` with typed wrappers)
- No direct database access from web — always through the API
- Server components fetch data server-side, pass as props
- Client components use `useSWR` or React `use` for data fetching
- Forms: `react-hook-form` + `zod` validation matching shared DTOs
- State: prefer URL search params for filter/page state; `useState` for ephemeral UI state

## Prisma + PostgreSQL

### Setup

- Prisma lives in `apps/api/prisma/schema.prisma`
- Single data source of truth — no raw SQL unless absolutely necessary
- Use `prisma generate` after every schema change
- Keep migrations in `apps/api/prisma/migrations/`
- Run `pnpm --filter @vemtap-fos/api exec prisma migrate dev` for development

### Prisma schema conventions

- Model names: PascalCase, singular (e.g. `User`, `Business`)
- Field names: camelCase
- Relation fields: use both `@relation` and explicit foreign keys
- Always set `@@map()` to snake_case for table names
- Always set `@map()` for foreign key fields
- Use enums (via Prisma `enum`) not string fields for constrained values
- Add `createdAt` and `updatedAt` via `@default(now())` and `@updatedAt`
- Use `@id @default(cuid())` for primary keys — never autoincrement
- Soft-delete: add `deletedAt DateTime?` and filter in middleware
- Document complex fields with `///` comments

Example fragment:
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  businesses Business[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

enum Role {
  USER
  ADMIN
  SUPER_ADMIN
}
```

### Prisma service pattern

- Create a `PrismaModule` (global, `@Global()` decorator) that provides `PrismaService`
- `PrismaService` extends `PrismaClient` and implements `OnModuleInit`
- Feature modules import `PrismaModule` and use `PrismaService` in their services

```typescript
// prisma/prisma.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

- Never access `PrismaService` from controllers — only from services
- Services expose domain methods, not raw Prisma queries

## Avoiding N+1 queries

- **Always use `include` or `select` to eagerly load relations** in a single query
- Avoid lazy relation access in loops (e.g. `for (const u of users) { u.posts }`)
- Use Prisma's `findMany` with nested `include` rather than iterative queries

### Bad (N+1):
```typescript
const users = await prisma.user.findMany();
for (const user of users) {
  const posts = await prisma.post.findMany({ where: { userId: user.id } });
}
```

### Good (single query):
```typescript
const users = await prisma.user.findMany({
  include: { posts: true },
});
```

- For deeply nested data, use `include` up to 3 levels; beyond that, restructure
- Use `batch` transactions (`prisma.$transaction([...])`) for multi-record writes
- When you need only a subset of fields, prefer `select` over `include` to reduce payload
- Use Prisma's `@@index` on foreign keys and frequently filtered columns
- Monitor `PrismaService` use with logging middleware to catch accidental queries

```typescript
// In PrismaService constructor:
constructor() {
  super({
    log: ['query', 'info', 'warn', 'error'],
  });
}
```

## Zod + DTO validation

- Define validation schemas in `@vemtap-fos/shared-types` using `zod`
- Infer TypeScript types from zod schemas with `z.infer<>`

```typescript
// packages/shared-types/src/dtos/create-user.dto.ts
import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100).optional(),
  role: z.enum(['USER', 'ADMIN']).default('USER'),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
```

- NestJS: use `ZodValidationPipe` or `@nestjs/zod` to validate at the controller boundary
- Web: use same zod schemas for form validation via `react-hook-form` + `@hookform/resolvers`
- One source of truth — never rewrite validation in two places

## API response patterns

- Consistent response envelope from all endpoints:

```typescript
// packages/shared-types/src/common/api-response.ts
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    perPage: number;
    total: number;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
```

- Use NestJS interceptors to wrap responses
- Use NestJS exception filters for consistent error responses

## Linting & formatting

- ESLint flat config via `@vemtap-fos/eslint-config`
- Prettier for formatting — run `pnpm format` before commit
- No `// eslint-disable` or `// @ts-ignore` without explicit justification comment

## Testing

- API: Jest (spec per service, e2e per module)
- Web: Vitest for component tests
- Name test files `*.spec.ts` (API) or `*.test.tsx` (Web)
- Mock Prisma using `@prisma/client` jest mock or `prisma-mock`
- Every service method must have a unit test

## Git conventions

- Commits: conventional commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`)
- Branch from `main`, PR to `main`
- Never commit `.env` files, `node_modules`, `dist`, `.next`

## Performance rules

- API: paginate all list endpoints (cursor-based preferred, offset acceptable for small sets)
- API: use Prisma `select` to fetch only needed columns
- Web: lazy-load route segments via Next.js dynamic imports
- Web: avoid `useEffect` for data fetching — use server components or SWR
- Web: memoise expensive computations with `useMemo` / `useCallback`
- Avoid client-side sorting/filtering of large datasets — push to API

## Granular rules

For focused deep-dives on individual topics, see `.agent/rules/`:

| File | Topic |
|---|---|
| `.agent/rules/architecture.md` | Architecture overview |
| `.agent/rules/typescript.md` | TypeScript + shared types |
| `.agent/rules/prisma.md` | Prisma schema + N+1 prevention |
| `.agent/rules/api.md` | NestJS API conventions |
| `.agent/rules/web.md` | Next.js Web conventions |
| `.agent/rules/workspace.md` | Package naming + workspace |

<!-- END:vemtap-fos-monorepo-rules -->
