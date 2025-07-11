'use client';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Eye,
  Folder,
  HardDrive,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  User,
  UserCheck,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AlertModal } from '@/components/modal/alert-modal';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { useGetUserByRole } from '@/hooks/queries/use-auth-queries';
import {
  type MriScan,
  useDeleteMriScan,
  useGetAllMriScans,
  useGetMriStatistics,
  usePollingMriScan,
  useProcessMRI,
} from '@/hooks/queries/use-mri-queries';

// Types
interface UserData {
  id: number;
  name: string;
  email: string;
}

interface UploadForm {
  patientId: string;
  doctorId: string;
  file: File | null;
}

const MriDashboard = () => {
  const router = useRouter();

  // API hooks
  const { data: users = [] } = useGetUserByRole('patient') as {
    data: UserData[];
  };
  const { data: doctors = [] } = useGetUserByRole('doctor') as {
    data: UserData[];
  };
  const {
    data: mriScans = [],
    isLoading: scansLoading,
    error: scansError,
    refetch,
  } = useGetAllMriScans();
  const { data: statistics } = useGetMriStatistics();
  const processMriMutation = useProcessMRI();
  const deleteMriMutation = useDeleteMriScan();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mriToDelete, setMriToDelete] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [uploadForm, setUploadForm] = useState<UploadForm>({
    patientId: '',
    doctorId: '',
    file: null,
  });

  // Find processing scans for polling
  const processingScanIds = mriScans
    .filter((scan) => scan.status === 'processing')
    .map((scan) => scan.id);

  // Reset upload form
  const resetUploadForm = () => {
    setUploadForm({
      patientId: '',
      doctorId: '',
      file: null,
    });
    setSelectedFile(null);
  };

  // Validate file type
  const validateFileType = (file: File): boolean => {
    const allowedTypes = ['.dcm', '.nii.gz', '.nii', '.dicom', 'gz'];
    const fileName = file.name.toLowerCase();
    return allowedTypes.some((type) => fileName.endsWith(type));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!validateFileType(file)) {
        alert('Please select a valid MRI file (.dcm, .nii.gz, .nii, .dicom)');
        e.target.value = '';
        return;
      }

      // Check file size (100MB limit)
      if (file.size > 100 * 1024 * 1024) {
        alert('File size must be less than 100MB');
        e.target.value = '';
        return;
      }

      setSelectedFile(file);
      setUploadForm((prev) => ({ ...prev, file }));
    }
  };

  const handleView = () => {
    router.push('/viewer');
  };

  const handleDeleteClick = (scanId: number) => {
    setMriToDelete(scanId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (mriToDelete) {
      try {
        await deleteMriMutation.mutateAsync(mriToDelete);
        setMriToDelete(null);
        setShowDeleteModal(false);
      } catch (error) {
        console.error('Error deleting MRI:', error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setMriToDelete(null);
    setShowDeleteModal(false);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadForm.file || !uploadForm.patientId || !uploadForm.doctorId) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await processMriMutation.mutateAsync({
        patientId: parseInt(uploadForm.patientId),
        doctorId: parseInt(uploadForm.doctorId),
        mriFile: uploadForm.file,
      });

      setShowUploadDialog(false);
      resetUploadForm();
    } catch (error) {
      console.error('Error uploading MRI:', error);
    }
  };

  const handleDownloadReport = (scan: MriScan) => {
    if (scan.resultsJson?.output_files?.report_png) {
      // Create download link for report
      const link = document.createElement('a');
      link.href = `/api/v1/mri/${scan.id}/download/report`;
      link.download = `mri-report-${scan.id}.png`;
      link.click();
    }
  };

  const handleDownloadSegmentation = (scan: MriScan) => {
    if (scan.segmentationPath) {
      const link = document.createElement('a');
      link.href = `/api/v1/mri/${scan.id}/download/segmentation`;
      link.download = `mri-segmentation-${scan.id}.nii.gz`;
      link.click();
    }
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
      processing: {
        icon: Clock,
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        label: 'Processing',
      },
      completed: {
        icon: CheckCircle,
        color: 'bg-green-100 text-green-800 border-green-200',
        label: 'Completed',
      },
      failed: {
        icon: AlertCircle,
        color: 'bg-red-100 text-red-800 border-red-200',
        label: 'Failed',
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.processing;
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={`${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  // Volume display component
  const VolumeDisplay = ({ volumes }: { volumes: any }) => {
    if (!volumes) return <span className="text-gray-400">-</span>;

    return (
      <div className="text-sm">
        <div className="font-medium">Total: {volumes.total}</div>
        <div className="text-xs text-gray-500">
          Anterior: {volumes.anterior} | Posterior: {volumes.posterior}
        </div>
      </div>
    );
  };

  // Actions dropdown component
  const ActionsDropdown = ({ scan }: { scan: MriScan }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <Eye className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleView()}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        {scan.status === 'completed' &&
          scan.resultsJson?.output_files?.report_png && (
            <DropdownMenuItem onClick={() => handleDownloadReport(scan)}>
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </DropdownMenuItem>
          )}
        {scan.status === 'completed' && scan.segmentationPath && (
          <DropdownMenuItem onClick={() => handleDownloadSegmentation(scan)}>
            <Download className="mr-2 h-4 w-4" />
            Download Segmentation
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleDeleteClick(scan.id)}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Filter scans based on search and status
  const filteredMriData = mriScans.filter((scan) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      scan.id.toString().includes(searchLower) ||
      scan.patient?.name.toLowerCase().includes(searchLower) ||
      scan.doctor?.name.toLowerCase().includes(searchLower);

    const matchesStatus =
      statusFilter === 'all' || scan.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Error state
  if (scansError) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-semibold text-red-700 mb-2">
                Error Loading MRI Data
              </h3>
              <p className="text-red-600 mb-4">
                Failed to load MRI scans. Please try again.
              </p>
              <Button onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <HardDrive className="h-8 w-8 text-blue-600" />
            MRI Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage MRI files and hippocampus segmentation processing
          </p>
        </div>
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Upload className="h-4 w-4 mr-2" />
              Upload MRI
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Upload New MRI</DialogTitle>
              <DialogDescription>
                Upload MRI file for hippocampus segmentation processing
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mri-file">
                  MRI File <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="mri-file"
                  type="file"
                  onChange={handleFileChange}
                  accept=".dcm,.dicom,.nii,.nii.gz"
                  required
                />
                <p className="text-xs text-gray-500">
                  Supported formats: .dcm, .nii.gz, .nii, .dicom (Max: 100MB)
                </p>
                {selectedFile && (
                  <div className="text-sm text-green-600 mt-1 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Selected: {selectedFile.name} (
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient-select">
                  Patient <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={uploadForm.patientId}
                  onValueChange={(value) =>
                    setUploadForm((prev) => ({ ...prev, patientId: value }))
                  }
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name} (ID: {user.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor-select">
                  Doctor <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={uploadForm.doctorId}
                  onValueChange={(value) =>
                    setUploadForm((prev) => ({ ...prev, doctorId: value }))
                  }
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id.toString()}>
                        {doctor.name} (ID: {doctor.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowUploadDialog(false);
                    resetUploadForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    processMriMutation.isPending ||
                    !uploadForm.file ||
                    !uploadForm.patientId ||
                    !uploadForm.doctorId
                  }
                >
                  {processMriMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Upload MRI'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total MRI</CardTitle>
            <Folder className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {statistics?.totalScans || mriScans.length}
            </div>
            <p className="text-xs text-muted-foreground">MRI files processed</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statistics?.completedScans ||
                mriScans.filter((s) => s.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully processed
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {statistics?.processingScans ||
                mriScans.filter((s) => s.status === 'processing').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently processing
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {statistics?.failedScans ||
                mriScans.filter((s) => s.status === 'failed').length}
            </div>
            <p className="text-xs text-muted-foreground">Processing failed</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Folder className="h-5 w-5" />
                MRI Files
              </CardTitle>
              <CardDescription>
                Manage all MRI files and hippocampus segmentation results
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={scansLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${scansLoading ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
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
                  placeholder="Search by ID, patient, or doctor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-80"
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
                  <TableHead>ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Volumes</TableHead>
                  <TableHead>Processing Time</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMriData.map((scan) => (
                  <TableRow key={scan.id}>
                    <TableCell className="font-mono text-sm">
                      #{scan.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-medium">
                            {scan.patient?.name || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {scan.patientId}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-green-600" />
                        <div>
                          <div className="font-medium">
                            {scan.doctor?.name || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {scan.doctorId}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={scan.status} />
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
                        {scan.processingStarted && scan.processingCompleted ? (
                          <div>
                            <div className="text-green-600">
                              {Math.round(
                                (new Date(scan.processingCompleted).getTime() -
                                  new Date(scan.processingStarted).getTime()) /
                                  1000,
                              )}
                              s
                            </div>
                            <div className="text-xs text-gray-500">
                              completed
                            </div>
                          </div>
                        ) : scan.processingStarted ? (
                          <div>
                            <div className="text-yellow-600">
                              {Math.round(
                                (Date.now() -
                                  new Date(scan.processingStarted).getTime()) /
                                  1000,
                              )}
                              s
                            </div>
                            <div className="text-xs text-gray-500">running</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="text-sm">
                            {new Date(scan.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(scan.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <ActionsDropdown scan={scan} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {scansLoading && (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-blue-600" />
                <p className="text-gray-500">Loading MRI scans...</p>
              </div>
            )}
            {!scansLoading && filteredMriData.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No MRI files found</p>
                {searchTerm || statusFilter !== 'all' ? (
                  <p className="text-sm">Try adjusting your filters</p>
                ) : null}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Modal */}
      <AlertModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        loading={deleteMriMutation.isPending}
      />

      {/* Global Loading Overlay for mutations */}
      {(processMriMutation.isPending || deleteMriMutation.isPending) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg flex items-center gap-3 min-w-[200px]">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
            <div>
              <div className="font-medium">
                {processMriMutation.isPending
                  ? 'Processing MRI...'
                  : 'Deleting scan...'}
              </div>
              <div className="text-sm text-gray-500">
                {processMriMutation.isPending
                  ? 'This may take several minutes'
                  : 'Removing files and data'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Processing Status Indicators */}
      {processingScanIds.length > 0 && (
        <div className="fixed bottom-4 right-4 space-y-2">
          {processingScanIds.slice(0, 3).map((scanId) => (
            <ProcessingIndicator key={scanId} scanId={scanId} />
          ))}
          {processingScanIds.length > 3 && (
            <Card className="p-3 bg-yellow-50 border-yellow-200">
              <div className="text-sm text-yellow-800">
                +{processingScanIds.length - 3} more processing...
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

// Processing indicator component for real-time updates
const ProcessingIndicator = ({ scanId }: { scanId: number }) => {
  const { data: scan, isLoading } = usePollingMriScan(scanId, true);

  if (isLoading || !scan || scan.status !== 'processing') return null;

  const processingTime = scan.processingStarted
    ? Math.round(
        (Date.now() - new Date(scan.processingStarted).getTime()) / 1000,
      )
    : 0;

  return (
    <Card className="p-3 bg-blue-50 border-blue-200 min-w-[200px]">
      <div className="flex items-center gap-2">
        <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
        <div className="flex-1">
          <div className="text-sm font-medium text-blue-800">MRI #{scanId}</div>
          <div className="text-xs text-blue-600">
            Processing for {processingTime}s
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MriDashboard;
