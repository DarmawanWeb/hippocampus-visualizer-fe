// app/dashboard/viewer/layout.tsx - FIXED
'use client';

interface DashboardViewerLayoutProps {
  children: React.ReactNode;
}

export default function DashboardViewerLayout({
  children,
}: DashboardViewerLayoutProps) {
  // Since children parameter is used directly in JSX, no need for additional logic
  return <>{children}</>;
}
