# TypeScript conventions

- Use `@vemtap-fos/tsconfig/nextjs.json` or `nestjs.json` — never custom tsconfigs
- `strict: true` — no exceptions
- `interface` for object shapes, `type` for unions/primitives
- `as const` for literal constants, `satisfies` for type narrowing
- **No `any`** — use `unknown` and narrow with type guards
- All public API signatures must be explicitly typed
- No `// @ts-ignore` or `// eslint-disable` without a justification comment

## Shared types

- All cross-app types in `packages/shared-types/src/`
- Organised by domain: `entities/`, `dtos/`, `enums/`, `common/`
- Barrel export from `src/index.ts`
- Use **zod** schemas for runtime validation + type inference
- Never duplicate a type across apps
