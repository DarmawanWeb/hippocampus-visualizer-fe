// src/hooks/useAuth.ts
'use client';

import { useEffect } from 'react';
import { useCurrentUser } from '@/hooks/queries/use-auth-queries';
import { authService } from '@/services/auth-service';
import { useAuthStore } from '@/stores/auth-store';
import type { User } from '@/types/auth';

export const useAuth = () => {
  const { user: storeUser, setUser, isHydrated } = useAuthStore();

  const {
    data: queryUser,
    isLoading: isQueryLoading,
    error,
    refetch: refetchUser,
  } = useCurrentUser();

  // Sync query user with store
  useEffect(() => {
    if (queryUser && queryUser !== storeUser) {
      setUser(queryUser);
    }
  }, [queryUser, storeUser, setUser]);

  // Check if we're authenticated
  const isAuthenticated = authService.isAuthenticated() && !!storeUser;

  // Loading state: show loading if store isn't hydrated or query is loading
  const isLoading =
    !isHydrated || (authService.isAuthenticated() && isQueryLoading);

  // Use store user first, fallback to query user
  const user: User | null = storeUser || queryUser || null;

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    refetchUser,
  };
};
