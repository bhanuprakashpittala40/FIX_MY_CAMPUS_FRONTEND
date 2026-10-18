import React, { useState, useEffect } from 'react';
import { ComplaintStatus } from '../../types';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface SlaTimerProps {
  deadline: string;
  isOverdue?: boolean;
  status: ComplaintStatus;
  resolvedAt?: string;
  className?: string;
}

export const SlaTimer: React.FC<SlaTimerProps> = ({
  deadline,
  isOverdue = false,
  status,
  resolvedAt,
  className = '',
}) => {
  const [timeText, setTimeText] = useState<string>('');
  const [urgency, setUrgency] = useState<'normal' | 'warning' | 'urgent' | 'breached' | 'completed'>('normal');

  useEffect(() => {
    const isCompleted = ['RESOLVED', 'CLOSED'].includes(status);

    if (isCompleted) {
      if (resolvedAt) {
        const resolvedTime = new Date(resolvedAt).getTime();
        const deadlineTime = new Date(deadline).getTime();
        if (resolvedTime <= deadlineTime) {
          setTimeText('Resolved within SLA');
          setUrgency('completed');
        } else {
          const diffHours = Math.round((resolvedTime - deadlineTime) / (1000 * 3600));
          setTimeText(`Resolved (${diffHours}h past SLA)`);
          setUrgency('warning');
        }
      } else {
        setTimeText('Resolved');
        setUrgency('completed');
      }
      return;
    }

    const updateCountdown = () => {
      const now = new Date().getTime();
      const target = new Date(deadline).getTime();
      const diffMs = target - now;

      if (diffMs <= 0 || isOverdue) {
        const pastMs = Math.abs(diffMs);
        const pastHours = Math.floor(pastMs / (1000 * 60 * 60));
        const pastMinutes = Math.floor((pastMs % (1000 * 60 * 60)) / (1000 * 60));
        setTimeText(`OVERDUE (${pastHours}h ${pastMinutes}m)`);
        setUrgency('breached');
      } else {
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        if (hours < 4) {
          setTimeText(`${hours}h ${minutes}m left`);
          setUrgency('urgent');
        } else if (hours < 24) {
          setTimeText(`${hours}h ${minutes}m left`);
          setUrgency('warning');
        } else {
          const days = Math.floor(hours / 24);
          const remHours = hours % 24;
          setTimeText(`${days}d ${remHours}h left`);
          setUrgency('normal');
        }
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [deadline, isOverdue, status, resolvedAt]);

  const styles = {
    normal: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-300',
    urgent: 'bg-orange-50 text-orange-700 border-orange-300 font-semibold animate-pulse',
    breached: 'bg-red-50 text-red-700 border-red-300 font-bold',
    completed: 'bg-slate-100 text-slate-700 border-slate-200',
  }[urgency];

  const Icon = urgency === 'breached' ? AlertTriangle : urgency === 'completed' ? CheckCircle2 : Clock;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border ${styles} ${className}`}
      title={`SLA Target: ${new Date(deadline).toLocaleString()}`}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{timeText}</span>
    </div>
  );
};
