// app/dashboard/admin/page.tsx - RBAC Integrated Admin Dashboard - FINAL FIXED
'use client';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  Edit,
  Eye,
  FileText,
  Search,
  Settings,
  Shield,
  Trash2,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RoleBadge } from '@/components/ui/role-badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PermissionGuard } from '@/components/viewer/access-control/permission-guard';
import { useAuth } from '@/hooks/useAuth';

// Define proper types
type UserRole = 'admin' | 'doctor' | 'staff' | 'patient';
type LogLevel = 'info' | 'warning' | 'error';

interface MockUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: string;
  createdAt: string;
  lastLogin: string;
}

interface MockLog {
  id: string;
  action: string;
  user: string;
  role: UserRole | 'unknown';
  timestamp: string;
  level: LogLevel;
  details: string;
}

// Mock data for demonstration
const mockStats = {
  totalUsers: 1847,
  totalPatients: 1234,
  totalScans: 2847,
  pendingReviews: 23,
  monthlyGrowth: {
    users: 12.5,
    patients: 8.2,
    scans: 15.3,
  },
  usersByRole: {
    admin: 5,
    doctor: 45,
    staff: 23,
    patient: 1774,
  },
  scansByStatus: {
    pending: 23,
    processing: 12,
    completed: 2795,
    error: 17,
  },
};

const mockRecentUsers: MockUser[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@hospital.com',
    role: 'doctor',
    status: 'active',
    createdAt: '2024-06-28',
    lastLogin: '2024-06-29 14:30',
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike.chen@lab.com',
    role: 'staff',
    status: 'active',
    createdAt: '2024-06-27',
    lastLogin: '2024-06-29 13:15',
  },
  {
    id: '3',
    name: 'Emily Davis',
    email: 'emily.davis@email.com',
    role: 'patient',
    status: 'pending',
    createdAt: '2024-06-26',
    lastLogin: 'Never',
  },
];

