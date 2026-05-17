# Prisma + PostgreSQL

## Schema conventions

- Model names: PascalCase, singular (`User`, `Business`)
- Fields: camelCase
- `@@map("snake_case")` for table names, `@map()` for FK fields
- Use Prisma `enum` not string fields for constrained values
- `@id @default(cuid())` for PKs — never autoincrement
- `createdAt` + `updatedAt` on every model
- Soft-delete: `deletedAt DateTime?` with middleware filtering
- `///` comments for complex fields

## Service pattern

- `PrismaModule` is `@Global()` — imports once, injects everywhere
- `PrismaService` extends `PrismaClient`, implements `OnModuleInit`
- Feature modules import `PrismaModule`, services inject `PrismaService`
- Controllers **never** access Prisma directly — always through services
- Services expose domain methods, not raw Prisma queries

## N+1 prevention (CRITICAL)

- **Always** use `include` or `select` to eagerly load relations
- Never lazy-access relations in loops
- Use `findMany` with nested `include` instead of iterative queries
- For subset of fields, prefer `select` over `include`
- `$transaction([...])` for multi-record writes
- `@@index` on FKs and frequently filtered columns
- Enable query logging in `PrismaService` to catch accidental queries

### Bad (N+1):

```typescript
const users = await prisma.user.findMany();
for (const u of users) {
  const posts = await prisma.post.findMany({ where: { userId: u.id } });
}
```

### Good:

```typescript
const users = await prisma.user.findMany({
  include: { posts: true },
});
```
