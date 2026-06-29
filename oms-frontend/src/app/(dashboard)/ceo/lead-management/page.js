"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import ProtectedPage from "@/components/auth/ProtectedPage";
import { getLeads, createLead, updateLead, deleteLead } from "@/lib/api";
import {
  Trash2,
  Pencil,
  X,
  CheckCircle,
  Loader2,
  ChevronDown,
  Download,
  FileSpreadsheet,
  SlidersHorizontal,
  Plus,
  Clock,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const SOURCES = ["Referral", "Cold Call", "Website", "Social Media", "Email Campaign", "Walk-in", "Other"];

const DEFAULT_PIPELINE_STAGES = [
  { id: "Contacted", label: "CONTACTED", accent: "bg-blue-400" },
  { id: "Meeting", label: "MEETING", accent: "bg-amber-400" },
  { id: "Proposal", label: "PROPOSAL", accent: "bg-purple-400" },
  { id: "Close", label: "CLOSE", accent: "bg-green-400" },
  { id: "Lost", label: "LOST", accent: "bg-red-400" },
];

const DEFAULT_STATUSES = ["Contacted", "Meeting", "Proposal", "Close", "Lost"];

const DEFAULT_STATUS_COLORS = {
  New: "bg-blue-50 text-blue-700",
  Contacted: "bg-amber-50 text-amber-700",
  Meeting: "bg-purple-50 text-purple-700",
  Proposal: "bg-indigo-50 text-indigo-700",
  Close: "bg-green-50 text-green-700",
  Lost: "bg-red-50 text-red-700",
};

const COLOR_THEMES = [
  { name: "Blue", accent: "bg-blue-400", bg: "bg-blue-50 text-blue-700", dot: "bg-blue-500" },
  { name: "Amber", accent: "bg-amber-400", bg: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  { name: "Purple", accent: "bg-purple-400", bg: "bg-purple-50 text-purple-700", dot: "bg-purple-500" },
  { name: "Green", accent: "bg-green-400", bg: "bg-green-50 text-green-700", dot: "bg-green-500" },
  { name: "Red", accent: "bg-red-400", bg: "bg-red-50 text-red-700", dot: "bg-red-500" },
  { name: "Indigo", accent: "bg-indigo-400", bg: "bg-indigo-50 text-indigo-700", dot: "bg-indigo-500" },
  { name: "Teal", accent: "bg-teal-400", bg: "bg-teal-50 text-teal-700", dot: "bg-teal-500" },
  { name: "Pink", accent: "bg-pink-400", bg: "bg-pink-50 text-pink-700", dot: "bg-pink-500" }
];

const EMPTY_FORM = {
  projectName: "",
  designation: "",
  email: "",
  source: "Referral",
  phone: "",
  organization: "",
  address: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (diff < 1) return "just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KanbanCard({ lead, onEdit, onDelete, onStatusChange, deletingId, setDeletingId, statuses, statusColors }) {
  const initials = getInitials(lead.projectName);
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleStatusSelect = (status) => {
    onStatusChange(lead, status);
    setIsOpen(false);
  };

  const handleCardClick = (e) => {
    if (e.target.closest("button") || e.target.closest(".relative")) {
      return;
    }
    router.push(`/ceo/lead-management/${lead._id}`);
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData("text/plain", lead._id);
    e.dataTransfer.effectAllowed = "move";
  };

  const activeColor = statusColors[lead.status] || "bg-slate-100 text-slate-600";
  const isCustomColor = activeColor && !activeColor.startsWith("bg-");

  return (
    <div
      onClick={handleCardClick}
      draggable
      onDragStart={handleDragStart}
      className="bg-white border border-card-stroke rounded-lg p-3.5 space-y-2.5 group cursor-pointer hover:border-primary-button/30 hover:shadow-xs transition select-none"
    >
      {/* Header */}
      <div className="flex items-start gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-menu-fill text-[11px] font-bold text-primary-button">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-slate-800 truncate">{lead.projectName}</p>
          {lead.organization && (
            <p className="text-[11.5px] text-slate-400 truncate">{lead.organization}</p>
          )}
        </div>
      </div>

      {/* Assignee */}
      {lead.designation && (
        <div className="flex items-center gap-1.5 text-[11.5px] text-slate-500">
          <div className="h-4 w-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-600">
            {lead.designation[0]}
          </div>
          {lead.designation}
        </div>
      )}

      {/* Updated time */}
      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
        <Clock className="h-3 w-3 shrink-0" />
        Updated {timeAgo(lead.updatedAt)}
      </div>

      {/* Accent line (Process / Progress Bar) */}
      {(() => {
        const normalizedStatus = lead.status === "New" ? "Contacted" : lead.status;
        let progressPercent = 0;

        if (normalizedStatus.toLowerCase() !== "lost") {
          const activeStatuses = statuses.filter((s) => s.toLowerCase() !== "lost");
          const stageIndex = activeStatuses.indexOf(normalizedStatus);
          progressPercent = activeStatuses.length > 0 && stageIndex !== -1 
            ? Math.round(((stageIndex + 1) / activeStatuses.length) * 100) 
            : 20;
        }

        return (
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                isCustomColor ? "" :
                activeColor.includes("blue") ? "bg-blue-500" :
                activeColor.includes("amber") ? "bg-amber-500" :
                activeColor.includes("purple") ? "bg-purple-500" :
                activeColor.includes("indigo") ? "bg-indigo-500" :
                activeColor.includes("green") ? "bg-green-500" :
                activeColor.includes("red") ? "bg-red-500" :
                activeColor.includes("pink") ? "bg-pink-500" :
                activeColor.includes("teal") ? "bg-teal-500" :
                "bg-[#500072]"
              }`} 
              style={{ 
                width: `${progressPercent}%`,
                ...(isCustomColor ? { backgroundColor: activeColor } : {})
              }}
            />
          </div>
        );
      })()}

      {/* Footer */}
      <div className="flex items-center justify-between pt-0.5">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-1 rounded-[5px] pl-2 pr-1.5 py-0.5 text-[10.5px] font-semibold outline-none border-0 cursor-pointer ${isCustomColor ? "" : activeColor}`}
            style={isCustomColor ? {
              backgroundColor: activeColor + "1a",
              color: activeColor,
              border: `1px solid ${activeColor}20`
            } : undefined}
          >
            <span>{lead.status}</span>
            <ChevronDown className="h-3 w-3 opacity-80 shrink-0" />
          </button>

          {isOpen && (
            <div className="absolute left-0 bottom-full mb-1 z-30 min-w-[120px] rounded-lg border border-card-stroke bg-white py-1 shadow-md max-h-48 overflow-y-auto">
              {statuses.map((s) => {
                const isSelected = lead.status === s;
                return (
                  <button
                    key={s}
                    onClick={() => handleStatusSelect(s)}
                    className={`flex w-full cursor-pointer items-center px-2.5 py-1.5 text-[10.5px] font-semibold transition text-left ${
                      isSelected
                        ? "bg-[#f7effc] text-primary-button"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                    }`}
                  >
                    <span>{s}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(lead)}
            className="flex h-6 w-6 items-center justify-center rounded-[5px] text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <Pencil className="h-3 w-3" />
          </button>
          {deletingId === lead._id ? (
            <div className="flex items-center gap-1">
              <button onClick={() => onDelete(lead._id)} className="text-[10px] font-semibold text-red-600 hover:text-red-700 cursor-pointer">Del</button>
              <button onClick={() => setDeletingId(null)} className="text-[10px] font-semibold text-slate-400 cursor-pointer">×</button>
            </div>
          ) : (
            <button
              onClick={() => setDeletingId(lead._id)}
              className="flex h-6 w-6 items-center justify-center rounded-[5px] text-slate-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CEOLeadManagementPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  // Export filter state
  const [exportDateRange, setExportDateRange] = useState("");
  const [exportStatus, setExportStatus] = useState("all");
  const [exportAgent, setExportAgent] = useState("all");

  // Dynamic Pipeline Stages State
  const [pipelineStages, setPipelineStages] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("lead_pipeline_stages");
      if (saved) return JSON.parse(saved);
    }
    return DEFAULT_PIPELINE_STAGES;
  });

  const [statuses, setStatuses] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("lead_pipeline_statuses");
      if (saved) return JSON.parse(saved);
    }
    return DEFAULT_STATUSES;
  });

  const [statusColors, setStatusColors] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("lead_pipeline_status_colors");
      if (saved) return JSON.parse(saved);
    }
    return DEFAULT_STATUS_COLORS;
  });

  const [showStageModal, setShowStageModal] = useState(false);
  const [newStageName, setNewStageName] = useState("");
  const [newStageColor, setNewStageColor] = useState(COLOR_THEMES[0]);
  const [customColorHex, setCustomColorHex] = useState("#500072");

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem("lead_pipeline_stages", JSON.stringify(pipelineStages));
  }, [pipelineStages]);

  useEffect(() => {
    localStorage.setItem("lead_pipeline_statuses", JSON.stringify(statuses));
  }, [statuses]);

  useEffect(() => {
    localStorage.setItem("lead_pipeline_status_colors", JSON.stringify(statusColors));
  }, [statusColors]);

  const isDefaultStage = (id) => ["Contacted", "Meeting", "Proposal", "Close", "Lost"].includes(id);

  const handleAddStage = (e) => {
    e.preventDefault();
    const cleanName = newStageName.trim();
    if (!cleanName) {
      setError("Stage name cannot be empty.");
      return;
    }
    
    // Capitalize first letter of name
    const stageId = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    if (pipelineStages.some((s) => s.id.toLowerCase() === stageId.toLowerCase())) {
      setError("A stage with this name already exists.");
      return;
    }

    const isCustom = newStageColor.name === "Custom";
    const bgVal = isCustom ? customColorHex : newStageColor.bg;
    const accentVal = isCustom ? "" : newStageColor.accent;

    const newStage = {
      id: stageId,
      label: cleanName.toUpperCase(),
      accent: accentVal,
      colorHex: isCustom ? customColorHex : undefined,
    };

    setPipelineStages((prev) => [...prev, newStage]);
    setStatuses((prev) => [...prev, stageId]);
    setStatusColors((prev) => ({
      ...prev,
      [stageId]: bgVal,
    }));

    setNewStageName("");
    setNewStageColor(COLOR_THEMES[0]);
    setShowStageModal(false);
    setSuccessMsg("New stage added successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleDeleteStage = (stageId) => {
    const count = leads.filter((l) => l.status === stageId).length;
    if (count > 0) {
      setError(`Cannot delete stage "${stageId}" because it contains leads.`);
      setTimeout(() => setError(""), 4000);
      return;
    }

    setPipelineStages((prev) => prev.filter((s) => s.id !== stageId));
    setStatuses((prev) => prev.filter((s) => s !== stageId));
    setSuccessMsg("Stage deleted successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getLeads();
      setLeads(data.leads || []);
    } catch {
      setError("Failed to fetch leads.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleFormChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.projectName.trim()) {
      setError("Project name is required.");
      return;
    }
    try {
      setSubmitting(true);
      setError("");
      if (editingId) {
        await updateLead(editingId, form);
        setSuccessMsg("Lead updated successfully.");
      } else {
        await createLead(form);
        setSuccessMsg("Lead saved successfully.");
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
      fetchLeads();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to save lead.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (lead) => {
    setForm({
      projectName: lead.projectName || "",
      designation: lead.designation || "",
      email: lead.email || "",
      source: lead.source || "Referral",
      phone: lead.phone || "",
      organization: lead.organization || "",
      address: lead.address || "",
    });
    setEditingId(lead._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    try {
      await deleteLead(id);
      setLeads((prev) => prev.filter((l) => l._id !== id));
      setDeletingId(null);
    } catch {
      setError("Failed to delete lead.");
    }
  };

  const handleClear = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError("");
  };

  const handleStatusChange = async (lead, newStatus) => {
    try {
      await updateLead(lead._id, { status: newStatus });
      setLeads((prev) =>
        prev.map((l) => (l._id === lead._id ? { ...l, status: newStatus } : l))
      );
    } catch {
      setError("Failed to update status.");
    }
  };

  const handleCardDrop = async (leadId, newStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l._id === leadId ? { ...l, status: newStatus } : l))
    );
    try {
      await updateLead(leadId, { status: newStatus });
    } catch {
      setError("Failed to update status on drop.");
      fetchLeads();
    }
  };

  const pipelineLeads = pipelineStages.map((stage) => ({
    ...stage,
    leads: leads.filter((l) =>
      stage.id === "Contacted"
        ? (l.status === "Contacted" || l.status === "New")
        : l.status === stage.id
    ),
  }));

  return (
    <ProtectedPage allowedRole="CEO, BDE, Sales Head">
      <div className="space-y-10 pb-16">

        {/* ── Success Banner ── */}
        {successMsg && (
          <div className="flex items-center gap-3 rounded-[5px] bg-green-50 border border-green-200 px-4 py-3 text-[13px] font-medium text-green-700">
            <CheckCircle className="h-4 w-4 shrink-0" />
            {successMsg}
          </div>
        )}

        {/* ── Error Banner ── */}
        {error && (
          <div className="flex items-center justify-between rounded-[5px] bg-red-50 border border-red-200 px-4 py-3 text-[13px] font-medium text-red-600">
            <span>{error}</span>
            <button onClick={() => setError("")} className="cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════
            SECTION 1: Add / Edit Lead Form
        ══════════════════════════════════════════ */}
        <div>
          <div className="mb-5">
            <h2 className="text-[17px] font-bold text-primary-text">
              {editingId ? "Edit Lead" : "Add New Lead"}
            </h2>
            <p className="text-[13px] text-secondary-text mt-0.5">
              {editingId ? "Update client and project details" : "Enter client and project details"}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Project Name</label>
                <input name="projectName" value={form.projectName} onChange={handleFormChange} placeholder="e.g. Website Redesign 2024" className="w-full rounded-lg border border-card-stroke bg-white px-4 py-2.5 text-[13.5px] text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary-button focus:ring-1 focus:ring-primary-button/20 transition" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Designation</label>
                <input name="designation" value={form.designation} onChange={handleFormChange} placeholder="e.g. Marketing Head" className="w-full rounded-lg border border-card-stroke bg-white px-4 py-2.5 text-[13.5px] text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary-button focus:ring-1 focus:ring-primary-button/20 transition" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 mt-5">
              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Email</label>
                <input name="email" type="email" value={form.email} onChange={handleFormChange} placeholder="client@organization.com" className="w-full rounded-lg border border-card-stroke bg-white px-4 py-2.5 text-[13.5px] text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary-button focus:ring-1 focus:ring-primary-button/20 transition" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Source</label>
                <div className="relative">
                  <select name="source" value={form.source} onChange={handleFormChange} className="w-full appearance-none rounded-lg border border-card-stroke bg-white px-4 py-2.5 text-[13.5px] text-slate-800 outline-none focus:border-primary-button focus:ring-1 focus:ring-primary-button/20 transition cursor-pointer">
                    {SOURCES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 mt-5">
              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Phone</label>
                <input name="phone" value={form.phone} onChange={handleFormChange} placeholder="+1 (555) 000-0000" className="w-full rounded-lg border border-card-stroke bg-white px-4 py-2.5 text-[13.5px] text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary-button focus:ring-1 focus:ring-primary-button/20 transition" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Organization</label>
                <input name="organization" value={form.organization} onChange={handleFormChange} placeholder="e.g. Acme Corp" className="w-full rounded-lg border border-card-stroke bg-white px-4 py-2.5 text-[13.5px] text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary-button focus:ring-1 focus:ring-primary-button/20 transition" />
              </div>
            </div>

            <div className="mt-5">
              <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Address</label>
              <input name="address" value={form.address} onChange={handleFormChange} placeholder="Full street address" className="w-full rounded-lg border border-card-stroke bg-white px-4 py-2.5 text-[13.5px] text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary-button focus:ring-1 focus:ring-primary-button/20 transition" />
            </div>

            <div className="mt-7 flex items-center gap-3">
              <button type="submit" disabled={submitting} className="flex items-center gap-2 rounded-lg bg-primary-button px-6 py-2.5 text-[13px] font-semibold text-white transition hover:opacity-95 disabled:opacity-60 cursor-pointer">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingId ? "Update Lead" : "Save Lead"}
              </button>
              <button type="button" onClick={handleClear} className="rounded-lg border border-card-stroke bg-white px-6 py-2.5 text-[13px] font-semibold text-secondary-text transition hover:bg-slate-50 cursor-pointer">
                Clear Form
              </button>
              {editingId && (
                <button type="button" onClick={handleClear} className="rounded-lg border border-card-stroke bg-white px-6 py-2.5 text-[13px] font-semibold text-secondary-text transition hover:bg-slate-50 cursor-pointer">
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        {/* ══════════════════════════════════════════
            SECTION 2: Lead Export
        ══════════════════════════════════════════ */}
        <div className="rounded-xl border border-card-stroke bg-white p-6 shadow-xs">
          {/* Header row */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-[15px] font-bold text-primary-text">Lead Export</h3>
              <p className="text-[12.5px] text-secondary-text mt-0.5">Filter and generate detailed status reports.</p>
            </div>
            <button className="flex items-center gap-2 rounded-lg border border-card-stroke bg-white px-4 py-2 text-[12.5px] font-semibold text-secondary-text hover:bg-slate-50 transition cursor-pointer">
              <Download className="h-3.5 w-3.5" />
              Download PDF
            </button>
          </div>

          {/* Inner filters border box */}
          <div className="rounded-xl border border-card-stroke bg-[#fafafa] p-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-wrap items-end gap-4 flex-1">
              {/* Date Range */}
              <div className="flex flex-col gap-1.5 flex-1 min-w-[200px] max-w-[280px]">
                <label className="text-[12px] font-medium text-secondary-text">Date Range</label>
                <div className="flex h-10 items-center gap-2 rounded-lg border border-card-stroke bg-white px-3.5 w-full">
                  <svg className="h-3.5 w-3.5 shrink-0 text-secondary-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  <input
                    type="text"
                    value={exportDateRange}
                    onChange={(e) => setExportDateRange(e.target.value)}
                    placeholder="mm/dd/yyyy"
                    className="flex-1 bg-transparent text-[12.5px] text-primary-text placeholder:text-search-text outline-none"
                  />
                </div>
              </div>

              {/* Lead Status */}
              <div className="flex flex-col gap-1.5 flex-1 min-w-[200px] max-w-[280px]">
                <label className="text-[12px] font-medium text-secondary-text">Lead Status</label>
                <div className="relative w-full">
                  <select value={exportStatus} onChange={(e) => setExportStatus(e.target.value)} className="h-10 w-full appearance-none rounded-lg border border-card-stroke bg-white pl-3.5 pr-8 text-[12.5px] text-primary-text outline-none cursor-pointer">
                    <option value="all">All Statuses</option>
                    {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-secondary-text" />
                </div>
              </div>
            </div>

            {/* Generate Excel Button */}
            <button className="flex h-10 items-center gap-2 rounded-lg bg-primary-button px-5 text-[12.5px] font-semibold text-white hover:opacity-95 transition cursor-pointer md:self-end">
              Generate Excel
              <Download className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            SECTION 3: Lead Pipeline (Kanban)
        ══════════════════════════════════════════ */}
        <div>
          {/* Section Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-[17px] font-bold text-primary-text">Lead Pipeline</h3>
                <span className="rounded-lg bg-menu-fill px-2.5 py-0.5 text-[11px] font-bold text-primary-button tracking-wide">
                  {leads.length} TOTAL LEADS
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="h-2 w-2 rounded-full bg-green-400" />
                <p className="text-[12.5px] text-secondary-text">Monitor lead progress across every business stage.</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-card-stroke bg-white text-secondary-text hover:bg-slate-50 transition cursor-pointer">
                <SlidersHorizontal className="h-4 w-4" />
              </button>
              <button onClick={() => setShowStageModal(true)} className="flex items-center gap-1.5 rounded-lg bg-primary-button px-4 py-2 text-[12.5px] font-semibold text-white hover:opacity-95 transition cursor-pointer">
                <Plus className="h-3.5 w-3.5" />
                New Stage
              </button>
            </div>
          </div>

          {/* Kanban columns */}
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span className="text-[13px]">Loading pipeline…</span>
            </div>
          ) : (
            <div className="flex gap-5 overflow-x-auto pb-4 w-full scrollbar-thin scrollbar-thumb-slate-200">
              {pipelineLeads.map((stage) => (
                <div key={stage.id} className="flex flex-col gap-3 min-w-[220px] md:min-w-[240px] flex-1">
                  {/* Column Header */}
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span className="text-[11.5px] font-bold tracking-wider text-slate-500 truncate">{stage.label}</span>
                      <span className="rounded-[5px] bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                        {stage.leads.length.toString().padStart(2, "0")}
                      </span>
                    </div>
                    {!isDefaultStage(stage.id) && stage.leads.length === 0 && (
                      <button
                        onClick={() => handleDeleteStage(stage.id)}
                        className="text-slate-350 hover:text-red-500 transition cursor-pointer p-0.5 rounded hover:bg-slate-100"
                        title="Delete custom stage"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  {/* Accent line */}
                  <div className={`h-0.5 w-full rounded-full ${stage.accent}`} style={stage.colorHex ? { backgroundColor: stage.colorHex } : undefined} />

                  {/* Cards drop zone */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      const leadId = e.dataTransfer.getData("text/plain");
                      if (leadId) {
                        handleCardDrop(leadId, stage.id);
                      }
                      setDragOverStage(null);
                    }}
                    onDragEnter={() => setDragOverStage(stage.id)}
                    onDragLeave={() => setDragOverStage(null)}
                    className={`flex flex-col gap-3 min-h-[250px] rounded-xl p-1.5 transition-all duration-200 ${
                      dragOverStage === stage.id ? "bg-[#f8fafc] border border-dashed border-primary-button/30 shadow-2xs" : ""
                    }`}
                  >
                    {stage.leads.length === 0 ? (
                      <div className="rounded-[5px] border border-dashed border-[#e2e8f0] p-4 text-center text-[11.5px] text-slate-400">
                        No leads
                      </div>
                    ) : (
                      stage.leads.map((lead) => (
                        <KanbanCard
                          key={lead._id}
                          lead={lead}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onStatusChange={handleStatusChange}
                          deletingId={deletingId}
                          setDeletingId={setDeletingId}
                          statuses={statuses}
                          statusColors={statusColors}
                        />
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ─── New Stage Modal ─── */}
          {showStageModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs animate-fadeIn">
              <div className="bg-white border border-[#edf2f7] rounded-[20px] p-8 w-full max-w-md shadow-lg relative mx-4 animate-scaleUp">
                <button
                  onClick={() => setShowStageModal(false)}
                  className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
                
                <h3 className="text-[17px] font-bold text-slate-800 mb-2">Add Pipeline Stage</h3>
                <p className="text-[12.5px] text-slate-400 mb-6">Create a custom status column to track business leads.</p>
                
                <form onSubmit={handleAddStage} className="space-y-6">
                  <div>
                    <label className="block text-[13px] font-semibold text-[#4a5568] mb-1.5">Stage Name</label>
                    <input
                      type="text"
                      required
                      value={newStageName}
                      onChange={(e) => setNewStageName(e.target.value)}
                      placeholder="e.g. Negotiation"
                      className="w-full rounded-xl border border-[#cbd5e1] bg-white px-4 py-2.5 text-sm text-[#1a202c] placeholder:text-slate-400 outline-none focus:border-[#500072] focus:ring-1 focus:ring-[#500072]/20 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-[#4a5568] mb-2.5">Theme Color</label>
                    <div className="grid grid-cols-4 gap-3">
                      {COLOR_THEMES.map((theme) => {
                        const isSelected = newStageColor.name === theme.name;
                        return (
                          <button
                            key={theme.name}
                            type="button"
                            onClick={() => {
                              setNewStageColor(theme);
                            }}
                            className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition cursor-pointer ${
                              isSelected ? "border-[#500072] bg-[#500072]/5" : "border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            <span className={`h-4.5 w-4.5 rounded-full ${theme.dot}`} />
                            <span className="text-[10px] font-semibold text-slate-500">{theme.name}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Color Option */}
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setNewStageColor({ name: "Custom", accent: "", bg: customColorHex });
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${
                          newStageColor.name === "Custom" ? "border-[#500072] bg-[#500072]/5" : "border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span 
                            className="h-5 w-5 rounded-full border border-slate-350 shadow-2xs" 
                            style={{ backgroundColor: customColorHex }} 
                          />
                          <span className="text-xs font-semibold text-slate-700">Custom Color</span>
                        </div>
                        <span className="text-xs font-semibold text-[#500072] bg-[#500072]/10 px-2 py-0.5 rounded-[5px]">
                          {newStageColor.name === "Custom" ? "Selected" : "Select"}
                        </span>
                      </button>

                      {newStageColor.name === "Custom" && (
                        <div className="bg-slate-50 border border-[#edf2f7] rounded-xl p-4 mt-3 animate-fadeIn flex flex-col gap-2">
                          <label className="block text-[12px] font-semibold text-slate-500">Pick Custom Color</label>
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-9 rounded-lg overflow-hidden border border-slate-300 bg-white">
                              <input
                                type="color"
                                value={customColorHex}
                                onChange={(e) => {
                                  const hexVal = e.target.value;
                                  setCustomColorHex(hexVal);
                                  setNewStageColor({
                                    name: "Custom",
                                    accent: "",
                                    bg: hexVal
                                  });
                                }}
                                className="absolute inset-0 w-full h-full p-0 border-none cursor-pointer scale-120 origin-center"
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-700 tracking-wide uppercase bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg shadow-2xs">
                              {customColorHex}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowStageModal(false)}
                      className="px-5 py-2.5 rounded-xl border border-[#cbd5e1] bg-white text-xs font-semibold text-[#4a5568] hover:bg-slate-50 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-primary-button text-xs font-semibold text-white hover:opacity-95 transition cursor-pointer"
                    >
                      Add Stage
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

      </div>
    </ProtectedPage>
  );
}
