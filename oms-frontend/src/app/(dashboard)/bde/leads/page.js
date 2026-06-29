"use client";

import React, { useState, useEffect, useCallback } from "react";
import ProtectedPage from "@/components/auth/ProtectedPage";
import { getLeads, createLead, updateLead, deleteLead } from "@/lib/api";
import {
  Plus,
  Search,
  Clock,
  Pencil,
  Trash2,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Filter,
  Users
} from "lucide-react";

// --- Constants ---
const SOURCES = ["Referral", "Cold Call", "Website", "Social Media", "Email Campaign", "Walk-in", "Other"];
const PRIORITIES = ["Low", "Medium", "High"];

const PIPELINE_STAGES = [
  { id: "Contacted", label: "CONTACTED", accent: "bg-blue-400", border: "border-blue-100" },
  { id: "Meeting", label: "MEETING", accent: "bg-amber-400", border: "border-amber-100" },
  { id: "Proposal", label: "PROPOSAL", accent: "bg-purple-400", border: "border-purple-100" },
  { id: "Close", label: "CLOSE (WON)", accent: "bg-green-400", border: "border-green-100" },
  { id: "Lost", label: "LOST", accent: "bg-red-400", border: "border-red-100" },
];

const STAGE_COLORS = {
  Contacted: "bg-blue-50 text-blue-700 border-blue-100",
  Meeting: "bg-amber-50 text-amber-700 border-amber-100",
  Proposal: "bg-purple-50 text-purple-700 border-purple-100",
  Close: "bg-green-50 text-green-700 border-green-100",
  Lost: "bg-red-50 text-red-700 border-red-100",
};

const EMPTY_FORM = {
  projectName: "",
  organization: "",
  phone: "",
  email: "",
  designation: "",
  address: "",
  source: "Referral",
  priority: "Medium",
  status: "Contacted"
};

// --- Helpers ---
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

