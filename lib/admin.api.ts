import { apiFetch } from './api';
import type { Blog, Comment, PaginatedResponse, CommentStatus } from './types';

export function adminLogin(payload: {
  username: string;
  password: string;
}): Promise<{ accessToken: string }> {
  return apiFetch<{ accessToken: string }>('/auth/login', {
    method: 'POST',
    body: payload,
  });
}

export function adminLogout(token: string): Promise<void> {
  return apiFetch<void>('/auth/logout', { method: 'POST', token });
}

export interface AdminBlogListParams {
  search?: string;
  page?: number;
  limit?: number;
}

export function getAdminBlogs(
  token: string,
  params: AdminBlogListParams = {},
): Promise<PaginatedResponse<Blog>> {
  const q = new URLSearchParams();
  if (params.search) q.set('search', params.search);
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  const qs = q.toString() ? `?${q.toString()}` : '';
  return apiFetch<PaginatedResponse<Blog>>(`/blog${qs}`, { token });
}

export interface CreateBlogPayload {
  title: string;
  content: string;
}

export function createBlog(token: string, payload: CreateBlogPayload): Promise<Blog> {
  return apiFetch<Blog>('/blog', { method: 'POST', token, body: payload });
}

export interface UpdateBlogPayload {
  title?: string;
  content?: string;
  status?: 1 | 0 | -1;
}

export function updateBlog(
  token: string,
  id: string,
  payload: UpdateBlogPayload,
): Promise<void> {
  return apiFetch<void>(`/blog/${id}`, { method: 'PUT', token, body: payload });
}

export function getComments(
  token: string,
  params: { status?: CommentStatus; blogId?: string } = {},
): Promise<Comment[]> {
  const q = new URLSearchParams();
  if (params.status) q.set('status', params.status);
  if (params.blogId) q.set('blogId', params.blogId);
  const qs = q.toString() ? `?${q.toString()}` : '';
  return apiFetch<Comment[]>(`/comment${qs}`, { token });
}

export function approveComment(token: string, id: string): Promise<void> {
  return apiFetch<void>(`/comment/${id}/approve`, { method: 'PATCH', token });
}

export function rejectComment(token: string, id: string): Promise<void> {
  return apiFetch<void>(`/comment/${id}/reject`, { method: 'PATCH', token });
}
