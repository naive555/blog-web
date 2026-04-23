# Blog Frontend (Next.js)

Frontend application for a Blog platform built with Next.js 15 App Router.  
Displays blog posts, handles comment submissions, and provides an admin panel for content management.

---

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript 5**
- **Tailwind CSS v4**
- **next-themes** (dark mode)
- **Vitest + Testing Library** (testing)

---

## Features

### Public
- Blog list with cover image, title, and date
- Search by title with pagination (10 per page)
- Blog detail with image gallery, view count, and approved comments
- Comment submission (Thai characters and numbers only, pending approval)

### Admin
- Login / logout
- Manage blogs — edit title & content, publish / unpublish
- Manage comments — approve or reject pending comments

---

## Getting Started

### 1. Install dependencies

```bash
bun install
```

### 2. Environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

`.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Make sure the backend API is running before starting the frontend.

### 3. Run development server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
app/
  page.tsx                        # Blog list (SSR)
  blog/[slug]/page.tsx            # Blog detail (SSR)
  admin/
    login/page.tsx                # Admin login (CSR)
    (protected)/
      layout.tsx                  # Sidebar + auth guard
      blogs/page.tsx              # Manage blogs (CSR)
      comments/page.tsx           # Manage comments (CSR)

components/
  BlogCard.tsx                    # Blog list item
  BlogImages.tsx                  # Cover + extra image gallery
  CommentForm.tsx                 # Comment submission form
  CommentList.tsx                 # Approved comments list
  Pagination.tsx                  # Page navigation
  SearchBar.tsx                   # Title search input
  Navbar.tsx                      # Public top navigation

lib/
  api.ts                          # Base fetch wrapper
  types.ts                        # Shared TypeScript types
  blog.api.ts                     # Blog & image API calls
  comment.api.ts                  # Comment submission
  admin.api.ts                    # Admin auth & management

hooks/
  useAdminAuth.ts                 # JWT lifecycle (login, logout, persist)
```

---

## Rendering Strategy

| Route             | Strategy | Reason                                      |
| ----------------- | -------- | ------------------------------------------- |
| `/`               | SSR      | Search/page params vary; SEO required       |
| `/blog/[slug]`    | SSR      | Fresh view count; SEO per post              |
| `/admin/login`    | CSR      | Form state only, no SEO                     |
| `/admin/blogs`    | CSR      | Requires localStorage token; interactive    |
| `/admin/comments` | CSR      | Same as above                               |

---

## Available Scripts

```bash
bun run dev        # Start development server
bun run build      # Production build
bun run start      # Start production server
bun run lint       # Run ESLint
bun run test       # Run tests (watch mode)
bun run test:run   # Run tests (CI mode)
```

---

## Backend Requirement

This frontend requires the [blog-api](../blog-api) backend to be running. Key endpoints used:

- `GET /blog` — blog list with search & pagination
- `GET /blog/:slug` — blog detail with comments
- `GET /blog/:blogId/image` — blog images
- `POST /blog/:blogId/comment` — submit comment
- `POST /auth/login` — admin login
- `PUT /blog/:id` — update blog (admin)
- `PATCH /comment/:id/approve` — approve comment (admin)
- `PATCH /comment/:id/reject` — reject comment (admin)

See [docs/api-integration.md](docs/api-integration.md) for the full mapping.

---

## Documentation

- [docs/architecture.md](docs/architecture.md) — folder structure and design decisions
- [docs/rendering-strategy.md](docs/rendering-strategy.md) — SSR / CSR / ISR explained
- [docs/api-integration.md](docs/api-integration.md) — API endpoint mapping and auth flow

---

## License

MIT
