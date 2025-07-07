'use client';
import {
  Activity,
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileCheck,
  Folder,
  HardDrive,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  UserPlus,
  Users,
  Zap,
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
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data for lab staff dashboard
const mockLabStats = {
  totalUploads: 234,
  todayUploads: 12,
  processingFiles: 8,
  completedToday: 19,
  storageUsed: 78.5,
  uploadSpeed: '45 MB/s',
  monthlyProgress: {
    uploadsCompleted: 234,
    avgProcessingTime: '12 minutes',
    successRate: 98.5,
  },
};

const mockRecentUploads = [
  {
    id: '1',
    filename: 'brain_scan_001.nii.gz',
    patientCode: 'P000123',
    patientName: 'Sarah Johnson',
    scanType: 'T1',
    fileSize: '45.2 MB',
    uploadDate: '2024-06-29 14:30',
    status: 'completed',
    processedBy: 'Dr. Smith',
  },
  {
    id: '2',
    filename: 'mri_flair_002.nii.gz',
    patientCode: 'P000124',
    patientName: 'Robert Wilson',
    scanType: 'FLAIR',
    fileSize: '52.8 MB',
    uploadDate: '2024-06-29 13:15',
    status: 'processing',
    processedBy: null,
  },
  {
    id: '3',
    filename: 'dti_scan_003.nii.gz',
    patientCode: 'P000125',
    patientName: 'Emily Davis',
    scanType: 'DTI',
    fileSize: '128.4 MB',
    uploadDate: '2024-06-29 12:45',
    status: 'pending',
    processedBy: null,
  },
  {
    id: '4',
    filename: 'brain_overlay.nii.gz',
    patientCode: 'P000123',
    patientName: 'Sarah Johnson',
    scanType: 'Overlay',
    fileSize: '12.3 MB',
    uploadDate: '2024-06-29 11:20',
    status: 'completed',
    processedBy: 'Dr. Johnson',
  },
];

const mockPatients = [
  {
    id: '1',
    patientCode: 'P000123',
    name: 'Sarah Johnson',
    age: 34,
    totalScans: 5,
    lastUpload: '2024-06-29',
    status: 'active',
    assignedDoctor: 'Dr. Smith',
  },
  {
    id: '2',
    patientCode: 'P000124',
    name: 'Robert Wilson',
    age: 56,
    totalScans: 3,
    lastUpload: '2024-06-28',
    status: 'new',
    assignedDoctor: 'Dr. Johnson',
  },
  {
    id: '3',
    patientCode: 'P000125',
    name: 'Emily Davis',
    age: 28,
    totalScans: 1,
    lastUpload: '2024-06-27',
    status: 'pending',
    assignedDoctor: null,
  },
];

const mockUploadQueue = [
  {
    id: '1',
    filename: 'brain_mri_large.nii.gz',
    progress: 75,
    speed: '12.5 MB/s',
    timeRemaining: '2 minutes',
    status: 'uploading',
  },
  {
    id: '2',
    filename: 'spinal_cord_scan.nii.gz',
    progress: 45,
    speed: '8.2 MB/s',
    timeRemaining: '5 minutes',
    status: 'uploading',
  },
  {
    id: '3',
    filename: 'overlay_segmentation.nii.gz',
    progress: 100,
    speed: '0 MB/s',
    timeRemaining: 'Processing...',
    status: 'processing',
  },
];

const LabStaffDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'uploading':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPatientStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'new':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'uploading':
        return <Upload className="h-4 w-4 text-purple-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <HardDrive className="h-8 w-8 text-green-600" />
            Lab Staff Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Medical file management and patient data processing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <UserPlus className="h-4 w-4 mr-2" />
            New Patient
          </Button>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Uploads</CardTitle>
            <Upload className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {mockLabStats.totalUploads}
            </div>
            <p className="text-xs text-muted-foreground">All time uploads</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Uploads
            </CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {mockLabStats.todayUploads}
            </div>
            <p className="text-xs text-muted-foreground">
              Files uploaded today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <RefreshCw className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {mockLabStats.processingFiles}
            </div>
            <p className="text-xs text-muted-foreground">
              Files being processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <HardDrive className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {mockLabStats.storageUsed}%
            </div>
            <p className="text-xs text-muted-foreground">Of total capacity</p>
          </CardContent>
        </Card>
      </div>

      {/* System Status & Upload Queue */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              System Performance
            </CardTitle>
            <CardDescription>
              Current system status and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Upload Speed</span>
                <span className="text-sm font-medium text-green-600">
                  {mockLabStats.uploadSpeed}
                </span>
              </div>
              <Progress value={85} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Storage Usage</span>
                <span className="text-sm font-medium text-orange-600">
                  {mockLabStats.storageUsed}%
                </span>
              </div>
              <Progress value={mockLabStats.storageUsed} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Processing Queue</span>
                <span className="text-sm font-medium text-blue-600">
                  {mockLabStats.processingFiles} files
                </span>
              </div>
              <Progress value={35} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">
                  {mockLabStats.monthlyProgress.successRate}%
                </div>
                <p className="text-xs text-muted-foreground">Success Rate</p>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">
                  {mockLabStats.monthlyProgress.avgProcessingTime}
                </div>
                <p className="text-xs text-muted-foreground">Avg Processing</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              Upload Queue
            </CardTitle>
            <CardDescription>
              Currently uploading and processing files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockUploadQueue.map((upload) => (
                <div key={upload.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(upload.status)}
                      <span className="text-sm font-medium truncate max-w-[200px]">
                        {upload.filename}
                      </span>
                    </div>
                    <Badge className={getStatusBadgeColor(upload.status)}>
                      {upload.status}
                    </Badge>
                  </div>
                  <Progress value={upload.progress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{upload.speed}</span>
                    <span>{upload.timeRemaining}</span>
                  </div>
                </div>
              ))}

              {mockUploadQueue.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No active uploads</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="uploads" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="uploads">File Uploads</TabsTrigger>
          <TabsTrigger value="patients">Patient Management</TabsTrigger>
          <TabsTrigger value="queue">Processing Queue</TabsTrigger>
          <TabsTrigger value="storage">Storage Management</TabsTrigger>
        </TabsList>

        <TabsContent value="uploads" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5" />
                    Recent File Uploads
                  </CardTitle>
                  <CardDescription>
                    Monitor uploaded files and their processing status
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="T1">T1</SelectItem>
                      <SelectItem value="T2">T2</SelectItem>
                      <SelectItem value="FLAIR">FLAIR</SelectItem>
                      <SelectItem value="DTI">DTI</SelectItem>
                      <SelectItem value="Overlay">Overlay</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search files..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">File</th>
                      <th className="text-left p-2 font-medium">Patient</th>
                      <th className="text-left p-2 font-medium">Type</th>
                      <th className="text-left p-2 font-medium">Size</th>
                      <th className="text-left p-2 font-medium">Upload Time</th>
                      <th className="text-left p-2 font-medium">Status</th>
                      <th className="text-left p-2 font-medium">
                        Processed By
                      </th>
                      <th className="text-left p-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockRecentUploads.map((upload) => (
                      <tr key={upload.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <Folder className="h-4 w-4 text-blue-600" />
                            <span className="font-medium truncate max-w-[150px]">
                              {upload.filename}
                            </span>
                          </div>
                        </td>
                        <td className="p-2">
                          <div>
                            <div className="font-medium">
                              {upload.patientName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {upload.patientCode}
                            </div>
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge variant="outline">{upload.scanType}</Badge>
                        </td>
                        <td className="p-2">{upload.fileSize}</td>
                        <td className="p-2">{upload.uploadDate}</td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(upload.status)}
                            <Badge
                              className={getStatusBadgeColor(upload.status)}
                            >
                              {upload.status}
                            </Badge>
                          </div>
                        </td>
                        <td className="p-2">{upload.processedBy || '-'}</td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Patient Management
                  </CardTitle>
                  <CardDescription>
                    Manage patient records and file uploads
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
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Patient
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Patient</th>
                      <th className="text-left p-2 font-medium">Age</th>
                      <th className="text-left p-2 font-medium">Total Scans</th>
                      <th className="text-left p-2 font-medium">Last Upload</th>
                      <th className="text-left p-2 font-medium">
                        Assigned Doctor
                      </th>
                      <th className="text-left p-2 font-medium">Status</th>
                      <th className="text-left p-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockPatients.map((patient) => (
                      <tr
                        key={patient.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-2">
                          <div>
                            <div className="font-medium">{patient.name}</div>
                            <div className="text-sm text-gray-500">
                              {patient.patientCode}
                            </div>
                          </div>
                        </td>
                        <td className="p-2">{patient.age}</td>
                        <td className="p-2">
                          <Badge variant="outline">{patient.totalScans}</Badge>
                        </td>
                        <td className="p-2">{patient.lastUpload}</td>
                        <td className="p-2">
                          {patient.assignedDoctor || 'Not assigned'}
                        </td>
                        <td className="p-2">
                          <Badge
                            className={getPatientStatusColor(patient.status)}
                          >
                            {patient.status}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Upload className="h-4 w-4 mr-1" />
                              Upload
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Processing Queue Management
              </CardTitle>
              <CardDescription>
                Monitor and manage file processing queue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Clock className="h-8 w-8 text-yellow-600" />
                        <div>
                          <p className="text-2xl font-bold text-yellow-700">
                            8
                          </p>
                          <p className="text-sm text-yellow-600">
                            Pending Files
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
                        <div>
                          <p className="text-2xl font-bold text-blue-700">3</p>
                          <p className="text-sm text-blue-600">Processing</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                        <div>
                          <p className="text-2xl font-bold text-green-700">
                            19
                          </p>
                          <p className="text-sm text-green-600">
                            Completed Today
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Current Processing Queue</h3>
                  <div className="space-y-3">
                    {mockUploadQueue.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{item.filename}</p>
                            <p className="text-sm text-gray-500">
                              {item.status === 'processing'
                                ? 'Processing file...'
                                : `${item.speed} • ${item.timeRemaining}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-32">
                            <Progress value={item.progress} className="h-2" />
                          </div>
                          <span className="text-sm font-medium">
                            {item.progress}%
                          </span>
                          <Badge className={getStatusBadgeColor(item.status)}>
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-gray-500">
                      Average processing time:{' '}
                      {mockLabStats.monthlyProgress.avgProcessingTime}
                    </p>
                    <Button variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Queue
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  Storage Overview
                </CardTitle>
                <CardDescription>
                  System storage usage and management
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Storage Used</span>
                    <span className="text-sm font-medium">
                      {mockLabStats.storageUsed}%
                    </span>
                  </div>
                  <Progress value={mockLabStats.storageUsed} className="h-3" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>785 GB used</span>
                    <span>1 TB total</span>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Brain Scans</span>
                    </div>
                    <span className="text-sm font-medium">425 GB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Spinal Scans</span>
                    </div>
                    <span className="text-sm font-medium">180 GB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">Overlays</span>
                    </div>
                    <span className="text-sm font-medium">85 GB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">Other</span>
                    </div>
                    <span className="text-sm font-medium">95 GB</span>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <Button variant="outline" className="w-full">
                    <HardDrive className="h-4 w-4 mr-2" />
                    Manage Storage
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Archive Old Files
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  File Statistics
                </CardTitle>
                <CardDescription>
                  Upload and processing statistics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      1,247
                    </div>
                    <p className="text-sm text-gray-600">Total Files</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      98.5%
                    </div>
                    <p className="text-sm text-gray-600">Success Rate</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">File Types Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">NIfTI (.nii.gz)</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full">
                          <div className="w-4/5 h-full bg-blue-500 rounded-full"></div>
                        </div>
                        <span className="text-sm">80%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">DICOM (.dcm)</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full">
                          <div className="w-1/5 h-full bg-green-500 rounded-full"></div>
                        </div>
                        <span className="text-sm">20%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Monthly Trends</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">This Month</span>
                      <span className="text-sm font-medium text-green-600">
                        +15.3%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Last Month</span>
                      <span className="text-sm font-medium">234 uploads</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Average Daily</span>
                      <span className="text-sm font-medium">12 files</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Upload Section */}
      {/* <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <div className="mt-0.5">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            </div>
            <div>
              <p className="font-medium text-green-900 dark:text-green-100">
                Quick Upload Assistant
              </p>
              <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                Drag and drop your NIfTI files anywhere on this page to start
                uploading. Our system supports batch uploads, automatic file
                validation, and real-time processing status. For large files, we
                recommend using our chunked upload feature for better
                reliability.
              </p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" className="bg-white">
                  <Upload className="h-4 w-4 mr-2" />
                  Quick Upload
                </Button>
                <Button size="sm" variant="outline" className="bg-white">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Patient
                </Button>
                <Button size="sm" variant="outline" className="bg-white">
                  <FileText className="h-4 w-4 mr-2" />
                  Upload Guide
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
};

export default LabStaffDashboard;
