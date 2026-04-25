# Rendering Strategy

## Page-by-page breakdown

| Route             | Strategy | Reason                                                                   |
| ----------------- | -------- | ------------------------------------------------------------------------ |
| `/` (blog list)   | **SSR**  | Content changes with search/page params; SEO matters for discoverability |
| `/blog/[slug]`    | **SSR**  | View count must be fresh; SEO title/description per post                 |
| `/admin/login`    | **CSR**  | No SEO needed; depends on client-side form state                         |
| `/admin/blogs`    | **CSR**  | Requires auth token from localStorage; highly interactive                |
| `/admin/comments` | **CSR**  | Same as above                                                            |

## SSR — Server-Side Rendering

Pages rendered on the server per request. Data fetched inside `async` Server Components.

**Used by:** `/` and `/blog/[slug]`

```tsx
// app/page.tsx — data fetched at request time
export default async function BlogListPage({ searchParams }: PageProps) {
  const { data: blogs, total } = await getBlogs({ search, page, limit: PAGE_SIZE });
  return <BlogCard blog={...} />;
}
```

**Why SSR instead of SSG:**

- Blog list varies by `?search=` and `?page=` params — too many combinations for static generation.
- Blog detail increments `viewCount` on each read — the count must be current.
- Both pages benefit from search-engine indexing, so client-side rendering is avoided.

**Trade-off:** Every request hits the backend. For high traffic, ISR (see below) reduces this.

## CSR — Client-Side Rendering

Pages fetched in the browser after hydration. Marked with `'use client'`.

**Used by:** All admin pages.

```tsx
'use client';
export default function AdminBlogsPage() {
  const { token } = useAdminAuth(); // reads localStorage
  useEffect(() => {
    fetchBlogs();
  }, [token]);
  // ...
}
```

**Why CSR for admin:**

- The JWT token lives in `localStorage` — inaccessible during SSR.
- Admin pages are never indexed by search engines.
- Data is highly dynamic (approve a comment -> list updates immediately).

## ISR — Incremental Static Regeneration (recommended upgrade)

Not currently implemented, but the ideal next step for the blog list and detail pages once traffic grows:

```tsx
// Revalidate cached page every 60 seconds
export const revalidate = 60;

// Or per-fetch:
await apiFetch('/blog', { next: { revalidate: 60 } });
```

With ISR, Next.js serves a cached static page and regenerates it in the background. This eliminates database round-trips on every request while keeping content reasonably fresh.

**Trade-off:** View counts would lag by up to `revalidate` seconds. Acceptable for most blogs; if real-time counts are required, keep `/blog/[slug]` as SSR.

## SSG — Static Site Generation

Not suitable for this blog because:

- Blog list changes when posts are published/unpublished.
- `viewCount` changes on every visit.
- Search and pagination produce unbounded parameter combinations.

SSG with `generateStaticParams` would work for blog detail pages _if_ view count accuracy is not required, and the site is rebuilt on publish — practical for very small blogs.

## Summary

```
Public pages  ->  SSR  ->  fresh data, good SEO, renders on server
Admin pages   ->  CSR  ->  token-gated, interactive, no SEO needed
Future        ->  ISR  ->  cached SSR with time-based revalidation
```
