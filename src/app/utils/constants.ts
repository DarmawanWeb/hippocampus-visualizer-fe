// src/utils/constants.ts
import type { User } from '@/types/auth';

// ============================================================================
// USER ROLES
// ============================================================================
export const USER_ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  PATIENT: 'patient',
  STAFF: 'staff',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// ============================================================================
// COMMENT TYPES
// ============================================================================
export const COMMENT_TYPES = {
  FINDING: 'finding',
  RECOMMENDATION: 'recommendation',
  NOTE: 'note',
  QUESTION: 'question',
} as const;

export type CommentType = (typeof COMMENT_TYPES)[keyof typeof COMMENT_TYPES];

// ============================================================================
// PERMISSION ACTIONS
// ============================================================================
export const PERMISSION_ACTIONS = {
  CAN_ADD_COMMENTS: 'canAddComments',
  CAN_EDIT_COMMENTS: 'canEditComments',
  CAN_DELETE_COMMENTS: 'canDeleteComments',
  CAN_VIEW_PRIVATE_COMMENTS: 'canViewPrivateComments',
  CAN_MANAGE_USERS: 'canManageUsers',
  CAN_ACCESS_ALL_PATIENTS: 'canAccessAllPatients',
} as const;

// ============================================================================
// MEDICAL IMAGING CONSTANTS
// ============================================================================
export const SCAN_TYPES = {
  T1: 'T1',
  T2: 'T2',
  FLAIR: 'FLAIR',
  DTI: 'DTI',
  DWI: 'DWI',
  BOLD: 'BOLD',
  ASL: 'ASL',
  SWI: 'SWI',
} as const;

export const SCAN_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  REVIEWED: 'reviewed',
  ERROR: 'error',
  ARCHIVED: 'archived',
} as const;

export const BODY_PARTS = {
  BRAIN: 'brain',
  SPINE: 'spine',
  HEAD: 'head',
  NECK: 'neck',
} as const;

// ============================================================================
// NAVIGATION ACCESS RULES
// ============================================================================
export const NAVIGATION_ACCESS: Record<string, UserRole[]> = {
  // Dashboard items - accessible to all authenticated users
  dashboard: ['admin', 'doctor', 'patient', 'staff'],
  viewer: ['admin', 'doctor', 'patient', 'staff'],
  'medical-viewer': ['admin', 'doctor', 'patient', 'staff'],

  // Admin only
  admin: ['admin'],
  users: ['admin'],
  'user-management': ['admin'],
  system: ['admin'],
  'system-monitor': ['admin'],
  settings: ['admin'],
  audit: ['admin'],

  // Doctor and Admin
  patients: ['admin', 'doctor'],
  'patient-management': ['admin', 'doctor'],
  reports: ['admin', 'doctor'],
  'medical-reports': ['admin', 'doctor'],
  analytics: ['admin', 'doctor'],
  statistics: ['admin', 'doctor'],

  // Lab staff specific
  upload: ['admin', 'doctor', 'staff'],
  'file-upload': ['admin', 'doctor', 'staff'],
  files: ['admin', 'staff'],
  'file-management': ['admin', 'staff'],
  lab: ['admin', 'staff'],
  'lab-dashboard': ['admin', 'staff'],
  processing: ['admin', 'staff'],

  // Patient specific
  profile: ['admin', 'doctor', 'patient'],
  'my-profile': ['admin', 'doctor', 'patient'],
  appointments: ['admin', 'doctor', 'patient'],
  'my-appointments': ['admin', 'doctor', 'patient'],
  scans: ['admin', 'doctor', 'patient', 'staff'],
  'my-scans': ['admin', 'doctor', 'patient'],
  results: ['admin', 'doctor', 'patient'],
  'my-results': ['admin', 'doctor', 'patient'],

  // Schedule related
  schedule: ['admin', 'doctor'],
  calendar: ['admin', 'doctor'],
  'appointments-management': ['admin', 'doctor'],
};

// ============================================================================
// DEMO USERS FOR TESTING
// ============================================================================
export const DEMO_USERS: Record<UserRole, User> = {
  admin: {
    id: 1,
    name: 'Dr. Sarah Admin',
    email: 'admin@ibrain2u.com',
    role: 'admin',
    active: true,
    avatar: '/placeholder-avatar-admin.jpg',
    department: 'Administration',
    specialization: 'System Administration',
  },
  doctor: {
    id: 2,
    name: 'Dr. Robert Smith',
    email: 'robert.smith@ibrain2u.com',
    role: 'doctor',
    active: true,
    avatar: '/placeholder-avatar-doctor.jpg',
    department: 'Neurology',
    specialization: 'Brain Imaging & Neurological Disorders',
  },
  patient: {
    id: 3,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    role: 'patient',
    active: true,
    avatar: '/placeholder-avatar-patient.jpg',
    department: 'Neurology Patient',
    specialization: undefined,
  },
  staff: {
    id: 4,
    name: 'Mike Chen',
    email: 'mike.chen@ibrain2u.com',
    role: 'staff',
    active: true,
    avatar: '/placeholder-avatar-staff.jpg',
    department: 'Medical Laboratory',
    specialization: 'MRI Technician & Image Processing',
  },
};

