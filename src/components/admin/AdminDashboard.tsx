import React, { useState, useEffect } from 'react';
import { ComplaintList } from '../complaints/ComplaintList';
import { api } from '../../lib/api';
import { AdminMetrics, User, Building, Category, ComplaintActivity } from '../../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Shield,
  BarChart3,
  Users,
  Building2,
  FolderTree,
  Sliders,
  FileSpreadsheet,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Plus,
  Edit,
  Save,
  Check,
  X,
  History,
} from 'lucide-react';

interface AdminDashboardProps {
  onSelectComplaint: (id: string) => void;
  refreshTrigger: number;
}

const COLORS = ['#0c8fe9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#64748b', '#ef4444', '#06b6d4'];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onSelectComplaint,
  refreshTrigger,
}) => {
  const [activeTab, setActiveTab] = useState<
    'complaints' | 'analytics' | 'users' | 'buildings' | 'categories' | 'rules' | 'audit'
  >('complaints');

  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [auditLogs, setAuditLogs] = useState<ComplaintActivity[]>([]);
  const [priorityRules, setPriorityRules] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Forms
  const [newBuilding, setNewBuilding] = useState({ name: '', code: '', zone: 'Central Campus', floors: 3, isCritical: false });
  const [showAddBuilding, setShowAddBuilding] = useState(false);

  const [newCategory, setNewCategory] = useState({ name: '', description: '', slaHours: 24, icon: 'Wrench' });
  const [showAddCategory, setShowAddCategory] = useState(false);

  useEffect(() => {
    fetchMetrics();
  }, [refreshTrigger]);

  const fetchMetrics = async () => {
    try {
      const data = await api.admin.getMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Error fetching admin metrics:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'analytics') loadAnalytics();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'buildings') loadBuildings();
    if (activeTab === 'categories') loadCategories();
    if (activeTab === 'rules') loadPriorityRules();
    if (activeTab === 'audit') loadAuditLogs();
  }, [activeTab, refreshTrigger]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await api.admin.getAnalytics();
      setAnalytics(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.admin.getUsers();
      setUsers(data.users);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadBuildings = async () => {
    try {
      setLoading(true);
      const data = await api.admin.getBuildings();
      setBuildings(data.buildings);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await api.admin.getCategories();
      setCategories(data.categories);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadPriorityRules = async () => {
    try {
      setLoading(true);
      const data = await api.admin.getPriorityRules();
      setPriorityRules(data.rules);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const data = await api.admin.getAuditLogs(1, 30);
      setAuditLogs(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.admin.createBuilding(newBuilding);
      setShowAddBuilding(false);
      setNewBuilding({ name: '', code: '', zone: 'Central Campus', floors: 3, isCritical: false });
      loadBuildings();
      setSuccessMsg('Building added successfully');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add building');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.admin.createCategory(newCategory);
      setShowAddCategory(false);
      setNewCategory({ name: '', description: '', slaHours: 24, icon: 'Wrench' });
      loadCategories();
      setSuccessMsg('Category added successfully');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create category');
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      await api.admin.updateUser(userId, { role: newRole });
      loadUsers();
      setSuccessMsg('User role updated');
      setTimeout(() => setSuccessMsg(null), 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update user');
    }
  };

  const handleSavePriorityRules = async () => {
    if (!priorityRules) return;
    try {
      await api.admin.updatePriorityRules(priorityRules);
      setSuccessMsg('Priority scoring rules updated');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update priority rules');
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Title & Alerts */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-campus-600" /> Campus Operations Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Supervisory monitoring, SLA governance, team assignments, and facilities configuration
          </p>
        </div>

        {/* SLA Compliance Pill */}
        {metrics && (
          <div className="flex items-center gap-3 bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">SLA Compliance</span>
              <span className="text-sm font-black text-emerald-600">{metrics.slaComplianceRate}%</span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Avg Resolution</span>
              <span className="text-sm font-black text-slate-800">{metrics.avgResolutionHours} hrs</span>
            </div>
          </div>
        )}
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Metric Cards Grid */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Complaints</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{metrics.total}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-blue-500 block">Pending Review</span>
            <div className="text-2xl font-black text-blue-700 mt-1">{metrics.pending}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-amber-500 block">In Progress</span>
            <div className="text-2xl font-black text-amber-700 mt-1">{metrics.activeInProgress}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-emerald-500 block">Resolved / Closed</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">{metrics.resolved}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-red-500 block flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-red-600" /> Overdue
            </span>
            <div className="text-2xl font-black text-red-600 mt-1">{metrics.overdue}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-rose-500 block">Critical Priority</span>
            <div className="text-2xl font-black text-rose-600 mt-1">{metrics.critical}</div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-200/70 border border-slate-300/50 text-xs font-bold">
        <button
          onClick={() => setActiveTab('complaints')}
          className={`px-3.5 py-2 rounded-xl transition-all ${
            activeTab === 'complaints' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Campus Complaints
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'analytics' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Analytics & SLA</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'users' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>User Roles</span>
        </button>

        <button
          onClick={() => setActiveTab('buildings')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'buildings' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Buildings & Zones</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'categories' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FolderTree className="w-3.5 h-3.5" />
          <span>Categories & SLA</span>
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'rules' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Priority Rules Engine</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'audit' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Audit Log</span>
        </button>
      </div>

      {/* Tab Panels */}
      {/* 1. Complaints List */}
      {activeTab === 'complaints' && (
        <div className="space-y-3">
          <ComplaintList
            scope="all"
            onSelectComplaint={onSelectComplaint}
            refreshTrigger={refreshTrigger}
          />
        </div>
      )}

      {/* 2. Visual Analytics (Recharts) */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {loading || !analytics ? (
            <div className="py-20 text-center text-xs text-slate-400">Loading analytics visualizations...</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Complaints by Category */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <h3 className="text-sm font-extrabold text-slate-900">Complaints by Category</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.byCategory} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                      <Bar dataKey="total" fill="#0c8fe9" name="Total Issues" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="resolved" fill="#10b981" name="Resolved" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Status Distribution Pie */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <h3 className="text-sm font-extrabold text-slate-900">Complaint Status Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.byStatus.filter((s: any) => s.count > 0)}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={(entry: any) => `${entry.status}: ${entry.count}`}
                      >
                        {analytics.byStatus.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Building Distribution & Overdue */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3 lg:col-span-2">
                <h3 className="text-sm font-extrabold text-slate-900">Facility Breakdown & Overdue Hotspots</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.byBuilding} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <XAxis dataKey="code" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar dataKey="count" fill="#3b82f6" name="Total Logged" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="overdue" fill="#ef4444" name="Overdue Breaches" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. User & Role Management */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">Registered Campus Users</h3>
            <span className="text-xs text-slate-400">{users.length} Total Users</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Name & Email</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Activity</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-slate-400 text-[11px]">{u.email}</div>
                    </td>
                    <td className="py-3 px-4">{u.department || '—'}</td>
                    <td className="py-3 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                        className="px-2 py-1 rounded-md border border-slate-300 text-xs font-semibold bg-white"
                      >
                        <option value="STUDENT">STUDENT</option>
                        <option value="FACULTY">FACULTY</option>
                        <option value="MAINTENANCE">MAINTENANCE</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-[11px]">
                      {u._count?.complaintsSubmitted || 0} Submitted • {u._count?.complaintsAssigned || 0} Assigned
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Buildings & Zones */}
      {activeTab === 'buildings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">Campus Facilities & Buildings</h3>
            <button
              onClick={() => setShowAddBuilding(!showAddBuilding)}
              className="px-3.5 py-1.5 rounded-xl bg-campus-600 hover:bg-campus-700 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Building
            </button>
          </div>

          {showAddBuilding && (
            <form onSubmit={handleCreateBuilding} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase">Register New Campus Building</h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Building Name *"
                  value={newBuilding.name}
                  onChange={(e) => setNewBuilding({ ...newBuilding, name: e.target.value })}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-300"
                  required
                />
                <input
                  type="text"
                  placeholder="Code (e.g. STC) *"
                  value={newBuilding.code}
                  onChange={(e) => setNewBuilding({ ...newBuilding, code: e.target.value })}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-300"
                  required
                />
                <input
                  type="text"
                  placeholder="Zone (e.g. North Campus)"
                  value={newBuilding.zone}
                  onChange={(e) => setNewBuilding({ ...newBuilding, zone: e.target.value })}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-300"
                  required
                />
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-600 flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newBuilding.isCritical}
                      onChange={(e) => setNewBuilding({ ...newBuilding, isCritical: e.target.checked })}
                    />
                    <span>Critical Infrastructure</span>
                  </label>
                  <button type="submit" className="ml-auto px-4 py-2 bg-campus-600 text-white rounded-xl text-xs font-bold">
                    Save
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {buildings.map((b) => (
              <div key={b.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {b.code}
                  </span>
                  {b.isCritical && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Critical Asset
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{b.name}</h4>
                <div className="text-xs text-slate-500">{b.zone} • {b.floors} Floors</div>
                <div className="text-[11px] text-campus-600 font-semibold pt-2 border-t border-slate-100">
                  {b._count?.complaints || 0} Total Logged Complaints
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Categories Configuration */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">Configured Complaint Categories & SLA Rules</h3>
            <button
              onClick={() => setShowAddCategory(!showAddCategory)}
              className="px-3.5 py-1.5 rounded-xl bg-campus-600 hover:bg-campus-700 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>
          </div>

          {showAddCategory && (
            <form onSubmit={handleCreateCategory} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase">Create New Complaint Category</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Category Name *"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-300"
                  required
                />
                <input
                  type="number"
                  placeholder="Default SLA Hours (e.g. 24)"
                  value={newCategory.slaHours}
                  onChange={(e) => setNewCategory({ ...newCategory, slaHours: Number(e.target.value) })}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-300"
                  required
                />
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Short Description"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                  <button type="submit" className="px-4 py-2 bg-campus-600 text-white rounded-xl text-xs font-bold">
                    Create
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((c) => (
              <div key={c.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">{c.name}</h4>
                  <span className="text-xs font-bold text-campus-700 bg-campus-50 px-2 py-0.5 rounded border border-campus-200">
                    SLA: {c.slaHours}h
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">{c.description || 'Standard facility maintenance'}</p>
                <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span>{c._count?.complaints || 0} complaints logged</span>
                  <span className="font-semibold text-emerald-600">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Priority Rules Engine Configuration */}
      {activeTab === 'rules' && priorityRules && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Smart Priority Engine Scoring Model</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Transparent multi-factor scoring algorithm. Weights automatically compute SLA priority levels.
              </p>
            </div>
            <button
              onClick={handleSavePriorityRules}
              className="px-4 py-2 bg-campus-600 hover:bg-campus-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-4 h-4" /> Save Rule Engine
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Safety Risk Weights */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                1. Safety Risk Weights (Points)
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Immediate Danger:</span>
                  <input
                    type="number"
                    value={priorityRules.safetyWeights.IMMEDIATE_DANGER}
                    onChange={(e) =>
                      setPriorityRules({
                        ...priorityRules,
                        safetyWeights: { ...priorityRules.safetyWeights, IMMEDIATE_DANGER: Number(e.target.value) },
                      })
                    }
                    className="w-20 px-2 py-1 text-xs border border-slate-300 rounded-lg text-right font-bold"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Hazard / Mild Danger:</span>
                  <input
                    type="number"
                    value={priorityRules.safetyWeights.HAZARD}
                    onChange={(e) =>
                      setPriorityRules({
                        ...priorityRules,
                        safetyWeights: { ...priorityRules.safetyWeights, HAZARD: Number(e.target.value) },
                      })
                    }
                    className="w-20 px-2 py-1 text-xs border border-slate-300 rounded-lg text-right font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Severity Weights */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                2. Problem Severity Weights (Points)
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Catastrophic:</span>
                  <input
                    type="number"
                    value={priorityRules.severityWeights.CATASTROPHIC}
                    onChange={(e) =>
                      setPriorityRules({
                        ...priorityRules,
                        severityWeights: { ...priorityRules.severityWeights, CATASTROPHIC: Number(e.target.value) },
                      })
                    }
                    className="w-20 px-2 py-1 text-xs border border-slate-300 rounded-lg text-right font-bold"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Major:</span>
                  <input
                    type="number"
                    value={priorityRules.severityWeights.MAJOR}
                    onChange={(e) =>
                      setPriorityRules({
                        ...priorityRules,
                        severityWeights: { ...priorityRules.severityWeights, MAJOR: Number(e.target.value) },
                      })
                    }
                    className="w-20 px-2 py-1 text-xs border border-slate-300 rounded-lg text-right font-bold"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Moderate:</span>
                  <input
                    type="number"
                    value={priorityRules.severityWeights.MODERATE}
                    onChange={(e) =>
                      setPriorityRules({
                        ...priorityRules,
                        severityWeights: { ...priorityRules.severityWeights, MODERATE: Number(e.target.value) },
                      })
                    }
                    className="w-20 px-2 py-1 text-xs border border-slate-300 rounded-lg text-right font-bold"
                  />
                </div>
              </div>
            </div>

            {/* SLA Deadlines */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 md:col-span-2">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                3. Priority Tier SLA Deadlines (Hours)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-red-700 font-bold block mb-1">CRITICAL SLA (hrs):</span>
                  <input
                    type="number"
                    value={priorityRules.slaHours.CRITICAL}
                    onChange={(e) =>
                      setPriorityRules({
                        ...priorityRules,
                        slaHours: { ...priorityRules.slaHours, CRITICAL: Number(e.target.value) },
                      })
                    }
                    className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg text-right font-bold"
                  />
                </div>
                <div>
                  <span className="text-orange-700 font-bold block mb-1">HIGH SLA (hrs):</span>
                  <input
                    type="number"
                    value={priorityRules.slaHours.HIGH}
                    onChange={(e) =>
                      setPriorityRules({
                        ...priorityRules,
                        slaHours: { ...priorityRules.slaHours, HIGH: Number(e.target.value) },
                      })
                    }
                    className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg text-right font-bold"
                  />
                </div>
                <div>
                  <span className="text-amber-700 font-bold block mb-1">MEDIUM SLA (hrs):</span>
                  <input
                    type="number"
                    value={priorityRules.slaHours.MEDIUM}
                    onChange={(e) =>
                      setPriorityRules({
                        ...priorityRules,
                        slaHours: { ...priorityRules.slaHours, MEDIUM: Number(e.target.value) },
                      })
                    }
                    className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg text-right font-bold"
                  />
                </div>
                <div>
                  <span className="text-emerald-700 font-bold block mb-1">LOW SLA (hrs):</span>
                  <input
                    type="number"
                    value={priorityRules.slaHours.LOW}
                    onChange={(e) =>
                      setPriorityRules({
                        ...priorityRules,
                        slaHours: { ...priorityRules.slaHours, LOW: Number(e.target.value) },
                      })
                    }
                    className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg text-right font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Campus Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">Campus Activity & Status Audit Stream</h3>
            <span className="text-xs text-slate-400">Recorded chronological events</span>
          </div>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3.5 hover:bg-slate-50 transition-colors text-xs flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.actorName}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {log.actorRole}
                    </span>
                    {log.complaint && (
                      <span className="font-mono text-campus-600 font-bold text-[11px]">
                        [{log.complaint.ticketNumber}]
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600">{log.comments}</p>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
