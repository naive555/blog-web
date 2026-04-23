'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { getAdminBlogs, createBlog, updateBlog, deleteBlog } from '@/lib/admin.api';
import { CreateBlogForm } from '@/components/admin/CreateBlogForm';
import { BlogListItem } from '@/components/admin/BlogListItem';
import type { Blog } from '@/lib/types';

const PAGE_SIZE = 10;

export default function AdminBlogsPage() {
  const { token } = useAdminAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const fetchBlogs = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setFetchError('');
    try {
      const result = await getAdminBlogs(token, { page, limit: PAGE_SIZE, search });
      setBlogs(result.data);
      setTotal(result.total);
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'โหลดบทความไม่สำเร็จ';
      setFetchError(message);
    } finally {
      setLoading(false);
    }
  }, [token, page, search]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  async function handleCreate(title: string, content: string): Promise<Blog> {
    if (!token) throw new Error('Not authenticated');
    return createBlog(token, { title, content });
  }

  async function handleToggleStatus(blog: Blog) {
    if (!token) return;
    await updateBlog(token, blog.id, { status: blog.status === 1 ? 0 : 1 });
    fetchBlogs();
  }

  async function handleSaveEdit(blog: Blog, title: string, slug: string, content: string) {
    if (!token) return;
    await updateBlog(token, blog.id, { title, slug, content });
    fetchBlogs();
  }

  async function handleDelete(blog: Blog) {
    if (!token) return;
    if (!confirm(`ต้องการลบบทความ "${blog.title}" ใช่หรือไม่?`)) return;
    await deleteBlog(token, blog.id);
    fetchBlogs();
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">จัดการบทความ</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{total} บทความ</span>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition"
          >
            + สร้างบทความ
          </button>
        </div>
      </div>

      {showCreate && (
        <CreateBlogForm
          token={token!}
          onCreate={handleCreate}
          onCreated={() => { setShowCreate(false); fetchBlogs(); }}
          onCancel={() => setShowCreate(false)}
        />
      )}

      <input
        type="text"
        placeholder="ค้นหาบทความ..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="w-full mb-6 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      />

      {fetchError && (
        <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950 px-3 py-2 rounded-md mb-4">
          {fetchError}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">กำลังโหลด...</p>
      ) : (
        <div className="space-y-3">
          {blogs.map((blog) => (
            <BlogListItem
              key={blog.id}
              blog={blog}
              token={token!}
              onToggleStatus={handleToggleStatus}
              onSaveEdit={handleSaveEdit}
              onDelete={handleDelete}
              onEditStart={() => setShowCreate(false)}
            />
          ))}
          {blogs.length === 0 && (
            <p className="text-center text-gray-500 py-12 text-sm">ไม่พบบทความ</p>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex gap-1 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded text-sm transition ${p === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
