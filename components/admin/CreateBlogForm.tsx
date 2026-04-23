'use client';
import { useState } from 'react';
import { ImageUploader, type ImageEntry } from './ImageUploader';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { addBlogImage } from '@/lib/admin.api';
import type { Blog } from '@/lib/types';

interface CreateBlogFormProps {
  token: string;
  onCreate: (title: string, content: string) => Promise<Blog>;
  onCreated: () => void;
  onCancel: () => void;
}

export function CreateBlogForm({ token, onCreate, onCreated, onCancel }: CreateBlogFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const activeImages = images.filter(i => !i.toDelete);
    if (!activeImages.some(i => i.isCover)) {
      setError('กรุณาเลือกภาพหน้าปก');
      return;
    }

    setLoading(true);
    try {
      const blog = await onCreate(title.trim(), content.trim());

      for (const img of activeImages) {
        const url = img.file ? await uploadToCloudinary(img.file) : img.preview;
        await addBlogImage(token, blog.id, { url, isCover: img.isCover });
      }

      onCreated();
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
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>

        <ImageUploader value={images} onChange={setImages} disabled={loading} />

        <div className="flex gap-2 pt-1">
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
            disabled={loading}
            className="px-4 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition"
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  );
}
