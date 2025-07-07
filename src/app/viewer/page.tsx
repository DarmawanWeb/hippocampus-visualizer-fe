// src/app/viewer/page.tsx - Viewer Page
'use client';

import { Brain, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { PermissionGuard } from '@/components/viewer/access-control/permission-guard';

// Dynamic import untuk enhanced medical viewer
const EnhancedMedicalViewer = dynamic(
  () => import('./components/enhanced-medical-viewer'),
  {
    loading: () => (
      <div className="h-full flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <Brain className="h-12 w-12 mx-auto mb-4 animate-pulse" />
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading Medical Viewer...</p>
          <p className="text-sm text-gray-400">Please wait...</p>
        </div>
      </div>
    ),
    ssr: false,
  },
);

export default function ViewerPage() {
  return (
    <div className="h-full">
      <PermissionGuard
        requiredRoles={['admin', 'doctor', 'patient', 'staff']}
        showWarning={true}
      >
        <Suspense
          fallback={
            <div className="h-full flex items-center justify-center bg-black">
              <div className="text-center text-white">
                <Brain className="h-12 w-12 mx-auto mb-4 animate-pulse" />
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-lg">Loading Medical Viewer...</p>
                <p className="text-sm text-gray-400">
                  Initializing components...
                </p>
              </div>
            </div>
          }
        >
          <EnhancedMedicalViewer />
        </Suspense>
      </PermissionGuard>
    </div>
  );
}
