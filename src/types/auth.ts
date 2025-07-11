export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'doctor' | 'patient' | 'staff';
  active: boolean;
  avatar?: string;
  department?: string;
  specialization?: string;
}

export interface AuthRequest {
  name?: string;
  email: string;
  password: string;
  role?: 'admin' | 'doctor' | 'patient' | 'staff';
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
}

// RBAC Types
export interface UserPermissions {
  canAddComments: boolean;
  canEditComments: boolean;
  canDeleteComments: boolean;
  canViewPrivateComments: boolean;
  canManageUsers: boolean;
  canAccessAllPatients: boolean;
}

export interface Comment {
  id: string;
  author: string;
  authorId: string;
  role: string;
  content: string;
  type: 'finding' | 'recommendation' | 'note' | 'question';
  position?: {
    x: number;
    y: number;
    z: number;
    slice: number;
    view: string;
  };
  timestamp: string;
  isPrivate: boolean;
  scanId?: string;
  patientId?: string;
}
