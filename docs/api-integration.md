# API Integration

Backend base URL: `http://localhost:3001/api` (configurable via `NEXT_PUBLIC_API_URL`)

## Frontend -> API endpoint mapping

| Frontend page / action      | HTTP method | Endpoint                     | Auth         |
| --------------------------- | ----------- | ---------------------------- | ------------ |
| Blog list page              | GET         | `/blog?search=&page=&limit=` | No           |
| Blog detail page            | GET         | `/blog/:slug`                | No           |
| Blog images (detail + list) | GET         | `/blog/:blogId/image`        | **See note** |
| Submit comment              | POST        | `/blog/:blogId/comment`      | No           |
| Admin login                 | POST        | `/auth/login`                | No           |
| Admin logout                | POST        | `/auth/logout`               | Bearer       |
| Admin blog list             | GET         | `/blog?search=&page=&limit=` | Bearer       |
| Admin edit blog             | PUT         | `/blog/:id`                  | Bearer       |
| Admin publish/unpublish     | PUT         | `/blog/:id` (status field)   | Bearer       |
| Admin list comments         | GET         | `/comment?status=&blogId=`   | Bearer       |
| Admin approve comment       | PATCH       | `/comment/:id/approve`       | Bearer       |
| Admin reject comment        | PATCH       | `/comment/:id/reject`        | Bearer       |

## API client layer (`lib/api.ts`)

All requests go through `apiFetch`, a thin `fetch` wrapper:

```typescript
apiFetch<T>(path, { method, body, token, cache, next });
```

- Prefixes `NEXT_PUBLIC_API_URL` automatically.
- Attaches `Authorization: Bearer <token>` when `token` is provided.
- Throws the parsed JSON error body on non-2xx responses (matches backend `{ statusCode, message, error }` shape).
- Returns `undefined` for 204 No Content responses.

## Authentication flow

```
1. POST /auth/login  ->  { accessToken }
2. Store token in localStorage + mirror to cookie (for middleware)
3. Client components: read token from useAdminAuth(), pass to API functions
4. Middleware: read cookie, redirect /admin/* to /admin/login if absent
5. POST /auth/logout  ->  invalidates token in Redis; clear localStorage + cookie
```

The backend uses a sliding 1-hour JWT. The token is re-cached in Redis on every valid request, so active sessions stay alive automatically.

## Image URL rendering

Blog images are stored as fully-qualified URLs (e.g., `https://cdn.example.com/photo.jpg`). Rendering uses `next/image`:

```tsx
import Image from 'next/image';

<Image
  src={imageUrl} // any https:// URL
  alt={title}
  fill
  className="object-cover"
  sizes="768px"
/>;
```

`next.config.ts` permits all HTTPS hosts:

```ts
images: {
  remotePatterns: [{ protocol: 'https', hostname: '**' }],
}
```

For local development with the backend serving images on `localhost:3001`, the `http://localhost:3001` pattern is also allowed.

## Known backend limitations

### `content` not included in blog list

`GET /blog` excludes the `content` field. The blog list card shows content only if the field is present. A future backend change could add a `summary` field (first ~150 chars) to the list response.

### Blog images may require auth

`GET /blog/:blogId/image` is documented under "Auth Required". For public blog pages this is a backend design issue — the frontend calls it optimistically (without a token) and silently omits images if the backend rejects the request. Recommended fix: move image reads to a public endpoint or embed `coverImageUrl` directly in the blog list/detail responses.

### No pagination on comments

`GET /comment` returns all comments for the filter. For blogs with many comments this could be slow. The frontend displays all returned results; pagination would require a backend change.

## Response shapes

### Blog list

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "slug": "string",
      "viewCount": 0,
      "status": 1,
      "authorId": "uuid",
      "createdAt": "ISO 8601",
      "updatedAt": "ISO 8601"
    }
  ],
  "total": 42
}
```

### Blog detail

```json
{
  "id": "uuid",
  "title": "string",
  "slug": "string",
  "content": "full text",
  "viewCount": 17,
  "status": 1,
  "authorId": "uuid",
  "createdAt": "ISO 8601",
  "updatedAt": "ISO 8601",
  "comments": [
    {
      "id": "uuid",
      "blogId": "uuid",
      "content": "string",
      "authorName": "string",
      "status": "pending | approved | rejected",
      "createdAt": "ISO 8601",
      "updatedAt": "ISO 8601"
    }
  ]
}
```

> The backend returns **all** comments regardless of status. The frontend filters to `status === 'approved'` before rendering.

### Comment submission

```json
// POST /blog/:blogId/comment
// Request
{ "authorName": "string", "content": "string" }

// Response 201
{ "id": "uuid", "blogId": "uuid", "authorName": "...", "content": "...", "status": "pending", ... }
```

## Environment variable

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Prefix `NEXT_PUBLIC_` makes the value available in both Server Components and Client Components. For production, set this to the deployed backend URL.
