// components/layout/app-sidebar.tsx - FINAL VERSION dengan icon keys yang benar
'use client';

import { Brain, ChevronRight, ChevronsUpDown, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '@/components/shared/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RoleBadge } from '@/components/ui/role-badge';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { navItems } from '@/constants/navbar';
import { useRBAC } from '@/hooks/use-rbac';
import type { User } from '@/types/auth';
import { useAuthContext } from '../provider/auth-provider';

export const company = {
  name: 'IBrain2U',
  logo: Brain,
  plan: 'Medical Platform',
};

export default function AppSidebar() {
  const { logout } = useAuthContext();
  const { user, permissions } = useRBAC();
  const pathname = usePathname();

  // Filter navigation items based on user role and permissions
  const filteredNavItems = navItems.filter((item) => {
    // If no user, show nothing or basic items only
    if (!user) return false;

    // Define role-based access rules for navigation items
    const itemAccess: Record<string, User['role'][]> = {
      // Dashboard items - accessible to all authenticated users
      dashboard: ['admin', 'doctor', 'patient', 'staff'],
      viewer: ['admin', 'doctor', 'patient', 'staff'],
      'medical viewer': ['admin', 'doctor', 'patient', 'staff'],

      // Admin only
      admin: ['admin'],
      'admin panel': ['admin'],
      users: ['admin'],
      system: ['admin'],
      settings: ['admin'],

      // Doctor and Admin
      patients: ['admin', 'doctor'],
      reports: ['admin', 'doctor'],
      analytics: ['admin', 'doctor'],

      // Lab staff specific
      upload: ['admin', 'doctor', 'staff'],
      files: ['admin', 'staff'],
      lab: ['admin', 'staff'],

      // Patient specific
      profile: ['admin', 'doctor', 'patient'],
      appointments: ['admin', 'doctor', 'patient'],
      scans: ['admin', 'doctor', 'patient', 'staff'],
    };

    // Check if item has role restrictions
    const itemKey =
      item.title?.toLowerCase() ||
      item.url?.toLowerCase().replace('/dashboard/', '') ||
      item.url?.toLowerCase().replace('/', '');

    const allowedRoles = itemAccess[itemKey] || [
      'admin',
      'doctor',
      'patient',
      'staff',
    ];

    return allowedRoles.includes(user.role);
  });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex gap-2 py-2 text-sidebar-accent-foreground">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <company.logo className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{company.name}</span>
            <span className="truncate text-xs">{company.plan}</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup>
          <SidebarGroupLabel>Medical Platform</SidebarGroupLabel>
          <SidebarMenu>
            {filteredNavItems.map((item) => {
              // Get icon with fallback
              const Icon =
                item.icon && Icons[item.icon] ? Icons[item.icon] : Icons.brain;

              return item?.items && item?.items?.length > 0 ? (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={pathname === item.url}
                      >
                        <Icon />
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => {
                          const SubIcon =
                            subItem.icon && Icons[subItem.icon]
                              ? Icons[subItem.icon]
                              : null;
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={pathname === subItem.url}
                              >
                                <Link href={subItem.url}>
                                  {SubIcon && (
                                    <SubIcon className="mr-2 h-4 w-4" />
                                  )}
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <Icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* Role-specific quick actions - UPDATED dengan icon keys yang benar
        {user && (
          <SidebarGroup>
            <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
            <SidebarMenu>
              {user.role === 'admin' && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Admin Panel">
                    <Link href="/dashboard/admin">
                      <Icons.shield />
                      <span>Admin Panel</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              
              {(user.role === 'doctor' || user.role === 'admin') && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Medical Viewer">
                    <Link href="/viewer">
                      <Icons.brain />
                      <span>Medical Viewer</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              
              {user.role === 'staff' && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Upload Files">
                      <Link href="/dashboard/upload">
                        <Icons.upload />
                        <span>Upload Scans</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="View Scans">
                      <Link href="/viewer">
                        <Icons.brain />
                        <span>View Scans</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
              
              {user.role === 'patient' && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="My Results">
                      <Link href="/dashboard/patient">
                        <Icons.fileText />
                        <span>My Results</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="View My Scans">
                      <Link href="/viewer">
                        <Icons.brain />
                        <span>View Scans</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
            </SidebarMenu>
          </SidebarGroup>
        )} */}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={user?.avatar || ''}
                      alt={user?.name || 'Medical User'}
                    />
                    <AvatarFallback className="rounded-lg">
                      {user?.name
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('') || 'MU'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user?.name || 'Medical User'}
                    </span>
                    <span className="truncate text-xs">
                      {user?.email || 'user@ibrain2u.com'}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={user?.avatar || ''}
                        alt={user?.name || 'Medical User'}
                      />
                      <AvatarFallback className="rounded-lg">
                        {user?.name
                          ?.split(' ')
                          .map((n) => n[0])
                          .join('') || 'MU'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user?.name || 'Medical User'}
                      </span>
                      <span className="truncate text-xs">
                        {user?.email || 'user@ibrain2u.com'}
                      </span>
                      <div className="mt-1">
                        {user && (
                          <RoleBadge role={user.role} className="text-xs" />
                        )}
                      </div>
                    </div>
                  </div>
                </DropdownMenuLabel>

                {/* Permission indicators */}
                <div className="px-2 py-1 border-t border-b bg-muted/50">
                  <div className="text-xs text-muted-foreground mb-1">
                    Permissions:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {permissions.canAddComments && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300">
                        Comments
                      </span>
                    )}
                    {permissions.canViewPrivateComments && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                        Private
                      </span>
                    )}
                    {permissions.canManageUsers && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300">
                        Admin
                      </span>
                    )}
                  </div>
                </div>

                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-600 focus:text-red-600 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
