export type BlogStatus = 1 | 0 | -1;
export type CommentStatus = 'pending' | 'approved' | 'rejected';

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content?: string;
  viewCount: number;
  status: BlogStatus;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  comments?: Comment[];
}

export interface BlogImage {
  id: string;
  blogId: string;
  url: string;
  isCover: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  blogId: string;
  content: string;
  authorName: string;
  status: CommentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}
