// src/app/viewer/layout.tsx - Viewer Layout (full screen)
'use client';

import { Brain, Loader2 } from 'lucide-react';
import { Suspense } from 'react';

export default function ViewerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-full overflow-auto bg-black">
      <Suspense
        fallback={
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-white">
              <Brain className="h-12 w-12 mx-auto mb-4 animate-pulse" />
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-lg">Loading Medical Viewer...</p>
              <p className="text-sm text-gray-400">
                Initializing NiiVue engine...
              </p>
            </div>
          </div>
        }
      >
        {children}
      </Suspense>
    </div>
  );
}
