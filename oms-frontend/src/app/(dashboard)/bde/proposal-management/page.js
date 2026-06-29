"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ProtectedPage from "@/components/auth/ProtectedPage";
import SearchableDropdown from "@/components/ui/SearchableDropdown";
import {
  ChevronDown,
  Loader2,
  CheckCircle,
  X,
  Download,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS = [
  "Creatives",
  "Creative Strategy",
  "Software Development",
  "Web Redesign",
  "Digital Consulting",
  "App Development",
];

const CURRENCY_SYMBOLS = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "Pending", label: "Pending" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
];

const EMPTY_FORM = {
  clientName: "",
  category: "",
  contactNumber: "",
  currency: "INR",
  date: "",
  amount: "",
};

export default function BDEProposalManagementPage() {
  const [proposals, setProposals] = useState([]);
  const [leads, setLeads] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleEditClick = (prop) => {
    setEditingId(prop._id);
    setForm({
      clientName: prop.clientName || "",
      category: prop.category || "",
      contactNumber: prop.contactNumber || "",
      currency: prop.currency || "INR",
      date: prop.date ? new Date(prop.date).toISOString().split("T")[0] : "",
      amount: prop.amount !== undefined ? String(prop.amount) : "",
    });
  };

  // ─── Fetch Proposals from Backend ───
  const fetchProposals = useCallback(async () => {
    try {
      const res = await fetch(`${API}/proposals`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setProposals(data.proposals || []);
      } else {
        setProposals([]);
      }
    } catch {
      setProposals([]);
    }
  }, [API]);

  // ─── Fetch Leads from Backend ───
  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch(`${API}/leads`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (err) {
      console.error("Error fetching leads for proposals:", err);
    }
  }, [API]);

  useEffect(() => {
    fetchProposals();
    fetchLeads();
  }, [fetchProposals, fetchLeads]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setForm(EMPTY_FORM);
    setError("");
    setSuccessMsg("");
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.clientName.trim()) {
      setError("Client name is required.");
      return;
    }
    if (!form.contactNumber) {
      setError("Contact number is required.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      if (editingId && editingId.startsWith("mock")) {
        setProposals(prev =>
          prev.map(p =>
            p._id === editingId
              ? {
                  ...p,
                  clientName: form.clientName,
                  category: form.category,
                  contactNumber: form.contactNumber,
                  currency: form.currency,
                  date: form.date,
                  amount: parseFloat(form.amount) || 0,
                }
              : p
          )
        );
        setSuccessMsg("Proposal updated!");
        const today = new Date().toISOString().split("T")[0];
        setForm({
          ...EMPTY_FORM,
          date: today,
        });
        setEditingId(null);
        setTimeout(() => setSuccessMsg(""), 4000);
        return;
      }

      const url = editingId ? `${API}/proposals/${editingId}` : `${API}/proposals`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: form.clientName,
          category: form.category,
          contactNumber: form.contactNumber,
          currency: form.currency,
          date: form.date,
          amount: parseFloat(form.amount) || 0,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || `Failed to ${editingId ? "update" : "submit"} proposal.`);
      }

      setSuccessMsg(editingId ? "Proposal updated successfully!" : "Proposal saved successfully!");
      const today = new Date().toISOString().split("T")[0];
      setForm({
        ...EMPTY_FORM,
        date: today,
      });
      setEditingId(null);
      fetchProposals();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err.message || "Something went wrong while saving.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Status Toggle from Table Dropdown ───
  const handleStatusChange = async (id, newStatus) => {
    if (id.startsWith("mock")) {
      setProposals(prev =>
        prev.map(p => (p._id === id ? { ...p, status: newStatus } : p))
      );
      setSuccessMsg("Proposal status updated!");
      setTimeout(() => setSuccessMsg(""), 3000);
      return;
    }

    try {
      const res = await fetch(`${API}/proposals/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setSuccessMsg("Proposal status updated successfully!");
        fetchProposals();
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch {
      setError("Failed to update status.");
    }
  };

  // ─── Delete Proposal ───
  const handleDeleteProposal = async (id) => {
    if (id.startsWith("mock")) {
      setProposals(prev => prev.filter(p => p._id !== id));
      setDeletingId(null);
      setSuccessMsg("Proposal deleted!");
      setTimeout(() => setSuccessMsg(""), 3000);
      return;
    }

    try {
      const res = await fetch(`${API}/proposals/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setSuccessMsg("Proposal deleted successfully!");
        fetchProposals();
        setDeletingId(null);
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch {
      setError("Failed to delete proposal.");
    }
  };

  const handleGenerateExcel = () => {
    setSuccessMsg(`Excel report generated successfully for ${statusFilter} statuses.`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  // ─── Filter proposals by Status Report ───
  const filteredProposals = proposals.filter((p) => {
    if (statusFilter === "all") return true;
    return p.status === statusFilter;
  });

  return (
    <ProtectedPage allowedRole="BDE">
      <div className="space-y-8 pb-16">
        
        {/* Success Alert */}
        {successMsg && (
          <div className="flex w-full items-center gap-3 rounded-xl bg-green-50 border border-green-200 px-4 py-3.5 text-[13.5px] font-medium text-green-700">
            <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
            {successMsg}
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="flex w-full items-center justify-between rounded-xl bg-red-50 border border-red-200 px-4 py-3.5 text-[13.5px] font-medium text-red-650">
            <span>{error}</span>
            <button onClick={() => setError("")} className="cursor-pointer">
              <X className="h-4.5 w-4.5 text-red-500 hover:text-red-700" />
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════
            Add New Proposal Form (No Card Container)
        ══════════════════════════════════════════ */}
        <div className="w-full">
          <div className="mb-6">
            <h3 className="text-[18px] font-bold text-[#1f1f1f]">
              {editingId ? "Edit Proposal" : "Add New Proposal"}
            </h3>
            <p className="text-[12.5px] text-[#9a9a9a]">
              {editingId ? "Modify proposal details" : "Create and manage proposal details"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Row 1: Client Name & Category */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-[11px] font-bold tracking-wider text-[#4a5568] uppercase mb-1.5">Client Name</label>
                <SearchableDropdown
                  placeholder="Search and select client..."
                  value={form.clientName}
                  options={leads.map(lead => ({
                    value: lead.projectName,
                    label: lead.organization ? `${lead.projectName} (${lead.organization})` : lead.projectName,
                    phone: lead.phone
                  }))}
                  onChange={(val, opt) => {
                    setForm(prev => ({
                      ...prev,
                      clientName: val,
                      contactNumber: opt?.phone || prev.contactNumber || ""
                    }));
                  }}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-wider text-[#4a5568] uppercase mb-1.5">Category</label>
                <div className="relative">
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleInputChange}
                    className="w-full appearance-none rounded-xl border border-[#cbd5e1] bg-white px-4 py-3 text-sm text-[#1a202c] outline-none focus:border-[#500072] focus:ring-1 focus:ring-[#500072]/20 transition cursor-pointer"
                  >
                    <option value="">Select Category</option>
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Row 2: Contact Number & Currency */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-[11px] font-bold tracking-wider text-[#4a5568] uppercase mb-1.5">Contact Number</label>
                <input
                  type="text"
                  name="contactNumber"
                  value={form.contactNumber}
                  onChange={handleInputChange}
                  placeholder="e.g. +1 (555) 000-0000"
                  className="w-full rounded-xl border border-[#cbd5e1] bg-white px-4 py-3 text-sm text-[#1a202c] placeholder:text-slate-400 outline-none focus:border-[#500072] focus:ring-1 focus:ring-[#500072]/20 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-wider text-[#4a5568] uppercase mb-1.5">Currency</label>
                <div className="relative">
                  <select
                    name="currency"
                    value={form.currency}
                    onChange={handleInputChange}
                    className="w-full appearance-none rounded-xl border border-[#cbd5e1] bg-white px-4 py-3 text-sm text-[#1a202c] outline-none focus:border-[#500072] focus:ring-1 focus:ring-[#500072]/20 transition cursor-pointer"
                  >
                    {Object.keys(CURRENCY_SYMBOLS).map((curr) => (
                      <option key={curr} value={curr}>
                        {curr}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Row 3: Date & Amount (Side-by-Side) */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-bold tracking-wider text-[#4a5568] uppercase mb-1.5">Date</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-[#cbd5e1] bg-white px-4 py-3 text-sm text-[#1a202c] outline-none focus:border-[#500072] focus:ring-1 focus:ring-[#500072]/20 transition cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-wider text-[#4a5568] uppercase mb-1.5">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium">
                    {CURRENCY_SYMBOLS[form.currency] || "₹"}
                  </span>
                  <input
                    type="text"
                    name="amount"
                    value={form.amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-[#cbd5e1] bg-white pl-8 pr-4 py-3 text-sm text-[#1a202c] outline-none focus:border-[#500072] focus:ring-1 focus:ring-[#500072]/20 transition"
                  />
                </div>
              </div>
            </div>

            {/* Row 5: Action Buttons */}
            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#500072] text-sm font-semibold text-white hover:bg-[#3d0057] active:bg-[#2e0042] disabled:opacity-60 transition cursor-pointer outline-none shadow-xs"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingId ? "Update Proposal" : "Save Proposal"}
              </button>
              
              <button
                type="button"
                onClick={handleClear}
                className="px-8 py-3 rounded-xl border border-[#cbd5e1] bg-white text-sm font-semibold text-[#4a5568] hover:bg-slate-55 hover:text-slate-800 transition cursor-pointer outline-none shadow-xs"
              >
                {editingId ? "Cancel Edit" : "Clear Form"}
              </button>
            </div>

          </form>
        </div>

        {/* ══════════════════════════════════════════
            Proposal Status Report (No Card Container)
        ══════════════════════════════════════════ */}
        <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-8">
          <div>
            <h3 className="text-[15px] font-bold text-[#1f1f1f]">Proposal Status Report</h3>
            <p className="text-[12.5px] text-[#9a9a9a]">Filter and export proposals based on current status</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative min-w-40 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none rounded-xl border border-[#cbd5e1] bg-white px-4 py-2.5 pr-10 text-[13px] font-medium text-slate-700 outline-none focus:border-[#500072] focus:ring-1 focus:ring-[#500072]/20 transition cursor-pointer"
              >
                {STATUS_FILTER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>

            <button
              onClick={handleGenerateExcel}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#500072] text-[13px] font-semibold text-white hover:bg-[#3d0057] transition cursor-pointer outline-none shadow-xs whitespace-nowrap"
            >
              <Download className="h-4 w-4" />
              Generate Excel
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            Proposals Overview Table (No Card Container)
        ══════════════════════════════════════════ */}
        <div className="pt-6 border-t border-[#edf2f7] mt-8 space-y-6">
          <div>
            <h3 className="text-[18px] font-bold text-[#1f1f1f]">Proposals Overview</h3>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="bg-[#fafafa] border-b border-[#ececec]">
                  <th className="px-5 py-4 font-bold text-[11px] text-slate-400 uppercase tracking-wider"></th>
                  <th className="px-5 py-4 font-bold text-[11px] text-slate-400 uppercase tracking-wider">Ref No</th>
                  <th className="px-5 py-4 font-bold text-[11px] text-slate-400 uppercase tracking-wider">Category</th>
                  <th className="px-5 py-4 font-bold text-[11px] text-slate-400 uppercase tracking-wider">Client Name</th>
                  <th className="px-5 py-4 font-bold text-[11px] text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-4 font-bold text-[11px] text-slate-400 uppercase tracking-wider">Amount</th>
                  <th className="px-5 py-4 font-bold text-[11px] text-slate-400 uppercase tracking-wider">GST Amount</th>
                  <th className="px-5 py-4 font-bold text-[11px] text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-4 font-bold text-[11px] text-slate-400 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ececec] bg-white">
                {filteredProposals.map((prop, idx) => {
                  const sequentialNo = String(idx + 1).padStart(2, "0");
                  const refString = prop.refNo || `REF2020${idx + 4}`;
                  const formattedAmount = typeof prop.amount === "number" ? prop.amount.toLocaleString("en-IN") : prop.amount;
                  const dateString = prop.date ? new Date(prop.date).toLocaleDateString("en-GB") : "10/04/2026";

                  return (
                    <tr key={prop._id} className="hover:bg-[#fafafa] transition-colors">
                      {/* Index Column */}
                      <td className="px-5 py-4 font-medium text-slate-400 w-12">{sequentialNo}</td>
                      
                      {/* Ref No */}
                      <td className="px-5 py-4 font-semibold text-slate-700 whitespace-nowrap max-w-[80px] truncate leading-tight">
                        {refString.slice(0, 6)}
                        <br />
                        {refString.slice(6)}
                      </td>
                      
                      {/* Category */}
                      <td className="px-5 py-4 text-slate-600">{prop.category || "Creatives"}</td>
                      
                      {/* Client Name */}
                      <td className="px-5 py-4 font-medium text-slate-800">{prop.clientName}</td>
                      
                      {/* Date */}
                      <td className="px-5 py-4 text-slate-500">{dateString}</td>
                      
                      {/* Amount */}
                      <td className="px-5 py-4 font-semibold text-slate-700">{formattedAmount}</td>
                      
                      {/* GST Amount */}
                      <td className="px-5 py-4 text-slate-400">{prop.gstAmount || "------"}</td>
                      
                      {/* Interactive Status Dropdown Pill */}
                      <td className="px-5 py-4">
                        <div className="relative inline-flex items-center">
                          <select
                            value={prop.status}
                            onChange={(e) => handleStatusChange(prop._id, e.target.value)}
                            className={`appearance-none font-bold text-[10px] uppercase tracking-wider rounded-md pl-3 pr-8 py-1 border outline-none cursor-pointer ${
                              prop.status === "Approved"
                                ? "bg-green-50 border-green-200 text-green-600"
                                : prop.status === "Rejected"
                                ? "bg-red-50 border-red-200 text-red-600"
                                : "bg-amber-50 border-amber-200 text-amber-600"
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                          <ChevronDown className={`pointer-events-none absolute right-2.5 h-3.5 w-3.5 ${
                            prop.status === "Approved"
                              ? "text-green-500"
                              : prop.status === "Rejected"
                              ? "text-red-500"
                              : "text-amber-500"
                          }`} />
                        </div>
                      </td>

                      {/* Action Column */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-3.5">
                          <button
                            onClick={() => router.push(`/bde/proposal-management/${prop._id}`)}
                            className="text-slate-400 hover:text-[#500072] transition cursor-pointer outline-none"
                            title="View Proposal"
                          >
                            <Eye className="h-4.5 w-4.5" strokeWidth={1.8} />
                          </button>
                          
                          <button
                            onClick={() => handleEditClick(prop)}
                            className="text-slate-400 hover:text-blue-600 transition cursor-pointer outline-none"
                            title="Edit Proposal"
                          >
                            <Pencil className="h-4.5 w-4.5" strokeWidth={1.8} />
                          </button>

                          {deletingId === prop._id ? (
                            <div className="flex items-center gap-1.5 pl-2">
                              <button
                                onClick={() => handleDeleteProposal(prop._id)}
                                className="rounded-[4px] bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-red-700 transition cursor-pointer"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setDeletingId(null)}
                                className="rounded-[4px] border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-500 hover:bg-slate-50 transition cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeletingId(prop._id)}
                              className="text-red-400 hover:text-red-600 transition cursor-pointer outline-none"
                              title="Delete Proposal"
                            >
                              <Trash2 className="h-4.5 w-4.5" strokeWidth={1.8} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-[#edf2f7]">
            <span className="text-[12.5px] font-medium text-slate-400">
              Showing {filteredProposals.length} of {proposals.length} results
            </span>

            <div className="flex items-center gap-1">
              <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e2e8f0] bg-white text-slate-400 hover:bg-slate-50 cursor-pointer outline-none">
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#cbd5e1]/60 bg-white text-[12.5px] font-semibold text-slate-700">
                1
              </span>
              
              <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e2e8f0] bg-white text-slate-400 hover:bg-slate-50 cursor-pointer outline-none">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </ProtectedPage>
  );
}
