'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { getAdminBlogs, updateBlog } from '@/lib/admin.api';
import type { Blog } from '@/lib/types';

const PAGE_SIZE = 10;

export default function AdminBlogsPage() {
  const { token } = useAdminAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const fetchBlogs = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const result = await getAdminBlogs(token, {
        page,
        limit: PAGE_SIZE,
        search,
      });
      setBlogs(result.data);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  }, [token, page, search]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  async function toggleStatus(blog: Blog) {
    if (!token) return;
    await updateBlog(token, blog.id, { status: blog.status === 1 ? 0 : 1 });
    fetchBlogs();
  }

  async function saveEdit(blog: Blog) {
    if (!token) return;
    await updateBlog(token, blog.id, {
      title: editTitle,
      content: editContent,
    });
    setEditingId(null);
    fetchBlogs();
  }

  function startEdit(blog: Blog) {
    setEditingId(blog.id);
    setEditTitle(blog.title);
    setEditContent(blog.content ?? '');
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">จัดการบทความ</h1>
        <span className="text-sm text-gray-500">{total} บทความ</span>
      </div>

      <input
        type="text"
        placeholder="ค้นหาบทความ..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="w-full mb-6 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      />

      {loading ? (
        <p className="text-sm text-gray-500">กำลังโหลด...</p>
      ) : (
        <div className="space-y-3">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
              {editingId === blog.id ? (
                <div className="space-y-3">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm"
                  />
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(blog)}
                      className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                      บันทึก
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      ยกเลิก
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{blog.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(blog.createdAt).toLocaleDateString('th-TH')} ·{' '}
                      {blog.viewCount.toLocaleString()} ครั้ง
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${blog.status === 1 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                      {blog.status === 1 ? 'เผยแพร่' : 'ซ่อน'}
                    </span>
                    <button
                      onClick={() => startEdit(blog)}
                      className="text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      แก้ไข
                    </button>
                    <button
                      onClick={() => toggleStatus(blog)}
                      className={`text-sm px-3 py-1.5 rounded-md transition ${blog.status === 1 ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-950 dark:text-yellow-300' : 'bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-300'}`}>
                      {blog.status === 1 ? 'ซ่อน' : 'เผยแพร่'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {blogs.length === 0 && (
            <p className="text-center text-gray-500 py-12 text-sm">
              ไม่พบบทความ
            </p>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex gap-1 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded text-sm transition ${p === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
