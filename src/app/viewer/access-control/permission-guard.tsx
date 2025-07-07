// components/viewer/access-control/permission-guard.tsx - FIXED
'use client';

import { AlertTriangle, Loader2, Shield } from 'lucide-react';
import type { ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

// Define proper types
type UserRole = 'admin' | 'doctor' | 'staff' | 'patient';
type Permission = 'canAddComments' | 'canEditComments' | 'canDeleteComments' | 'canViewPrivateComments' | 'canManageUsers' | 'canAccessAllPatients';

interface PermissionGuardProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
  requiredPermissions?: Permission[];
  fallback?: ReactNode;
  requireAll?: boolean; // If true, user must have ALL permissions. If false, user needs ANY permission
}

// Permission system based on roles
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'canAddComments',
    'canEditComments', 
    'canDeleteComments',
    'canViewPrivateComments',
    'canManageUsers',
    'canAccessAllPatients'
  ],
  doctor: [
    'canAddComments',
    'canEditComments',
    'canDeleteComments', 
    'canViewPrivateComments',
    'canAccessAllPatients'
  ],
  staff: [],
  patient: []
};

// Helper function to check if user has permission - FIXED
const hasPermission = (userRole: UserRole, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
};

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  fallback,
  requireAll = false
}) => {
  const { user, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return (
      fallback || (
        <Alert className="m-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>You must be logged in to access this content.</span>
              <Button size="sm" variant="outline">
                Sign In
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )
    );
  }

  // Check role-based access
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.includes(user.role as UserRole);
    if (!hasRequiredRole) {
      return (
        fallback || (
          <Alert className="m-6 border-red-200 bg-red-50">
            <Shield className="h-4 w-4 text-red-600" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium text-red-800">Access Denied</p>
                <p className="text-red-700">
                  You need {requiredRoles.join(' or ')} access to view this content.
                  Your current role: <strong>{user.role}</strong>
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )
      );
    }
  }

  // Check permission-based access
  if (requiredPermissions.length > 0) {
    const hasRequiredPermission = requiredPermissions.some((permission) => {
      return hasPermission(user.role as UserRole, permission); // FIXED: Proper type casting
    });

    if (requireAll) {
      // User must have ALL permissions
      const hasAllPermissions = requiredPermissions.every((permission) => {
        return hasPermission(user.role as UserRole, permission);
      });
      
      if (!hasAllPermissions) {
        return (
          fallback || (
            <Alert className="m-6 border-orange-200 bg-orange-50">
              <Shield className="h-4 w-4 text-orange-600" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium text-orange-800">Insufficient Permissions</p>
                  <p className="text-orange-700">
                    You need all of the following permissions: {requiredPermissions.join(', ')}
                  </p>
                  <p className="text-sm text-orange-600">
                    Your role ({user.role}) doesn't have the required access level.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )
        );
      }
    } else {
      // User needs ANY of the permissions
      if (!hasRequiredPermission) {
        return (
          fallback || (
            <Alert className="m-6 border-orange-200 bg-orange-50">
              <Shield className="h-4 w-4 text-orange-600" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium text-orange-800">Insufficient Permissions</p>
                  <p className="text-orange-700">
                    You need one of the following permissions: {requiredPermissions.join(', ')}
                  </p>
                  <p className="text-sm text-orange-600">
                    Your role ({user.role}) doesn't have the required access level.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )
        );
      }
    }
  }

  // User has access, render children
  return <>{children}</>;
};