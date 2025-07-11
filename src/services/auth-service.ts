import { api } from '@/lib/axios';
import {
  clearAuthData,
  getAccessToken,
  isAuthenticated as hasTokens,
  setAuthData,
} from '@/lib/cookie';
import type { ApiResponse } from '@/types/api';
import type {
  AuthRequest,
  AuthResponse,
  RefreshTokenResponse,
  User,
} from '@/types/auth';

class AuthService {
  private static instance: AuthService;
  static getInstance() {
    if (!AuthService.instance) AuthService.instance = new AuthService();
    return AuthService.instance;
  }

  // ─── CRUD ──────────────────────────────────────────────────────────────────
  async login(credentials: AuthRequest): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      credentials,
    );
    const { user, accessToken, refreshToken } = res.data.data;
    setAuthData(accessToken, refreshToken);
    return { user, accessToken, refreshToken };
  }

  async register(data: AuthRequest) {
    await api.post<ApiResponse<void>>('/auth/register', data);
  }

  async logout() {
    try {
      const at = getAccessToken();
      if (at) await api.post('/auth/logout', { accessToken: at });
    } finally {
      clearAuthData();
    }
  }

  async getUserByRole(role: string): Promise<User[]> {
    const res = await api.get<ApiResponse<User[]>>(`/users/role/${role}`);
    return res.data.data;
  }

  async createUser(data: AuthRequest): Promise<void> {
    const res = await api.post<ApiResponse<User>>('/auth/create-user', data);
  }

  async getCurrentUser(): Promise<User> {
    const res = await api.get<ApiResponse<User>>('/auth/user');
    return res.data.data;
  }

  async refreshToken(): Promise<RefreshTokenResponse> {
    const res =
      await api.post<ApiResponse<RefreshTokenResponse>>('/auth/refresh');
    return res.data.data;
  }

  async getAllUsers(): Promise<User[]> {
    const res = await api.get<ApiResponse<User[]>>('/users');
    return res.data.data;
  }

  isAuthenticated() {
    return hasTokens();
  }

  async updateUserRole(userId: number, role: string): Promise<User> {
    const res = await api.patch<ApiResponse<User>>(`/users/${userId}/role`, {
      role,
    });
    return res.data.data;
  }

  async deleteUser(userId: number): Promise<void> {
    await api.delete<ApiResponse<void>>(`/users/${userId}`);
  }
}

export const authService = AuthService.getInstance();
