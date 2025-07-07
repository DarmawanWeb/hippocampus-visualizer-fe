// src/hooks/use-rbac.ts - FIXED VERSION WITH INLINE FUNCTION
'use client';
import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { User, UserPermissions } from '@/types/auth';

// Inline getUserPermissions function to avoid import issues
const getUserPermissions = (role: User['role']): UserPermissions => {
  switch (role) {
    case 'admin':
      return {
        canAddComments: true,
        canEditComments: true,
        canDeleteComments: true,
        canViewPrivateComments: true,
        canManageUsers: true,
        canAccessAllPatients: true,
      };

    case 'doctor':
      return {
        canAddComments: true,
        canEditComments: true,
        canDeleteComments: true,
        canViewPrivateComments: true,
        canManageUsers: false,
        canAccessAllPatients: true,
      };

    case 'staff':
      return {
        canAddComments: true,
        canEditComments: true,
        canDeleteComments: false,
        canViewPrivateComments: false,
        canManageUsers: false,
        canAccessAllPatients: false,
      };

    case 'patient':
      return {
        canAddComments: false,
        canEditComments: false,
        canDeleteComments: false,
        canViewPrivateComments: false,
        canManageUsers: false,
        canAccessAllPatients: false,
      };

    default:
      return {
        canAddComments: false,
        canEditComments: false,
        canDeleteComments: false,
        canViewPrivateComments: false,
        canManageUsers: false,
        canAccessAllPatients: false,
      };
  }
};

export const useRBAC = () => {
  const { user, isLoading, isAuthenticated, error, refetchUser } = useAuth();

  const permissions = useMemo((): UserPermissions => {
    if (!user) {
      return {
        canAddComments: false,
        canEditComments: false,
        canDeleteComments: false,
        canViewPrivateComments: false,
        canManageUsers: false,
        canAccessAllPatients: false,
      };
    }
    return getUserPermissions(user.role);
  }, [user]);

  const hasRole = (requiredRoles: User['role'][]): boolean => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  };

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    return permissions[permission];
  };

  const canAccessPatient = (
    patientId: string,
    assignedPatients?: string[],
  ): boolean => {
    if (!user) return false;

    if (permissions.canAccessAllPatients) return true;
    if (user.role === 'patient' && user.id.toString() === patientId)
      return true;
    if (user.role === 'staff' && assignedPatients?.includes(patientId))
      return true;

    return false;
  };

  return {
    user,
    permissions,
    isLoading,
    isAuthenticated,
    error,
    refetchUser,
    hasRole,
    hasPermission,
    canAccessPatient,
  };
};
