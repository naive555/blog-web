import { apiFetch } from './api';
import type { Comment } from './types';

export interface SubmitCommentPayload {
  content: string;
  authorName: string;
}

export function submitComment(
  blogId: string,
  payload: SubmitCommentPayload,
): Promise<Comment> {
  return apiFetch<Comment>(`/blog/${blogId}/comment`, {
    method: 'POST',
    body: payload,
  });
}
