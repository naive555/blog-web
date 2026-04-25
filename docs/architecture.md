# Architecture

## Folder Structure

```
blog-web/
├── app/
│   ├── layout.tsx                     # Root layout: Navbar + ThemeProvider
│   ├── page.tsx                       # Blog list page (SSR)
│   ├── globals.css
│   ├── blog/
│   │   └── [slug]/page.tsx            # Blog detail page (SSR)
│   └── admin/
│       ├── login/page.tsx             # Admin login (CSR, no sidebar)
│       └── (protected)/               # Route group - applies sidebar layout
│           ├── layout.tsx             # Admin sidebar + auth guard
│           ├── page.tsx               # Admin dashboard / redirect
│           ├── blogs/page.tsx         # Manage blogs (CSR)
│           └── comments/page.tsx      # Manage comments (CSR)
│
├── components/
│   ├── Navbar.tsx          # Public top navigation (hidden inside /admin)
│   ├── BlogCard.tsx        # Blog list item with cover image
│   ├── BlogImages.tsx      # Cover + gallery display on blog detail
│   ├── CommentForm.tsx     # Thai-only comment submission form (CSR)
│   ├── CommentList.tsx     # Displays approved comments
│   ├── Pagination.tsx      # URL-driven page navigation (Link-based)
│   ├── SearchBar.tsx       # Controlled search input (CSR)
│   └── ThemeProvider.tsx   # next-themes dark-mode wrapper (unchanged)
│
├── lib/
│   ├── api.ts              # Base fetch wrapper with auth + error handling
│   ├── types.ts            # Shared TypeScript types (Blog, Comment, etc.)
│   ├── blog.api.ts         # Public blog fetch functions (getBlogs, getBlog)
│   ├── comment.api.ts      # Comment submission
│   └── admin.api.ts        # Admin auth + blog/image/comment management
│
├── hooks/
│   └── useAdminAuth.ts     # Token lifecycle: login, logout, persist to cookie
│
├── middleware.ts            # Redirects unauthenticated requests from /admin/*
└── docs/
    ├── architecture.md      ← this file
    ├── rendering-strategy.md
    └── api-integration.md
```

## Key Design Decisions

### Route group for admin layout isolation

`app/admin/(protected)/` is a Next.js route group. Parenthesised segments are invisible in URLs, so `/admin/(protected)/blogs/page.tsx` resolves to `/admin/blogs`. This isolates the sidebar layout from the login page (`/admin/login`) - avoiding an auth redirect loop where the layout checks for a token before one exists.

### Fetch over Axios

The API client (`lib/api.ts`) uses native `fetch` instead of `axios`. This integrates natively with Next.js 15's caching model (`cache`, `next.revalidate`) and avoids an extra dependency. Admin pages that need fresh data on every render call `apiFetch` with `cache: 'no-store'` implicitly (default browser fetch behaviour from Client Components).

### Named exports for all components

Per project convention (CLAUDE.md), every component uses a named export. Default exports remain only for Next.js page/layout files and the existing `ThemeProvider.tsx`.

### Token storage: localStorage + cookie dual-write

`useAdminAuth` stores the JWT in `localStorage` (for client-side reads) and mirrors it to a plain cookie (for server-side middleware reads). The cookie is `SameSite=Strict` to prevent CSRF. A more secure production setup would use `httpOnly` cookies via a Next.js API route proxy.

### Image URL handling

Blog images are stored as fully-qualified URLs in the backend. The frontend renders them with `next/image`, which enables lazy loading, format optimisation (WebP), and responsive `sizes`. `next.config.ts` allows all HTTPS hostnames with `hostname: '**'` to support arbitrary CDN URLs.

## Separation of Concerns

| Layer           | Responsibility                                 |
| --------------- | ---------------------------------------------- |
| `lib/*.api.ts`  | HTTP calls - no rendering, no state            |
| `components/`   | Pure presentational - receive data as props    |
| `app/` pages    | Orchestration - fetch data, pass to components |
| `hooks/`        | Stateful client behaviour (auth only)          |
| `middleware.ts` | Route protection at the Edge                   |

## Scaling Notes

- **Caching**: Public SSR pages currently use `cache: 'no-store'` for fresh view counts. For higher traffic, switch to `next: { revalidate: 60 }` (ISR) so pages are cached and revalidated every 60 seconds.
- **CDN**: Deploy with Vercel or Cloudflare for automatic edge caching of static assets.
- **Image CDN**: The backend stores image URLs; pair with Cloudflare R2 + Images or AWS S3 + CloudFront for transformations and global caching.
- **Image embedding**: Blog images (including cover) are embedded in the blog list and detail responses as `images: BlogImage[]`. No extra per-blog requests are needed; `BlogCard` reads `blog.images.find(img => img.isCover)` directly.
