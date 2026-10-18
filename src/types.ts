export type Role = 'STUDENT' | 'FACULTY' | 'MAINTENANCE' | 'ADMIN';

export type ComplaintStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REJECTED'
  | 'REOPENED';

export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type SafetyRiskLevel = 'IMMEDIATE_DANGER' | 'HAZARD' | 'NONE';

export type SeverityLevel = 'CATASTROPHIC' | 'MAJOR' | 'MODERATE' | 'MINOR';

export type AffectedCountLevel = 'CAMPUS_WIDE' | 'BUILDING_WIDE' | 'GROUP' | 'INDIVIDUAL';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt?: string;
  _count?: {
    complaintsSubmitted?: number;
    complaintsAssigned?: number;
  };
}

export interface Building {
  id: string;
  name: string;
  code: string;
  zone: string;
  floors: number;
  isCritical: boolean;
  isActive: boolean;
  _count?: {
    complaints?: number;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  slaHours: number;
  displayOrder: number;
  isActive: boolean;
  _count?: {
    complaints?: number;
  };
}

export interface ComplaintActivity {
  id: string;
  complaintId: string;
  actorId?: string;
  actorName: string;
  actorRole: string;
  previousStatus?: string;
  newStatus: string;
  action: string;
  comments?: string;
  createdAt: string;
  complaint?: {
    id: string;
    ticketNumber: string;
    title: string;
    priority: PriorityLevel;
  };
}

export interface ComplaintComment {
  id: string;
  complaintId: string;
  userId: string;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
}

export interface Complaint {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  locationDetails: string;
  status: ComplaintStatus;
  priority: PriorityLevel;
  calculatedScore: number;
  safetyRisk: SafetyRiskLevel;
  severity: SeverityLevel;
  affectedCount: AffectedCountLevel;
  locationImpact: boolean;
  slaDeadline: string;
  isOverdue: boolean;
  images: string[];
  resolutionImages: string[];
  resolutionNotes?: string;
  holdReason?: string;
  expectedRestartDate?: string;
  rejectionReason?: string;
  reopenReason?: string;
  submittedById: string;
  submittedBy: {
    id: string;
    name: string;
    email: string;
    role: Role;
    department?: string;
    phone?: string;
  };
  assignedToId?: string;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
    department?: string;
    phone?: string;
  };
  buildingId: string;
  building: Building;
  categoryId: string;
  category: Category;
  resolvedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
  activities?: ComplaintActivity[];
  comments?: ComplaintComment[];
  _count?: {
    comments: number;
    activities: number;
  };
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  complaintId?: string;
  createdAt: string;
  complaint?: {
    id: string;
    ticketNumber: string;
    title: string;
    status: ComplaintStatus;
    priority: PriorityLevel;
  };
}

export interface AdminMetrics {
  total: number;
  pending: number;
  activeInProgress: number;
  resolved: number;
  overdue: number;
  critical: number;
  rejected: number;
  totalUsers: number;
  slaComplianceRate: number;
  avgResolutionHours: number;
}
