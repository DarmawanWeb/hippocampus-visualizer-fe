// components/layout/header.tsx - UPDATED with existing auth - FIXED
'use client';
import { Bell, MessageSquare, Shield, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RoleBadge } from '@/components/ui/role-badge';
import { useRBAC } from '@/hooks/use-rbac'; // Updated import
import { Breadcrumbs } from '../shared/breadcrumbs';
import SearchInput from '../shared/search-input';
import { Separator } from '../ui/separator';
import { SidebarTrigger } from '../ui/sidebar';
import { UserNav } from './user-nav';

export default function Header() {
  const { user, permissions } = useRBAC(); // Updated hook

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-2 px-4">
        {/* User info and permissions display */}
        {user && (
          <div className="hidden lg:flex items-center gap-3 mr-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Welcome,</span>
              <span className="font-medium ml-1">{user.name}</span>
            </div>
            <RoleBadge role={user.role} />

            {/* Permission indicators */}
            <div className="flex items-center gap-1">
              {permissions.canAddComments && (
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-600 text-xs"
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Comments
                </Badge>
              )}
              {permissions.canManageUsers && (
                <Badge
                  variant="outline"
                  className="text-purple-600 border-purple-600 text-xs"
                >
                  <Shield className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              )}
              {permissions.canAccessAllPatients && (
                <Badge
                  variant="outline"
                  className="text-blue-600 border-blue-600 text-xs"
                >
                  <Users className="h-3 w-3 mr-1" />
                  All Patients
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="hidden md:flex">
          <SearchInput />
        </div>

        {/* Notifications for medical staff - FIXED: Added proper button type */}
        {(user?.role === 'doctor' || user?.role === 'admin') && (
          <div className="relative">
            <button 
              type="button"
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
            </button>
          </div>
        )}

        {user && <UserNav />}
      </div>
    </header>
  );
}