// src/components/ui/role-badge.tsx
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { User } from '@/types/auth';

interface RoleBadgeProps {
  role: User['role'];
  className?: string;
}

const roleConfig = {
  admin: {
    label: 'Admin',
    className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
  },
  doctor: {
    label: 'Doctor',
    className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
  },
  staff: {
    label: 'Staff',
    className:
      'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
  },
  patient: {
    label: 'Patient',
    className: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200',
  },
} as const;

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const config = roleConfig[role];

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
