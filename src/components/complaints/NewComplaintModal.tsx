import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { api, uploadMultipleImages } from '../../lib/api';
import { Category, Building, PriorityLevel, SafetyRiskLevel, SeverityLevel, AffectedCountLevel } from '../../types';
import {
  Upload,
  AlertTriangle,
  ShieldAlert,
  Info,
  CheckCircle2,
  X,
  Sparkles,
  Zap,
  Droplets,
  Wifi,
  Sparkle,
  Home,
  GraduationCap,
  Wrench,
} from 'lucide-react';

interface NewComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (complaint: any) => void;
}

export const NewComplaintModal: React.FC<NewComplaintModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loadingMeta, setLoadingMeta] = useState<boolean>(true);

  // Form State
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [buildingId, setBuildingId] = useState('');
  const [locationDetails, setLocationDetails] = useState('');
  const [description, setDescription] = useState('');
  const [safetyRisk, setSafetyRisk] = useState<SafetyRiskLevel>('NONE');
  const [severity, setSeverity] = useState<SeverityLevel>('MODERATE');
  const [affectedCount, setAffectedCount] = useState<AffectedCountLevel>('INDIVIDUAL');
  
  // Image Upload State
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Live Priority Engine Preview
  const [previewPriority, setPreviewPriority] = useState<{ priority: PriorityLevel; score: number; slaHours: number }>({
    priority: 'MEDIUM',
    score: 25,
    slaHours: 72,
  });

  useEffect(() => {
    if (isOpen) {
      loadMetadata();
    }
  }, [isOpen]);

  const loadMetadata = async () => {
    try {
      setLoadingMeta(true);
      const data = await api.complaints.getMetaOptions();
      setCategories(data.categories);
      setBuildings(data.buildings);
      if (data.categories.length > 0) setCategoryId(data.categories[0].id);
      if (data.buildings.length > 0) setBuildingId(data.buildings[0].id);
    } catch (err) {
      console.error('Error fetching meta:', err);
    } finally {
      setLoadingMeta(false);
    }
  };

  // Recalculate live smart priority preview on user input changes
  useEffect(() => {
    let safetyScore = safetyRisk === 'IMMEDIATE_DANGER' ? 45 : safetyRisk === 'HAZARD' ? 25 : 0;
    let severityScore =
      severity === 'CATASTROPHIC' ? 35 : severity === 'MAJOR' ? 25 : severity === 'MODERATE' ? 15 : 5;
    let affectedScore =
      affectedCount === 'CAMPUS_WIDE'
        ? 25
        : affectedCount === 'BUILDING_WIDE'
        ? 18
        : affectedCount === 'GROUP'
        ? 10
        : 2;

    const selectedBuilding = buildings.find((b) => b.id === buildingId);
    const locationScore = selectedBuilding?.isCritical ? 15 : 0;

    const totalScore = safetyScore + severityScore + affectedScore + locationScore;

    let priority: PriorityLevel = 'LOW';
    let slaHours = 168;

    if (safetyRisk === 'IMMEDIATE_DANGER' || totalScore >= 75) {
      priority = 'CRITICAL';
      slaHours = 4;
    } else if (totalScore >= 45) {
      priority = 'HIGH';
      slaHours = 24;
    } else if (totalScore >= 22) {
      priority = 'MEDIUM';
      slaHours = 72;
    } else {
      priority = 'LOW';
      slaHours = 168;
    }

    setPreviewPriority({ priority, score: totalScore, slaHours });
  }, [safetyRisk, severity, affectedCount, buildingId, buildings]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArr]);

      const newPreviews = filesArr.map((f) => URL.createObjectURL(f));
      setPreviewUrls((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim() || title.length < 5) {
      setErrorMsg('Please enter a descriptive title (at least 5 characters)');
      return;
    }
    if (!locationDetails.trim()) {
      setErrorMsg('Please specify the room, floor, or landmark');
      return;
    }
    if (!description.trim() || description.length < 10) {
      setErrorMsg('Please provide detailed information (at least 10 characters)');
      return;
    }

    try {
      setIsSubmitting(true);

      // Upload images if any
      let uploadedImageUrls: string[] = [];
      if (selectedFiles.length > 0) {
        uploadedImageUrls = await uploadMultipleImages(selectedFiles);
      }

      const res = await api.complaints.create({
        title: title.trim(),
        description: description.trim(),
        categoryId,
        buildingId,
        locationDetails: locationDetails.trim(),
        safetyRisk,
        severity,
        affectedCount,
        images: uploadedImageUrls,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setLocationDetails('');
      setSelectedFiles([]);
      setPreviewUrls([]);
      onSuccess(res.complaint);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Campus Maintenance Request"
      subtitle="Fill in the details below. Our smart priority engine automatically computes SLA deadlines."
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Complaint Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Water leakage in Room 302 ceiling"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-campus-500 focus:border-campus-500 placeholder:text-slate-400"
            required
          />
        </div>

        {/* Category & Building Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Category *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-campus-500 bg-white"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (SLA: {c.slaHours}h)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Campus Building / Facility *
            </label>
            <select
              value={buildingId}
              onChange={(e) => setBuildingId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-campus-500 bg-white"
            >
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code}) {b.isCritical ? '★ Critical Asset' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Location Details */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Exact Location Details *
          </label>
          <input
            type="text"
            value={locationDetails}
            onChange={(e) => setLocationDetails(e.target.value)}
            placeholder="e.g., Floor 3, Room 304, Near East Emergency Stairwell"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-campus-500 placeholder:text-slate-400"
            required
          />
        </div>

        {/* Detailed Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Detailed Problem Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Describe the issue clearly, when it started, and any symptoms or immediate impact..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-campus-500 placeholder:text-slate-400 resize-none"
            required
          />
        </div>

        {/* Smart Priority Matrix Section */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-campus-600" />
              Smart Priority Assessment Engine
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Predicted Priority:</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                  previewPriority.priority === 'CRITICAL'
                    ? 'bg-red-100 text-red-800 border border-red-300'
                    : previewPriority.priority === 'HIGH'
                    ? 'bg-orange-100 text-orange-800 border border-orange-300'
                    : previewPriority.priority === 'MEDIUM'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}
              >
                {previewPriority.priority} ({previewPriority.slaHours}h SLA)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* Safety Risk */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Safety & Health Risk
              </label>
              <select
                value={safetyRisk}
                onChange={(e) => setSafetyRisk(e.target.value as SafetyRiskLevel)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white font-medium focus:ring-1 focus:ring-campus-500"
              >
                <option value="NONE">None / Standard</option>
                <option value="HAZARD">Slip / Trip / Mild Hazard</option>
                <option value="IMMEDIATE_DANGER">🚨 Immediate Danger (Sparks, Gas, Collapse)</option>
              </select>
            </div>

            {/* Severity */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Problem Severity
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white font-medium focus:ring-1 focus:ring-campus-500"
              >
                <option value="MINOR">Minor (Aesthetic/Low impact)</option>
                <option value="MODERATE">Moderate (Partially functional)</option>
                <option value="MAJOR">Major (Service stopped)</option>
                <option value="CATASTROPHIC">Catastrophic (Total outage)</option>
              </select>
            </div>

            {/* Affected Count */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Estimated People Affected
              </label>
              <select
                value={affectedCount}
                onChange={(e) => setAffectedCount(e.target.value as AffectedCountLevel)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white font-medium focus:ring-1 focus:ring-campus-500"
              >
                <option value="INDIVIDUAL">Individual (1 - 5 persons)</option>
                <option value="GROUP">Group / Class (5 - 50 persons)</option>
                <option value="BUILDING_WIDE">Building-wide (50 - 500)</option>
                <option value="CAMPUS_WIDE">Campus-wide (500+ students)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Image Attachment */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Complaint Photos (Optional)
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-campus-500 bg-white hover:bg-campus-50/50 cursor-pointer text-xs font-semibold text-slate-700 transition-colors">
              <Upload className="w-4 h-4 text-campus-600" />
              <span>Choose Photos</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <span className="text-[11px] text-slate-400">PNG, JPG, WebP up to 10MB</span>
          </div>

          {previewUrls.length > 0 && (
            <div className="flex flex-wrap gap-2.5 mt-3">
              {previewUrls.map((url, idx) => (
                <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 group">
                  <img src={url} alt="upload preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="absolute top-1 right-1 p-0.5 rounded-full bg-slate-900/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-campus-600 hover:bg-campus-700 text-white text-xs font-bold tracking-wide shadow-md shadow-campus-600/20 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isSubmitting ? 'Evaluating & Submitting...' : 'Submit Complaint'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
