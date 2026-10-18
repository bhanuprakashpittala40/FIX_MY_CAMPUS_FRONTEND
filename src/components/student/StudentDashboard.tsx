import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ComplaintList } from '../complaints/ComplaintList';
import { api } from '../../lib/api';
import {
  PlusCircle,
  Clock,
  Hammer,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  FileText,
  LifeBuoy,
} from 'lucide-react';

interface StudentDashboardProps {
  onOpenNewComplaint: () => void;
  onSelectComplaint: (id: string) => void;
  refreshTrigger: number;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onOpenNewComplaint,
  onSelectComplaint,
  refreshTrigger,
}) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    try {
      const res = await api.complaints.list({ limit: 100, scope: 'my' });
      const data = res.data;
      setStats({
        total: data.length,
        pending: data.filter((c: any) => ['SUBMITTED', 'UNDER_REVIEW'].includes(c.status)).length,
        inProgress: data.filter((c: any) => ['ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'REOPENED'].includes(c.status)).length,
        resolved: data.filter((c: any) => ['RESOLVED', 'CLOSED'].includes(c.status)).length,
      });
    } catch (e) {
      console.error('Error fetching student stats:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-campus-900 via-campus-800 to-campus-700 p-6 sm:p-8 text-white shadow-xl shadow-campus-900/10">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-campus-100 border border-white/20 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Smart Campus Facility Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {user?.name}
            </h1>
            <p className="text-sm text-campus-100 mt-2 leading-relaxed">
              Report campus infrastructure issues, electrical hazards, Wi-Fi outages, or plumbing problems. Our smart SLA priority engine routes directly to maintenance teams.
            </p>
          </div>

          <button
            onClick={onOpenNewComplaint}
            className="px-5 py-3 rounded-2xl bg-white text-campus-900 hover:bg-campus-50 font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group flex-shrink-0"
          >
            <PlusCircle className="w-5 h-5 text-campus-600 group-hover:scale-110 transition-transform" />
            <span>Submit New Complaint</span>
          </button>
        </div>

        {/* Decorative background element */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Submitted</span>
            <div className="w-8 h-8 rounded-lg bg-campus-50 text-campus-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{stats.total}</div>
          <div className="text-[11px] text-slate-400 mt-1">Logged requests</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Under Review</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{stats.pending}</div>
          <div className="text-[11px] text-slate-400 mt-1">Awaiting dispatch</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">In Progress</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Hammer className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{stats.inProgress}</div>
          <div className="text-[11px] text-slate-400 mt-1">Active repair underway</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Resolved / Closed</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{stats.resolved}</div>
          <div className="text-[11px] text-slate-400 mt-1">Completed repairs</div>
        </div>
      </div>

      {/* Complaint History Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">My Complaint History</h2>
            <p className="text-xs text-slate-500">Track real-time progress, technician notes, and SLA status</p>
          </div>
        </div>

        <ComplaintList
          scope="my"
          onSelectComplaint={onSelectComplaint}
          refreshTrigger={refreshTrigger}
        />
      </div>
    </div>
  );
};
