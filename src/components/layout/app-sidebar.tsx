'use client';

import {
  Brain,
  ChevronRight,
  ChevronsUpDown,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type React from 'react';
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
// import { RoleBadge } from '@/components/ui/role-badge';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  // SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import { useRBAC } from '@/hooks/use-rbac';
import type { User } from '@/types/auth';
import { useAuthContext } from '../provider/auth-provider';

type NavItem = {
  title: string;
  url?: string;
  icon?: string;
  items?: NavItem[];
};

let Icons: Record<string, React.ComponentType<{ className?: string }>> | null =
  null;
try {
  Icons = require('@/components/shared/icons').Icons;
} catch (error) {
  // Icons not found, will use default
}

let navItems: NavItem[] = [];
try {
  navItems = require('@/constants/navbar').navItems || [];
} catch (error) {
  // Nav items not found, will use empty array
}

export const company = {
  name: 'IBrain2U',
  logo: Brain,
  plan: 'Medical Platform',
};

const getIconComponent = (iconName?: string) => {
  if (iconName && Icons && Icons[iconName]) {
    return Icons[iconName];
  }
  return Brain;
};

export default function AppSidebar() {
  const { logout } = useAuthContext();
  const { user, permissions } = useRBAC();
  const pathname = usePathname();
  const { open, isMobile } = useSidebar();

  // Filter nav items based on user role
  const filteredNavItems =
    navItems?.filter((item) => {
      if (!user) return false;

      const itemAccess: Record<string, User['role'][]> = {
        dashboard: ['admin', 'doctor', 'patient', 'staff'],
        viewer: ['admin', 'doctor', 'patient', 'staff'],
        'medical viewer': ['admin', 'doctor', 'patient', 'staff'],
        admin: ['admin'],
        'admin panel': ['admin'],
        users: ['admin'],
        system: ['admin'],
        settings: ['admin'],
        patients: ['admin', 'doctor'],
        reports: ['admin', 'doctor'],
        analytics: ['admin', 'doctor'],
        upload: ['admin', 'doctor', 'staff'],
        files: ['admin', 'staff'],
        lab: ['admin', 'staff'],
        profile: ['admin', 'doctor', 'patient'],
        appointments: ['admin', 'doctor', 'patient'],
        scans: ['admin', 'doctor', 'patient', 'staff'],
      };

      const itemKey =
        item?.title?.toLowerCase() ||
        item?.url?.toLowerCase()?.replace('/dashboard/', '') ||
        item?.url?.toLowerCase()?.replace('/', '') ||
        '';

      const allowedRoles = itemAccess[itemKey] || [
        'admin',
        'doctor',
        'patient',
        'staff',
      ];

      return allowedRoles.includes(user.role);
    }) || [];

  return (
    <Sidebar collapsible="icon" className="relative">
      <SidebarHeader className="border-0">
        <div
          className={`flex items-center text-sidebar-accent-foreground transition-all duration-300 ${
            open || isMobile ? 'gap-2 py-2' : 'justify-center py-2'
          }`}
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <company.logo className="size-4" />
          </div>
          {(open || isMobile) && (
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{company.name}</span>
              <span className="truncate text-xs">{company.plan}</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent
        className="overflow-x-hidden p-0"
        style={{ paddingBottom: '80px' }}
      >
        <SidebarGroup className="px-2 py-0">
          {(open || isMobile) && (
            <SidebarGroupLabel className="px-2 py-2">
              Medical Platform
            </SidebarGroupLabel>
          )}
          <SidebarMenu className="gap-1 px-2">
            {filteredNavItems.map((item, index) => {
              const Icon = getIconComponent(item?.icon);
              const isActive = pathname === item?.url;

              return item?.items?.length ? (
                <Collapsible
                  key={`nav-${item.url || item.title || index}`}
                  defaultOpen={isActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger className="w-full">
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={isActive}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {(open || isMobile) && (
                          <>
                            <span className="truncate">{item.title}</span>
                            <ChevronRight className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </>
                        )}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    {(open || isMobile) && (
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem, subIndex) => {
                            const SubIcon = getIconComponent(subItem.icon);
                            const isSubActive = pathname === subItem.url;

                            return (
                              <SidebarMenuSubItem
                                key={`sub-${subItem.url || subItem.title || subIndex}`}
                              >
                                <SidebarMenuSubButton
                                  isActive={isSubActive}
                                  onClick={() => {
                                    if (subItem.url) {
                                      window.location.href = subItem.url;
                                    }
                                  }}
                                >
                                  {subItem.icon && (
                                    <SubIcon className="h-4 w-4 shrink-0" />
                                  )}
                                  <span className="truncate">
                                    {subItem.title}
                                  </span>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    )}
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={`nav-${item.url || item.title || index}`}>
                  <Link href={item.url || '#'} className="block">
                    <SidebarMenuButton tooltip={item.title} isActive={isActive}>
                      <Icon className="h-4 w-4 shrink-0" />
                      {(open || isMobile) && (
                        <span className="truncate">{item.title}</span>
                      )}
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* User section - PAKSA KE BAWAH DENGAN ABSOLUTE */}
      <div className="absolute bottom-0 left-0 right-0 bg-background">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md p-4 text-left hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Avatar className="h-8 w-8 rounded-lg shrink-0">
                <AvatarImage
                  src={user?.avatar || ''}
                  alt={user?.name || 'User'}
                />
                <AvatarFallback className="rounded-lg">
                  {user?.name
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('') || 'G'}
                </AvatarFallback>
              </Avatar>
              {(open || isMobile) && (
                <>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Gyh</span>
                    <span className="truncate text-xs text-muted-foreground">
                      dokter@test.com
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-56 rounded-lg"
            side="top"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Gyh</p>
                <p className="text-xs leading-none text-muted-foreground">
                  dokter@test.com
                </p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuItem>
              <UserIcon className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={logout}
              className="text-red-600 focus:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* <SidebarRail /> */}
    </Sidebar>
  );
}
