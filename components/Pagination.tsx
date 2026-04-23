import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  search?: string;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  search = '',
  className = '',
}: PaginationProps) {
  function buildHref(page: number) {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    params.set('page', String(page));
    return `/?${params.toString()}`;
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      className={`flex justify-center gap-1 ${className}`}
      aria-label="Pagination">
      <Link
        href={buildHref(currentPage - 1)}
        aria-disabled={currentPage === 1}
        className={`px-3 py-1.5 text-sm rounded-md border transition ${currentPage === 1 ? 'pointer-events-none opacity-40 border-gray-200' : 'border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'}`}>
        ก่อนหน้า
      </Link>

      {pages.map((p) => (
        <Link
          key={p}
          href={buildHref(p)}
          className={`w-9 h-9 flex items-center justify-center text-sm rounded-md border transition ${p === currentPage ? 'bg-blue-600 text-white border-blue-600 pointer-events-none' : 'border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'}`}>
          {p}
        </Link>
      ))}

      <Link
        href={buildHref(currentPage + 1)}
        aria-disabled={currentPage === totalPages}
        className={`px-3 py-1.5 text-sm rounded-md border transition ${currentPage === totalPages ? 'pointer-events-none opacity-40 border-gray-200' : 'border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'}`}>
        ถัดไป
      </Link>
    </nav>
  );
}
