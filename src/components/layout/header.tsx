'use client';
import { MessageSquare, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RoleBadge } from '@/components/ui/role-badge';
import { useRBAC } from '@/hooks/use-rbac';
import { Breadcrumbs } from '../shared/breadcrumbs';
import { Separator } from '../ui/separator';
import { SidebarTrigger } from '../ui/sidebar';
import { UserNav } from './user-nav';

export default function Header() {
  const { user, permissions } = useRBAC();

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
            </div>
          </div>
        )}

        {user && <UserNav />}
      </div>
    </header>
  );
}
