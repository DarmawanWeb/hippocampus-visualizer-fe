// src/app/dashboard/page.tsx
'use client';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useRBAC } from '@/hooks/use-rbac';

export default function DashboardPage() {
  const { user, isLoading } = useRBAC();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
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
          break;
      }
    }
  }, [user, isLoading, router]);

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
    return null;
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
