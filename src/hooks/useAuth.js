'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export const useAuth = () => {
  const pathname = usePathname();
  const router = useRouter();
  const hasCheckedAuth = useRef(false);

  const {
    user,
    isLoading,
    isAuthenticated,
    setUser,
    clearUser,
    setLoading,
  } = useAuthStore();

  useEffect(() => {
    const isAuthPage =
      pathname === '/login' || pathname === '/register' || pathname === '/';

    // already authenticated or on public pages - don't check
    if (isAuthenticated || isAuthPage) {
      setLoading(false);
      hasCheckedAuth.current = true;
      return;
    }

    // Skip if we've already checked auth and user is not authenticated
    if (hasCheckedAuth.current) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchCurrentUser = async () => {
      try {
        setLoading(true);

        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (!isMounted) return;

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else if (response.status === 401) {
          clearUser();
        } else {
          console.warn('Auth check failed with status', response.status);
        }
      } catch (error) {
        console.error('Failed to fetch current user:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
          hasCheckedAuth.current = true;
        }
      }
    };

    fetchCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [
    pathname,
    isAuthenticated,
    setUser,
    clearUser,
    setLoading,
  ]);

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (response.ok) {
        router.refresh();
        setUser(data.user);
        return { success: true, data };
      }

      return {
        success: false,
        error: data.error || 'Login failed',
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        router.refresh();
        setUser(data.user);
        return { success: true, data };
      }

      return {
        success: false,
        error: data.error || 'Registration failed',
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      router.refresh();
      router.push('/');
      clearUser();
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
  };
};
