/**
 * Client-side authentication hook
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/types/api';
import { createGuestSession, isGuest, getGuestId, clearGuestSession } from '@/lib/auth/guest';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuestUser, setIsGuestUser] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    // Check for guest first (no API call needed)
    const guestId = getGuestId();
    if (guestId) {
      setIsGuestUser(true);
      setUser({
        id: guestId,
        email: 'guest@example.com',
      });
      setLoading(false);
      return;
    }

    // Only make API call if not a guest
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include', // Include cookies in request
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsGuestUser(false);
      } else {
        setUser(null);
        setIsGuestUser(false);
      }
    } catch (error) {
      // Network errors - user is not authenticated
      setUser(null);
      setIsGuestUser(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Include cookies in request
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (response.ok) {
      setUser(data.user);
      return { success: true };
    }
    return { success: false, error: data.error };
  };

  const signup = async (email: string, password: string) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Include cookies in request
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (response.ok) {
      setUser(data.user);
      return { success: true };
    }
    return { success: false, error: data.error };
  };

  const logout = async () => {
    try {
      if (isGuestUser) {
        clearGuestSession();
      } else {
        await fetch('/api/auth/logout', { 
          method: 'POST',
          credentials: 'include',
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    setIsGuestUser(false);
    router.push('/');
  };

  const continueAsGuest = useCallback(() => {
    const guestId = createGuestSession();
    setIsGuestUser(true);
    setUser({
      id: guestId,
      email: 'guest@example.com',
    });
  }, []);

  return {
    user,
    loading,
    login,
    signup,
    logout,
    continueAsGuest,
    isAuthenticated: !!user,
    isGuest: isGuestUser,
    checkAuth, // Expose checkAuth for manual re-validation
  };
}

