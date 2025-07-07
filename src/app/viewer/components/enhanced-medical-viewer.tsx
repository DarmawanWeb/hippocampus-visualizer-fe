// app/dashboard/viewer/components/enhanced-medical-viewer.tsx - FINAL FIXED VERSION
'use client';

import {
  AlertCircle,
  ArrowLeft,
  Brain,
  Download,
  Hand,
  Info,
  Layers,
  Loader2,
  Maximize,
  MessageSquare,
  Play,
  Plus,
  RotateCcw,
  Share,
  Shield,
  Upload,
  ZoomIn,
} from 'lucide-react';
import type React from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { UserNav } from '@/components/layout/user-nav';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RoleBadge } from '@/components/ui/role-badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { CommentsPanel } from '@/components/viewer/comment-system/comments-panel';
import { useRBAC } from '@/hooks/use-rbac';
import { useAuth } from '@/hooks/useAuth';
import type { Comment } from '@/types/auth';
import NiiVueViewer from './niivue-viewer';

// Define proper types
type CommentType = 'finding' | 'recommendation' | 'note' | 'question';

// Types
interface SampleImage {
  id: string;
  title: string;
  description: string;
  url: string;
  overlayUrl?: string;
  type: string;
  requiresPermission?: boolean;
  allowedRoles?: string[];
}

// Static data
const mockScanData = {
  id: 'MRI20240629001',
  patientName: 'Sarah Johnson',
  patientCode: 'P000123',
  scanType: 'T1',
  scanDate: '2024-06-29',
  bodyPart: 'Brain',
  title: 'Brain MRI - Follow-up Study',
  patientId: 'P000123',
};

const initialComments: Comment[] = [
  {
    id: '1',
    author: 'Dr. Robert Smith',
    authorId: 'doc001',
    role: 'doctor',
    content:
      'Notable hyperintensity in the left temporal region. Consistent with demyelination. Patient should continue current treatment protocol.',
    type: 'finding',
    position: { x: 128, y: 156, z: 78, slice: 45, view: 'axial' },
    timestamp: '2024-06-29 14:30',
    isPrivate: false,
    scanId: 'MRI20240629001',
    patientId: 'P000123',
  },
  {
    id: '2',
    author: 'Dr. Emily Chen',
    authorId: 'doc002',
    role: 'doctor',
    content: 'Recommend follow-up scan in 3 months to monitor progression.',
    type: 'recommendation',
    position: { x: 150, y: 200, z: 80, slice: 47, view: 'axial' },
    timestamp: '2024-06-29 15:15',
    isPrivate: true,
    scanId: 'MRI20240629001',
    patientId: 'P000123',
  },
];

const sampleImages: SampleImage[] = [
  {
    id: 'mni152',
    title: 'MNI152 Brain Template',
    description: 'Standard brain template for neuroimaging',
    url: 'https://niivue.github.io/niivue/images/mni152.nii.gz',
    type: 'Anatomical',
    requiresPermission: false,
  },
  {
    id: 'hippocampus-overlay',
    title: 'Hippocampus with Segmentation',
    description: 'Original hippocampus with segmentation overlay',
    url: '/hippo-ori.nii.gz',
    overlayUrl: '/hippo-segmentasi.nii.gz',
    type: 'Overlay Sample',
    requiresPermission: false,
  },
  {
    id: 'patient-scan',
    title: 'Patient MRI Scan',
    description: 'Real patient data - requires medical access',
    url: '/sample1-ori.nii.gz',
    overlayUrl: '/sample2.nii.gz',
    type: 'Patient Data',
    requiresPermission: true,
    allowedRoles: ['admin', 'doctor'],
  },
];

