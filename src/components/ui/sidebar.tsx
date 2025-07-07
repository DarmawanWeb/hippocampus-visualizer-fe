// components/ui/sidebar.tsx - CLEAN VERSION NO DUPLICATE EXPORTS
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

// Create context for sidebar state
interface SidebarContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = React.createContext<SidebarContextType | null>(null);

// Hook to use sidebar context
const useSidebar = () => {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

// Enhanced SidebarProvider
const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
>(
  (
    {
      className,
      defaultOpen = true,
      open: openProp,
      onOpenChange,
      children,
      ...props
    },
    ref,
  ) => {
    const [openState, setOpenState] = React.useState(defaultOpen);
    const [openMobile, setOpenMobile] = React.useState(false);
    const [isMobile, setIsMobile] = React.useState(false);

    const open = openProp ?? openState;

    const setOpen = React.useCallback(
      (value: boolean | ((prev: boolean) => boolean)) => {
        const newValue = typeof value === 'function' ? value(open) : value;
        if (onOpenChange) {
          onOpenChange(newValue);
        } else {
          setOpenState(newValue);
        }
      },
      [onOpenChange, open],
    );

    const toggleSidebar = React.useCallback(() => {
      if (isMobile) {
        setOpenMobile((prev) => !prev);
      } else {
        setOpen((prev) => !prev);
      }
    }, [isMobile, setOpen]);

    // Mobile detection with debounce
    React.useEffect(() => {
      const checkMobile = () => {
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);

        // Close mobile sidebar when switching to desktop
        if (!mobile && openMobile) {
          setOpenMobile(false);
        }
      };

      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }, [openMobile]);

    // Prevent body scroll when mobile sidebar is open
    React.useEffect(() => {
      if (isMobile && openMobile) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }

      return () => {
        document.body.style.overflow = 'unset';
      };
    }, [isMobile, openMobile]);

    const contextValue = React.useMemo(
      () => ({
        open,
        setOpen,
        openMobile,
        setOpenMobile,
        isMobile,
        toggleSidebar,
      }),
      [open, setOpen, openMobile, isMobile, toggleSidebar],
    );

    return (
      <SidebarContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn(
            'group/sidebar-wrapper flex min-h-screen w-full',
            className,
          )}
          data-sidebar-provider=""
          {...props}
        >
          {children}
        </div>
      </SidebarContext.Provider>
    );
  },
);
SidebarProvider.displayName = 'SidebarProvider';

// Enhanced SidebarInset
const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'relative flex min-h-svh flex-1 flex-col bg-background',
        className,
      )}
      {...props}
    />
  );
});
SidebarInset.displayName = 'SidebarInset';

// Enhanced Sidebar with proper state handling
const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'sidebar' | 'floating' | 'inset';
    collapsible?: 'none' | 'icon' | 'offcanvas';
  }
>(
  (
    { className, variant = 'sidebar', collapsible = 'offcanvas', ...props },
    ref,
  ) => {
    const { open, openMobile, isMobile, setOpenMobile } = useSidebar();

    return (
      <>
        {/* Mobile backdrop */}
        {isMobile && openMobile && (
          <button
            type="button"
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden cursor-default"
            onClick={() => setOpenMobile(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setOpenMobile(false);
              }
            }}
            aria-label="Close sidebar"
          />
        )}

        {/* Sidebar */}
        <div
          ref={ref}
          data-sidebar="sidebar"
          data-variant={variant}
          data-state={open ? 'expanded' : 'collapsed'}
          data-collapsible={collapsible}
          className={cn(
            'group peer transition-all duration-200 ease-in-out',
            'relative h-svh bg-background border-r border-border',

            // Variants
            variant === 'floating' && 'p-2 pr-0',
            variant === 'inset' && 'p-2',

            // Collapsible states - desktop
            !isMobile && collapsible === 'icon' && (open ? 'w-64' : 'w-16'),
            !isMobile && collapsible !== 'icon' && 'w-64',
            !isMobile && 'hidden md:block',

            // Mobile styles
            isMobile && [
              'fixed inset-y-0 left-0 z-50 w-64',
              openMobile ? 'translate-x-0' : '-translate-x-full',
            ],

            className,
          )}
          {...props}
        />
      </>
    );
  },
);
Sidebar.displayName = 'Sidebar';

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="header"
    className={cn('flex flex-col gap-2 p-4', className)}
    {...props}
  />
));
SidebarHeader.displayName = 'SidebarHeader';

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="content"
    className={cn(
      'flex min-h-0 flex-1 flex-col gap-2 overflow-auto py-2',
      className,
    )}
    {...props}
  />
));
SidebarContent.displayName = 'SidebarContent';

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="footer"
    className={cn('flex flex-col gap-2 p-4', className)}
    {...props}
  />
));
SidebarFooter.displayName = 'SidebarFooter';

