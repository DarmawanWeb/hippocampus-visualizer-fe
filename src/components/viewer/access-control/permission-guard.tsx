// src/components/viewer/access-control/permission-guard.tsx
'use client';
import { AlertTriangle, Shield } from 'lucide-react';
import type { ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useRBAC } from '@/hooks/use-rbac';
import type { User } from '@/types/auth';

interface PermissionGuardProps {
  children: ReactNode;
  requiredRoles?: User['role'][];
  requiredPermissions?: string[];
  fallback?: ReactNode;
  showWarning?: boolean;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  fallback,
  showWarning = true,
}) => {
  const { user, hasRole, hasPermission, isLoading } = useRBAC();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      fallback || (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please log in to access this feature.
          </AlertDescription>
        </Alert>
      )
    );
  }

  // Check role-based access
  if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    if (!showWarning) return null;

    return (
      fallback || (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                Access restricted. Required role: {requiredRoles.join(' or ')}.
                Your role: {user.role}
              </span>
              <Button size="sm" variant="outline">
                Request Access
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )
    );
  }

  // Check permission-based access
  if (requiredPermissions.length > 0) {
    const hasRequiredPermission = requiredPermissions.some((permission) => {
      return hasPermission(permission as any);
    });

    if (!hasRequiredPermission) {
      if (!showWarning) return null;

      return (
        fallback || (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              You don't have the required permissions to access this feature.
            </AlertDescription>
          </Alert>
        )
      );
    }
  }

  return <>{children}</>;
};
