'use client';
import { useState } from 'react';
import { getBlog } from '@/lib/blog.api';
import { addBlogImage, deleteBlogImage } from '@/lib/admin.api';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { ImageUploader, type ImageEntry } from './ImageUploader';
import type { Blog } from '@/lib/types';

function extractMessage(err: unknown, fallback: string): string {
  return err && typeof err === 'object' && 'message' in err
    ? String((err as { message: string }).message)
    : fallback;
}

interface BlogListItemProps {
  blog: Blog;
  token: string;
  onToggleStatus: (blog: Blog) => Promise<void>;
  onSaveEdit: (blog: Blog, title: string, slug: string, content: string) => Promise<void>;
  onDelete: (blog: Blog) => Promise<void>;
  onEditStart: () => void;
}

export function BlogListItem({
  blog,
  token,
  onToggleStatus,
  onSaveEdit,
  onDelete,
  onEditStart,
}: BlogListItemProps) {
  const [editing, setEditing] = useState(false);
  const [fetchingEdit, setFetchingEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editContent, setEditContent] = useState('');
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [error, setError] = useState('');

  async function startEdit() {
    onEditStart();
    setError('');
    setFetchingEdit(true);
    try {
      const full = await getBlog(blog.slug);
      setEditTitle(full.title);
      setEditSlug(full.slug);
      setEditContent(full.content ?? '');
      setImages(
        full.images.map(img => ({
          existingId: img.id,
          preview: img.url,
          isCover: img.isCover,
          toDelete: false,
        })),
      );
      setEditing(true);
    } catch (err) {
      setError(extractMessage(err, 'โหลดบทความไม่สำเร็จ'));
    } finally {
      setFetchingEdit(false);
    }
  }

  async function handleSave() {
    setError('');
    setSaving(true);
    try {
      // 1. Save text fields
      await onSaveEdit(blog, editTitle, editSlug, editContent);

      // 2. Delete removed images
      await Promise.all(
        images
          .filter(i => i.toDelete && i.existingId)
          .map(i => deleteBlogImage(token, i.existingId!)),
      );

      // 3. Upload new images to Cloudinary, then register with backend
      for (const img of images.filter(i => !i.toDelete && i.file)) {
        const url = await uploadToCloudinary(img.file!);
        await addBlogImage(token, blog.id, { url, isCover: img.isCover });
      }

      setEditing(false);
    } catch (err) {
      setError(extractMessage(err, 'บันทึกไม่สำเร็จ'));
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus() {
    setError('');
    try {
      await onToggleStatus(blog);
    } catch (err) {
      setError(extractMessage(err, 'เปลี่ยนสถานะไม่สำเร็จ'));
    }
  }

  async function handleDelete() {
    setError('');
    try {
      await onDelete(blog);
    } catch (err) {
      setError(extractMessage(err, 'ลบบทความไม่สำเร็จ'));
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
      {editing ? (
        <div className="space-y-3">
          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            value={editSlug}
            onChange={(e) => setEditSlug(e.target.value)}
            placeholder="slug"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <ImageUploader value={images} onChange={setImages} disabled={saving} />

          {error && (
            <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950 px-3 py-2 rounded-md">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
            <button
              onClick={() => setEditing(false)}
              disabled={saving}
              className="px-4 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{blog.title}</h3>
              {blog.content && (
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{blog.content}</p>
              )}
              <p className="text-xs text-gray-500 mt-0.5">
                {new Date(blog.createdAt).toLocaleDateString('th-TH')} ·{' '}
                {blog.viewCount.toLocaleString()} ครั้ง
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${blog.status === 1 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}
              >
                {blog.status === 1 ? 'เผยแพร่' : 'ซ่อน'}
              </span>
              <button
                onClick={startEdit}
                disabled={fetchingEdit}
                className="text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition"
              >
                {fetchingEdit ? 'กำลังโหลด...' : 'แก้ไข'}
              </button>
              <button
                onClick={handleToggleStatus}
                className={`text-sm px-3 py-1.5 rounded-md transition ${blog.status === 1 ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-950 dark:text-yellow-300' : 'bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-300'}`}
              >
                {blog.status === 1 ? 'ซ่อน' : 'เผยแพร่'}
              </button>
              <button
                onClick={handleDelete}
                className="text-sm px-3 py-1.5 rounded-md bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-300 transition"
              >
                ลบ
              </button>
            </div>
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950 px-3 py-2 rounded-md">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
