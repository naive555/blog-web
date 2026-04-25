import Link from 'next/link';
import Image from 'next/image';
import type { Blog } from '@/lib/types';

interface BlogCardProps {
  blog: Blog;
}

export function BlogCard({ blog }: BlogCardProps) {
  const coverImage = blog.images.find((img) => img.isCover)?.url ?? null;

  return (
    <Link
      href={`/blog/${blog.slug}`}
      className="flex gap-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow">
      {coverImage && (
        <div className="relative w-40 shrink-0">
          <Image
            src={coverImage}
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
