import React from 'react';
import { ComplaintStatus, PriorityLevel, SafetyRiskLevel } from '../../types';
import { AlertTriangle, Clock, CheckCircle, ShieldAlert, XCircle, RefreshCw, PauseCircle, Hammer } from 'lucide-react';

export const StatusBadge: React.FC<{ status: ComplaintStatus; className?: string }> = ({ status, className = '' }) => {
  const configs: Record<ComplaintStatus, { label: string; bg: string; text: string; border: string; icon: any }> = {
    SUBMITTED: {
      label: 'Submitted',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: Clock,
    },
    UNDER_REVIEW: {
      label: 'Under Review',
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      icon: Clock,
    },
    ASSIGNED: {
      label: 'Assigned',
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      icon: Hammer,
    },
    IN_PROGRESS: {
      label: 'In Progress',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-300',
      icon: Hammer,
    },
    ON_HOLD: {
      label: 'On Hold',
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-300',
      icon: PauseCircle,
    },
    RESOLVED: {
      label: 'Resolved',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-300',
      icon: CheckCircle,
    },
    CLOSED: {
      label: 'Closed',
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-300',
      icon: CheckCircle,
    },
    REJECTED: {
      label: 'Rejected',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      icon: XCircle,
    },
    REOPENED: {
      label: 'Reopened',
      bg: 'bg-pink-50',
      text: 'text-pink-700',
      border: 'border-pink-300',
      icon: RefreshCw,
    },
  };

  const config = configs[status] || configs.SUBMITTED;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: PriorityLevel; className?: string }> = ({ priority, className = '' }) => {
  const configs: Record<PriorityLevel, { label: string; bg: string; text: string; border: string; dot: string }> = {
    CRITICAL: {
      label: 'Critical',
      bg: 'bg-red-500/10',
      text: 'text-red-700',
      border: 'border-red-300',
      dot: 'bg-red-600 animate-pulse',
    },
    HIGH: {
      label: 'High',
      bg: 'bg-orange-500/10',
      text: 'text-orange-700',
      border: 'border-orange-300',
      dot: 'bg-orange-500',
    },
    MEDIUM: {
      label: 'Medium',
      bg: 'bg-amber-500/10',
      text: 'text-amber-700',
      border: 'border-amber-300',
      dot: 'bg-amber-500',
    },
    LOW: {
      label: 'Low',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-700',
      border: 'border-emerald-300',
      dot: 'bg-emerald-500',
    },
  };

  const config = configs[priority] || configs.MEDIUM;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export const SafetyRiskBadge: React.FC<{ risk: SafetyRiskLevel; className?: string }> = ({ risk, className = '' }) => {
  if (risk === 'IMMEDIATE_DANGER') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800 border border-red-300 ${className}`}
      >
        <ShieldAlert className="w-3.5 h-3.5 text-red-600 animate-bounce" />
        Immediate Hazard
      </span>
    );
  }

  if (risk === 'HAZARD') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 ${className}`}
      >
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        Moderate Risk
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center text-xs text-slate-500 ${className}`}>
      Standard (No Hazard)
    </span>
  );
};
