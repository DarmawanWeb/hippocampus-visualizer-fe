// src/components/shared/icons.tsx - UPDATED dengan icons yang sudah ada
import {
  Activity,
  AlertTriangle,
  Archive,
  ArrowRight,
  BarChart3,
  Bell,
  Bot,
  Brain,
  Calculator,
  Calendar,
  ChartBar,
  Check,
  ChevronLeft,
  ChevronRight,
  CircuitBoardIcon,
  Clock,
  Command,
  CreditCard,
  Download,
  Eye,
  File,
  FileText,
  Folder,
  HelpCircle,
  History,
  Home,
  Image,
  Laptop,
  Layers,
  LayoutDashboardIcon,
  Loader2,
  LogIn,
  LogOut,
  type LucideIcon,
  Menu,
  MessageSquare,
  Plus,
  Search,
  // Import additional icons yang diperlukan untuk medical platform
  Settings,
  Shield,
  Stethoscope,
  Upload,
  User,
  UserCircle2Icon,
  UserPen,
  UserPlus,
  Users,
  UserX2Icon,
  X,
} from 'lucide-react';

export type Icon = LucideIcon;

export const Icons = {
  // Original icons dari file Anda
  dashboard: LayoutDashboardIcon,
  logo: Command,
  login: LogIn,
  close: X,
  spinner: Loader2,
  kanban: CircuitBoardIcon,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  employee: UserX2Icon,
  post: FileText,
  page: File,
  userPen: UserPen,
  user2: UserCircle2Icon,
  media: Image,
  billing: CreditCard,
  warning: AlertTriangle,
  user: User,
  arrowRight: ArrowRight,
  help: HelpCircle,
  laptop: Laptop,
  check: Check,

  // Medical platform icons (existing)
  brain: Brain,
  eye: Eye,
  users: Users,
  folder: Folder,
  upload: Upload,
  clock: Clock,
  archive: Archive,
  download: Download,
  analytics: Activity,
  barChart: BarChart3,
  calculator: Calculator,
  bot: Bot,
  userPlus: UserPlus,
  userList: Users,
  history: History,
  layers: Layers,
  chartBar: ChartBar,
  fileText: FileText,
  medicalReport: FileText,

  // Additional icons untuk medical platform
  home: Home,
  activity: Activity,
  settings: Settings,
  shield: Shield,
  logout: LogOut,
  messageSquare: MessageSquare,
  calendar: Calendar,
  search: Search,
  menu: Menu,
  plus: Plus,
  bell: Bell,
  stethoscope: Stethoscope,

  // Aliases untuk compatibility
  medicalViewer: Brain,
  dashboard2: Home, // Alternative dashboard icon
  adminPanel: Shield,
} as const;

export type IconKeys = keyof typeof Icons;
