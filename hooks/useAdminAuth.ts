'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminLogin, adminLogout } from '@/lib/admin.api';

const TOKEN_KEY = 'admin_token';

export function useAdminAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    setToken(stored);
    setLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const { accessToken } = await adminLogin({ username, password });
    localStorage.setItem(TOKEN_KEY, accessToken);
    // Also set a cookie so the middleware can verify the session server-side
    document.cookie = `admin_token=${accessToken}; path=/; max-age=3600; SameSite=Strict`;
    setToken(accessToken);
    return accessToken;
  }, []);

  const logout = useCallback(async () => {
    if (!token) return;
    await adminLogout(token).catch(() => {});
    localStorage.removeItem(TOKEN_KEY);
    document.cookie = 'admin_token=; path=/; max-age=0';
    setToken(null);
  }, [token]);

  return { token, loading, login, logout };
}
