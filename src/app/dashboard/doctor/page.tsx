'use client';

import {
  Activity,
  AlertCircle,
  Brain,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileText,
  RefreshCw,
  Stethoscope,
  TrendingUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
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
  useGetAllMriScans,
  useGetMriScansByDoctor,
  useGetMriStatistics,
} from '@/hooks/queries/use-mri-queries';
import { useAuth } from '@/hooks/useAuth';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('today');

  // API hooks
  const {
    data: allMriScans = [],
    isLoading: scansLoading,
    error: scansError,
    refetch,
  } = useGetAllMriScans();

  const { data: doctorScans = [], isLoading: doctorScansLoading } =
    useGetMriScansByDoctor(user?.id || 0);

  const { data: statistics } = useGetMriStatistics();

  // Calculate time-based filters
  const getFilteredScans = useMemo(() => {
    let filtered = allMriScans;

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
      default:
        // No time filtering
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
          scan.patient?.name.toLowerCase().includes(searchLower) ||
          scan.doctor?.name.toLowerCase().includes(searchLower),
      );
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [allMriScans, timeFilter, statusFilter, searchTerm]);

  // Calculate statistics
  const dashboardStats = useMemo(() => {
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    // Today's scans
    const todayScans = allMriScans.filter(
      (scan) => new Date(scan.createdAt) >= todayStart,
    );

    // Doctor's scans
    const myScans = doctorScans;
    const myTodayScans = myScans.filter(
      (scan) => new Date(scan.createdAt) >= todayStart,
    );

    // Processing times for completed scans
    const completedScans = allMriScans.filter(
      (scan) =>
        scan.status === 'completed' &&
        scan.processingStarted &&
        scan.processingCompleted,
    );

    const avgProcessingTime =
      completedScans.length > 0
        ? completedScans.reduce((acc, scan) => {
            if (!scan.processingCompleted || !scan.processingStarted) {
              return acc;
            }
            const duration =
              new Date(scan.processingCompleted).getTime() -
              new Date(scan.processingStarted).getTime();
            return acc + duration;
          }, 0) /
          completedScans.length /
          1000 /
          60 //
        : 0;

    return {
      totalScans: allMriScans.length,
      todayScans: todayScans.length,
      myScans: myScans.length,
      myTodayScans: myTodayScans.length,
      pendingScans: allMriScans.filter((s) => s.status === 'processing').length,
      completedScans: allMriScans.filter((s) => s.status === 'completed')
        .length,
      failedScans: allMriScans.filter((s) => s.status === 'failed').length,
      avgProcessingTime: Math.round(avgProcessingTime * 10) / 10,
      uniquePatients: new Set(allMriScans.map((s) => s.patientId)).size,
    };
  }, [allMriScans, doctorScans]);

  const getStatusColor = (status: string) => {
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
      return `${minutes}m`;
    }
    if (scan.status === 'processing' && scan.processingStarted) {
      const duration = Date.now() - new Date(scan.processingStarted).getTime();
      const minutes = Math.round(duration / 1000 / 60);
      return `${minutes}m (ongoing)`;
    }
    return '-';
  };

  const VolumeDisplay = ({ volumes }: { volumes: any }) => {
    if (!volumes) return <span className="text-gray-400">-</span>;

    return (
      <div className="text-xs">
        <div className="font-medium">Total: {volumes.total}</div>
        <div className="text-gray-500">
          A: {volumes.anterior} | P: {volumes.posterior}
        </div>
      </div>
    );
  };

  // Error state
  if (scansError) {
    return (
      <PermissionGuard requiredRoles={['doctor']}>
        <div className="p-6 max-w-7xl mx-auto">
          <Card className="border-red-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                <h3 className="text-lg font-semibold text-red-700 mb-2">
                  Error Loading Data
                </h3>
                <p className="text-red-600 mb-4">
                  Failed to load MRI scan data. Please try again.
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
    <PermissionGuard requiredRoles={['doctor']}>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Stethoscope className="h-8 w-8 text-blue-600" />
              Doctor Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Medical imaging analysis and hippocampus segmentation review
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-muted-foreground">
                Welcome back,
              </span>
              <span className="font-medium">{user?.name}</span>
              <Badge variant="outline" className="ml-2">
                {user?.role}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw
                className={`h-4 w-4 mr-2 ${scansLoading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
            <Button asChild>
              <Link href="/viewer">
                <Brain className="h-4 w-4 mr-2" />
                Medical Viewer
              </Link>
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total MRI Scans */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total MRI Scans
              </CardTitle>
              <Brain className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {dashboardStats.totalScans}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardStats.todayScans} uploaded today
              </p>
            </CardContent>
          </Card>

          {/* My Scans */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Scans</CardTitle>
              <FileText className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {dashboardStats.myScans}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardStats.myTodayScans} today
              </p>
            </CardContent>
          </Card>

          {/* Processing Status */}
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <Activity className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {dashboardStats.pendingScans}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardStats.completedScans} completed
              </p>
            </CardContent>
          </Card>

          {/* Patients */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Unique Patients
              </CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {dashboardStats.uniquePatients}
              </div>
              <p className="text-xs text-muted-foreground">
                Avg processing: {dashboardStats.avgProcessingTime}m
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Row */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">
                    Completed Today
                  </p>
                  <p className="text-2xl font-bold">
                    {
                      allMriScans.filter(
                        (s) =>
                          s.status === 'completed' &&
                          new Date(s.createdAt).toDateString() ===
                            new Date().toDateString(),
                      ).length
                    }
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">
                    Failed Scans
                  </p>
                  <p className="text-2xl font-bold">
                    {dashboardStats.failedScans}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    Success Rate
                  </p>
                  <p className="text-2xl font-bold">
                    {dashboardStats.totalScans > 0
                      ? Math.round(
                          (dashboardStats.completedScans /
                            dashboardStats.totalScans) *
                            100,
                        )
                      : 0}
                    %
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* MRI Scans Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  MRI Scans & Hippocampus Analysis
                </CardTitle>
                <CardDescription>
                  Review and analyze medical imaging scans with AI-powered
                  hippocampus segmentation
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
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
                <Input
                  placeholder="Search scans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Scan ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Hippocampus Volumes</TableHead>
                    <TableHead>Processing Time</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scansLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <RefreshCw className="h-6 w-6 mx-auto mb-2 animate-spin text-blue-600" />
                        <p className="text-gray-500">Loading MRI scans...</p>
                      </TableCell>
                    </TableRow>
                  ) : getFilteredScans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-gray-500">No MRI scans found</p>
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
                              {scan.patient?.name || 'Unknown Patient'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ID: {scan.patientId}
                            </div>
                          </div>
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
                            className={getStatusColor(scan.status)}
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
                              {scan.errorMessage}
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
                          <div className="text-sm">
                            {new Date(scan.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(scan.createdAt).toLocaleTimeString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" asChild></Button>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/viewer?scan=${scan.id}`}>
                                <Brain className="h-4 w-4" />
                              </Link>
                            </Button>
                            {scan.status === 'completed' &&
                              scan.resultsJson?.output_files && (
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
}
