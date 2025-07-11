'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  Brain,
  Edit,
  Save,
  Search,
  Shield,
  Stethoscope,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RoleBadge } from '@/components/ui/role-badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PermissionGuard } from '@/components/viewer/access-control/permission-guard';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth-service';
import type { User } from '@/types/auth';

// Zod Validation Schemas
const userRoleSchema = z.enum(['admin', 'doctor', 'staff', 'patient']);
const logLevelSchema = z.enum(['info', 'warning', 'error']);

const registerFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: userRoleSchema,
});

const roleUpdateFormSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  newRole: userRoleSchema,
});

type UserRole = z.infer<typeof userRoleSchema>;
type LogLevel = z.infer<typeof logLevelSchema>;
type RegisterFormData = z.infer<typeof registerFormSchema>;
type RoleUpdateFormData = z.infer<typeof roleUpdateFormSchema>;

// Mock stats data
const mockStats = {
  monthlyGrowth: {
    users: 12.5,
    patients: 8.2,
    doctors: 5.1,
    staff: 15.3,
  },
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // React Query hooks using your auth service
  const { data: users, refetch: refetchUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => authService.getAllUsers(),
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: doctors } = useQuery({
    queryKey: ['users', 'doctor'],
    queryFn: () => authService.getUserByRole('doctor'),
    retry: 3,
    staleTime: 5 * 60 * 1000,
  });

  const { data: patients } = useQuery({
    queryKey: ['users', 'patient'],
    queryFn: () => authService.getUserByRole('patient'),
    retry: 3,
    staleTime: 5 * 60 * 1000,
  });

  const { data: staff } = useQuery({
    queryKey: ['users', 'staff'],
    queryFn: () => authService.getUserByRole('staff'),
    retry: 3,
    staleTime: 5 * 60 * 1000,
  });

  // Mutations using your auth service
  const createUserMutation = useMutation({
    mutationFn: (data: RegisterFormData) => authService.createUser(data),
    onSuccess: () => {
      // Invalidate and refetch users data
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'doctor'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'patient'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'staff'] });
      toast.success('User created successfully');
    },
    onError: (error: any) => {
      console.error('Create user error:', error);
      toast.error(error.response?.data?.message || 'Failed to create user');
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, newRole }: { userId: string; newRole: string }) =>
      authService.updateUserRole(parseInt(userId), newRole),
    onSuccess: () => {
      // Invalidate and refetch users data
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'doctor'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'patient'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'staff'] });
      toast.success('User role updated successfully');
    },
    onError: (error: any) => {
      console.error('Update role error:', error);
      toast.error(
        error.response?.data?.message || 'Failed to update user role',
      );
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => authService.deleteUser(userId),
    onSuccess: () => {
      // Invalidate and refetch users data
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'doctor'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'patient'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'staff'] });
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      console.error('Delete user error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    },
  });

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isRoleUpdateOpen, setIsRoleUpdateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [registerForm, setRegisterForm] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    role: 'patient',
  });
  const [roleUpdateForm, setRoleUpdateForm] = useState<RoleUpdateFormData>({
    userId: '',
    newRole: 'patient',
  });

  // Form validation errors
  const [registerErrors, setRegisterErrors] = useState<
    Partial<Record<keyof RegisterFormData, string>>
  >({});
  const [roleUpdateErrors, setRoleUpdateErrors] = useState<
    Partial<Record<keyof RoleUpdateFormData, string>>
  >({});

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate form data
      const validatedData = registerFormSchema.parse(registerForm);

      // Call mutation
      await createUserMutation.mutateAsync(validatedData);

      // Reset form and close dialog
      setIsRegisterOpen(false);
      setRegisterForm({ name: '', email: '', password: '', role: 'patient' });
      setRegisterErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof RegisterFormData, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof RegisterFormData] = err.message;
          }
        });
        setRegisterErrors(fieldErrors);
      }
    }
  };

  const handleRoleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate form data
      const validatedData = roleUpdateFormSchema.parse(roleUpdateForm);

      // Call mutation
      await updateRoleMutation.mutateAsync({
        userId: validatedData.userId,
        newRole: validatedData.newRole,
      });

      // Reset form and close dialog
      setIsRoleUpdateOpen(false);
      setRoleUpdateErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof RoleUpdateFormData, string>> =
          {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof RoleUpdateFormData] = err.message;
          }
        });
        setRoleUpdateErrors(fieldErrors);
      }
    }
  };

  const openRoleUpdateModal = (user: User) => {
    setSelectedUser(user);
    setRoleUpdateForm({
      userId: user.id.toString(),
      newRole: user.role,
    });
    setRoleUpdateErrors({});
    setIsRoleUpdateOpen(true);
  };

  const openDeleteModal = (user: User) => {
    setUserToDelete(user);
    setIsDeleteOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await deleteUserMutation.mutateAsync(userToDelete.id);
      setIsDeleteOpen(false);
      setUserToDelete(null);
    } catch (error) {
      // Error is already handled in the mutation
    }
  };

  const handleRegisterInputChange = (
    field: keyof RegisterFormData,
    value: string,
  ) => {
    setRegisterForm((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (registerErrors[field]) {
      setRegisterErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleRoleUpdateInputChange = (
    field: keyof RoleUpdateFormData,
    value: string,
  ) => {
    setRoleUpdateForm((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (roleUpdateErrors[field]) {
      setRoleUpdateErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <PermissionGuard requiredRoles={['admin']}>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Enhanced Header */}
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

          <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
            <DialogTrigger asChild></DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Register New User</DialogTitle>
                <DialogDescription>
                  Create a new user account and assign their role
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={registerForm.name}
                    onChange={(e) =>
                      handleRegisterInputChange('name', e.target.value)
                    }
                    className={registerErrors.name ? 'border-red-500' : ''}
                    required
                  />
                  {registerErrors.name && (
                    <p className="text-sm text-red-600">
                      {registerErrors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={registerForm.email}
                    onChange={(e) =>
                      handleRegisterInputChange('email', e.target.value)
                    }
                    className={registerErrors.email ? 'border-red-500' : ''}
                    required
                  />
                  {registerErrors.email && (
                    <p className="text-sm text-red-600">
                      {registerErrors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={registerForm.password}
                    onChange={(e) =>
                      handleRegisterInputChange('password', e.target.value)
                    }
                    className={registerErrors.password ? 'border-red-500' : ''}
                    required
                  />
                  {registerErrors.password && (
                    <p className="text-sm text-red-600">
                      {registerErrors.password}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={registerForm.role}
                    onValueChange={(value: UserRole) =>
                      handleRegisterInputChange('role', value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="patient">Patient</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  {registerErrors.role && (
                    <p className="text-sm text-red-600">
                      {registerErrors.role}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    disabled={createUserMutation.isPending}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {createUserMutation.isPending
                      ? 'Creating...'
                      : 'Register User'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsRegisterOpen(false);
                      setRegisterErrors({});
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Role Update Dialog */}
        <Dialog open={isRoleUpdateOpen} onOpenChange={setIsRoleUpdateOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Update User Role</DialogTitle>
              <DialogDescription>
                Change the role for {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRoleUpdate} className="space-y-4">
              <div>
                <Label>Current User</Label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{selectedUser?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedUser?.email}
                      </p>
                    </div>
                    <RoleBadge role={selectedUser?.role || 'patient'} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newRole">New Role</Label>
                <Select
                  value={roleUpdateForm.newRole}
                  onValueChange={(value: UserRole) =>
                    handleRoleUpdateInputChange('newRole', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select new role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient">Patient</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                {roleUpdateErrors.newRole && (
                  <p className="text-sm text-red-600">
                    {roleUpdateErrors.newRole}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={updateRoleMutation.isPending}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateRoleMutation.isPending ? 'Updating...' : 'Update Role'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsRoleUpdateOpen(false);
                    setRoleUpdateErrors({});
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Delete User
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this user? This action cannot be
                undone.
              </DialogDescription>
            </DialogHeader>

            {userToDelete && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-red-900">
                      {userToDelete.name}
                    </p>
                    <p className="text-sm text-red-700">{userToDelete.email}</p>
                  </div>
                  <RoleBadge role={userToDelete.role} />
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                variant="destructive"
                onClick={handleDeleteUser}
                disabled={deleteUserMutation.isPending}
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleteUserMutation.isPending ? 'Deleting...' : 'Delete User'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDeleteOpen(false);
                  setUserToDelete(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {users?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Patients
              </CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {patients?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Doctors
              </CardTitle>
              <Stethoscope className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {doctors?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <Brain className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {staff?.length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

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
                <Button onClick={() => setIsRegisterOpen(true)}>
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users
                  ?.filter(
                    (user) =>
                      searchTerm === '' ||
                      user.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      user.email
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()),
                  )
                  .map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{renderRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openRoleUpdateModal(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => openDeleteModal(user)}
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
      </div>
    </PermissionGuard>
  );
}
