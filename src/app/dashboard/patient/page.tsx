'use client';

import {
  Activity,
  AlertCircle,
  Brain,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileText,
  RefreshCw,
  Search,
  Stethoscope,
  TrendingUp,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
  type MriScan,
  useGetMriScansByPatient,
} from '@/hooks/queries/use-mri-queries';
import { useAuth } from '@/hooks/useAuth';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('all');

  // API hooks - get scans for current patient
  const {
    data: myMriScans = [],
    isLoading: scansLoading,
    error: scansError,
    refetch,
  } = useGetMriScansByPatient(user?.id || 0);

  // Calculate patient statistics
  const patientStats = useMemo(() => {
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const thisMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Today's scans
    const todayScans = myMriScans.filter(
      (scan) => new Date(scan.createdAt) >= todayStart,
    );

    // This month's scans
    const monthScans = myMriScans.filter(
      (scan) => new Date(scan.createdAt) >= thisMonth,
    );

    // Processing times for completed scans
    const completedScans = myMriScans.filter(
      (scan) =>
        scan.status === 'completed' &&
        scan.processingStarted &&
        scan.processingCompleted,
    );

    const avgProcessingTime = completedScans.length;
    const assignedDoctors = [
      ...new Set(myMriScans.map((scan) => scan.doctor?.name).filter(Boolean)),
    ];

    return {
      totalScans: myMriScans.length,
      todayScans: todayScans.length,
      monthScans: monthScans.length,
      pendingScans: myMriScans.filter((s) => s.status === 'processing').length,
      completedScans: myMriScans.filter((s) => s.status === 'completed').length,
      failedScans: myMriScans.filter((s) => s.status === 'failed').length,
      avgProcessingTime: Math.round(avgProcessingTime * 10) / 10,
      assignedDoctors,
      latestScan:
        myMriScans.length > 0
          ? myMriScans.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )[0]
          : null,
    };
  }, [myMriScans]);

  // Filter scans based on search and filters
  const getFilteredScans = useMemo(() => {
    let filtered = myMriScans;

    // Time filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    switch (timeFilter) {
      case 'today':
        filtered = filtered.filter((scan) => new Date(scan.createdAt) >= today);
        break;
      case 'week':
        filtered = filtered.filter(
          (scan) => new Date(scan.createdAt) >= thisWeek,
        );
        break;
      case 'month':
        filtered = filtered.filter(
          (scan) => new Date(scan.createdAt) >= thisMonth,
        );
        break;
      case 'all':
      default:
        break;
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((scan) => scan.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (scan) =>
          scan.id.toString().includes(searchLower) ||
          scan.doctor?.name.toLowerCase().includes(searchLower) ||
          scan.originalPath?.toLowerCase().includes(searchLower),
      );
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [myMriScans, timeFilter, statusFilter, searchTerm]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Clock className="w-3 h-3" />;
      case 'completed':
        return <CheckCircle className="w-3 h-3" />;
      case 'failed':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const VolumeDisplay = ({ volumes }: { volumes: any }) => {
    if (!volumes)
      return <span className="text-gray-400">Pending analysis</span>;

    return (
      <div className="text-sm">
        <div className="font-medium text-green-600">
          Total Hippocampus: {volumes.total}
        </div>
        <div className="text-xs text-gray-500">
          Anterior: {volumes.anterior} | Posterior: {volumes.posterior}
        </div>
      </div>
    );
  };

  const getProcessingDuration = (scan: MriScan) => {
    if (
      scan.status === 'completed' &&
      scan.processingStarted &&
      scan.processingCompleted
    ) {
      const duration =
        new Date(scan.processingCompleted).getTime() -
        new Date(scan.processingStarted).getTime();
      const minutes = Math.round(duration / 1000 / 60);
      return `${minutes} minutes`;
    }
    if (scan.status === 'processing' && scan.processingStarted) {
      const duration = Date.now() - new Date(scan.processingStarted).getTime();
      const minutes = Math.round(duration / 1000 / 60);
      return `${minutes} minutes (ongoing)`;
    }
    return '-';
  };

  if (scansError) {
    return (
      <PermissionGuard requiredRoles={['patient']}>
        <div className="p-6 max-w-7xl mx-auto">
          <Card className="border-red-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                <h3 className="text-lg font-semibold text-red-700 mb-2">
                  Error Loading Your Scans
                </h3>
                <p className="text-red-600 mb-4">
                  Failed to load your MRI scan data. Please try again.
                </p>
                <Button onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PermissionGuard>
    );
  }

  return (
    <PermissionGuard requiredRoles={['patient']}>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <User className="h-8 w-8 text-blue-600" />
              Patient Portal
            </h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {user?.name}
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${scansLoading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>

        {/* Profile Card */}
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.avatar || '/placeholder-avatar.jpg'} />
                <AvatarFallback className="text-lg bg-blue-100 text-blue-700">
                  {user?.name
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('') || 'P'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
                      {user?.name}
                    </h2>
                    <p className="text-blue-700 dark:text-blue-300">
                      Patient ID: {user?.id} | Email: {user?.email}
                    </p>
                    <Badge variant="outline" className="mt-1">
                      {user?.role}
                    </Badge>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                    <Stethoscope className="h-4 w-4" />
                    <span className="text-sm">
                      Assigned Doctors:{' '}
                      {patientStats.assignedDoctors.length > 0
                        ? patientStats.assignedDoctors.join(', ')
                        : 'None assigned'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                    <Brain className="h-4 w-4" />
                    <span className="text-sm">
                      Total Scans: {patientStats.totalScans}
                    </span>
                  </div>
                  {patientStats.latestScan && (
                    <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">
                        Latest:{' '}
                        {new Date(
                          patientStats.latestScan.createdAt,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
              <Brain className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {patientStats.totalScans}
              </div>
              <p className="text-xs text-muted-foreground">
                {patientStats.monthScans} this month
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {patientStats.completedScans}
              </div>
              <p className="text-xs text-muted-foreground">
                Analysis completed
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <Activity className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {patientStats.pendingScans}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently analyzing
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Time</CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {patientStats.avgProcessingTime}m
              </div>
              <p className="text-xs text-muted-foreground">Processing time</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        {patientStats.completedScans > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">
                      Success Rate
                    </p>
                    <p className="text-2xl font-bold">
                      {Math.round(
                        (patientStats.completedScans /
                          patientStats.totalScans) *
                          100,
                      )}
                      %
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">
                      Assigned Doctors
                    </p>
                    <p className="text-2xl font-bold">
                      {patientStats.assignedDoctors.length}
                    </p>
                  </div>
                  <Stethoscope className="h-8 w-8 text-blue-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* MRI Scans Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  My MRI Scans & Hippocampus Analysis
                </CardTitle>
                <CardDescription>
                  View your medical imaging history and AI-powered hippocampus
                  segmentation results
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search scans..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Scan ID</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Hippocampus Volumes</TableHead>
                    <TableHead>Processing Time</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scansLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <RefreshCw className="h-6 w-6 mx-auto mb-2 animate-spin text-blue-600" />
                        <p className="text-gray-500">
                          Loading your MRI scans...
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : getFilteredScans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-gray-500">
                          {myMriScans.length === 0
                            ? 'No MRI scans found. Contact your doctor to upload your scans.'
                            : 'No scans match your current filters'}
                        </p>
                        {(searchTerm ||
                          statusFilter !== 'all' ||
                          timeFilter !== 'all') && (
                          <p className="text-sm text-gray-400">
                            Try adjusting your filters
                          </p>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    getFilteredScans.map((scan) => (
                      <TableRow key={scan.id}>
                        <TableCell className="font-mono text-sm">
                          #{scan.id}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {scan.doctor?.name || 'Unknown Doctor'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ID: {scan.doctorId}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getStatusBadgeColor(scan.status)}
                          >
                            {getStatusIcon(scan.status)}
                            <span className="ml-1 capitalize">
                              {scan.status}
                            </span>
                          </Badge>
                          {scan.status === 'failed' && scan.errorMessage && (
                            <div
                              className="text-xs text-red-600 mt-1 max-w-32 truncate"
                              title={scan.errorMessage}
                            >
                              Error: {scan.errorMessage}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <VolumeDisplay volumes={scan.volumes} />
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {getProcessingDuration(scan)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm">
                              {new Date(scan.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(scan.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href="/viewer">
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View details</span>
                              </Link>
                            </Button>
                            {scan.status === 'completed' &&
                              scan.resultsJson?.output_files?.report_png && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    // Download report functionality
                                    const link = document.createElement('a');
                                    link.href = `/api/v1/mri/${scan.id}/download/report`;
                                    link.download = `mri-report-${scan.id}.png`;
                                    link.click();
                                  }}
                                >
                                  <Download className="h-4 w-4" />
                                  <span className="sr-only">
                                    Download report
                                  </span>
                                </Button>
                              )}
                            {scan.status === 'completed' &&
                              scan.segmentationPath && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = `/api/v1/mri/${scan.id}/download/segmentation`;
                                    link.download = `mri-segmentation-${scan.id}.nii.gz`;
                                    link.click();
                                  }}
                                >
                                  <FileText className="h-4 w-4" />
                                  <span className="sr-only">
                                    Download segmentation
                                  </span>
                                </Button>
                              )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
};

export default PatientDashboard;
