'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Hide the public navbar inside the admin area
  if (pathname.startsWith('/admin')) return null;

  return (
    <nav className="flex justify-between items-center px-6 py-4 border-b bg-white dark:bg-gray-900 dark:border-gray-700">
      <Link href="/" className="font-bold text-lg dark:text-white">
        Blog
      </Link>

      <div className="flex items-center gap-3">
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="px-3 py-2 rounded-md text-sm transition hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300"
            aria-label="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        )}
        <Link
          href="/admin/login"
          className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition">
          Admin
        </Link>
      </div>
    </nav>
  );
}
