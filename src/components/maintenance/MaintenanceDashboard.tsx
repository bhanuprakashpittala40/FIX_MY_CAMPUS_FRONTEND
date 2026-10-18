import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ComplaintList } from '../complaints/ComplaintList';
import { StatusBadge, PriorityBadge } from '../ui/Badge';
import { SlaTimer } from '../ui/SlaTimer';
import { api } from '../../lib/api';
import {
  Wrench,
  AlertTriangle,
  Clock,
  CheckCircle2,
  PauseCircle,
  ShieldAlert,
  ArrowRight,
  History,
  Building,
} from 'lucide-react';

interface MaintenanceDashboardProps {
  onSelectComplaint: (id: string) => void;
  refreshTrigger: number;
}

export const MaintenanceDashboard: React.FC<MaintenanceDashboardProps> = ({
  onSelectComplaint,
  refreshTrigger,
}) => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    activeAssigned: 0,
    inProgress: 0,
    onHold: 0,
    completed: 0,
    overdue: 0,
  });
  const [urgentTasks, setUrgentTasks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'assigned' | 'history'>('assigned');
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, [refreshTrigger]);

  const fetchDashboard = async () => {
    try {
      const data = await api.maintenance.getDashboard();
      setMetrics(data.metrics);
      setUrgentTasks(data.urgentTasks);
    } catch (err) {
      console.error('Error fetching maintenance dashboard:', err);
    }
  };

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      const data = await api.maintenance.getHistory();
      setHistoryList(data.history);
    } catch (err) {
      console.error('Error loading maintenance history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab, refreshTrigger]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Wrench className="w-6 h-6 text-campus-600" /> Maintenance Operations Console
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as <span className="font-bold text-slate-700">{user?.name}</span> ({user?.department || 'Maintenance Unit'})
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 text-xs">
          <button
            onClick={() => setActiveTab('assigned')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'assigned'
                ? 'bg-campus-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Assigned Queue ({metrics.activeAssigned})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-campus-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Completed History</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Assigned Active</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{metrics.activeAssigned}</div>
          <span className="text-[10px] text-slate-400">Total in queue</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">In Progress</span>
          <div className="text-2xl font-black text-amber-800 mt-1">{metrics.inProgress}</div>
          <span className="text-[10px] text-slate-400">Underway now</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-orange-700 uppercase tracking-wider block">On Hold</span>
          <div className="text-2xl font-black text-orange-800 mt-1">{metrics.onHold}</div>
          <span className="text-[10px] text-slate-400">Awaiting parts</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">Completed</span>
          <div className="text-2xl font-black text-emerald-800 mt-1">{metrics.completed}</div>
          <span className="text-[10px] text-slate-400">Resolved jobs</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-red-700 uppercase tracking-wider block flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> Overdue
          </span>
          <div className="text-2xl font-black text-red-700 mt-1">{metrics.overdue}</div>
          <span className="text-[10px] text-red-500 font-semibold">Exceeded SLA</span>
        </div>
      </div>

      {/* Urgent Tasks Ribbon */}
      {urgentTasks.length > 0 && activeTab === 'assigned' && (
        <div className="p-4 rounded-2xl bg-red-50/80 border border-red-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600 animate-pulse" />
              <h3 className="text-xs font-bold text-red-900 uppercase tracking-wider">
                High Priority & Urgent Queue
              </h3>
            </div>
            <span className="text-[11px] text-red-700 font-medium">Take immediate action</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {urgentTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => onSelectComplaint(t.id)}
                className="p-3 rounded-xl bg-white border border-red-200 shadow-2xs hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="font-mono text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                      {t.ticketNumber}
                    </span>
                    <PriorityBadge priority={t.priority} />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{t.title}</h4>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 truncate">
                    <Building className="w-3 h-3 text-slate-400" />
                    <span>{t.building?.name} ({t.locationDetails})</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <StatusBadge status={t.status} />
                  <SlaTimer
                    deadline={t.slaDeadline}
                    isOverdue={t.isOverdue}
                    status={t.status}
                    resolvedAt={t.resolvedAt}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Tab Content */}
      {activeTab === 'assigned' ? (
        <div className="space-y-3">
          <h2 className="text-base font-extrabold text-slate-900">Assigned Tasks Queue</h2>
          <ComplaintList
            scope="assigned"
            onSelectComplaint={onSelectComplaint}
            refreshTrigger={refreshTrigger}
          />
        </div>
      ) : (
        /* Work History View */
        <div className="space-y-3">
          <h2 className="text-base font-extrabold text-slate-900">Completed Work History</h2>
          {loadingHistory ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading work history...</div>
          ) : historyList.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
              No completed work records found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {historyList.map((c) => (
                <div
                  key={c.id}
                  onClick={() => onSelectComplaint(c.id)}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:shadow-md cursor-pointer transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {c.ticketNumber}
                    </span>
                    <StatusBadge status={c.status} />
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{c.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.locationDetails}</p>
                  </div>

                  {c.resolutionNotes && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                      <span className="font-bold block text-[10px] text-emerald-800 uppercase">Resolution Notes</span>
                      <p className="mt-0.5 line-clamp-2">{c.resolutionNotes}</p>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Target: {c.building?.name}</span>
                    <span>
                      {c.resolvedAt ? new Date(c.resolvedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
