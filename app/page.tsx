import { getBlogs } from '@/lib/blog.api';
import { BlogCard } from '@/components/BlogCard';
import { Pagination } from '@/components/Pagination';
import { SearchBar } from '@/components/SearchBar';

type PageProps = {
  searchParams: Promise<{ search?: string; page?: string }>;
};

const PAGE_SIZE = 10;

export default async function BlogListPage({ searchParams }: PageProps) {
  const { search = '', page: pageStr = '1' } = await searchParams;
  const page = Math.max(1, Number(pageStr) || 1);

  const { data: blogs, total } = await getBlogs({ search, page, limit: PAGE_SIZE });
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">บล็อก</h1>

      <SearchBar defaultValue={search} />

      {blogs.length === 0 ? (
        <p className="text-center text-gray-500 mt-16">ไม่พบบทความ</p>
      ) : (
        <div className="grid gap-4 mt-8">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} search={search} className="mt-10" />
      )}
    </div>
  );
}
