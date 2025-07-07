// src/app/dashboard/viewer/page.tsx - Redirect Page
'use client';

import { Brain, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardViewerPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/viewer');
  }, [router]);

  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <Brain className="h-12 w-12 mx-auto mb-4 text-blue-600 animate-pulse" />
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-4" />
        <p className="text-lg font-semibold">Redirecting to Medical Viewer</p>
        <p className="text-sm text-muted-foreground">Please wait...</p>
      </div>
    </div>
  );
}
