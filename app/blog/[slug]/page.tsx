import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBlog } from '@/lib/blog.api';
import { BlogImages } from '@/components/BlogImages';
import { CommentList } from '@/components/CommentList';
import { CommentForm } from '@/components/CommentForm';
import type { Metadata } from 'next';
import { Blog } from '@/lib/types';
import { ArrowLeft } from 'lucide-react';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const blog = await getBlog(slug);
    return { title: blog.title };
  } catch {
    return { title: 'Blog Post' };
  }
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let blog: Blog;
  try {
    blog = await getBlog(slug);
  } catch {
    notFound();
  }

  const approvedComments = (blog.comments ?? []).filter(
    (c) => c.status === 'approved',
  );

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 transition">
        <ArrowLeft size={16} />
      </Link>

      <BlogImages images={blog.images} title={blog.title} />

      <h1 className="text-3xl font-bold mt-8 mb-3">{blog.title}</h1>

      <div className="flex gap-4 text-sm text-gray-500 mb-8">
        <time>
          {new Date(blog.createdAt).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
        <span>{blog.viewCount.toLocaleString()} ครั้ง</span>
      </div>

      <article className="max-w-none whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-gray-200">
        {blog.content}
      </article>

      <hr className="my-12 border-gray-200 dark:border-gray-800" />

      <section>
        <h2 className="text-xl font-semibold mb-6">
          ความคิดเห็น ({approvedComments.length})
        </h2>
        <CommentList comments={approvedComments} />
        <CommentForm blogId={blog.id} />
      </section>
    </div>
  );
}