// ============================================================================
// ROLE DESCRIPTIONS & CAPABILITIES
// ============================================================================
export const ROLE_DESCRIPTIONS = {
  admin: {
    title: 'System Administrator',
    description: 'Full system access and user management capabilities',
    color: 'red',
    icon: '👑',
    capabilities: [
      'Manage all users and permissions',
      'Access system administration panel',
      'View all patient data and records',
      'Add, edit, and delete all comments',
      'View private medical comments',
      'Generate system reports and analytics',
      'Configure system settings',
      'Access audit logs and security features',
    ],
  },
  doctor: {
    title: 'Medical Doctor',
    description: 'Medical professional with patient care responsibilities',
    color: 'blue',
    icon: '👨‍⚕️',
    capabilities: [
      'Access all patient medical records',
      'Add medical findings and recommendations',
      'Edit and delete own medical comments',
      'View private medical discussions',
      'Generate medical reports',
      'Schedule and manage appointments',
      'Review and approve medical imaging',
      'Collaborate with medical team',
    ],
  },
  patient: {
    title: 'Patient',
    description: 'Individual receiving medical care and services',
    color: 'gray',
    icon: '👤',
    capabilities: [
      'View own medical records and results',
      'Access personal scan images and reports',
      'View public medical comments about own case',
      'Schedule appointments with doctors',
      'Update personal profile information',
      'Download own medical reports',
      'Access educational health resources',
      'Communicate with healthcare team',
    ],
  },
  staff: {
    title: 'Laboratory Staff',
    description:
      'Technical staff responsible for medical imaging and processing',
    color: 'green',
    icon: '🔬',
    capabilities: [
      'Upload and process medical images',
      'Manage file uploads and conversions',
      'View assigned patient imaging data',
      'Monitor processing queues and status',
      'Perform quality control on images',
      'Generate technical reports',
      'Maintain imaging equipment logs',
      'Support medical imaging workflows',
    ],
  },
};

// ============================================================================
// SAMPLE MEDICAL DATA
// ============================================================================
export const SAMPLE_PATIENTS = [
  {
    id: 'P000123',
    name: 'Sarah Johnson',
    age: 34,
    gender: 'Female',
    condition: 'Multiple Sclerosis',
    assignedDoctor: 'Dr. Robert Smith',
    lastScan: '2024-06-29',
    totalScans: 8,
    status: 'active',
  },
  {
    id: 'P000124',
    name: 'Robert Wilson',
    age: 56,
    gender: 'Male',
    condition: 'Brain Tumor Monitoring',
    assignedDoctor: 'Dr. Emily Chen',
    lastScan: '2024-06-28',
    totalScans: 12,
    status: 'follow-up',
  },
  {
    id: 'P000125',
    name: 'Emily Davis',
    age: 28,
    gender: 'Female',
    condition: 'Chronic Headache Investigation',
    assignedDoctor: 'Dr. Robert Smith',
    lastScan: '2024-06-27',
    totalScans: 3,
    status: 'new',
  },
];

export const SAMPLE_COMMENTS = [
  {
    id: '1',
    author: 'Dr. Robert Smith',
    authorId: '2',
    role: 'doctor',
    content:
      'Notable hyperintensity in the left temporal region. Consistent with demyelination pattern. Patient should continue current treatment protocol.',
    type: 'finding' as CommentType,
    position: { x: 128, y: 156, z: 78, slice: 45, view: 'axial' },
    timestamp: '2024-06-29 14:30',
    isPrivate: false,
    scanId: 'MRI20240629001',
    patientId: 'P000123',
  },
  {
    id: '2',
    author: 'Dr. Emily Chen',
    authorId: '5',
    role: 'doctor',
    content:
      'Recommend follow-up scan in 3 months to monitor progression. Consider adjusting medication dosage based on current findings.',
    type: 'recommendation' as CommentType,
    position: { x: 150, y: 200, z: 80, slice: 47, view: 'axial' },
    timestamp: '2024-06-29 15:15',
    isPrivate: true,
    scanId: 'MRI20240629001',
    patientId: 'P000123',
  },
  {
    id: '3',
    author: 'Dr. Robert Smith',
    authorId: '2',
    role: 'doctor',
    content:
      'Patient reports significant improvement in symptoms since last visit. Scan results correlate well with clinical presentation.',
    type: 'note' as CommentType,
    timestamp: '2024-06-29 16:00',
    isPrivate: false,
    scanId: 'MRI20240629001',
    patientId: 'P000123',
  },
];

