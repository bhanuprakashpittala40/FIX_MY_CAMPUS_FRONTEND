import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { StatusBadge, PriorityBadge, SafetyRiskBadge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { SlaTimer } from '../ui/SlaTimer';
import { Complaint, Role, PriorityLevel, ComplaintStatus } from '../../types';
import { api, uploadMultipleImages } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  MapPin,
  Calendar,
  User,
  Wrench,
  Send,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  PauseCircle,
  XCircle,
  ShieldCheck,
  Building,
  Image as ImageIcon,
  Clock,
  Sparkles,
} from 'lucide-react';

interface ComplaintDetailModalProps {
  complaintId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onComplaintUpdated?: () => void;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaintId,
  isOpen,
  onClose,
  onComplaintUpdated,
}) => {
  const { user } = useAuth();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  
  // Interactive action modals / prompts
  const [actionType, setActionType] = useState<string | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [actionDate, setActionDate] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolutionFiles, setResolutionFiles] = useState<File[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [selectedTechId, setSelectedTechId] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel>('HIGH');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && complaintId) {
      loadComplaint();
    }
  }, [isOpen, complaintId]);

  const loadComplaint = async () => {
    if (!complaintId) return;
    try {
      setLoading(true);
      const data = await api.complaints.get(complaintId);
      setComplaint(data);

      if (user?.role === 'ADMIN') {
        const meta = await api.complaints.getMetaOptions();
        setTechnicians(meta.technicians);
        if (meta.technicians.length > 0) setSelectedTechId(meta.technicians[0].id);
      }
    } catch (err) {
      console.error('Error fetching complaint details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !newComment.trim()) return;

    try {
      setSubmittingComment(true);
      await api.complaints.addComment(complaint.id, newComment.trim());
      setNewComment('');
      loadComplaint();
      if (onComplaintUpdated) onComplaintUpdated();
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Status transitions
  const executeStatusTransition = async (targetStatus: ComplaintStatus, payload: any = {}) => {
    if (!complaint) return;
    try {
      setActionLoading(true);
      setErrorMsg(null);
      await api.complaints.updateStatus(complaint.id, {
        status: targetStatus,
        ...payload,
      });
      setActionType(null);
      setActionReason('');
      setActionDate('');
      setResolutionNotes('');
      setResolutionFiles([]);
      loadComplaint();
      if (onComplaintUpdated) onComplaintUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Status transition failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Maintenance actions
  const handleAcceptAssignment = async () => {
    if (!complaint) return;
    try {
      setActionLoading(true);
      await api.maintenance.accept(complaint.id);
      loadComplaint();
      if (onComplaintUpdated) onComplaintUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to accept');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectAssignment = async () => {
    if (!complaint || !actionReason.trim()) {
      setErrorMsg('Please specify why this assignment is declined');
      return;
    }
    try {
      setActionLoading(true);
      await api.maintenance.reject(complaint.id, actionReason.trim());
      setActionType(null);
      setActionReason('');
      loadComplaint();
      if (onComplaintUpdated) onComplaintUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to decline');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveJob = async () => {
    if (!complaint || !resolutionNotes.trim()) {
      setErrorMsg('Detailed resolution notes are required');
      return;
    }
    try {
      setActionLoading(true);
      let uploadedUrls: string[] = [];
      if (resolutionFiles.length > 0) {
        uploadedUrls = await uploadMultipleImages(resolutionFiles);
      }
      await api.maintenance.resolve(complaint.id, {
        resolutionNotes: resolutionNotes.trim(),
        resolutionImages: uploadedUrls,
      });
      setActionType(null);
      setResolutionNotes('');
      setResolutionFiles([]);
      loadComplaint();
      if (onComplaintUpdated) onComplaintUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to complete resolution');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignTechnician = async () => {
    if (!complaint || !selectedTechId) return;
    try {
      setActionLoading(true);
      await api.complaints.assign(complaint.id, {
        assignedToId: selectedTechId,
        notes: actionReason.trim(),
      });
      setActionType(null);
      setActionReason('');
      loadComplaint();
      if (onComplaintUpdated) onComplaintUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to assign technician');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePriority = async () => {
    if (!complaint || !actionReason.trim()) {
      setErrorMsg('Justification reason is required to alter priority level');
      return;
    }
    try {
      setActionLoading(true);
      await api.complaints.updatePriority(complaint.id, {
        priority: selectedPriority,
        reason: actionReason.trim(),
      });
      setActionType(null);
      setActionReason('');
      loadComplaint();
      if (onComplaintUpdated) onComplaintUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update priority');
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        complaint ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-bold text-campus-600 bg-campus-50 px-2 py-0.5 rounded-md border border-campus-200">
              {complaint.ticketNumber}
            </span>
            <span className="text-slate-800 font-extrabold text-base truncate max-w-md">{complaint.title}</span>
          </div>
        ) : (
          'Loading Complaint...'
        )
      }
      maxWidth="max-w-4xl"
    >
      {loading || !complaint ? (
        <div className="py-16 text-center text-sm text-slate-400">Loading complaint details...</div>
      ) : (
        <div className="space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center justify-between">
              <span>{errorMsg}</span>
              <button onClick={() => setErrorMsg(null)} className="text-red-500 font-bold ml-2">
                ✕
              </button>
            </div>
          )}

          {/* Lifecycle Progress Bar */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200">
            <ProgressBar
              status={complaint.status}
              rejectionReason={complaint.rejectionReason}
              holdReason={complaint.holdReason}
              reopenReason={complaint.reopenReason}
            />
          </div>

          {/* Quick Badges & SLA Meta */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
              <SafetyRiskBadge risk={complaint.safetyRisk} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">SLA Target:</span>
              <SlaTimer
                deadline={complaint.slaDeadline}
                isOverdue={complaint.isOverdue}
                status={complaint.status}
                resolvedAt={complaint.resolvedAt}
              />
            </div>
          </div>

          {/* Two-Column Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left 2 Cols: Description, Location, Images, Resolution Info */}
            <div className="md:col-span-2 space-y-5">
              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Description</h4>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 whitespace-pre-wrap">
                  {complaint.description}
                </p>
              </div>

              {/* Location & Impact */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-400 font-semibold mb-1 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-campus-600" /> Building & Area
                  </div>
                  <div className="font-bold text-slate-800">{complaint.building?.name}</div>
                  <div className="text-slate-500">{complaint.locationDetails}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-400 font-semibold mb-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-campus-600" /> Category & Scope
                  </div>
                  <div className="font-bold text-slate-800">{complaint.category?.name}</div>
                  <div className="text-slate-500">
                    Scope: {complaint.affectedCount.replace('_', ' ')} • Severity: {complaint.severity}
                  </div>
                </div>
              </div>

              {/* Photos Gallery */}
              {complaint.images && complaint.images.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-slate-500" /> Issue Photos (Before)
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {complaint.images.map((img, i) => (
                      <a
                        key={i}
                        href={img}
                        target="_blank"
                        rel="noreferrer"
                        className="group relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 shadow-sm block hover:ring-2 hover:ring-campus-500"
                      >
                        <img src={img} alt="issue" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Resolution Info (if resolved/closed) */}
              {(complaint.resolutionNotes || (complaint.resolutionImages && complaint.resolutionImages.length > 0)) && (
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Resolution Details
                  </h4>
                  <p className="text-xs text-emerald-900 mt-1 whitespace-pre-wrap">{complaint.resolutionNotes}</p>
                  {complaint.resolutionImages && complaint.resolutionImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {complaint.resolutionImages.map((img, i) => (
                        <a key={i} href={img} target="_blank" rel="noreferrer" className="w-20 h-20 rounded-lg overflow-hidden border border-emerald-300 block">
                          <img src={img} alt="resolution" className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Role Action Buttons Bar */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Student / Faculty Actions */}
                  {(user?.role === 'STUDENT' || user?.role === 'FACULTY') && (
                    <>
                      {complaint.status === 'RESOLVED' && (
                        <>
                          <button
                            onClick={() => executeStatusTransition('CLOSED')}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Confirm & Close Issue
                          </button>
                          <button
                            onClick={() => setActionType('REOPEN')}
                            className="px-3.5 py-2 rounded-xl bg-pink-50 text-pink-700 border border-pink-300 hover:bg-pink-100 text-xs font-bold flex items-center gap-1.5"
                          >
                            <RefreshCw className="w-4 h-4" /> Issue Persists / Reopen
                          </button>
                        </>
                      )}
                    </>
                  )}

                  {/* Maintenance Actions */}
                  {user?.role === 'MAINTENANCE' && (
                    <>
                      {complaint.status === 'ASSIGNED' && (
                        <>
                          <button
                            onClick={handleAcceptAssignment}
                            disabled={actionLoading}
                            className="px-3.5 py-2 rounded-xl bg-campus-600 hover:bg-campus-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                          >
                            <Wrench className="w-4 h-4" /> Accept Task
                          </button>
                          <button
                            onClick={() => setActionType('DECLINE_MAINT')}
                            className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100 text-xs font-bold flex items-center gap-1.5"
                          >
                            <XCircle className="w-4 h-4" /> Decline Task
                          </button>
                        </>
                      )}

                      {['IN_PROGRESS', 'ON_HOLD', 'REOPENED'].includes(complaint.status) && (
                        <>
                          <button
                            onClick={() => setActionType('RESOLVE_JOB')}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Mark Work Complete
                          </button>
                          <button
                            onClick={() => setActionType('HOLD_JOB')}
                            className="px-3.5 py-2 rounded-xl bg-orange-50 text-orange-700 border border-orange-300 hover:bg-orange-100 text-xs font-bold flex items-center gap-1.5"
                          >
                            <PauseCircle className="w-4 h-4" /> Put On Hold
                          </button>
                        </>
                      )}
                    </>
                  )}

                  {/* Admin Actions */}
                  {user?.role === 'ADMIN' && (
                    <>
                      <button
                        onClick={() => setActionType('ASSIGN_TECH')}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 text-xs font-bold flex items-center gap-1"
                      >
                        <User className="w-3.5 h-3.5" /> Assign Tech
                      </button>
                      <button
                        onClick={() => setActionType('OVERRIDE_PRIORITY')}
                        className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 text-xs font-bold flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Change Priority
                      </button>
                      {complaint.status !== 'REJECTED' && complaint.status !== 'CLOSED' && (
                        <button
                          onClick={() => setActionType('REJECT_COMPLAINT')}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-bold flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* Sub-form action dialogs */}
                {actionType === 'REOPEN' && (
                  <div className="mt-3 p-3.5 bg-pink-50 border border-pink-200 rounded-xl space-y-2">
                    <label className="block text-xs font-bold text-pink-900">
                      Why does this issue persist? *
                    </label>
                    <textarea
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      placeholder="Explain what is still broken or what recurring behavior occurred..."
                      rows={2}
                      className="w-full text-xs p-2 rounded-lg border border-pink-300 bg-white"
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setActionType(null)} className="px-3 py-1 text-xs text-slate-600">
                        Cancel
                      </button>
                      <button
                        onClick={() => executeStatusTransition('REOPENED', { reopenReason: actionReason })}
                        disabled={actionLoading}
                        className="px-3 py-1 bg-pink-600 text-white rounded-lg text-xs font-bold"
                      >
                        Submit Reopen Request
                      </button>
                    </div>
                  </div>
                )}

                {actionType === 'DECLINE_MAINT' && (
                  <div className="mt-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                    <label className="block text-xs font-bold text-rose-900">
                      Reason for declining task *
                    </label>
                    <textarea
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      placeholder="e.g., Outside electrical scope; requires external HVAC contractor..."
                      rows={2}
                      className="w-full text-xs p-2 rounded-lg border border-rose-300 bg-white"
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setActionType(null)} className="px-3 py-1 text-xs text-slate-600">
                        Cancel
                      </button>
                      <button
                        onClick={handleRejectAssignment}
                        disabled={actionLoading}
                        className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold"
                      >
                        Confirm Decline
                      </button>
                    </div>
                  </div>
                )}

                {actionType === 'HOLD_JOB' && (
                  <div className="mt-3 p-3.5 bg-orange-50 border border-orange-200 rounded-xl space-y-2">
                    <label className="block text-xs font-bold text-orange-900">
                      Reason to place work On Hold *
                    </label>
                    <input
                      type="text"
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      placeholder="e.g., Awaiting spare motor delivery from distributor"
                      className="w-full text-xs p-2 rounded-lg border border-orange-300 bg-white"
                    />
                    <label className="block text-xs font-bold text-orange-900">Expected Restart Date (Optional)</label>
                    <input
                      type="date"
                      value={actionDate}
                      onChange={(e) => setActionDate(e.target.value)}
                      className="text-xs p-1.5 rounded-lg border border-orange-300 bg-white"
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setActionType(null)} className="px-3 py-1 text-xs text-slate-600">
                        Cancel
                      </button>
                      <button
                        onClick={() =>
                          executeStatusTransition('ON_HOLD', {
                            holdReason: actionReason,
                            expectedRestartDate: actionDate || undefined,
                          })
                        }
                        disabled={actionLoading}
                        className="px-3 py-1 bg-orange-600 text-white rounded-lg text-xs font-bold"
                      >
                        Set On Hold
                      </button>
                    </div>
                  </div>
                )}

                {actionType === 'RESOLVE_JOB' && (
                  <div className="mt-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                    <label className="block text-xs font-bold text-emerald-900">
                      Work Completion & Resolution Notes *
                    </label>
                    <textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Describe the repairs performed, parts replaced, and verification tests..."
                      rows={2}
                      className="w-full text-xs p-2 rounded-lg border border-emerald-300 bg-white"
                    />
                    <div>
                      <label className="block text-[11px] font-semibold text-emerald-800 mb-1">
                        Upload After-Repair Photos (Optional)
                      </label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => e.target.files && setResolutionFiles(Array.from(e.target.files))}
                        className="text-xs text-slate-500"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setActionType(null)} className="px-3 py-1 text-xs text-slate-600">
                        Cancel
                      </button>
                      <button
                        onClick={handleResolveJob}
                        disabled={actionLoading}
                        className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                      >
                        Mark As Completed
                      </button>
                    </div>
                  </div>
                )}

                {actionType === 'ASSIGN_TECH' && (
                  <div className="mt-3 p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2">
                    <label className="block text-xs font-bold text-indigo-900">Select Maintenance Personnel *</label>
                    <select
                      value={selectedTechId}
                      onChange={(e) => setSelectedTechId(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-indigo-300 bg-white"
                    >
                      {technicians.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.department || 'Maintenance'})
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      placeholder="Optional instruction or task note..."
                      className="w-full text-xs p-2 rounded-lg border border-indigo-300 bg-white"
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setActionType(null)} className="px-3 py-1 text-xs text-slate-600">
                        Cancel
                      </button>
                      <button
                        onClick={handleAssignTechnician}
                        disabled={actionLoading}
                        className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold"
                      >
                        Assign Task
                      </button>
                    </div>
                  </div>
                )}

                {actionType === 'OVERRIDE_PRIORITY' && (
                  <div className="mt-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                    <label className="block text-xs font-bold text-amber-900">New Priority Level *</label>
                    <select
                      value={selectedPriority}
                      onChange={(e) => setSelectedPriority(e.target.value as PriorityLevel)}
                      className="w-full text-xs p-2 rounded-lg border border-amber-300 bg-white font-bold"
                    >
                      <option value="CRITICAL">CRITICAL (4h SLA)</option>
                      <option value="HIGH">HIGH (24h SLA)</option>
                      <option value="MEDIUM">MEDIUM (72h SLA)</option>
                      <option value="LOW">LOW (168h SLA)</option>
                    </select>
                    <input
                      type="text"
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      placeholder="Mandatory administrative justification..."
                      className="w-full text-xs p-2 rounded-lg border border-amber-300 bg-white"
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setActionType(null)} className="px-3 py-1 text-xs text-slate-600">
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdatePriority}
                        disabled={actionLoading}
                        className="px-3 py-1 bg-amber-600 text-white rounded-lg text-xs font-bold"
                      >
                        Update Priority & Recalculate SLA
                      </button>
                    </div>
                  </div>
                )}

                {actionType === 'REJECT_COMPLAINT' && (
                  <div className="mt-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                    <label className="block text-xs font-bold text-rose-900">Reason for Rejection *</label>
                    <textarea
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      placeholder="e.g., Duplicate request; not within campus jurisdiction..."
                      rows={2}
                      className="w-full text-xs p-2 rounded-lg border border-rose-300 bg-white"
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setActionType(null)} className="px-3 py-1 text-xs text-slate-600">
                        Cancel
                      </button>
                      <button
                        onClick={() => executeStatusTransition('REJECTED', { rejectionReason: actionReason })}
                        disabled={actionLoading}
                        className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold"
                      >
                        Confirm Rejection
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right 1 Col: Metadata, Assigned Technician, Activity & Comments */}
            <div className="space-y-5 border-t md:border-t-0 md:border-l border-slate-200 md:pl-6">
              {/* Stakeholders Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Submitted By</span>
                  <span className="font-bold text-slate-800">{complaint.submittedBy?.name}</span>
                  <span className="text-slate-500 block text-[11px]">{complaint.submittedBy?.role} • {complaint.submittedBy?.department}</span>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Assigned Technician</span>
                  {complaint.assignedTo ? (
                    <div>
                      <span className="font-bold text-slate-800">{complaint.assignedTo.name}</span>
                      <span className="text-slate-500 block text-[11px]">{complaint.assignedTo.department || 'Maintenance'}</span>
                    </div>
                  ) : (
                    <span className="text-amber-600 font-semibold italic text-[11px]">Unassigned (Pending review)</span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Date Logged</span>
                  <span className="text-slate-600 font-medium">
                    {new Date(complaint.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Activity / Audit Trail */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" /> Audit Log
                </h4>
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {complaint.activities && complaint.activities.length > 0 ? (
                    complaint.activities.map((act) => (
                      <div key={act.id} className="text-xs p-2 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="flex items-center justify-between font-semibold text-slate-700">
                          <span>{act.actorName}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(act.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">{act.comments}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400">No activity recorded yet</div>
                  )}
                </div>
              </div>

              {/* Comments & Work Notes */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Discussion & Notes</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1 mb-2">
                  {complaint.comments && complaint.comments.length > 0 ? (
                    complaint.comments.map((cm) => (
                      <div key={cm.id} className="text-xs p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                        <div className="flex items-center justify-between font-semibold text-slate-800">
                          <span>{cm.user?.name} ({cm.user?.role})</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(cm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-1">{cm.comment}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 italic">No notes added yet</div>
                  )}
                </div>

                {/* Add Comment Input */}
                <form onSubmit={handleAddComment} className="flex gap-1.5">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment or work note..."
                    className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-campus-500"
                  />
                  <button
                    type="submit"
                    disabled={submittingComment || !newComment.trim()}
                    className="p-1.5 rounded-lg bg-campus-600 text-white disabled:opacity-50 hover:bg-campus-700 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
