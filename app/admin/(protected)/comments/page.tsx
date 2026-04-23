'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { getComments, approveComment, rejectComment } from '@/lib/admin.api';
import type { Comment, CommentStatus } from '@/lib/types';

const STATUS_LABELS: Record<CommentStatus | '', string> = {
  '': 'ทั้งหมด',
  pending: 'รอตรวจสอบ',
  approved: 'อนุมัติ',
  rejected: 'ปฏิเสธ',
};

const STATUS_BADGE: Record<CommentStatus, string> = {
  pending:
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

export default function AdminCommentsPage() {
  const { token } = useAdminAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [statusFilter, setStatusFilter] = useState<CommentStatus | ''>(
    'pending',
  );
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const result = await getComments(token, {
        status: statusFilter || undefined,
      });
      setComments(result);
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  async function approve(id: string) {
    if (!token) return;
    await approveComment(token, id);
    fetchComments();
  }

  async function reject(id: string) {
    if (!token) return;
    await rejectComment(token, id);
    fetchComments();
  }

  const filterKeys = Object.keys(STATUS_LABELS) as (CommentStatus | '')[];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">จัดการความคิดเห็น</h1>
        <span className="text-sm text-gray-500">{comments.length} รายการ</span>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {filterKeys.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-sm rounded-md border transition ${statusFilter === s ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">กำลังโหลด...</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-medium text-sm">
                      {comment.authorName}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[comment.status]}`}>
                      {STATUS_LABELS[comment.status]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {comment.content}
                  </p>
                  <time className="text-xs text-gray-400 mt-1 block">
                    {new Date(comment.createdAt).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                </div>
                {comment.status === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => approve(comment.id)}
                      className="px-3 py-1.5 text-sm bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-300 rounded-md transition">
                      อนุมัติ
                    </button>
                    <button
                      onClick={() => reject(comment.id)}
                      className="px-3 py-1.5 text-sm bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-300 rounded-md transition">
                      ปฏิเสธ
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {comments.length === 0 && (
            <p className="text-center text-gray-500 py-12 text-sm">
              ไม่มีความคิดเห็น
            </p>
          )}
        </div>
      )}
    </div>
  );
}