const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="group"
    className={cn('relative flex w-full min-w-0 flex-col', className)}
    {...props}
  />
));
SidebarGroup.displayName = 'SidebarGroup';

const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { open, isMobile } = useSidebar();

  return (
    <div
      ref={ref}
      data-sidebar="group-label"
      className={cn(
        'duration-200 flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-muted-foreground outline-none transition-all ease-linear',
        !open && !isMobile && 'opacity-0 h-0 overflow-hidden',
        className,
      )}
      {...props}
    />
  );
});
SidebarGroupLabel.displayName = 'SidebarGroupLabel';

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu"
    className={cn('flex w-full min-w-0 flex-col gap-1', className)}
    {...props}
  />
));
SidebarMenu.displayName = 'SidebarMenu';

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-sidebar="menu-item"
    className={cn('group/menu-item relative', className)}
    {...props}
  />
));
SidebarMenuItem.displayName = 'SidebarMenuItem';

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    isActive?: boolean;
    tooltip?: string;
  }
>(({ isActive = false, className, tooltip, children, ...props }, ref) => {
  const { open, isMobile } = useSidebar();

  return (
    <button
      ref={ref}
      data-sidebar="menu-button"
      data-active={isActive}
      type="button"
      className={cn(
        'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none transition-all hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 active:bg-accent active:text-accent-foreground disabled:pointer-events-none disabled:opacity-50',
        isActive && 'bg-accent font-medium text-accent-foreground',
        !open && !isMobile && 'justify-center px-2',
        className,
      )}
      title={!open && !isMobile ? tooltip : undefined}
      {...props}
    >
      {children}
    </button>
  );
});
SidebarMenuButton.displayName = 'SidebarMenuButton';

const SidebarMenuSub = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => {
  const { open, isMobile } = useSidebar();

  return (
    <ul
      ref={ref}
      data-sidebar="menu-sub"
      className={cn(
        'transition-all duration-300 space-y-1',
        open || isMobile ? 'ml-4 mt-1' : 'hidden',
        className,
      )}
      {...props}
    />
  );
});
SidebarMenuSub.displayName = 'SidebarMenuSub';

const SidebarMenuSubItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-sidebar="menu-sub-item"
    className={cn('', className)}
    {...props}
  />
));
SidebarMenuSubItem.displayName = 'SidebarMenuSubItem';

const SidebarMenuSubButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    isActive?: boolean;
  }
>(({ isActive = false, className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      data-sidebar="menu-sub-button"
      data-active={isActive}
      type="button"
      className={cn(
        'flex h-7 min-w-0 items-center gap-2 overflow-hidden rounded-md px-2 text-muted-foreground outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 active:bg-accent active:text-accent-foreground disabled:pointer-events-none disabled:opacity-50',
        isActive && 'bg-accent text-accent-foreground',
        className,
      )}
      {...props}
    />
  );
});
SidebarMenuSubButton.displayName = 'SidebarMenuSubButton';

const SidebarRail = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      ref={ref}
      data-sidebar="rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      type="button"
      className={cn(
        'absolute inset-y-0 right-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] after:-translate-x-1/2 after:bg-border after:transition-all after:duration-200 hover:after:bg-foreground sm:flex',
        className,
      )}
      {...props}
    />
  );
});
SidebarRail.displayName = 'SidebarRail';

const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      ref={ref}
      data-sidebar="trigger"
      type="button"
      className={cn(
        'h-7 w-7 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center transition-colors',
        className,
      )}
      onClick={(event) => {
        if (onClick) {
          onClick(event);
        }
        toggleSidebar();
      }}
      {...props}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        role="img"
        aria-label="Toggle sidebar"
      >
        <title>Toggle sidebar</title>
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <path d="M9 3v18" />
        <path d="m16 15-3-3 3-3" />
      </svg>
      <span className="sr-only">Toggle Sidebar</span>
    </button>
  );
});
SidebarTrigger.displayName = 'SidebarTrigger';

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
};
