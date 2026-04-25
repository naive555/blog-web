# Blog Image Upload - Cloudinary Integration

## Why Cloudinary instead of backend upload?

The backend API only accepts image **URLs** - it has no file-upload endpoint. Cloudinary fills this gap:

1. Frontend uploads the file directly to Cloudinary (no backend involvement).
2. Cloudinary returns a `secure_url`.
3. The frontend POSTs that URL to the backend (`POST /blog/:blogId/image`).

This keeps the backend simple (no S3/disk storage, no multipart parsing) and offloads CDN delivery to Cloudinary's edge network.

---

## Environment variables

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

Create an **unsigned upload preset** in your Cloudinary dashboard:
`Settings -> Upload -> Upload presets -> Add upload preset -> Signing mode: Unsigned`

Both variables are prefixed `NEXT_PUBLIC_` because the upload happens entirely in the browser.

---

## Upload flow

```
User selects file
       │
       ▼
ImageUploader (preview via blob URL)
       │
  [Save clicked]
       │
       ▼
uploadToCloudinary(file)          ← lib/cloudinary.ts
  POST https://api.cloudinary.com/v1_1/<cloud_name>/image/upload
  Body: FormData { file, upload_preset }
  Returns: { secure_url, ... }
       │
       ▼
addBlogImage(token, blogId, { url: secure_url, isCover })
  POST /blog/:blogId/image        ← backend
```

---

## Key files

| File                                  | Role                                                       |
| ------------------------------------- | ---------------------------------------------------------- |
| `lib/cloudinary.ts`                   | Uploads a `File` to Cloudinary, returns `secure_url`       |
| `lib/admin.api.ts`                    | `addBlogImage`, `deleteBlogImage` - backend image CRUD     |
| `components/admin/ImageUploader.tsx`  | Stateless UI - cover slot + up to 6 additional previews    |
| `components/admin/CreateBlogForm.tsx` | Create flow: create blog -> upload images -> register URLs |
| `components/admin/BlogListItem.tsx`   | Edit flow: load existing images -> diff -> apply changes   |

---

## ImageEntry type

```typescript
interface ImageEntry {
  existingId?: string; // set if already stored on backend
  file?: File; // set if user just selected a local file
  preview: string; // blob URL (local) or https URL (backend)
  isCover: boolean;
  toDelete: boolean; // flagged for deletion on next save
}
```

---

## Create flow (CreateBlogForm)

```typescript
// 1. Validate: must have a cover image
if (!activeImages.some(i => i.isCover)) throw ...

// 2. Create the blog (text only)
const blog = await onCreate(title, content); // returns Blog with id

// 3. For each active image: upload -> register
for (const img of activeImages) {
  const url = img.file
    ? await uploadToCloudinary(img.file)
    : img.preview; // already a URL (shouldn't happen in create)
  await addBlogImage(token, blog.id, { url, isCover: img.isCover });
}
```

If the blog is created but image upload fails, the blog still exists - the user can open it in edit mode to add images.

---

## Edit flow (BlogListItem)

```typescript
// On edit open: load full blog (images are embedded in the response)
const full = await getBlog(blog.slug);
setImages(
  full.images.map((img) => ({
    existingId: img.id,
    preview: img.url,
    isCover: img.isCover,
    toDelete: false,
  })),
);

// On save:
// 1. Save text fields
await onSaveEdit(blog, title, slug, content);

// 2. Delete removed images (parallel)
await Promise.all(
  images
    .filter((i) => i.toDelete && i.existingId)
    .map((i) => deleteBlogImage(token, i.existingId!)),
);

// 3. Upload and register new images (sequential - avoids Cloudinary rate limits)
for (const img of images.filter((i) => !i.toDelete && i.file)) {
  const url = await uploadToCloudinary(img.file!);
  await addBlogImage(token, blog.id, { url, isCover: img.isCover });
}
```

---

## Validation rules (enforced in ImageUploader)

| Rule                                                    | Where enforced                                 |
| ------------------------------------------------------- | ---------------------------------------------- |
| Accepted types: `image/jpeg`, `image/png`, `image/webp` | `accept` attribute + JS filter                 |
| Max 1 cover image                                       | Selecting a new cover auto-removes the old one |
| Max 6 additional images                                 | `selectAdditional` clamps to available slots   |
| Cover required to submit                                | Checked in `handleSubmit` before API calls     |

---

## Replacing Cloudinary with S3 + presigned URL

In a production environment you may prefer S3. The swap is isolated to `lib/cloudinary.ts`:

```typescript
// lib/s3upload.ts  (drop-in replacement)
export async function uploadToCloudinary(file: File): Promise<string> {
  // 1. Ask your backend for a presigned PUT URL
  const { uploadUrl, publicUrl } = await apiFetch('/upload/presign', {
    method: 'POST',
    token,
    body: { filename: file.name, contentType: file.type },
  });

  // 2. PUT the file directly to S3
  await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });

  // 3. Return the public URL - same shape as Cloudinary's secure_url
  return publicUrl;
}
```

No changes to `ImageUploader`, `CreateBlogForm`, or `BlogListItem` are required.

The backend would add a `POST /upload/presign` endpoint that calls `s3.getSignedUrlPromise('putObject', ...)` and returns both the presigned URL (short-lived, write-only) and the resulting public object URL.
