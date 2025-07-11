'use client';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useRBAC } from '@/hooks/use-rbac'; // Updated import

export default function DashboardPage() {
  const { user, isLoading } = useRBAC(); // Updated hook
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      return;
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via AuthProvider
  }

  // Route to appropriate dashboard based on user role
  switch (user.role) {
    case 'admin':
      router.replace('/dashboard/admin');
      break;
    case 'doctor':
      router.replace('/dashboard/doctor');
      break;
    case 'patient':
      router.replace('/dashboard/patient');
      break;
    case 'staff':
      router.replace('/dashboard/staff');
      break;
    default:
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-lg font-semibold">Invalid user role</p>
            <p className="text-muted-foreground">
              Please contact an administrator
            </p>
          </div>
        </div>
      );
  }

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
