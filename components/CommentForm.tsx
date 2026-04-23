'use client';

import { useState } from 'react';
import { submitComment } from '@/lib/comment.api';

// Allows Thai characters, Arabic digits, and spaces.
const THAI_AND_NUMBERS = /^[\u0E00-\u0E7F0-9\s]+$/;

interface CommentFormProps {
  blogId: string;
}

export function CommentForm({ blogId }: CommentFormProps) {
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {};
    if (!authorName.trim()) {
      errs.authorName = 'กรุณากรอกชื่อ';
    } else if (!THAI_AND_NUMBERS.test(authorName.trim())) {
      errs.authorName = 'กรอกได้เฉพาะตัวอักษรภาษาไทยและตัวเลขเท่านั้น';
    }
    if (!content.trim()) {
      errs.content = 'กรุณากรอกความคิดเห็น';
    } else if (!THAI_AND_NUMBERS.test(content.trim())) {
      errs.content = 'กรอกได้เฉพาะตัวอักษรภาษาไทยและตัวเลขเท่านั้น';
    }
    return errs;
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await submitComment(blogId, {
        authorName: authorName.trim(),
        content: content.trim(),
      });
      setSubmitted(true);
      setAuthorName('');
      setContent('');
    } catch {
      setErrors({ form: 'ส่งความคิดเห็นไม่สำเร็จ กรุณาลองอีกครั้ง' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">แสดงความคิดเห็น</h3>

      {submitted ? (
        <div className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg text-sm">
          ส่งความคิดเห็นเรียบร้อยแล้ว — รอการอนุมัติจากผู้ดูแล
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}

          <div className="space-y-1">
            <label className="block text-sm font-medium">ชื่อ</label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="กรอกชื่อ (ภาษาไทยและตัวเลขเท่านั้น)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            {errors.authorName && (
              <p className="text-xs text-red-600">{errors.authorName}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium">ความคิดเห็น</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="กรอกความคิดเห็น (ภาษาไทยและตัวเลขเท่านั้น)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
            {errors.content && (
              <p className="text-xs text-red-600">{errors.content}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-md transition text-sm">
            {loading ? 'กำลังส่ง...' : 'ส่งความคิดเห็น'}
          </button>
        </form>
      )}
    </div>
  );
}
