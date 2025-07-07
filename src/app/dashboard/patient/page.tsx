'use client';
import {
  Activity,
  AlertTriangle,
  Bell,
  BookOpen,
  Brain,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileText,
  Heart,
  Info,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Search,
  Settings,
  Shield,
  Star,
  Stethoscope,
  User,
} from 'lucide-react';
import { useState } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data for patient dashboard
const mockPatientInfo = {
  id: 'P000123',
  name: 'Sarah Johnson',
  email: 'sarah.johnson@email.com',
  phone: '+1 (555) 123-4567',
  dateOfBirth: '1990-03-15',
  gender: 'Female',
  address: '123 Main St, City, State 12345',
  emergencyContact: {
    name: 'John Johnson',
    relationship: 'Spouse',
    phone: '+1 (555) 987-6543',
  },
  allergies: ['Iodine contrast', 'Penicillin'],
  medicalHistory: ['Migraine', 'Hypertension'],
  assignedDoctor: 'Dr. Robert Smith',
  nextAppointment: '2024-07-05 10:00 AM',
};

const mockPatientStats = {
  totalScans: 8,
  completedScans: 6,
  pendingReviews: 2,
  lastScanDate: '2024-06-29',
  nextAppointment: '2024-07-05',
  doctorComments: 4,
};

const mockMRIScans = [
  {
    id: '1',
    scanCode: 'MRI20240629',
    title: 'Brain MRI - Follow-up',
    scanType: 'T1',
    scanDate: '2024-06-29',
    status: 'completed',
    doctor: 'Dr. Robert Smith',
    findings:
      'No significant changes from previous scan. Follow-up recommended in 6 months.',
    priority: 'normal',
    hasComments: true,
  },
  {
    id: '2',
    scanCode: 'MRI20240615',
    title: 'Brain MRI - Routine Check',
    scanType: 'FLAIR',
    scanDate: '2024-06-15',
    status: 'completed',
    doctor: 'Dr. Robert Smith',
    findings: 'Stable findings. Continue current treatment plan.',
    priority: 'normal',
    hasComments: true,
  },
  {
    id: '3',
    scanCode: 'MRI20240601',
    title: 'Brain MRI - Initial Assessment',
    scanType: 'T2',
    scanDate: '2024-06-01',
    status: 'reviewed',
    doctor: 'Dr. Robert Smith',
    findings: 'Initial baseline scan shows normal brain structure.',
    priority: 'normal',
    hasComments: false,
  },
  {
    id: '4',
    scanCode: 'MRI20240528',
    title: 'Brain MRI - Urgent',
    scanType: 'DTI',
    scanDate: '2024-05-28',
    status: 'pending',
    doctor: 'Dr. Robert Smith',
    findings: null,
    priority: 'high',
    hasComments: false,
  },
];

const mockComments = [
  {
    id: '1',
    scanId: '1',
    author: 'Dr. Robert Smith',
    role: 'Neurologist',
    content:
      'The follow-up scan shows excellent progress. The previous abnormalities have significantly reduced. Please continue with the current medication regimen.',
    type: 'finding',
    timestamp: '2024-06-29 15:30',
    isPrivate: false,
  },
  {
    id: '2',
    scanId: '1',
    author: 'Dr. Robert Smith',
    role: 'Neurologist',
    content:
      'Schedule next follow-up in 6 months. Patient should continue current lifestyle modifications.',
    type: 'recommendation',
    timestamp: '2024-06-29 15:35',
    isPrivate: false,
  },
  {
    id: '3',
    scanId: '2',
    author: 'Dr. Robert Smith',
    role: 'Neurologist',
    content:
      'Stable findings compared to previous scans. Treatment is working effectively.',
    type: 'note',
    timestamp: '2024-06-15 11:20',
    isPrivate: false,
  },
];

const mockAppointments = [
  {
    id: '1',
    date: '2024-07-05',
    time: '10:00 AM',
    doctor: 'Dr. Robert Smith',
    type: 'Follow-up Consultation',
    status: 'scheduled',
    notes: 'Review recent MRI results and discuss treatment plan',
  },
  {
    id: '2',
    date: '2024-07-20',
    time: '02:00 PM',
    doctor: 'Dr. Emily Chen',
    type: 'Routine Check-up',
    status: 'scheduled',
    notes: 'General health assessment and medication review',
  },
  {
    id: '3',
    date: '2024-06-29',
    time: '09:00 AM',
    doctor: 'Lab Technician',
    type: 'MRI Scan',
    status: 'completed',
    notes: 'Brain MRI scan completed successfully',
  },
];

const PatientDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCommentTypeIcon = (type: string) => {
    switch (type) {
      case 'finding':
        return <Brain className="h-4 w-4 text-blue-600" />;
      case 'recommendation':
        return <Heart className="h-4 w-4 text-green-600" />;
      case 'note':
        return <FileText className="h-4 w-4 text-purple-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAppointmentStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <User className="h-8 w-8 text-blue-600" />
            Patient Portal
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {mockPatientInfo.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Patient Info Card */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback className="text-lg">
                {mockPatientInfo.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
                    {mockPatientInfo.name}
                  </h2>
                  <p className="text-blue-700 dark:text-blue-300">
                    Patient ID: {mockPatientInfo.id}
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  Active Patient
                </Badge>
              </div>
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                  <Stethoscope className="h-4 w-4" />
                  <span className="text-sm">
                    Assigned Doctor: {mockPatientInfo.assignedDoctor}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    Next Appointment: {mockPatientInfo.nextAppointment}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{mockPatientInfo.email}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <Brain className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {mockPatientStats.totalScans}
            </div>
            <p className="text-xs text-muted-foreground">
              All time medical scans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {mockPatientStats.completedScans}
            </div>
            <p className="text-xs text-muted-foreground">
              Scans reviewed by doctor
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Reviews
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {mockPatientStats.pendingReviews}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting doctor review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Doctor Comments
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {mockPatientStats.doctorComments}
            </div>
            <p className="text-xs text-muted-foreground">
              Medical comments received
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="scans" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scans">My MRI Scans</TabsTrigger>
          <TabsTrigger value="comments">Doctor Comments</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="profile">Health Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="scans" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    My MRI Scans
                  </CardTitle>
                  <CardDescription>
                    View your medical imaging history and results
                  </CardDescription>
                </div>
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
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Scan Details</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockMRIScans.map((scan) => (
                    <TableRow key={scan.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{scan.title}</div>
                          <div className="text-sm text-gray-500">
                            {scan.scanCode}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{scan.scanType}</Badge>
                      </TableCell>
                      <TableCell>{scan.scanDate}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(scan.status)}>
                          {scan.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{scan.doctor}</TableCell>
                      <TableCell>
                        <Badge className={getPriorityBadgeColor(scan.priority)}>
                          {scan.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {scan.hasComments && (
                            <Button variant="ghost" size="sm">
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Scan Results Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Latest Scan Results
              </CardTitle>
              <CardDescription>
                Summary of your most recent MRI scan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-green-900">Good News!</h3>
                    <p className="text-sm text-green-800 mt-1">
                      Your latest brain MRI scan shows excellent progress. The
                      previous abnormalities have significantly reduced,
                      indicating that your treatment is working effectively.
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Doctor's Findings</h4>
                    <p className="text-sm text-gray-600">
                      No significant changes from previous scan. Follow-up
                      recommended in 6 months.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Recommendations</h4>
                    <p className="text-sm text-gray-600">
                      Continue current medication regimen and lifestyle
                      modifications.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Doctor Comments & Medical Notes
              </CardTitle>
              <CardDescription>
                View comments and feedback from your medical team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {comment.author
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {comment.author}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {comment.role}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">
                            {comment.timestamp}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getCommentTypeIcon(comment.type)}
                        <Badge variant="outline" className="capitalize">
                          {comment.type}
                        </Badge>
                      </div>
                    </div>

                    <div className="pl-11">
                      <p className="text-sm leading-relaxed">
                        {comment.content}
                      </p>
                    </div>

                    <div className="pl-11 flex items-center gap-2 text-xs text-gray-500">
                      <span>
                        Related to scan:{' '}
                        {
                          mockMRIScans.find((s) => s.id === comment.scanId)
                            ?.scanCode
                        }
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                My Appointments
              </CardTitle>
              <CardDescription>
                Upcoming and past medical appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          appointment.status === 'scheduled'
                            ? 'bg-blue-100'
                            : appointment.status === 'completed'
                              ? 'bg-green-100'
                              : 'bg-gray-100'
                        }`}
                      >
                        <Calendar
                          className={`h-5 w-5 ${
                            appointment.status === 'scheduled'
                              ? 'text-blue-600'
                              : appointment.status === 'completed'
                                ? 'text-green-600'
                                : 'text-gray-600'
                          }`}
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">{appointment.type}</h3>
                        <p className="text-sm text-gray-600">
                          {appointment.doctor}
                        </p>
                        <p className="text-sm text-gray-500">
                          {appointment.notes}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{appointment.date}</div>
                      <div className="text-sm text-gray-600">
                        {appointment.time}
                      </div>
                      <Badge
                        className={getAppointmentStatusColor(
                          appointment.status,
                        )}
                      >
                        {appointment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions for Appointments */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-blue-900">
                    Need to schedule an appointment?
                  </h3>
                  <p className="text-sm text-blue-800 mt-1">
                    Contact your doctor's office or use our online scheduling
                    system
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="bg-white">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Office
                  </Button>
                  <Button variant="outline" className="bg-white">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Online
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Your personal and contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Full Name</p>
                      <p className="text-sm text-gray-600">
                        {mockPatientInfo.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Date of Birth</p>
                      <p className="text-sm text-gray-600">
                        {mockPatientInfo.dateOfBirth}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Activity className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Gender</p>
                      <p className="text-sm text-gray-600">
                        {mockPatientInfo.gender}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-gray-600">
                        {mockPatientInfo.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-gray-600">
                        {mockPatientInfo.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-gray-600">
                        {mockPatientInfo.address}
                      </p>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Update Information
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Medical Information
                </CardTitle>
                <CardDescription>
                  Your medical history and health details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    Allergies
                  </h4>
                  <div className="space-y-2">
                    {mockPatientInfo.allergies.map((allergy) => (
                      <Badge
                        key={allergy}
                        variant="outline"
                        className="mr-2 text-red-600 border-red-200"
                      >
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    Medical History
                  </h4>
                  <div className="space-y-2">
                    {mockPatientInfo.medicalHistory.map((condition) => (
                      <Badge
                        key={condition}
                        variant="outline"
                        className="mr-2 text-blue-600 border-blue-200"
                      >
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-green-500" />
                    Emergency Contact
                  </h4>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="font-medium text-green-900">
                      {mockPatientInfo.emergencyContact.name}
                    </p>
                    <p className="text-sm text-green-800">
                      {mockPatientInfo.emergencyContact.relationship}
                    </p>
                    <p className="text-sm text-green-700">
                      {mockPatientInfo.emergencyContact.phone}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Health Tips */}
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-900">
                <BookOpen className="h-5 w-5" />
                Health Tips & Education
              </CardTitle>
              <CardDescription className="text-purple-700">
                Important information about your health and treatment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-blue-600" />
                    <h4 className="font-medium">About Your Condition</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Learn more about your diagnosis and how to manage your
                    symptoms effectively.
                  </p>
                </div>

                <div className="p-4 bg-white border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-yellow-600" />
                    <h4 className="font-medium">Treatment Guidelines</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Important information about your medication and lifestyle
                    recommendations.
                  </p>
                </div>

                <div className="p-4 bg-white border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <h4 className="font-medium">Prevention Tips</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Lifestyle changes and preventive measures to improve your
                    health outcomes.
                  </p>
                </div>

                <div className="p-4 bg-white border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="h-4 w-4 text-red-600" />
                    <h4 className="font-medium">Emergency Information</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    When to seek immediate medical attention and emergency
                    contact numbers.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Support Information */}
      {/* <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <div className="mt-0.5">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            </div>
            <div>
              <p className="font-medium text-green-900 dark:text-green-100">
                Need Help or Have Questions?
              </p>
              <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                Our patient support team is here to help you understand your
                results, schedule appointments, and answer any questions about
                your care. You can also access educational resources and connect
                with support groups.
              </p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" className="bg-white">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
                <Button size="sm" variant="outline" className="bg-white">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Ask Question
                </Button>
                <Button size="sm" variant="outline" className="bg-white">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Health Resources
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
};

export default PatientDashboard;
