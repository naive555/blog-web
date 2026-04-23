'use client';
import { useState } from 'react';

interface CreateBlogFormProps {
  onCreate: (title: string, content: string) => Promise<void>;
  onCancel: () => void;
}

export function CreateBlogForm({ onCreate, onCancel }: CreateBlogFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onCreate(title.trim(), content.trim());
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'สร้างบทความไม่สำเร็จ';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
      <h2 className="font-semibold mb-3">สร้างบทความใหม่</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950 px-3 py-2 rounded-md">
            {error}
          </p>
        )}
        <div className="space-y-1">
          <label className="block text-sm font-medium">ชื่อบทความ</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="กรอกชื่อบทความ"
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium">เนื้อหา</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            placeholder="กรอกเนื้อหา (อย่างน้อย 10 ตัวอักษร)"
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? 'กำลังสร้าง...' : 'สร้างบทความ'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  );
}
