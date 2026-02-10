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

    if (isAuthPage) {
      setLoading(false);
      return;
    }

    if (hasCheckedAuth.current) return;

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
        } else {
          clearUser();
        }
      } catch (error) {
        console.error('Failed to fetch current user:', error);
        clearUser();
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
  }, [pathname, setUser, clearUser, setLoading]);

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        router.refresh();
        router.push('/dashboard');
        return { success: true };
      }

      const data = await response.json();
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

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        router.refresh();
        router.push('/dashboard');
        return { success: true };
      }

      const data = await response.json();
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
      clearUser();
      router.push('/');
      router.refresh();
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
