# Next.js Web patterns

- **Server components by default** — `"use client"` only when interactivity is needed
- API calls through `src/lib/api-client.ts` (typed `fetch` wrappers)
- No direct DB access — always through the API
- Server components fetch data server-side, pass as props
- Client components: `useSWR` or React `use` for data fetching
- Forms: `react-hook-form` + `@hookform/resolvers/zod` matching shared DTOs
- State: URL search params for filter/pagination, `useState` for ephemeral UI
- Avoid `useEffect` for data fetching
- Memoise with `useMemo` / `useCallback`
- Lazy-load route segments via `next/dynamic`
- No client-side sorting/filtering of large datasets — push to API

## Next.js version note

This project uses **Next.js 16** which has breaking changes from earlier versions. Read `node_modules/next/dist/docs/` before writing any code.
