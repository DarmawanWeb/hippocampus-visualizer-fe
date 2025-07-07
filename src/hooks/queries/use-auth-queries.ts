import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authService } from '@/services/auth-service';
import { useAuthStore } from '@/stores/auth-store';
import type { AuthRequest, AuthResponse } from '@/types/auth';

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

// ─── queries ────────────────────────────────────────────────────────────────
export const useCurrentUser = () =>
  useQuery({
    queryKey: authKeys.me(),
    queryFn: () => authService.getCurrentUser(),
    enabled: authService.isAuthenticated(),
    retry: (f, e: Error & { response?: { status: number } }) =>
      e?.response?.status === 401 ? false : f < 2,
    staleTime: 300_000,
    gcTime: 600_000,
  });

// ─── mutations ──────────────────────────────────────────────────────────────
export const useLogin = () => {
  const qc = useQueryClient();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: (c: AuthRequest) => authService.login(c),
    onSuccess: (d: AuthResponse) => {
      qc.invalidateQueries({ queryKey: authKeys.me() });
      setUser(d.user);
      toast.success('Login successful');
    },
    onError: (e: Error) => toast.error(e.message || 'Login failed'),
  });
};

export const useRegister = () =>
  useMutation({
    mutationFn: (d: AuthRequest) => authService.register(d),
    onSuccess: () => toast.success('Registration successful – please log in'),
    onError: (e: Error) => toast.error(e.message || 'Registration failed'),
  });

export const useLogout = () => {
  const qc = useQueryClient();
  const { clearUser } = useAuthStore();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: async () => {
      qc.clear();
      clearUser();
      toast.success('Logged out');
    },
    onError: (e: Error) => {
      qc.clear();
      clearUser();
      toast.error(e.message || 'Signed out locally');
    },
  });
};
