// src/utils/auth.utils.ts
import type { User, UserPermissions } from '@/types/auth';

export const getUserPermissions = (role: User['role']): UserPermissions => {
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

export const checkPermission = (
  userRole: User['role'],
  permission: keyof UserPermissions,
): boolean => {
  const permissions = getUserPermissions(userRole);
  return permissions[permission];
};

export const hasRole = (
  userRole: User['role'],
  allowedRoles: User['role'][],
): boolean => {
  return allowedRoles.includes(userRole);
};

export const canAccessPatient = (
  user: User,
  patientId: string,
  assignedPatients?: string[],
): boolean => {
  const permissions = getUserPermissions(user.role);

  // Admin and doctors can access all patients
  if (permissions.canAccessAllPatients) return true;

  // Patients can only access their own data
  if (user.role === 'patient' && user.id.toString() === patientId) return true;

  // Staff can access assigned patients
  if (user.role === 'staff' && assignedPatients?.includes(patientId))
    return true;

  return false;
};
