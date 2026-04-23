import Link from 'next/link';
import Image from 'next/image';
import type { BlogWithCover } from '@/lib/blog.api';

interface BlogCardProps {
  blog: BlogWithCover;
}

export function BlogCard({ blog }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${blog.slug}`}
      className="flex gap-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow">
      {blog.coverImage && (
        <div className="relative w-40 shrink-0">
          <Image
            src={blog.coverImage}
            alt={blog.title}
            fill
            className="object-cover"
            sizes="160px"
          />
        </div>
      )}
      <div className="flex flex-col justify-center py-4 px-4 min-w-0">
        <h2 className="text-lg font-semibold leading-snug line-clamp-2">
          {blog.title}
        </h2>
        {blog.content && (
          <p className="text-sm text-gray-500 mt-1.5 line-clamp-2">
            {blog.content}
          </p>
        )}
        <time className="text-xs text-gray-400 mt-2">
          {new Date(blog.createdAt).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
      </div>
    </Link>
  );
}
