# Package naming & workspace

- All packages use `@vemtap-fos/*` scope
- Internal deps use `workspace:*` protocol — never pinned versions
- Example: `"@vemtap-fos/shared-types": "workspace:*"`

## Workspace layout

```
apps/api/           → @vemtap-fos/api
apps/web/           → @vemtap-fos/web
packages/shared-types/    → @vemtap-fos/shared-types
packages/config-typescript/ → @vemtap-fos/tsconfig
packages/config-eslint/    → @vemtap-fos/eslint-config
```