const EnhancedMedicalViewer: React.FC = () => {
  // Auth context with RBAC
  const { user, isLoading } = useAuth();
  const { permissions } = useRBAC();

  // Helper function to render role badge safely
  const renderRoleBadge = (role: string, className?: string) => {
    const validRoles = ['admin', 'doctor', 'staff', 'patient'];
    if (validRoles.includes(role)) {
      return <RoleBadge role={role as 'admin' | 'doctor' | 'staff' | 'patient'} className={className} />;
    }
    return (
      <Badge variant="outline" className={`text-gray-600 border-gray-600 ${className || ''}`}>
        {role}
      </Badge>
    );
  };

  // Core viewer state
  const [showViewer, setShowViewer] = useState(false);
  const [isViewerLoading, setIsViewerLoading] = useState(false);
  const [error, setError] = useState('');
  const [isViewerReady, setIsViewerReady] = useState(false);

  // Image state
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [overlayUrl, setOverlayUrl] = useState('');
  const [overlayFile, setOverlayFile] = useState<File | null>(null);
  const [inputUrl, setInputUrl] = useState('');
  const [inputOverlayUrl, setInputOverlayUrl] = useState('');
  const [currentSample, setCurrentSample] = useState('');

  // UI state
  const [showComments, setShowComments] = useState(true);
  const [showOverlay, setShowOverlay] = useState(true);
  const [overlayOpacity, setOverlayOpacity] = useState([0.7]);
  const [brightness, setBrightness] = useState([50]);
  const [contrast, setContrast] = useState([50]);

  // Comment system state
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Tools state
  const [activeTool, setActiveTool] = useState<
    'pan' | 'zoom' | 'comment' | null
  >(null);
  const [colormap, setColormap] = useState('gray');

  // File refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const overlayFileInputRef = useRef<HTMLInputElement>(null);

  // Check if user can access sample
  const canAccessSample = useCallback(
    (sample: SampleImage) => {
      if (!sample.requiresPermission) return true;
      if (!sample.allowedRoles) return true;
      return user ? sample.allowedRoles.includes(user.role) : false;
    },
    [user],
  );

  // Filtered samples based on permissions
  const availableSamples = useMemo(() => {
    return sampleImages.filter(canAccessSample);
  }, [canAccessSample]);

  // Memoized calculations
  const hasOverlay = useMemo(
    () => Boolean(overlayUrl || overlayFile),
    [overlayUrl, overlayFile],
  );

  // Event handlers
  const handleLoadImage = useCallback(() => {
    if (!inputUrl.trim()) return;

    setImageUrl(inputUrl);
    setImageFile(null);

    if (inputOverlayUrl.trim()) {
      setOverlayUrl(inputOverlayUrl);
      setOverlayFile(null);
    } else {
      setOverlayUrl('');
      setOverlayFile(null);
    }

    setCurrentSample('url-input');
    setShowViewer(true);
    setError('');
  }, [inputUrl, inputOverlayUrl]);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setImageFile(file);
      setImageUrl('');
      setCurrentSample('file-upload');
      setShowViewer(true);
      setError('');

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [],
  );

  const handleOverlayUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setOverlayFile(file);
      setOverlayUrl('');

      if (overlayFileInputRef.current) {
        overlayFileInputRef.current.value = '';
      }
    },
    [],
  );

  const loadSampleImage = useCallback(
    (sample: SampleImage) => {
      if (!canAccessSample(sample)) {
        setError("You don't have permission to access this sample");
        return;
      }

      setImageUrl(sample.url);
      setImageFile(null);
      setInputUrl(sample.url);

      if (sample.overlayUrl) {
        setOverlayUrl(sample.overlayUrl);
        setOverlayFile(null);
        setInputOverlayUrl(sample.overlayUrl);
      } else {
        setOverlayUrl('');
        setOverlayFile(null);
        setInputOverlayUrl('');
      }

      setCurrentSample(sample.id);
      setShowViewer(true);
      setError('');
    },
    [canAccessSample],
  );

  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (activeTool === 'comment' || isAddingComment) {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        setSelectedPosition({ x, y });
        setIsAddingComment(true);
      }
    },
    [activeTool, isAddingComment],
  );

  const handleAddComment = useCallback(
    (
      content: string,
      type: string,
      isPrivate: boolean,
      position?: { x: number; y: number },
    ) => {
      if (!user) return;

      const comment: Comment = {
        id: Date.now().toString(),
        author: user.name,
        authorId: String(user.id), // FIXED: Convert to string
        role: user.role,
        content,
        type: type as CommentType, // FIXED: Proper type casting
        position: position
          ? {
              x: position.x,
              y: position.y,
              z: 45,
              slice: 45,
              view: 'axial',
            }
          : undefined,
        timestamp: new Date().toLocaleString(),
        isPrivate,
        scanId: mockScanData.id,
        patientId: mockScanData.patientId,
      };

      setComments((prev) => [...prev, comment]);
      setIsAddingComment(false);
      setSelectedPosition(null);
      setActiveTool(null);
    },
    [user],
  );

  const handleEditComment = useCallback(
    (commentId: string, content: string) => {
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId ? { ...comment, content } : comment,
        ),
      );
    },
    [],
  );

  const handleDeleteComment = useCallback((commentId: string) => {
    setComments((prev) => prev.filter((comment) => comment.id !== commentId));
  }, []);

  const resetView = useCallback(() => {
    setBrightness([50]);
    setContrast([50]);
    setColormap('gray');
    setOverlayOpacity([0.7]);
    setActiveTool(null);
  }, []);

  const handleBack = useCallback(() => {
    setShowViewer(false);
    setImageUrl('');
    setImageFile(null);
    setOverlayUrl('');
    setOverlayFile(null);
    setCurrentSample('');
    setError('');
    setIsViewerLoading(false);
    setIsViewerReady(false);
    setActiveTool(null);
    setIsAddingComment(false);
    setSelectedPosition(null);
  }, []);

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setIsViewerReady(false);
  }, []);

  const handleLoading = useCallback((loading: boolean) => {
    setIsViewerLoading(loading);
    if (!loading) {
      setIsViewerReady(true);
    }
  }, []);

  const handleToolSelect = useCallback(
    (tool: 'pan' | 'zoom' | 'comment') => {
      if (tool === 'comment' && !permissions.canAddComments) {
        setError("You don't have permission to add comments");
        return;
      }

      setActiveTool((prev) => (prev === tool ? null : tool));
      if (tool === 'comment') {
        setIsAddingComment(true);
      } else {
        setIsAddingComment(false);
        setSelectedPosition(null);
      }
    },
    [permissions.canAddComments],
  );

  const handleCancelAddComment = useCallback(() => {
    setIsAddingComment(false);
    setSelectedPosition(null);
    setActiveTool(null);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading user session...</p>
        </div>
      </div>
    );
  }

  // Gallery view
  if (!showViewer) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold">Enhanced Medical Viewer</h1>
                <p className="text-muted-foreground">
                  Advanced medical imaging viewer with role-based access control
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Welcome,
                  </span>
                  <span className="font-medium">{user.name}</span>
                  <RoleBadge role={user.role} />
                </div>
              )}
              <UserNav />
            </div>
          </div>

          {/* User Permission Info */}
          <Alert className="mb-6">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>
                  You are logged in as <strong>{user?.role}</strong>.
                  {permissions.canAddComments
                    ? ' You can add and edit comments in the viewer.'
                    : ' You have read-only access to comments.'}
                </span>
                <div className="flex gap-2 text-xs">
                  {permissions.canAddComments && (
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-600"
                    >
                      Can Comment
                    </Badge>
                  )}
                  {permissions.canViewPrivateComments && (
                    <Badge
                      variant="outline"
                      className="text-blue-600 border-blue-600"
                    >
                      Private Access
                    </Badge>
                  )}
                  {permissions.canAccessAllPatients && (
                    <Badge
                      variant="outline"
                      className="text-purple-600 border-purple-600"
                    >
                      All Patients
                    </Badge>
                  )}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* URL Input Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Load from URL
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="base-image-url" className="text-sm font-medium">Base Image URL</label>
                <Input
                  id="base-image-url"
                  type="url"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://example.com/brain.nii.gz"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="overlay-url" className="text-sm font-medium flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Overlay URL (Optional)
                </label>
                <Input
                  id="overlay-url"
                  type="url"
                  value={inputOverlayUrl}
                  onChange={(e) => setInputOverlayUrl(e.target.value)}
                  placeholder="https://example.com/segmentation.nii.gz"
                />
              </div>

              <Button
                onClick={handleLoadImage}
                disabled={!inputUrl.trim()}
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                Load {inputOverlayUrl.trim() ? 'with Overlay' : 'Image'}
              </Button>
            </CardContent>
          </Card>

          {/* File Upload Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Files
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".nii,.nii.gz"
                onChange={handleFileUpload}
                className="hidden"
              />

              <input
                ref={overlayFileInputRef}
                type="file"
                accept=".nii,.nii.gz"
                onChange={handleOverlayUpload}
                className="hidden"
              />

              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Select Base Image
                  {imageFile && <span className="ml-2 text-green-600">✓</span>}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => overlayFileInputRef.current?.click()}
                  className="w-full"
                >
                  <Layers className="h-4 w-4 mr-2" />
                  Select Overlay (Optional)
                  {overlayFile && (
                    <span className="ml-2 text-green-600">✓</span>
                  )}
                </Button>
              </div>

              {imageFile && (
                <div className="text-xs text-muted-foreground">
                  <p>
                    <strong>Base:</strong> {imageFile.name}
                  </p>
                  {overlayFile && (
                    <p>
                      <strong>Overlay:</strong> {overlayFile.name}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sample Gallery */}
        <Card>
          <CardHeader>
            <CardTitle>Sample Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {availableSamples.map((sample) => (
                <div
                  key={sample.id}
                  className="group p-4 border rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                  onClick={() => loadSampleImage(sample)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      loadSampleImage(sample);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Load ${sample.title}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{sample.title}</h3>
                    <div className="flex gap-1">
                      <Badge variant="outline">{sample.type}</Badge>
                      {sample.overlayUrl && (
                        <Badge
                          variant="outline"
                          className="text-green-600 border-green-600"
                        >
                          Overlay
                        </Badge>
                      )}
                      {sample.requiresPermission && (
                        <Badge
                          variant="outline"
                          className="text-red-600 border-red-600"
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          Protected
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {sample.description}
                  </p>
                  <Button size="sm" variant="ghost" className="w-full">
                    <Play className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
              ))}
            </div>

            {/* Show blocked samples for transparency */}
            {sampleImages.length > availableSamples.length && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium text-muted-foreground mb-3">
                  Restricted Access (
                  {sampleImages.length - availableSamples.length} items)
                </h4>
                <div className="grid gap-3 md:grid-cols-2">
                  {sampleImages
                    .filter((sample) => !canAccessSample(sample))
                    .map((sample) => (
                      <div
                        key={sample.id}
                        className="p-3 border border-red-200 bg-red-50 rounded-lg opacity-75"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-red-800">
                            {sample.title}
                          </h4>
                          <Badge
                            variant="outline"
                            className="text-red-600 border-red-600"
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            Restricted
                          </Badge>
                        </div>
                        <p className="text-sm text-red-700">
                          Requires {sample.allowedRoles?.join(' or ')} access
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Viewer mode
  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="text-white hover:bg-gray-700"
            onClick={handleBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Gallery
          </Button>
          <div className="text-white">
            <h1 className="text-lg font-semibold">{mockScanData.title}</h1>
            <p className="text-sm text-gray-300">
              {mockScanData.patientName} • {mockScanData.scanType} •{' '}
              {mockScanData.scanDate}
            </p>
          </div>
          {hasOverlay && (
            <Badge
              variant="outline"
              className="text-green-400 border-green-400"
            >
              <Layers className="h-3 w-3 mr-1" />
              Overlay Active
            </Badge>
          )}
          <RoleBadge
            role={user?.role || 'patient'}
            className="text-white border-white"
          />
        </div>

        <div className="flex items-center gap-2">
          {isViewerLoading && (
            <div className="flex items-center gap-2 text-white">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          )}
          <Button variant="ghost" className="text-white hover:bg-gray-700">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" className="text-white hover:bg-gray-700">
            <Share className="h-4 w-4" />
          </Button>
          <UserNav />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-600 text-white p-4 text-center border-b border-red-500 shrink-0">
          <div className="flex items-center justify-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setError('')}
              className="text-white hover:bg-red-700"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        {/* Left Sidebar - Image Controls & Tools */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
          <div className="space-y-6">
            {/* User Info */}
            <Card className="bg-gray-700 border-gray-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Access Level
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white text-xs">Add Comments</span>
                  <Badge
                    variant="outline"
                    className={
                      permissions.canAddComments
                        ? 'text-green-400 border-green-400'
                        : 'text-red-400 border-red-400'
                    }
                  >
                    {permissions.canAddComments ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white text-xs">Private Comments</span>
                  <Badge
                    variant="outline"
                    className={
                      permissions.canViewPrivateComments
                        ? 'text-green-400 border-green-400'
                        : 'text-red-400 border-red-400'
                    }
                  >
                    {permissions.canViewPrivateComments ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Image Controls */}
            <Card className="bg-gray-700 border-gray-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm">
                  Image Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label htmlFor="brightness-slider" className="text-white text-xs">Brightness</label>
                    <span className="text-white text-xs">{brightness[0]}%</span>
                  </div>
                  <Slider
                    id="brightness-slider"
                    value={brightness}
                    onValueChange={setBrightness}
                    max={100}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label htmlFor="contrast-slider" className="text-white text-xs">Contrast</label>
                    <span className="text-white text-xs">{contrast[0]}%</span>
                  </div>
                  <Slider
                    id="contrast-slider"
                    value={contrast}
                    onValueChange={setContrast}
                    max={100}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="colormap-select" className="text-white text-xs">Colormap</label>
                  <Select value={colormap} onValueChange={setColormap}>
                    <SelectTrigger id="colormap-select" className="bg-gray-600 border-gray-500 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gray">Grayscale</SelectItem>
                      <SelectItem value="hot">Hot</SelectItem>
                      <SelectItem value="cool">Cool</SelectItem>
                      <SelectItem value="jet">Jet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetView}
                    className="flex-1 bg-gray-600 border-gray-500 text-white hover:bg-gray-500"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Reset
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-gray-600 border-gray-500 text-white hover:bg-gray-500"
                  >
                    <Maximize className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Overlay Controls */}
            {hasOverlay && (
              <Card className="bg-gray-700 border-gray-600">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Overlay Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label htmlFor="overlay-toggle" className="text-white text-xs">Show Overlay</label>
                    <Switch
                      id="overlay-toggle"
                      checked={showOverlay}
                      onCheckedChange={setShowOverlay}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label htmlFor="overlay-opacity" className="text-white text-xs">Opacity</label>
                      <span className="text-white text-xs">
                        {Math.round(overlayOpacity[0] * 100)}%
                      </span>
                    </div>
                    <Slider
                      id="overlay-opacity"
                      value={overlayOpacity}
                      onValueChange={setOverlayOpacity}
                      max={1}
                      min={0}
                      step={0.1}
                      disabled={!showOverlay}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tools */}
            <Card className="bg-gray-700 border-gray-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm">Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleToolSelect('pan')}
                  className={`w-full ${activeTool === 'pan' ? 'bg-blue-600 border-blue-500' : 'bg-gray-600 border-gray-500'} text-white hover:bg-gray-500`}
                >
                  <Hand className="h-3 w-3 mr-2" />
                  Pan {activeTool === 'pan' && '(Active)'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleToolSelect('zoom')}
                  className={`w-full ${activeTool === 'zoom' ? 'bg-blue-600 border-blue-500' : 'bg-gray-600 border-gray-500'} text-white hover:bg-gray-500`}
                >
                  <ZoomIn className="h-3 w-3 mr-2" />
                  Zoom {activeTool === 'zoom' && '(Active)'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleToolSelect('comment')}
                  disabled={!permissions.canAddComments}
                  className={`w-full ${activeTool === 'comment' ? 'bg-blue-600 border-blue-500' : 'bg-gray-600 border-gray-500'} text-white hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Plus className="h-3 w-3 mr-2" />
                  Add Comment {activeTool === 'comment' && '(Active)'}
                </Button>

                {!permissions.canAddComments && (
                  <p className="text-xs text-gray-400 text-center">
                    Comments require doctor/admin access
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Tool Instructions */}
            {activeTool && (
              <Card className="bg-blue-900/30 border-blue-600">
                <CardContent className="pt-4">
                  <div className="text-blue-200 text-xs">
                    {activeTool === 'pan' && (
                      <div>
                        <p className="font-medium mb-1">Pan Tool Active</p>
                        <p>Click and drag to move the image around</p>
                      </div>
                    )}
                    {activeTool === 'zoom' && (
                      <div>
                        <p className="font-medium mb-1">Zoom Tool Active</p>
                        <p>Scroll wheel to zoom in/out, or click to zoom in</p>
                      </div>
                    )}
                    {activeTool === 'comment' && (
                      <div>
                        <p className="font-medium mb-1">Comment Tool Active</p>
                        <p>Click on the image to place a comment marker</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Main Viewer */}
        <div className="flex-1 relative bg-black">
          {/* Canvas Container */}
          <div
            className="w-full h-full relative"
            onClick={handleCanvasClick}
            style={{
              cursor:
                activeTool === 'pan'
                  ? 'grab'
                  : activeTool === 'zoom'
                    ? 'zoom-in'
                    : activeTool === 'comment'
                      ? 'crosshair'
                      : 'default',
            }}
          >
            <NiiVueViewer
              imageUrl={imageUrl}
              imageFile={imageFile}
              overlayUrl={overlayUrl}
              overlayFile={overlayFile}
              onError={handleError}
              onLoading={handleLoading}
              overlayOpacity={overlayOpacity[0]}
              showOverlay={showOverlay}
              brightness={brightness[0]}
              contrast={contrast[0]}
              colormap={colormap}
              activeTool={activeTool}
              className="w-full h-full"
            />
          </div>

          {/* Loading State */}
          {!isViewerReady && (imageUrl || imageFile) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
              <div className="text-center text-white">
                <Brain className="h-12 w-12 animate-pulse mx-auto mb-4" />
                <p className="text-lg">Loading medical viewer...</p>
                <p className="text-sm text-gray-400 mt-2">
                  {hasOverlay
                    ? 'Initializing with overlay support'
                    : 'Initializing NiiVue engine'}
                </p>
              </div>
            </div>
          )}

          {/* Comment Markers */}
          {isViewerReady &&
            comments.map((comment) => {
              // Filter private comments based on permissions - FIXED
              if (
                comment.isPrivate &&
                !permissions.canViewPrivateComments &&
                comment.authorId !== String(user?.id) // FIXED: Convert to string
              ) {
                return null;
              }

              return (
                <Popover key={comment.id}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={`absolute w-4 h-4 border-2 border-white rounded-full shadow-lg hover:scale-110 transition-transform z-10 ${
                        comment.isPrivate
                          ? 'bg-yellow-500 hover:bg-yellow-600'
                          : 'bg-blue-500 hover:bg-blue-600'
                      }`}
                      style={{
                        left: (comment.position?.x || 0) - 8,
                        top: (comment.position?.y || 0) - 8,
                      }}
                    />
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          {comment.type === 'finding' && (
                            <Brain className="h-4 w-4 text-blue-600" />
                          )}
                          {comment.type === 'recommendation' && (
                            <Info className="h-4 w-4 text-green-600" />
                          )}
                          {comment.type === 'note' && (
                            <MessageSquare className="h-4 w-4 text-purple-600" />
                          )}
                          {comment.type === 'question' && (
                            <Info className="h-4 w-4 text-orange-600" />
                          )}
                          <span className="font-medium text-sm">
                            {comment.author}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {renderRoleBadge(comment.role, "text-xs")}
                          <Badge
                            variant="outline"
                            className="text-xs capitalize"
                          >
                            {comment.type}
                          </Badge>
                          {comment.isPrivate && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200"
                            >
                              Private
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                      <p className="text-xs text-gray-500">
                        {comment.timestamp}
                      </p>
                      {comment.position && (
                        <p className="text-xs text-gray-400">
                          {comment.position.view} • Slice{' '}
                          {comment.position.slice} • ({comment.position.x},{' '}
                          {comment.position.y})
                        </p>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              );
            })}

          {/* Selected Position Marker */}
          {selectedPosition &&
            activeTool === 'comment' &&
            permissions.canAddComments && (
              <div
                className="absolute w-4 h-4 bg-yellow-500 border-2 border-white rounded-full shadow-lg animate-pulse z-10"
                style={{
                  left: selectedPosition.x - 8,
                  top: selectedPosition.y - 8,
                }}
              />
            )}

          {/* Viewer Info */}
          <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-2 rounded-lg z-10">
            <div className="text-xs space-y-1">
              <div>
                User: {user?.name} ({user?.role})
              </div>
              <div>Active Tool: {activeTool || 'None'}</div>
              <div>
                Position:{' '}
                {selectedPosition
                  ? `${selectedPosition.x}, ${selectedPosition.y}`
                  : 'N/A'}
              </div>
              {hasOverlay && (
                <div>
                  Overlay:{' '}
                  {showOverlay
                    ? `${Math.round(overlayOpacity[0] * 100)}%`
                    : 'Hidden'}
                </div>
              )}
              <div>
                Comments:{' '}
                {
                  comments.filter(
                    (c) =>
                      !c.isPrivate ||
                      permissions.canViewPrivateComments ||
                      c.authorId === String(user?.id), // FIXED: Convert to string
                  ).length
                }
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Comments */}
        {showComments && (
          <CommentsPanel
            comments={comments}
            onAddComment={handleAddComment}
            onEditComment={handleEditComment}
            onDeleteComment={handleDeleteComment}
            onClose={() => setShowComments(false)}
            isAddingComment={isAddingComment}
            selectedPosition={selectedPosition}
            onCancelAdd={handleCancelAddComment}
          />
        )}

        {/* Toggle Comments Button */}
        {!showComments && (
          <Button
            onClick={() => setShowComments(true)}
            className="absolute top-20 right-4 bg-blue-600 hover:bg-blue-700 z-10"
            size="sm"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Comments (
            {
              comments.filter(
                (c) =>
                  !c.isPrivate ||
                  permissions.canViewPrivateComments ||
                  c.authorId === String(user?.id), // FIXED: Convert to string
              ).length
            }
            )
          </Button>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-2 text-xs text-gray-300 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <span>Patient: {mockScanData.patientName}</span>
          <span>Study: {mockScanData.scanType}</span>
          <span>Date: {mockScanData.scanDate}</span>
          {hasOverlay && <span>Overlay: Active</span>}
          <span>
            User: {user?.name} ({user?.role})
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span>Files: {1 + (hasOverlay ? 1 : 0)}</span>
          <span>
            Visible Comments:{' '}
            {
              comments.filter(
                (c) =>
                  !c.isPrivate ||
                  permissions.canViewPrivateComments ||
                  c.authorId === String(user?.id), // FIXED: Convert to string
              ).length
            }
          </span>
          <span>Active Tool: {activeTool || 'None'}</span>
          {permissions.canAddComments ? (
            <span className="text-green-400">● Can Comment</span>
          ) : (
            <span className="text-yellow-400">● Read Only</span>
          )}
          {isViewerReady && (
            <span className="text-green-400">● Viewer Ready</span>
          )}
          {isViewerLoading && (
            <span className="text-yellow-400">● Loading...</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedMedicalViewer;