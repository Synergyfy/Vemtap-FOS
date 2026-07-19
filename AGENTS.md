<!-- BEGIN:vemtap-fos-rules -->

# Vemtap FOS — Project Rules

## Architecture

- Single **Next.js 16** application in `apps/web/`
- Shared types live in `apps/web/src/shared/` (enums, DTOs, entities, common)
- All source code in `apps/web/src/`

## TypeScript conventions

- `strict: true` is enforced — no exceptions
- Prefer `interface` over `type` for object shapes, `type` for unions/primitives
- Use `as const` for literal constants, `satisfies` for type narrowing
- Avoid `any` — use `unknown` and narrow with type guards

## Shared types (`src/shared/`)

- Located at `apps/web/src/shared/`
- Organised by domain: `entities/`, `dtos/`, `enums/`, `common/`
- Exported from `src/shared/index.ts` via barrel
- Use `zod` schemas for runtime validation AND type inference

## Next.js conventions

- Prefer server components by default; add `"use client"` only when interactivity is needed
- API calls go through a thin client layer in `src/lib/api-client.ts`
- Server components fetch data server-side, pass as props
- Client components use `useSWR` or React `use` for data fetching
- Forms: `react-hook-form` + `zod` validation
- State: prefer URL search params for filter/page state; `useState` for ephemeral UI state

## Zod + DTO validation

- Define validation schemas in `src/shared/dtos/` using `zod`
- Infer TypeScript types from zod schemas with `z.infer<>`
- Use same zod schemas for form validation via `react-hook-form` + `@hookform/resolvers`

## Linting & formatting

- ESLint flat config (`eslint.config.mjs`)
- Prettier for formatting — run `pnpm format` before commit

## Testing

- Vitest for component tests
- Name test files `*.test.tsx`

## Git conventions

- Commits: conventional commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`)
- Branch from `main`, PR to `main`
- Never commit `.env` files, `node_modules`, `dist`, `.next`

## Performance rules

- Lazy-load route segments via Next.js dynamic imports
- Avoid `useEffect` for data fetching — use server components or SWR
- Memoise expensive computations with `useMemo` / `useCallback`
- Push sorting/filtering of large datasets to API

## Granular rules

For focused deep-dives, see `.agent/rules/`:

| File                        | Topic                     |
| --------------------------- | ------------------------- |
| `.agent/rules/typescript.md`| TypeScript conventions    |
| `.agent/rules/web.md`       | Next.js conventions       |

<!-- END:vemtap-fos-rules -->
