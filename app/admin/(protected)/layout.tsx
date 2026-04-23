'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, loading, logout } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !token) {
      router.replace('/admin/login');
    }
  }, [token, loading, router]);

  if (loading || !token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-sm">กำลังโหลด...</p>
      </div>
    );
  }

  async function handleLogout() {
    await logout();
    router.replace('/admin/login');
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        <div className="px-4 py-5 font-bold text-lg border-b border-gray-200 dark:border-gray-800">
          Admin
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <Link
            href="/admin/blogs"
            className={`block px-3 py-2 rounded-md text-sm transition ${pathname === '/admin/blogs' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            จัดการบทความ
          </Link>
          <Link
            href="/admin/comments"
            className={`block px-3 py-2 rounded-md text-sm transition ${pathname === '/admin/comments' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            จัดการความคิดเห็น
          </Link>
        </nav>
        <div className="p-3 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full text-sm px-3 py-2 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition">
            ออกจากระบบ
          </button>
        </div>
      </aside>
      <div className="flex-1 p-8 overflow-auto">{children}</div>
    </div>
  );
}
