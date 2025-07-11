// src/components/provider/auth-provider.tsx - FIXED
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { createContext, type ReactNode, useContext, useEffect } from 'react';
import {
  useCurrentUser,
  useLogin,
  useLogout,
  useRegister,
} from '@/hooks/queries/use-auth-queries';
import { authService } from '@/services/auth-service';
import { useAuthStore } from '@/stores/auth-store';
import type { AuthRequest, User } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (c: AuthRequest) => Promise<void>;
  register: (c: AuthRequest) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_ROUTES = [
  '/auth',
  // '/login',
  '/register',
  '/forgot-password',
  '/signin',
  '/signup',
  // '/dashboard/doctor',
  // '/dashboard/patient',
  // '/dashboard/staff',
  // '/dashboard/admin',
  // '/dashboard/viewer',
  // '/viewer',
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // Use store and query directly instead of useAuth hook
  const { user: storeUser, setUser } = useAuthStore();
  const { data: queryUser, isLoading, refetch: refetchUser } = useCurrentUser();

  const user = storeUser || queryUser || null;
  const isAuthenticated = authService.isAuthenticated() && !!user;

  const loginMut = useLogin();
  const registerMut = useRegister();
  const logoutMut = useLogout();

  const isPublic = PUBLIC_ROUTES.includes(pathname);

  const login = async (c: AuthRequest) => {
    await loginMut.mutateAsync(c);
    router.replace('/dashboard');
  };

  const logout = async () => {
    await logoutMut.mutateAsync();
    router.replace('/signin');
  };

  const register = async (c: AuthRequest) => {
    await registerMut.mutateAsync(c);
    router.replace('/dashboard');
  };

  useEffect(() => {
    if (isLoading) return;

    const hasAuth = authService.isAuthenticated();

    if (isPublic && hasAuth && user) {
      router.replace(`/dashboard/${user.role}`);
    } else if (!isPublic && !hasAuth) {
      router.replace('/signin');
    } else if (!isPublic && hasAuth && !user) {
      refetchUser();
    }
  }, [isLoading, user, refetchUser, isPublic, router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        register,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be inside <AuthProvider>');
  return ctx;
};
