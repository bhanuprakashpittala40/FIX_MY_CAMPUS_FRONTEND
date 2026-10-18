import React from 'react';
import { ComplaintStatus } from '../../types';
import { Check, AlertCircle, XCircle, PauseCircle, RefreshCw } from 'lucide-react';

interface ProgressBarProps {
  status: ComplaintStatus;
  rejectionReason?: string;
  holdReason?: string;
  reopenReason?: string;
}

const LIFECYCLE_STEPS: { key: ComplaintStatus; label: string }[] = [
  { key: 'SUBMITTED', label: 'Submitted' },
  { key: 'UNDER_REVIEW', label: 'Review' },
  { key: 'ASSIGNED', label: 'Assigned' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'RESOLVED', label: 'Resolved' },
  { key: 'CLOSED', label: 'Closed' },
];

export const ProgressBar: React.FC<ProgressBarProps> = ({
  status,
  rejectionReason,
  holdReason,
  reopenReason,
}) => {
  const getStepIndex = (st: ComplaintStatus): number => {
    switch (st) {
      case 'SUBMITTED':
        return 0;
      case 'UNDER_REVIEW':
        return 1;
      case 'ASSIGNED':
        return 2;
      case 'IN_PROGRESS':
        return 3;
      case 'ON_HOLD':
        return 3; // within execution phase
      case 'RESOLVED':
        return 4;
      case 'REOPENED':
        return 3; // back in progress
      case 'CLOSED':
        return 5;
      case 'REJECTED':
        return 1;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(status);

  return (
    <div className="w-full py-4">
      {/* Alert banner for non-linear statuses */}
      {status === 'REJECTED' && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2">
          <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Complaint Rejected:</span> {rejectionReason || 'Declined during review.'}
          </div>
        </div>
      )}

      {status === 'ON_HOLD' && (
        <div className="mb-4 p-3 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 text-sm flex items-start gap-2">
          <PauseCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Work Paused / On Hold:</span> {holdReason || 'Awaiting materials or specialized technician.'}
          </div>
        </div>
      )}

      {status === 'REOPENED' && (
        <div className="mb-4 p-3 rounded-lg bg-pink-50 border border-pink-200 text-pink-800 text-sm flex items-start gap-2">
          <RefreshCw className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Issue Reopened by Requester:</span> {reopenReason || 'Problem recurring or incompletely solved.'}
          </div>
        </div>
      )}

      {/* Main stepper line */}
      <div className="relative">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 -z-0" />
        <div
          className="absolute top-1/2 left-0 h-1 bg-campus-600 -translate-y-1/2 -z-0 transition-all duration-500"
          style={{ width: `${(Math.min(currentIndex, 5) / 5) * 100}%` }}
        />

        <div className="relative z-10 flex justify-between">
          {LIFECYCLE_STEPS.map((step, idx) => {
            const isCompleted = idx < currentIndex || (idx === currentIndex && status === 'CLOSED');
            const isCurrent = idx === currentIndex && status !== 'CLOSED';

            return (
              <div key={step.key} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                    isCompleted
                      ? 'bg-campus-600 text-white shadow-sm ring-4 ring-campus-100'
                      : isCurrent
                      ? 'bg-white border-2 border-campus-600 text-campus-600 ring-4 ring-campus-50 shadow-sm'
                      : 'bg-white border-2 border-slate-300 text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <span
                  className={`text-xs mt-2 font-medium tracking-tight ${
                    isCurrent ? 'text-campus-900 font-semibold' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
