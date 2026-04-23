import { apiFetch } from './api';
import type { Blog, BlogImage, PaginatedResponse } from './types';

export type BlogWithCover = Blog & { coverImage: string | null };

export interface BlogListParams {
  search?: string;
  page?: number;
  limit?: number;
}

export function getBlogs(
  params: BlogListParams = {},
): Promise<PaginatedResponse<Blog>> {
  const q = new URLSearchParams();
  if (params.search) q.set('search', params.search);
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  const qs = q.toString() ? `?${q.toString()}` : '';
  return apiFetch<PaginatedResponse<Blog>>(`/blog${qs}`, { cache: 'no-store' });
}

export function getBlog(slug: string): Promise<Blog> {
  return apiFetch<Blog>(`/blog/${slug}`, { cache: 'no-store' });
}

export function getBlogImages(blogId: string): Promise<BlogImage[]> {
  return apiFetch<BlogImage[]>(`/blog/${blogId}/image`);
}

// Fetches blog list and resolves cover image for each blog in parallel.
// Results in N+1 requests (one per blog); acceptable for page size of 10.
export async function getBlogsWithCover(
  params: BlogListParams = {},
): Promise<{ data: BlogWithCover[]; total: number }> {
  const result = await getBlogs(params);
  const withImages = await Promise.all(
    result.data.map(async (blog) => {
      try {
        const images = await getBlogImages(blog.id);
        const cover = images.find((img) => img.isCover);
        return { ...blog, coverImage: cover?.url ?? null };
      } catch {
        return { ...blog, coverImage: null };
      }
    }),
  );
  return { data: withImages, total: result.total };
}
