// src/constants/navbar.ts - UPDATED dengan icon keys yang valid dari Icons Anda
import type { NavItem } from '@/types/navbar';

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: 'dashboard', // ✅ Valid - maps to LayoutDashboardIcon
    isActive: false,
  },
  {
    title: 'Patients',
    url: '/dashboard/patients',
    icon: 'users', // ✅ Valid - maps to Users icon
    isActive: false,
  },
  {
    title: 'Reports',
    url: '/dashboard/reports',
    icon: 'fileText', // ✅ Valid - maps to FileText icon
    isActive: false,
  },
  {
    title: 'Admin Panel',
    url: '/dashboard/admin',
    icon: 'shield', // ✅ Valid - maps to Shield icon
    isActive: false,
  },
  {
    title: 'Settings',
    url: '/dashboard/settings',
    icon: 'settings', // ✅ Valid - maps to Settings icon
    isActive: false,
  },
];
