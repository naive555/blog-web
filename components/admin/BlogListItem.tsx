'use client';
import { useState } from 'react';
import type { Blog } from '@/lib/types';

interface BlogListItemProps {
  blog: Blog;
  onToggleStatus: (blog: Blog) => Promise<void>;
  onSaveEdit: (blog: Blog, title: string, content: string) => Promise<void>;
  onEditStart: () => void;
}

export function BlogListItem({
  blog,
  onToggleStatus,
  onSaveEdit,
  onEditStart,
}: BlogListItemProps) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  function startEdit() {
    setEditTitle(blog.title);
    setEditContent(blog.content ?? '');
    setEditing(true);
    onEditStart();
  }

  async function handleSave() {
    await onSaveEdit(blog, editTitle, editContent);
    setEditing(false);
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
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              บันทึก
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
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
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${blog.status === 1 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}
            >
              {blog.status === 1 ? 'เผยแพร่' : 'ซ่อน'}
            </span>
            <button
              onClick={startEdit}
              className="text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              แก้ไข
            </button>
            <button
              onClick={() => onToggleStatus(blog)}
              className={`text-sm px-3 py-1.5 rounded-md transition ${blog.status === 1 ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-950 dark:text-yellow-300' : 'bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-300'}`}
            >
              {blog.status === 1 ? 'ซ่อน' : 'เผยแพร่'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
