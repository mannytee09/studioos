import type { CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Chrome as Home, Folder, FolderPlus, FolderOpen, Bookmark, BookmarkPlus, User, UserPlus, Bell, BellOff, Search, X, Plus, CirclePlus as PlusCircle, Pencil, Trash2, Archive, Ellipsis as MoreHorizontal, MoveVertical as MoreVertical, Check, CircleCheck as CheckCircle2, CheckCheck, Calendar, CalendarDays, Mail, MailCheck, Phone, Settings, Copy, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Filter, ArrowUpDown, Menu, RefreshCw, Download, Upload, Eye, Info, TriangleAlert as AlertTriangle, CircleAlert as AlertCircle, Star, Pin, History, MapPin, Paperclip, Send, Save, CirclePlay as PlayCircle, Wallet, Receipt, FileText, Truck, BadgeCheck, Users, Flag, StickyNote, Armchair, Lightbulb, Paintbrush, Blinds, Sparkles, Wrench, CookingPot, Shapes, Package, Contact, Link as LinkIcon, Layers, LogOut, LayoutGrid, Rows3, SquareKanban as KanbanSquare, ListChecks, GripVertical, ExternalLink, LoaderCircle, Library, Clock, CalendarCheck, MessageSquare, SearchX, Files, FolderInput, Image, ImagePlus, FileImage, Table, TableProperties } from 'lucide-react';

/**
 * Maps Material Icons / Material Symbols string names to their Lucide equivalents.
 * Used by <DynamicIcon /> for any place that stores an icon as a string
 * (activity entries, timeline config, collection icons, EmptyState, etc.).
 */
export const iconMap: Record<string, LucideIcon> = {
  home: Home,
  folder: Folder,
  folder_open: FolderOpen,
  create_new_folder: FolderPlus,
  bookmark_border: Bookmark,
  bookmark_add: BookmarkPlus,
  person: User,
  person_add: UserPlus,
  notifications: Bell,
  notifications_none: BellOff,
  mark_email_read: MailCheck,
  search: Search,
  close: X,
  cancel: X,
  add: Plus,
  add_circle: PlusCircle,
  library_add: Library,
  edit: Pencil,
  delete: Trash2,
  delete_outline: Trash2,
  archive: Archive,
  more_horiz: MoreHorizontal,
  more_vert: MoreVertical,
  check: Check,
  check_circle: CheckCircle2,
  calendar_today: Calendar,
  calendar: Calendar,
  email: Mail,
  phone: Phone,
  settings: Settings,
  content_copy: Copy,
  expand_more: ChevronDown,
  expand_less: ChevronUp,
  chevron_right: ChevronRight,
  chevron_left: ChevronLeft,
  arrow_back: ArrowLeft,
  arrow_forward: ArrowRight,
  arrow_upward: ArrowUp,
  arrow_downward: ArrowDown,
  filter_list: Filter,
  sort: ArrowUpDown,
  list_arrow: ArrowUpDown,
  menu: Menu,
  refresh: RefreshCw,
  download: Download,
  upload: Upload,
  upload_file: Upload,
  visibility: Eye,
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
  star: Star,
  star_border: Star,
  history: History,
  pin: Pin,
  push_pin: Pin,
  location_on: MapPin,
  attach_file: Paperclip,
  send: Send,
  save: Save,
  play_circle: PlayCircle,
  change_circle: RefreshCw,
  receipt_long: Receipt,
  receipt: Receipt,
  payments: Wallet,
  description: FileText,
  local_shipping: Truck,
  badge: BadgeCheck,
  groups: Users,
  flag: Flag,
  sticky_note_2: StickyNote,
  task_alt: CheckCircle2,
  done_all: CheckCheck,
  schedule: Clock,
  event: CalendarCheck,
  chat: MessageSquare,
  person_search: Contact,
  event_list: ListChecks,
  search_off: SearchX,
  file_copy: Files,
  drive_file_move: FolderInput,
  image: Image,
  add_photo_alternate: ImagePlus,
  picture_as_pdf: FileImage,
  autorenew: RefreshCw,
  table_chart: Table,
  table_properties: TableProperties,
  chair: Armchair,
  lightbulb: Lightbulb,
  format_paint: Paintbrush,
  curtains: Blinds,
  decor: Sparkles,
  hardware: Wrench,
  kitchen: CookingPot,
  category: Shapes,
  inventory_2: Package,
  recent_actors: Contact,
  link: LinkIcon,
  layers: Layers,
  logout: LogOut,
  table_rows: Rows3,
  view_kanban: KanbanSquare,
  grid_view: LayoutGrid,
  checklist: ListChecks,
  drag_indicator: GripVertical,
  open_in_new: ExternalLink,
  auto_awesome: Sparkles,
  progress_activity: LoaderCircle,
};

const FALLBACK_ICON = Shapes;

/**
 * Renders a Lucide icon given a Material Icons string name.
 * Falls back to a generic icon if the name is unmapped.
 */
export function DynamicIcon({
  name,
  size,
  className,
  style,
}: {
  name?: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  if (!name) return null;
  const Icon = iconMap[name] ?? FALLBACK_ICON;
  return <Icon size={size} className={className} style={style} />;
}