const mockSystemLogs: MockLog[] = [
  {
    id: '1',
    action: 'User Login',
    user: 'Dr. Sarah Johnson',
    role: 'doctor',
    timestamp: '2024-06-29 14:30:22',
    level: 'info',
    details: 'Successful login from 192.168.1.100',
  },
  {
    id: '2',
    action: 'Comment Added',
    user: 'Dr. Robert Smith',
    role: 'doctor',
    timestamp: '2024-06-29 14:25:10',
    level: 'info',
    details: 'Added finding comment to scan MRI20240629001',
  },
  {
    id: '3',
    action: 'Failed Login Attempt',
    user: 'unknown',
    role: 'unknown',
    timestamp: '2024-06-29 14:15:33',
    level: 'warning',
    details: 'Multiple failed login attempts from 203.0.113.1',
  },
  {
    id: '4',
    action: 'Permission Change',
    user: 'Admin',
    role: 'admin',
    timestamp: '2024-06-29 13:45:12',
    level: 'info',
    details: 'Updated permissions for user ID: 123',
  },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Helper function to render role badge safely
  const renderRoleBadge = (role: UserRole | 'unknown') => {
    if (role === 'unknown') {
      return (
        <Badge variant="outline" className="text-gray-600 border-gray-600">
          Unknown
        </Badge>
      );
    }
    return <RoleBadge role={role} />;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'doctor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'staff':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'patient':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <PermissionGuard requiredRoles={['admin']}>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-red-600" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              System administration and user management
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-muted-foreground">
                Logged in as:
              </span>
              <span className="font-medium">{user?.name}</span>
              <RoleBadge role={user?.role || 'admin'} />
            </div>
          </div>
          <Button className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add New User
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {mockStats.totalUsers.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +{mockStats.monthlyGrowth.users}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Patients
              </CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {mockStats.totalPatients.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +{mockStats.monthlyGrowth.patients}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
              <Brain className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {mockStats.totalScans.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +{mockStats.monthlyGrowth.scans}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Reviews
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {mockStats.pendingReviews}
              </div>
              <p className="text-xs text-muted-foreground">
                Requires attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="system">System Logs</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      User Management
                    </CardTitle>
                    <CardDescription>
                      Manage system users and their permissions
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-64"
                      />
                    </div>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockRecentUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.name}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <RoleBadge role={user.role} />
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(user.status)}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.lastLogin}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Activity Logs
                </CardTitle>
                <CardDescription>
                  Monitor system activities and security events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockSystemLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">
                          {log.action}
                        </TableCell>
                        <TableCell>{log.user}</TableCell>
                        <TableCell>{renderRoleBadge(log.role)}</TableCell>
                        <TableCell>{log.timestamp}</TableCell>
                        <TableCell>
                          <Badge className={getLogLevelColor(log.level)}>
                            {log.level}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {log.details}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Role Permissions Matrix
                </CardTitle>
                <CardDescription>
                  View and manage role-based permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Admin Permissions */}
                    <Card className="border-red-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Shield className="h-4 w-4 text-red-600" />
                          Administrator
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Add Comments</span>
                          <Badge
                            variant="outline"
                            className="text-green-600 border-green-600"
                          >
                            ✓
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Edit Comments</span>
                          <Badge
                            variant="outline"
                            className="text-green-600 border-green-600"
                          >
                            ✓
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Delete Comments</span>
                          <Badge
                            variant="outline"
                            className="text-green-600 border-green-600"
                          >
                            ✓
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">View Private Comments</span>
                          <Badge
                            variant="outline"
                            className="text-green-600 border-green-600"
                          >
                            ✓
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Manage Users</span>
                          <Badge
                            variant="outline"
                            className="text-green-600 border-green-600"
                          >
                            ✓
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Access All Patients</span>
                          <Badge
                            variant="outline"
                            className="text-green-600 border-green-600"
                          >
                            ✓
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Doctor Permissions */}
                    <Card className="border-blue-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Activity className="h-4 w-4 text-blue-600" />
                          Doctor
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Add Comments</span>
                          <Badge
                            variant="outline"
                            className="text-green-600 border-green-600"
                          >
                            ✓
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Edit Comments</span>
                          <Badge
                            variant="outline"
                            className="text-green-600 border-green-600"
                          >
                            ✓
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Delete Comments</span>
                          <Badge
                            variant="outline"
                            className="text-green-600 border-green-600"
                          >
                            ✓
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">View Private Comments</span>
                          <Badge
                            variant="outline"
                            className="text-green-600 border-green-600"
                          >
                            ✓
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Manage Users</span>
                          <Badge
                            variant="outline"
                            className="text-red-600 border-red-600"
                          >
                            ✗
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Access All Patients</span>
                          <Badge
                            variant="outline"
                            className="text-green-600 border-green-600"
                          >
                            ✓
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Patient Permissions */}
                    <Card className="border-gray-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-600" />
                          Patient
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Add Comments</span>
                          <Badge
                            variant="outline"
                            className="text-red-600 border-red-600"
                          >
                            ✗
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Edit Comments</span>
                          <Badge
                            variant="outline"
                            className="text-red-600 border-red-600"
                          >
                            ✗
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Delete Comments</span>
                          <Badge
                            variant="outline"
                            className="text-red-600 border-red-600"
                          >
                            ✗
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">View Private Comments</span>
                          <Badge
                            variant="outline"
                            className="text-red-600 border-red-600"
                          >
                            ✗
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Manage Users</span>
                          <Badge
                            variant="outline"
                            className="text-red-600 border-red-600"
                          >
                            ✗
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Access All Patients</span>
                          <Badge
                            variant="outline"
                            className="text-red-600 border-red-600"
                          >
                            ✗
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Staff Permissions */}
                    <Card className="border-green-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <FileText className="h-4 w-4 text-green-600" />
                          Lab Staff
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Add Comments</span>
                          <Badge
                            variant="outline"
                            className="text-red-600 border-red-600"
                          >
                            ✗
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Edit Comments</span>
                          <Badge
                            variant="outline"
                            className="text-red-600 border-red-600"
                          >
                            ✗
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Delete Comments</span>
                          <Badge
                            variant="outline"
                            className="text-red-600 border-red-600"
                          >
                            ✗
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">View Private Comments</span>
                          <Badge
                            variant="outline"
                            className="text-red-600 border-red-600"
                          >
                            ✗
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Manage Users</span>
                          <Badge
                            variant="outline"
                            className="text-red-600 border-red-600"
                          >
                            ✗
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Access All Patients</span>
                          <Badge
                            variant="outline"
                            className="text-red-600 border-red-600"
                          >
                            ✗
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {Object.entries(mockStats.usersByRole).map(
                      ([role, count]) => (
                        <div
                          key={role}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <RoleBadge role={role as UserRole} />
                            <span className="text-sm font-medium capitalize">
                              {role.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">{count}</span>
                            <div className="h-2 w-16 bg-gray-200 rounded-full">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{
                                  width: `${(count / mockStats.totalUsers) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Growth Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">New Users</span>
                      <span className="text-sm font-medium text-green-600">
                        +{mockStats.monthlyGrowth.users}%
                      </span>
                    </div>
                    <div className="h-2 bg-green-100 rounded-full">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{
                          width: `${mockStats.monthlyGrowth.users * 2}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">New Patients</span>
                      <span className="text-sm font-medium text-blue-600">
                        +{mockStats.monthlyGrowth.patients}%
                      </span>
                    </div>
                    <div className="h-2 bg-blue-100 rounded-full">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${mockStats.monthlyGrowth.patients * 2}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">MRI Scans</span>
                      <span className="text-sm font-medium text-purple-600">
                        +{mockStats.monthlyGrowth.scans}%
                      </span>
                    </div>
                    <div className="h-2 bg-purple-100 rounded-full">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{
                          width: `${mockStats.monthlyGrowth.scans * 2}%`,
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    User Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(mockStats.usersByRole).map(
                    ([role, count]) => (
                      <div
                        key={role}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <RoleBadge role={role as UserRole} />
                          <span className="text-sm font-medium capitalize">
                            {role.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{count}</span>
                          <div className="h-2 w-16 bg-gray-200 rounded-full">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{
                                width: `${(count / mockStats.totalUsers) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-orange-600" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      99.9%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      System Uptime
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      1.2TB
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Storage Used
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      156
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Active Sessions
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">23</div>
                    <p className="text-sm text-muted-foreground">
                      Pending Actions
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* System Information */}
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <div className="mt-0.5">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              </div>
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  System Administration Access
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                  You have full administrative access to the IBrain2u medical
                  imaging platform. This includes user management, system
                  monitoring, and security configuration. All administrative
                  actions are logged for audit purposes.
                </p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" className="bg-white">
                    <Settings className="h-4 w-4 mr-2" />
                    System Settings
                  </Button>
                  <Button size="sm" variant="outline" className="bg-white">
                    <FileText className="h-4 w-4 mr-2" />
                    Audit Logs
                  </Button>
                  <Button size="sm" variant="outline" className="bg-white">
                    <Shield className="h-4 w-4 mr-2" />
                    Security Center
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
}