// ============================================================================
// UI THEME CONSTANTS
// ============================================================================
export const ROLE_COLORS = {
  admin: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    hover: 'hover:bg-red-200',
  },
  doctor: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    hover: 'hover:bg-blue-200',
  },
  patient: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200',
    hover: 'hover:bg-gray-200',
  },
  staff: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    hover: 'hover:bg-green-200',
  },
};

export const COMMENT_TYPE_COLORS = {
  finding: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    icon: '🔍',
  },
  recommendation: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    icon: '💡',
  },
  note: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-200',
    icon: '📝',
  },
  question: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-200',
    icon: '❓',
  },
};

// ============================================================================
// APPLICATION SETTINGS
// ============================================================================
export const APP_CONFIG = {
  name: 'IBrain2u',
  version: '2.0.0',
  description: 'Advanced Medical Imaging Platform with RBAC',
  supportEmail: 'support@ibrain2u.com',
  maxFileSize: 500 * 1024 * 1024, // 500MB
  allowedFileTypes: ['.nii', '.nii.gz', '.dcm'],
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  autoSaveInterval: 5 * 60 * 1000, // 5 minutes
};

export const VIEWER_CONFIG = {
  defaultColormap: 'gray',
  defaultOpacity: 0.7,
  defaultBrightness: 50,
  defaultContrast: 50,
  maxZoom: 500,
  minZoom: 10,
  panSensitivity: 1.0,
  zoomSensitivity: 1.0,
};

// ============================================================================
// ERROR MESSAGES
// ============================================================================
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'You are not authorized to perform this action',
  INSUFFICIENT_PERMISSIONS: 'You do not have sufficient permissions',
  INVALID_ROLE: 'Invalid user role specified',
  ACCESS_DENIED: 'Access denied. Please contact an administrator',
  SESSION_EXPIRED: 'Your session has expired. Please log in again',
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit',
  INVALID_FILE_TYPE:
    'Invalid file type. Please upload a valid medical image file',
  NETWORK_ERROR: 'Network error. Please check your connection and try again',
  SERVER_ERROR: 'Server error. Please try again later',
  COMMENT_SAVE_FAILED: 'Failed to save comment. Please try again',
  COMMENT_DELETE_FAILED: 'Failed to delete comment. Please try again',
};

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logged out successfully',
  COMMENT_ADDED: 'Comment added successfully',
  COMMENT_UPDATED: 'Comment updated successfully',
  COMMENT_DELETED: 'Comment deleted successfully',
  FILE_UPLOADED: 'File uploaded successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
};

// ============================================================================
// UTILITY FUNCTIONS FOR CONSTANTS
// ============================================================================

/**
 * Get role description by role type
 */
export const getRoleDescription = (role: UserRole) => {
  return ROLE_DESCRIPTIONS[role] || ROLE_DESCRIPTIONS.patient;
};

/**
 * Get role color classes by role type
 */
export const getRoleColors = (role: UserRole) => {
  return ROLE_COLORS[role] || ROLE_COLORS.patient;
};

/**
 * Get comment type color classes
 */
export const getCommentTypeColors = (type: CommentType) => {
  return COMMENT_TYPE_COLORS[type] || COMMENT_TYPE_COLORS.note;
};

/**
 * Check if user role can access navigation item
 */
export const canAccessNavigation = (
  role: UserRole,
  navigationKey: string,
): boolean => {
  const allowedRoles = NAVIGATION_ACCESS[navigationKey.toLowerCase()];
  return allowedRoles ? allowedRoles.includes(role) : false;
};

/**
 * Get demo user by role
 */
export const getDemoUser = (role: UserRole): User => {
  return DEMO_USERS[role];
};

/**
 * Validate file type
 */
export const isValidFileType = (filename: string): boolean => {
  return APP_CONFIG.allowedFileTypes.some((type) =>
    filename.toLowerCase().endsWith(type.toLowerCase()),
  );
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

/**
 * Check if file size is valid
 */
export const isValidFileSize = (size: number): boolean => {
  return size <= APP_CONFIG.maxFileSize;
};
