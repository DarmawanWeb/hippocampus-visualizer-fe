// src/app/dashboard/doctor/page.tsx - Doctor Dashboard
'use client';

import {
  Activity,
  AlertCircle,
  Brain,
  Calendar,
  Clock,
  Eye,
  FileText,
  MessageSquare,
  Search,
  Stethoscope,
  TrendingUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';
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

// Mock data untuk doctor dashboard
const mockDoctorStats = {
  todayPatients: 12,
  pendingReviews: 8,
  completedToday: 15,
  urgentCases: 3,
  avgResponseTime: 1.8,
  patientSatisfaction: 4.7,
  weeklyStats: {
    consultations: 67,
    scansReviewed: 43,
    reportsGenerated: 28,
  },
};

const mockPatients = [
  {
    id: 'P001',
    name: 'Sarah Johnson',
    age: 34,
    condition: 'Brain MRI Follow-up',
    status: 'pending',
    priority: 'urgent',
    scheduledTime: '09:00',
    lastScan: '2024-07-05',
  },
  {
    id: 'P002',
    name: 'Michael Chen',
    age: 45,
    condition: 'Routine Checkup',
    status: 'completed',
    priority: 'normal',
    scheduledTime: '10:30',
    lastScan: '2024-07-04',
  },
  {
    id: 'P003',
    name: 'Emily Davis',
    age: 28,
    condition: 'Headache Investigation',
    status: 'in-progress',
    priority: 'high',
    scheduledTime: '11:15',
    lastScan: '2024-07-06',
  },
];

const mockRecentScans = [
  {
    id: 'MRI001',
    patientName: 'Sarah Johnson',
    scanType: 'Brain MRI T1',
    status: 'pending-review',
    uploadTime: '2 hours ago',
    priority: 'urgent',
  },
  {
    id: 'MRI002',
    patientName: 'David Wilson',
    scanType: 'Brain MRI T2',
    status: 'reviewed',
    uploadTime: '4 hours ago',
    priority: 'normal',
  },
  {
    id: 'MRI003',
    patientName: 'Lisa Brown',
    scanType: 'Brain MRI FLAIR',
    status: 'pending-review',
    uploadTime: '6 hours ago',
    priority: 'high',
  },
];

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending-review':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'reviewed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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
              Patient management and medical imaging review
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-muted-foreground">
                Welcome back,
              </span>
              <span className="font-medium">{user?.name}</span>
              <RoleBadge role={user?.role || 'doctor'} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/viewer">
                <Brain className="h-4 w-4 mr-2" />
                Medical Viewer
              </Link>
            </Button>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today's Patients
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {mockDoctorStats.todayPatients}
              </div>
              <p className="text-xs text-muted-foreground">
                {mockDoctorStats.completedToday} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Reviews
              </CardTitle>
              <Brain className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {mockDoctorStats.pendingReviews}
              </div>
              <p className="text-xs text-muted-foreground">
                MRI scans awaiting review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Urgent Cases
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {mockDoctorStats.urgentCases}
              </div>
              <p className="text-xs text-muted-foreground">
                Require immediate attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Response
              </CardTitle>
              <Clock className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {mockDoctorStats.avgResponseTime}h
              </div>
              <p className="text-xs text-muted-foreground">
                Average response time
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="patients" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="patients">My Patients</TabsTrigger>
            <TabsTrigger value="scans">Recent Scans</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="patients" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Today's Patient Schedule
                    </CardTitle>
                    <CardDescription>
                      Manage your patient appointments and consultations
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search patients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-64"
                      />
                    </div>
                    <Button>
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockPatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">{patient.name}</div>
                            <div className="text-sm text-muted-foreground">
                              ID: {patient.id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{patient.age}</TableCell>
                        <TableCell>{patient.condition}</TableCell>
                        <TableCell>{patient.scheduledTime}</TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(patient.priority)}>
                            {patient.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(patient.status)}>
                            {patient.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/viewer?patient=${patient.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MessageSquare className="h-4 w-4" />
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

          <TabsContent value="scans" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Recent MRI Scans
                </CardTitle>
                <CardDescription>
                  Review and analyze recent medical imaging scans
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Scan ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Upload Time</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockRecentScans.map((scan) => (
                      <TableRow key={scan.id}>
                        <TableCell className="font-medium">{scan.id}</TableCell>
                        <TableCell>{scan.patientName}</TableCell>
                        <TableCell>{scan.scanType}</TableCell>
                        <TableCell>{scan.uploadTime}</TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(scan.priority)}>
                            {scan.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(scan.status)}>
                            {scan.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/viewer?scan=${scan.id}`}>
                                <Brain className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
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

          <TabsContent value="performance" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Weekly Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Consultations</span>
                      <span className="text-sm font-medium text-blue-600">
                        {mockDoctorStats.weeklyStats.consultations}
                      </span>
                    </div>
                    <div className="h-2 bg-blue-100 rounded-full">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: '85%' }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Scans Reviewed</span>
                      <span className="text-sm font-medium text-purple-600">
                        {mockDoctorStats.weeklyStats.scansReviewed}
                      </span>
                    </div>
                    <div className="h-2 bg-purple-100 rounded-full">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: '70%' }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Reports Generated</span>
                      <span className="text-sm font-medium text-green-600">
                        {mockDoctorStats.weeklyStats.reportsGenerated}
                      </span>
                    </div>
                    <div className="h-2 bg-green-100 rounded-full">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: '60%' }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Quality Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {mockDoctorStats.patientSatisfaction}★
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Patient Satisfaction
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {mockDoctorStats.avgResponseTime}h
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Average Response Time
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      98.5%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Diagnostic Accuracy
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions Panel
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <div className="mt-0.5">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              </div>
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Medical Imaging Platform
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                  Access advanced medical imaging tools, review MRI scans, add diagnostic comments, 
                  and collaborate with your medical team using the IBrain2u platform.
                </p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" className="bg-white" asChild>
                    <Link href="/viewer">
                      <Brain className="h-4 w-4 mr-2" />
                      Open Medical Viewer
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" className="bg-white">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button size="sm" variant="outline" className="bg-white">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Team Chat
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </PermissionGuard>
  );
}
