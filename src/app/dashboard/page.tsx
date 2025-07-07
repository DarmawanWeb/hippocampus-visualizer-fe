'use client';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthContext } from '@/components/provider/auth-provider';

export default function DashboardPage() {
  const { user, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (user?.role) {
      // console.log('Redirecting based on role:', user.role);
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
          // console.warn('Unknown role:', user.role);
          break;
      }
    } else {
      // console.warn('No user role found');
    }
  }, [isLoading, user?.role, router]);

  // Loading screen while fetching user
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

  // Optional: If user is null, you might redirect to login page or show error
  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>User not found.</p>
      </div>
    );
  }

  // Fallback UI during redirect
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
