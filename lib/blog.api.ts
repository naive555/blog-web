import { apiFetch } from './api';
import type { Blog, PaginatedResponse } from './types';

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