export default function BDELeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [draggedOverStage, setDraggedOverStage] = useState(null);

  // Form / Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchLeadsData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getLeads();
      setLeads(data.leads || []);
    } catch (err) {
      console.error("Error fetching leads:", err);
      setError("Failed to load sales pipeline leads.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeadsData();
  }, [fetchLeadsData]);

  // Form Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenAddModal = () => {
    setEditingLead(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowModal(true);
  };

  const handleOpenEditModal = (lead) => {
    setEditingLead(lead);
    setForm({
      projectName: lead.projectName || "",
      organization: lead.organization || "",
      phone: lead.phone || "",
      email: lead.email || "",
      designation: lead.designation || "",
      address: lead.address || "",
      source: lead.source || "Referral",
      priority: lead.priority || "Medium",
      status: lead.status || "Contacted"
    });
    setError("");
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.projectName.trim()) {
      setError("Project / Lead Name is required.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      if (editingLead) {
        // Edit flow
        await updateLead(editingLead._id, form);
        setSuccessMsg("Lead details updated successfully!");
      } else {
        // Create flow
        await createLead(form);
        setSuccessMsg("New lead added to sales pipeline!");
      }

      fetchLeadsData();
      setShowModal(false);
      setForm(EMPTY_FORM);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to save lead details.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLead = async (id) => {
    try {
      setError("");
      await deleteLead(id);
      setSuccessMsg("Lead deleted successfully.");
      setDeletingId(null);
      fetchLeadsData();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError("Failed to delete lead from database.");
    }
  };

  // Drag and Drop Pipeline Handlers
  const handleDragStart = (e, leadId) => {
    e.dataTransfer.setData("text/plain", leadId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleCardDrop = async (leadId, targetStage) => {
    // Find local lead
    const targetLead = leads.find((l) => l._id === leadId);
    if (!targetLead) return;

    if (targetLead.status === targetStage) return;

    // Update locally first for instant feedback
    setLeads((prev) =>
      prev.map((l) => (l._id === leadId ? { ...l, status: targetStage, updatedAt: new Date().toISOString() } : l))
    );

    try {
      await updateLead(leadId, { status: targetStage });
      setSuccessMsg(`Status updated to ${targetStage}`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError("Failed to update status in backend database.");
      fetchLeadsData(); // revert
    }
  };

  // Filtering Logic
  const filteredLeads = leads.filter((lead) => {
    if (priorityFilter !== "all" && lead.priority !== priorityFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = lead.projectName?.toLowerCase().includes(q);
      const orgMatch = lead.organization?.toLowerCase().includes(q);
      const emailMatch = lead.email?.toLowerCase().includes(q);
      if (!nameMatch && !orgMatch && !emailMatch) return false;
    }
    return true;
  });

  // Group filtered leads by stage
  const pipelineStages = PIPELINE_STAGES.map((stage) => {
    return {
      ...stage,
      leads: filteredLeads.filter((l) => l.status === stage.id),
    };
  });

  return (
    <ProtectedPage allowedRole="BDE" title="BDE Sales Pipeline">
      <div className="space-y-6 pb-16">
        
        {/* Header and Add Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">My Sales Pipeline</h2>
            <p className="text-xs text-slate-400 font-medium">Track your prospective leads, qualification stages, and customer onboarding.</p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-1.5 self-start md:self-auto px-5 py-2.5 rounded-xl bg-[#500072] text-xs font-semibold text-white hover:bg-[#3d0057] transition shadow-sm cursor-pointer outline-none border-none"
          >
            <Plus className="h-4 w-4" />
            Add New Lead
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="flex w-full items-center gap-3 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-[13px] font-medium text-green-700 animate-fadeIn">
            <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
            {successMsg}
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="flex w-full items-center justify-between rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-[13px] font-medium text-red-600 animate-fadeIn">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError("")} className="cursor-pointer text-red-500 hover:text-red-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Filters Panel */}
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search leads by name, organization, or email..."
                className="w-full rounded-xl border border-[#cbd5e1] bg-white pl-10 pr-4 py-2.5 text-xs text-[#1a202c] placeholder:text-slate-400 outline-none focus:border-[#500072] transition"
              />
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                Priority:
              </span>
              <div className="relative">
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="appearance-none rounded-xl border border-[#cbd5e1] bg-white pl-3.5 pr-8 py-2 text-xs text-slate-700 outline-none focus:border-[#500072] cursor-pointer"
                >
                  <option value="all">All Priorities</option>
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>

          </div>
        </div>

        {/* Pipeline Board (Kanban Column Scroll) */}
        {loading ? (
          <div className="flex h-[35vh] items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-[#500072]" />
              <span className="text-xs font-semibold text-slate-400">Loading sales pipeline...</span>
            </div>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-6 w-full scrollbar-thin scrollbar-thumb-slate-200">
            {pipelineStages.map((stage) => {
              const isOver = draggedOverStage === stage.id;
              return (
                <div key={stage.id} className="flex flex-col min-w-[240px] md:min-w-[260px] flex-1 bg-slate-50/50 border border-slate-100 rounded-2xl p-3.5">
                  
                  {/* Stage Header */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{stage.label}</span>
                      <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-bold text-slate-500 border border-slate-100">
                        {stage.leads.length.toString().padStart(2, "0")}
                      </span>
                    </div>
                  </div>

                  {/* Stage Accent Line */}
                  <div className={`h-1 w-full rounded-full mb-4 ${stage.accent}`} />

                  {/* Drop zone container */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      const leadId = e.dataTransfer.getData("text/plain");
                      if (leadId) handleCardDrop(leadId, stage.id);
                      setDraggedOverStage(null);
                    }}
                    onDragEnter={() => setDraggedOverStage(stage.id)}
                    onDragLeave={() => setDraggedOverStage(null)}
                    className={`flex flex-col gap-3 min-h-[350px] rounded-xl transition duration-200 p-1 ${
                      isOver ? "bg-[#500072]/5 border-2 border-dashed border-[#500072]/30 shadow-xs scale-[0.99]" : ""
                    }`}
                  >
                    {stage.leads.length === 0 ? (
                      <div className="flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl p-8 bg-white/40 text-center select-none text-[11px] text-slate-400 py-12">
                        No leads in stage
                      </div>
                    ) : (
                      stage.leads.map((lead) => {
                        const initials = getInitials(lead.projectName);
                        const priorityColor =
                          lead.priority === "High"
                            ? "bg-red-50 text-red-600 border-red-100"
                            : lead.priority === "Medium"
                            ? "bg-amber-50 text-amber-600 border-amber-100"
                            : "bg-slate-100 text-slate-500 border-slate-200";

                        return (
                          <div
                            key={lead._id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, lead._id)}
                            className="bg-white border border-slate-150 rounded-xl p-4 space-y-3 shadow-[0_1.5px_4px_rgba(0,0,0,0.015)] hover:border-[#500072]/30 hover:shadow-xs transition duration-200 cursor-grab active:cursor-grabbing group relative select-none"
                          >
                            {/* Card Top / Title */}
                            <div className="flex items-start gap-2.5">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-[11px] font-extrabold text-[#500072]">
                                {initials}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-[13px] font-bold text-slate-800 leading-snug truncate">
                                  {lead.projectName}
                                </h4>
                                {lead.organization && (
                                  <p className="text-[11px] text-slate-400 font-semibold truncate mt-0.5">
                                    {lead.organization}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Contact Summary details */}
                            {(lead.email || lead.phone) && (
                              <div className="text-[10px] text-slate-400 font-medium space-y-0.5 bg-slate-50/40 p-2 rounded-lg border border-slate-100">
                                {lead.phone && <p className="truncate">📞 {lead.phone}</p>}
                                {lead.email && <p className="truncate">✉️ {lead.email}</p>}
                              </div>
                            )}

                            {/* Priority and Time Meta */}
                            <div className="flex items-center justify-between pt-1">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${priorityColor}`}>
                                {lead.priority}
                              </span>

                              <span className="text-[9px] text-slate-400 font-semibold flex items-center gap-1.5">
                                <Clock className="h-3 w-3" />
                                {timeAgo(lead.updatedAt)}
                              </span>
                            </div>

                            {/* Edit / Actions Panel (Shows on Hover) */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-3 bottom-3 bg-white pl-2">
                              <button
                                onClick={() => handleOpenEditModal(lead)}
                                className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                                title="Edit Lead Details"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>

                              {deletingId === lead._id ? (
                                <div className="flex items-center gap-1 bg-red-50 p-0.5 rounded border border-red-100">
                                  <button
                                    onClick={() => handleDeleteLead(lead._id)}
                                    className="text-[9px] font-bold text-red-600 hover:underline px-1 cursor-pointer"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => setDeletingId(null)}
                                    className="text-[9px] font-bold text-slate-400 px-1 cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeletingId(lead._id)}
                                  className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                                  title="Delete Lead"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* --- Add / Edit Lead Dialog Modal --- */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs animate-fadeIn px-4">
            <div className="bg-white border border-slate-100 rounded-[20px] shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 animate-scaleUp relative">
              
              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 transition cursor-pointer outline-none"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="text-lg font-bold text-slate-800">
                {editingLead ? "Edit Lead Details" : "Register Sales Lead"}
              </h3>
              <p className="text-[12.5px] text-slate-400 mt-1 mb-6">
                Enter contact and project information to track progress through the funnel.
              </p>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                
                {/* Project / Lead Name */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Lead Name (Project/Service Name) *
                  </label>
                  <input
                    type="text"
                    required
                    name="projectName"
                    value={form.projectName}
                    onChange={handleInputChange}
                    placeholder="e.g. Website Overhaul"
                    className="w-full rounded-xl border border-[#cbd5e1] bg-white px-4 py-2.5 text-xs text-[#1a202c] placeholder:text-slate-400 outline-none focus:border-[#500072] focus:ring-1 focus:ring-[#500072]/20 transition"
                  />
                </div>

                {/* Company & Designation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Organization (Company)
                    </label>
                    <input
                      type="text"
                      name="organization"
                      value={form.organization}
                      onChange={handleInputChange}
                      placeholder="e.g. Lumina Tech Corp"
                      className="w-full rounded-xl border border-[#cbd5e1] bg-white px-4 py-2.5 text-xs text-[#1a202c] placeholder:text-slate-400 outline-none focus:border-[#500072] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Client Designation (Role)
                    </label>
                    <input
                      type="text"
                      name="designation"
                      value={form.designation}
                      onChange={handleInputChange}
                      placeholder="e.g. Product Manager"
                      className="w-full rounded-xl border border-[#cbd5e1] bg-white px-4 py-2.5 text-xs text-[#1a202c] placeholder:text-slate-400 outline-none focus:border-[#500072] transition"
                    />
                  </div>
                </div>

                {/* Contact Email & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleInputChange}
                      placeholder="e.g. client@domain.com"
                      className="w-full rounded-xl border border-[#cbd5e1] bg-white px-4 py-2.5 text-xs text-[#1a202c] placeholder:text-slate-400 outline-none focus:border-[#500072] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Contact Phone Number
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. +91 9876543210"
                      className="w-full rounded-xl border border-[#cbd5e1] bg-white px-4 py-2.5 text-xs text-[#1a202c] placeholder:text-slate-400 outline-none focus:border-[#500072] transition"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Address / Location
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleInputChange}
                    placeholder="e.g. Bangalore, India"
                    className="w-full rounded-xl border border-[#cbd5e1] bg-white px-4 py-2.5 text-xs text-[#1a202c] placeholder:text-slate-400 outline-none focus:border-[#500072] transition"
                  />
                </div>

                {/* Lead Source, Priority, & Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Lead Source */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Lead Source
                    </label>
                    <div className="relative">
                      <select
                        name="source"
                        value={form.source}
                        onChange={handleInputChange}
                        className="w-full appearance-none rounded-xl border border-[#cbd5e1] bg-white px-4 py-2.5 text-xs text-[#1a202c] outline-none focus:border-[#500072] cursor-pointer"
                      >
                        {SOURCES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    </div>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Priority
                    </label>
                    <div className="relative">
                      <select
                        name="priority"
                        value={form.priority}
                        onChange={handleInputChange}
                        className="w-full appearance-none rounded-xl border border-[#cbd5e1] bg-white px-4 py-2.5 text-xs text-[#1a202c] outline-none focus:border-[#500072] cursor-pointer"
                      >
                        {PRIORITIES.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    </div>
                  </div>

                  {/* Pipeline Stage (Status) */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Pipeline Stage
                    </label>
                    <div className="relative">
                      <select
                        name="status"
                        value={form.status}
                        onChange={handleInputChange}
                        className="w-full appearance-none rounded-xl border border-[#cbd5e1] bg-white px-4 py-2.5 text-xs text-[#1a202c] outline-none focus:border-[#500072] cursor-pointer"
                      >
                        {PIPELINE_STAGES.map((stage) => (
                          <option key={stage.id} value={stage.id}>
                            {stage.id}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    </div>
                  </div>

                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#500072] text-xs font-semibold text-white hover:bg-[#3d0057] active:bg-[#2e0042] disabled:opacity-65 transition cursor-pointer"
                  >
                    {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {editingLead ? "Save Changes" : "Create Lead"}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </ProtectedPage>
  );
}
