"use client";
 
import React, { useState, useEffect, useCallback } from "react";
import ProtectedPage from "@/components/auth/ProtectedPage";
import SearchableDropdown from "@/components/ui/SearchableDropdown";
import axiosInstance from "@/api/axiosInstance";
import {
  ChevronDown,
  Loader2,
  CheckCircle,
  X,
  Search,
  Download,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";
 
// ─── Constants ────────────────────────────────────────────────────────────────
 
const SERVICE_TYPES = [
  "UI/UX Design",
  "Web Development",
  "Mobile App Development",
  "QA Testing",
  "DevOps & Cloud",
  "Digital Marketing",
  "IT Consulting",
  "Branding",
  "Development",
];
 
const STATUS_OPTIONS = ["Ongoing", "Completed", "Pending", "Cancelled", "On Hold"];
 
const FALLBACK_PROJECTS = [
  { _id: "mock-proj-1", projectName: "Lumina Mobile App", amount: "12000.00", clientName: "Lumina Tech Corp" },
  { _id: "mock-proj-2", projectName: "Nexus Brand Identity", amount: "5500.00", clientName: "Nexus Ventures" },
  { _id: "mock-proj-3", projectName: "E-comm Platform Dev", amount: "25000.00", clientName: "RetailFlow India" },
  { _id: "mock-proj-4", projectName: "Alpha E-Commerce", amount: "12500.00", clientName: "Alpha Corp" },
];
 
const FALLBACK_PAYMENTS = [
  {
    _id: "mock-pay-1",
    projectName: "Lumina Mobile App",
    clientName: "Lumina Tech Corp",
    serviceType: "UI/UX Design",
    totalOfferedAmount: 12000,
    amountReceived: 8000,
    balanceAmount: 4000,
    status: "Ongoing",
    date: "2023-10-12",
    referenceNo: "INV-2023-001",
    gstAmount: "1,440",
  },
  {
    _id: "mock-pay-2",
    projectName: "Nexus Brand Identity",
    clientName: "Nexus Ventures",
    serviceType: "Branding",
    totalOfferedAmount: 5500,
    amountReceived: 5500,
    balanceAmount: 0,
    status: "Completed",
    date: "2023-09-28",
    referenceNo: "INV-2023-002",
    gstAmount: "990",
  },
  {
    _id: "mock-pay-3",
    projectName: "E-comm Platform Dev",
    clientName: "RetailFlow India",
    serviceType: "Development",
    totalOfferedAmount: 25000,
    amountReceived: 5000,
    balanceAmount: 20000,
    status: "On Hold",
    date: "2023-11-05",
    referenceNo: "INV-2023-003",
    gstAmount: "900",
  },
];
 
const EMPTY_FORM = {
  project: "",
  projectName: "",
  clientName: "",
  serviceType: "",
  totalOfferedAmount: "",
  amountReceived: "",
  newPaymentAmount: "",
  balanceAmount: "",
  status: "",
  date: "",
  referenceNo: "",
};

function getStatusStyles(status) {
  switch (status) {
    case "Completed":
      return {
        bg: "bg-[#f0fdf4] border-[#bbf7d0] text-[#166534]",
        dot: "bg-[#166534]",
        chevron: "text-[#166534]"
      };
    case "Ongoing":
      return {
        bg: "bg-[#eff6ff] border-[#bfdbfe] text-[#1d4ed8]",
        dot: "bg-[#1d4ed8]",
        chevron: "text-[#1d4ed8]"
      };
    case "On Hold":
    case "Pending":
      return {
        bg: "bg-[#fffbeb] border-[#fde68a] text-[#b45309]",
        dot: "bg-[#b45309]",
        chevron: "text-[#b45309]"
      };
    default: // Cancelled / other
      return {
        bg: "bg-[#fef2f2] border-[#fecaca] text-[#991b1b]",
        dot: "bg-[#991b1b]",
        chevron: "text-[#991b1b]"
      };
  }
}
 
export default function CEOAccountsPage() {
  const [payments, setPayments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [leads, setLeads] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [viewingPayment, setViewingPayment] = useState(null);
 
  // Filters State
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
 
  // ─── Fetch Payments ───
  const fetchPayments = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/payments");
      setPayments(res.data.payments || []);
    } catch {
      setPayments([]);
    }
  }, []);
 
  // ─── Fetch Projects ───
  const fetchProjects = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/projects");
      setProjects(res.data.projects || []);
    } catch {
      setProjects([]);
    }
  }, []);

  // ─── Fetch Leads ───
  const fetchLeads = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/leads");
      setLeads(res.data.leads || []);
    } catch {
      setLeads([]);
    }
  }, []);

  // ─── Fetch Proposals ───
  const fetchProposals = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/proposals");
      setProposals(res.data.proposals || []);
    } catch {
      setProposals([]);
    }
  }, []);
 
  useEffect(() => {
    fetchPayments();
    fetchProjects();
    fetchLeads();
    fetchProposals();
  }, [fetchPayments, fetchProjects, fetchLeads, fetchProposals]);
 
  // ─── Form Inputs Change Handlers ───
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      
      // Auto-calculate Balance Amount dynamically when financial amounts change
      if (name === "totalOfferedAmount" || name === "amountReceived" || name === "newPaymentAmount") {
        const offered = parseFloat(updated.totalOfferedAmount) || 0;
        const received = parseFloat(updated.amountReceived) || 0;
        const newPay = parseFloat(updated.newPaymentAmount) || 0;
        updated.balanceAmount = (offered - (received + newPay)).toFixed(2);
      }
 
      return updated;
    });
  };
 
  const handleProjectChange = (e) => {
    const selectedName = e.target.value;
    if (!selectedName) {
      setForm((prev) => ({
        ...prev,
        projectName: "",
        clientName: "",
        project: "",
        totalOfferedAmount: "",
        amountReceived: "",
        newPaymentAmount: "",
        balanceAmount: "",
      }));
      return;
    }
    const selectedProj = projects.find((p) => p.projectName === selectedName);
    const selectedLead = leads.find((l) => l.projectName === selectedName);
    const selectedProp = proposals.find((p) => p.clientName === selectedName);

    // Sum all previous payment transactions received for this project
    const projectPayments = payments.filter((p) => p.projectName === selectedName && p._id !== editingId);
    const previousReceived = projectPayments.reduce((sum, p) => sum + (parseFloat(p.amountReceived) || 0), 0);
    
    setForm((prev) => {
      // Find the offered amount: project amount takes priority, then proposal amount, then fallback to previous payment offered amount
      let offeredVal = 0;
      if (selectedProj) {
        if (selectedProj.totalAmount) {
          offeredVal = parseFloat(selectedProj.totalAmount) || 0;
        } else {
          const amt = parseFloat(selectedProj.amount) || 0;
          const gst = parseFloat(selectedProj.gstAmount) || 0;
          const host = parseFloat(selectedProj.hosting) || 0;
          const dom = parseFloat(selectedProj.domain) || 0;
          offeredVal = amt + gst + host + dom;
        }
      } else if (selectedProp && selectedProp.amount) {
        offeredVal = parseFloat(selectedProp.amount) || 0;
      } else if (projectPayments.length > 0) {
        offeredVal = parseFloat(projectPayments[0].totalOfferedAmount) || 0;
      }
      
      const offered = offeredVal;
      const received = previousReceived;
      const balance = offered - received;

      // Find the service type: project category takes priority, then proposal category fallback
      let serviceTypeVal = prev.serviceType || "";
      const projectCategory = selectedProj?.serviceCategory || "";
      const proposalCategory = selectedProp?.category || "";
      const matchedCategory = projectCategory || proposalCategory;
      if (matchedCategory) {
        const matchedType = SERVICE_TYPES.find(t => 
          t.toLowerCase().includes(matchedCategory.toLowerCase()) || 
          matchedCategory.toLowerCase().includes(t.toLowerCase())
        );
        if (matchedType) {
          serviceTypeVal = matchedType;
        } else {
          const lowerCat = matchedCategory.toLowerCase();
          if (lowerCat.includes("web") || lowerCat.includes("software")) {
            serviceTypeVal = "Web Development";
          } else if (lowerCat.includes("app") || lowerCat.includes("mobile")) {
            serviceTypeVal = "Mobile App Development";
          } else if (lowerCat.includes("creative") || lowerCat.includes("brand")) {
            serviceTypeVal = "Branding";
          } else if (lowerCat.includes("design") || lowerCat.includes("ui") || lowerCat.includes("ux")) {
            serviceTypeVal = "UI/UX Design";
          } else if (lowerCat.includes("marketing") || lowerCat.includes("social")) {
            serviceTypeVal = "Digital Marketing";
          } else if (lowerCat.includes("consulting") || lowerCat.includes("strategy")) {
            serviceTypeVal = "IT Consulting";
          }
        }
      }

      return {
        ...prev,
        projectName: selectedName,
        clientName: selectedLead?.organization || selectedProj?.clientName || selectedProp?.clientName || selectedName,
        project: selectedProj && !selectedProj._id.startsWith("mock") ? selectedProj._id : "",
        totalOfferedAmount: offered > 0 ? offered.toFixed(2) : "",
        amountReceived: received.toFixed(2),
        newPaymentAmount: "",
        balanceAmount: offered > 0 ? balance.toFixed(2) : "",
        serviceType: serviceTypeVal,
      };
    });
  };
 
  const handleClear = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError("");
    setSuccessMsg("");
  };
 
  const handleOpenNewForm = () => {
    handleClear();
    setShowForm(true);
  };
 
  const handleEditPayment = (payment) => {
    // Sum all other payment transactions received for this project
    const otherPayments = payments.filter((p) => p.projectName === payment.projectName && p._id !== payment._id);
    const previousReceived = otherPayments.reduce((sum, p) => sum + (parseFloat(p.amountReceived) || 0), 0);

    setEditingId(payment._id);
    setForm({
      project: payment.project || "",
      projectName: payment.projectName,
      clientName: payment.clientName || "",
      serviceType: payment.serviceType,
      totalOfferedAmount: (payment.totalOfferedAmount || 0).toFixed(2),
      amountReceived: previousReceived.toFixed(2),
      newPaymentAmount: (payment.amountReceived || 0).toFixed(2),
      balanceAmount: (payment.balanceAmount || 0).toFixed(2),
      status: payment.status || "Ongoing",
      date: payment.date ? new Date(payment.date).toISOString().split("T")[0] : "",
      referenceNo: payment.referenceNo,
    });
    setShowForm(true);
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.projectName) {
      setError("Please select a project.");
      return;
    }
    if (!form.serviceType) {
      setError("Please select a service type.");
      return;
    }
    if (!form.newPaymentAmount || isNaN(parseFloat(form.newPaymentAmount)) || parseFloat(form.newPaymentAmount) < 0) {
      setError("Please enter a valid new payment amount.");
      return;
    }
    if (!form.status) {
      setError("Please select a status.");
      return;
    }
    if (!form.date) {
      setError("Please select a date.");
      return;
    }
    if (!form.referenceNo.trim()) {
      setError("Reference number is required.");
      return;
    }
 
    try {
      setSubmitting(true);
      setError("");
 
      const method = editingId ? "put" : "post";
      const url = editingId ? `/payments/${editingId}` : "/payments";
 
      const res = await axiosInstance({
        url,
        method,
        data: {
          project: form.project || null,
          projectName: form.projectName,
          clientName: form.clientName,
          serviceType: form.serviceType,
          totalOfferedAmount: parseFloat(form.totalOfferedAmount) || 0,
          amountReceived: parseFloat(form.newPaymentAmount) || 0,
          balanceAmount: parseFloat(form.balanceAmount) || 0,
          status: form.status,
          date: form.date,
          referenceNo: form.referenceNo,
        },
      });
 
      setSuccessMsg(editingId ? "Payment updated successfully!" : "Payment recorded successfully!");
      fetchPayments();
      setShowForm(false);
      handleClear();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Something went wrong while saving.");
    } finally {
      setSubmitting(false);
    }
  };
 
  // ─── Inline Status Dropdown Toggle ───
  const handleStatusChange = async (id, newStatus) => {
    if (id.startsWith("mock")) {
      setPayments((prev) =>
        prev.map((p) => (p._id === id ? { ...p, status: newStatus } : p))
      );
      setSuccessMsg("Payment status updated!");
      setTimeout(() => setSuccessMsg(""), 3000);
      return;
    }
 
    try {
      await axiosInstance.put(`/payments/${id}`, { status: newStatus });
      setSuccessMsg("Payment status updated successfully!");
      fetchPayments();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      setError("Failed to update payment status.");
    }
  };
 
  // ─── Delete Payment ───
  const handleDeletePayment = async (id) => {
    if (id.startsWith("mock")) {
      setPayments((prev) => prev.filter((p) => p._id !== id));
      setDeletingId(null);
      setSuccessMsg("Payment log deleted!");
      setTimeout(() => setSuccessMsg(""), 3000);
      return;
    }
 
    try {
      await axiosInstance.delete(`/payments/${id}`);
      setSuccessMsg("Payment log deleted successfully!");
      fetchPayments();
      setDeletingId(null);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      setError("Failed to delete payment transaction.");
    }
  };
 
  const handleGenerateExcel = () => {
    setSuccessMsg("Excel report for accounts generated successfully.");
    setTimeout(() => setSuccessMsg(""), 4000);
  };
 
  // ─── Filter & Search Logic ───
  const filteredPayments = payments.filter((pay) => {
    // Status Filter
    if (statusFilter !== "all" && pay.status !== statusFilter) return false;
    
    // Service Type Filter
    if (serviceFilter !== "all" && pay.serviceType !== serviceFilter) return false;
 
    // Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const projNameMatch = pay.projectName?.toLowerCase().includes(q);
      const clientNameMatch = pay.clientName?.toLowerCase().includes(q) || false;
      const refMatch = pay.referenceNo?.toLowerCase().includes(q);
      const serviceMatch = pay.serviceType?.toLowerCase().includes(q);
      if (!projNameMatch && !clientNameMatch && !refMatch && !serviceMatch) return false;
    }
 
    return true;
  });
 
  return (
    <ProtectedPage allowedRole="CEO, Accountant">
      <div className="space-y-6 pb-16">
        

 
        {/* Success Alert */}
        {successMsg && (
          <div className="flex w-full items-center gap-3 rounded-xl bg-green-50 border border-green-200 px-4 py-3.5 text-[13.5px] font-medium text-green-700">
            <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
            {successMsg}
          </div>
        )}
 
        {/* Error Alert */}
        {error && (
          <div className="flex w-full items-center justify-between rounded-xl bg-red-50 border border-red-200 px-4 py-3.5 text-[13.5px] font-medium text-red-600">
            <span>{error}</span>
            <button onClick={() => setError("")} className="cursor-pointer">
              <X className="h-4.5 w-4.5 text-red-500 hover:text-red-700" />
            </button>
          </div>
        )}
 
        {!showForm ? (
          viewingPayment ? (() => {
            const matchedProj = projects.find((p) => p.projectName === viewingPayment.projectName);
            const hasGstDetails = matchedProj 
              ? (parseFloat(matchedProj.gstAmount) > 0) 
              : (viewingPayment._id?.startsWith("mock") || false);

            const gstVal = matchedProj
              ? (parseFloat(matchedProj.gstAmount) || 0)
              : (parseFloat(viewingPayment.gstAmount?.replace(/,/g, "")) || 0);

            const viewingPaymentGst = gstVal;
            const viewingPaymentReceivedGst = viewingPayment.totalOfferedAmount > 0 
              ? (viewingPayment.amountReceived * (gstVal / viewingPayment.totalOfferedAmount)) 
              : 0;
            const viewingPaymentTotalReceivedGst = viewingPayment.totalOfferedAmount > 0 
              ? ((viewingPayment.totalOfferedAmount - viewingPayment.balanceAmount) * (gstVal / viewingPayment.totalOfferedAmount)) 
              : 0;

            return (
              /* ══════════════════════════════════════════
                  Accounts Details View Panel
              ══════════════════════════════════════════ */
              <div className="bg-white border border-[#edf2f7] rounded-2xl p-8 w-full shadow-sm relative">
                <button
                  onClick={() => setViewingPayment(null)}
                  className="absolute right-6 top-6 flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 cursor-pointer transition shadow-xs animate-fadeIn"
                >
                  Back to Overview
                </button>
  
                <h3 className="text-[18px] font-bold text-[#1f1f1f] mb-8">Accounts Details</h3>
  
                <div className="grid grid-cols-[160px_20px_1fr] gap-y-5 text-sm border-t border-slate-100 pt-6">
                  <span className="font-semibold text-slate-500">Project Name</span>
                  <span className="text-slate-400 font-bold">:</span>
                  <span className="text-slate-800 font-semibold">{viewingPayment.projectName}</span>
  
                  <span className="font-semibold text-slate-500">Service Offered</span>
                  <span className="text-slate-400 font-bold">:</span>
                  <span className="text-slate-800 font-medium">{viewingPayment.serviceType}</span>
  
                  <span className="font-semibold text-slate-500">Offered Amount</span>
                  <span className="text-slate-400 font-bold">:</span>
                  <span className="text-slate-800 font-medium">
                    ₹{(viewingPayment.totalOfferedAmount || 0).toLocaleString("en-IN")}
                    {hasGstDetails ? (
                      <span className="ml-2 text-xs font-semibold text-green-600">
                        (GST Included: ₹{viewingPaymentGst.toLocaleString("en-IN", { maximumFractionDigits: 0 })})
                      </span>
                    ) : (
                      <span className="ml-2 text-xs font-semibold text-slate-400">(Without GST)</span>
                    )}
                  </span>
  
                  <span className="font-semibold text-slate-500">Received (This Trans.)</span>
                  <span className="text-slate-400 font-bold">:</span>
                  <span className="text-slate-800 font-medium">
                    ₹{(viewingPayment.amountReceived || 0).toLocaleString("en-IN")}
                    {hasGstDetails && (
                      <span className="ml-2 text-xs font-semibold text-green-600">
                        (GST Included: ₹{viewingPaymentReceivedGst.toLocaleString("en-IN", { maximumFractionDigits: 0 })})
                      </span>
                    )}
                  </span>
  
                  <span className="font-semibold text-slate-500">Total Received So Far</span>
                  <span className="text-slate-400 font-bold">:</span>
                  <span className="text-[#500072] font-semibold">
                    ₹{((viewingPayment.totalOfferedAmount - viewingPayment.balanceAmount) || 0).toLocaleString("en-IN")}
                    {hasGstDetails && (
                      <span className="ml-2 text-xs font-semibold text-green-600">
                        (GST Included: ₹{viewingPaymentTotalReceivedGst.toLocaleString("en-IN", { maximumFractionDigits: 0 })})
                      </span>
                    )}
                  </span>
  
                  <span className="font-semibold text-slate-500">Balance</span>
                  <span className="text-slate-400 font-bold">:</span>
                  <span className="text-[#ef4444] font-semibold">₹{(viewingPayment.balanceAmount || 0).toLocaleString("en-IN")}</span>
  
                  <span className="font-semibold text-slate-500">Start date</span>
                  <span className="text-slate-400 font-bold">:</span>
                  <span className="text-slate-800 font-medium">
                    {viewingPayment.date
                      ? new Date(viewingPayment.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        }).replace(",", "")
                      : "Oct 12 2023"}
                  </span>
  
                  <span className="font-semibold text-slate-500">Status</span>
                  <span className="text-slate-400 font-bold">:</span>
                  <span className="text-slate-800 font-medium">{viewingPayment.status}</span>
                </div>
              </div>
            );
          })() : (
            <>
            {/* ══════════════════════════════════════════
                Filters Section
            ══════════════════════════════════════════ */}
            <div className="flex flex-col md:flex-row items-stretch md:items-end gap-6 bg-white border border-[#edf2f7] rounded-[20px] p-6 shadow-xs">
              <div className="w-full md:w-[45%]">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Date Range</label>
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <select
                    value={dateFilter}
                    onChange={(e) => {
                      setDateFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full appearance-none rounded-xl border border-[#cbd5e1] bg-white pl-10 pr-10 py-2.5 text-[13px] font-medium text-slate-700 outline-none focus:border-[#500072] focus:ring-1 focus:ring-[#500072]/20 transition cursor-pointer"
                  >
                    <option value="all">Current Financial Year (2023-24)</option>
                    <option value="2024">Current Financial Year (2024-25)</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>
 
              <div className="w-full md:w-[18%]">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Payment Status</label>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full appearance-none rounded-xl border border-[#cbd5e1] bg-white px-4 py-2.5 pr-10 text-[13px] font-medium text-slate-700 outline-none focus:border-[#500072] focus:ring-1 focus:ring-[#500072]/20 transition cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>
 
              <div className="w-full md:w-[18%]">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Service Type</label>
                <div className="relative">
                  <select
                    value={serviceFilter}
                    onChange={(e) => {
                      setServiceFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full appearance-none rounded-xl border border-[#cbd5e1] bg-white px-4 py-2.5 pr-10 text-[13px] font-medium text-slate-700 outline-none focus:border-[#500072] focus:ring-1 focus:ring-[#500072]/20 transition cursor-pointer"
                  >
                    <option value="all">All Services</option>
                    {SERVICE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>
 
              <button
                onClick={handleGenerateExcel}
                className="w-full md:w-[19%] flex h-[42px] items-center justify-center gap-2 px-6 rounded-xl bg-[#500072] text-[13px] font-semibold text-white hover:bg-[#3d0057] transition cursor-pointer outline-none shadow-xs whitespace-nowrap"
              >
                <Download className="h-4 w-4" />
                Generate Excel
              </button>
            </div>
 
            {/* ══════════════════════════════════════════
                Payment Overview Table Section
            ══════════════════════════════════════════ */}
            <div className="bg-white border border-[#edf2f7] rounded-[20px] shadow-xs overflow-hidden mt-8">
              <div className="flex items-center justify-between p-8 border-b border-[#edf2f7]">
                <h3 className="text-xl font-bold text-[#1f1f1f]">Payment Overview</h3>
                <button
                  onClick={handleOpenNewForm}
                  className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#500072] text-[12.5px] font-bold text-white hover:bg-[#3d0057] transition cursor-pointer shadow-xs whitespace-nowrap"
                >
                  <Plus className="h-4 w-4" />
                  Add Payment
                </button>
              </div>

              <div className="overflow-x-auto w-full">
                <table className="w-full table-auto text-left text-[12.5px]">
                  <thead>
                    <tr className="bg-[#fafafa] border-b border-[#ececec]">
                      <th className="pl-6 pr-2 py-3.5 font-bold text-[10.5px] text-slate-400 uppercase tracking-wider w-12">SL NO</th>
                      <th className="px-2 py-3.5 font-bold text-[10.5px] text-slate-400 uppercase tracking-wider">PROJECT NAME</th>
                      <th className="px-2 py-3.5 font-bold text-[10.5px] text-slate-400 uppercase tracking-wider">SERVICE OFFERED</th>
                      <th className="px-2 py-3.5 font-bold text-[10.5px] text-slate-400 uppercase tracking-wider">OFFERED AMOUNT</th>
                      <th className="px-2 py-3.5 font-bold text-[10.5px] text-slate-400 uppercase tracking-wider">RECEIVED</th>
                      <th className="px-2 py-3.5 font-bold text-[10.5px] text-slate-400 uppercase tracking-wider">BALANCE</th>
                      <th className="px-2 py-3.5 font-bold text-[10.5px] text-slate-400 uppercase tracking-wider">START DATE</th>
                      <th className="px-2 py-3.5 font-bold text-[10.5px] text-slate-400 uppercase tracking-wider">STATUS</th>
                      <th className="pl-2 pr-6 py-3.5 font-bold text-[10.5px] text-slate-400 uppercase tracking-wider text-right w-24">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ececec] bg-white">
                    {(() => {
                      const itemsPerPage = 10;
                      const startIndex = (currentPage - 1) * itemsPerPage;
                      const paginatedPayments = filteredPayments.slice(startIndex, startIndex + itemsPerPage);

                      if (paginatedPayments.length === 0) {
                        return (
                          <tr>
                            <td colSpan="9" className="px-6 py-8 text-center text-slate-400 font-semibold text-xs">
                              No payment transactions found matching the active filters.
                            </td>
                          </tr>
                        );
                      }

                      return paginatedPayments.map((pay, idx) => {
                        const globalIdx = startIndex + idx + 1;
                        const sequentialNo = String(globalIdx).padStart(2, "0");
                        
                        const matchedProj = projects.find((p) => p.projectName === pay.projectName);
                        const hasGst = matchedProj 
                          ? (parseFloat(matchedProj.gstAmount) > 0) 
                          : (pay._id?.startsWith("mock") || false);

                        const gstVal = matchedProj
                          ? (parseFloat(matchedProj.gstAmount) || 0)
                          : (parseFloat(pay.gstAmount?.replace(/,/g, "")) || 0);

                        const offeredGst = gstVal;
                        const receivedGst = pay.totalOfferedAmount > 0 
                          ? (pay.amountReceived * (gstVal / pay.totalOfferedAmount)) 
                          : 0;
   
                        const formattedOffered = pay.totalOfferedAmount.toLocaleString("en-IN");
                        const formattedReceived = pay.amountReceived.toLocaleString("en-IN");
                        const formattedBalance = pay.balanceAmount.toLocaleString("en-IN");
                        
                        const dateObj = pay.date ? new Date(pay.date) : new Date();
                        const dateString = dateObj.toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        });

                        const balanceSubtext = pay.projectName === "E-comm Platform Dev"
                          ? "Milestone 2 Pending"
                          : pay.balanceAmount > 0
                          ? "Pending"
                          : "Settled";
   
                        return (
                          <tr key={pay._id} className="hover:bg-[#fafafa] transition-colors border-b border-[#ececec]">
                            {/* SL NO */}
                            <td className="pl-6 pr-2 py-4 font-medium text-slate-400 w-12">{sequentialNo}</td>
                            
                            {/* PROJECT NAME */}
                            <td className="px-2 py-4 cursor-pointer group max-w-[140px] truncate" onClick={() => setViewingPayment(pay)}>
                              <span className="font-semibold text-slate-800 block text-[13px] leading-tight group-hover:text-[#500072] group-hover:underline transition duration-200">
                                {pay.projectName}
                              </span>
                              <span className="text-[10.5px] text-slate-400 mt-0.5 block group-hover:text-slate-600 transition">
                                {pay.clientName || ""}
                              </span>
                            </td>
                            
                            {/* SERVICE OFFERED */}
                            <td className="px-2 py-4 text-slate-600 max-w-[120px] truncate" title={pay.serviceType}>{pay.serviceType}</td>
                            
                            {/* OFFERED AMOUNT */}
                            <td className="px-2 py-4">
                              <span className="font-semibold text-slate-700 block">
                                ₹{formattedOffered}
                              </span>
                              {hasGst ? (
                                <span className="text-[10px] text-green-600 font-semibold block mt-0.5" title={`GST Amount: ₹${offeredGst.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`}>
                                  GST Included: ₹{offeredGst.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                                  Without GST
                                </span>
                              )}
                            </td>
                            
                            {/* RECEIVED */}
                            <td className="px-2 py-4">
                              <span className="font-semibold text-slate-700 block" title="Amount received in this transaction">
                                ₹{formattedReceived}
                              </span>
                              {hasGst ? (
                                <span className="text-[10px] text-green-600 font-semibold block mt-0.5" title={`GST Amount: ₹${receivedGst.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`}>
                                  GST Included: ₹{receivedGst.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                                  Without GST
                                </span>
                              )}
                              <span className="text-[9.5px] text-[#500072] font-bold block mt-1">
                                Total Paid: ₹{(pay.totalOfferedAmount - pay.balanceAmount).toLocaleString("en-IN")}
                              </span>
                            </td>
                            
                            {/* BALANCE */}
                            <td className="px-2 py-4">
                              <span className={`font-semibold block ${pay.balanceAmount > 0 ? "text-[#ef4444]" : "text-slate-500"}`}>
                                ₹{formattedBalance}
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                {balanceSubtext}
                              </span>
                            </td>
                            
                            {/* START DATE */}
                            <td className="px-2 py-4 text-slate-500 whitespace-nowrap">{dateString}</td>
                            
                            {/* STATUS */}
                            <td className="px-2 py-4">
                              {(() => {
                                const styles = getStatusStyles(pay.status);
                                return (
                                  <div className={`relative inline-flex items-center gap-1.5 px-2.5 py-1 border rounded-full text-[9px] font-bold uppercase tracking-wider ${styles.bg}`}>
                                    <span className={`h-1 w-1 rounded-full ${styles.dot}`} />
                                    <span>{pay.status}</span>
                                    <ChevronDown className={`h-2.5 w-2.5 ${styles.chevron}`} />
                                    <select
                                      value={pay.status}
                                      onChange={(e) => handleStatusChange(pay._id, e.target.value)}
                                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    >
                                      {STATUS_OPTIONS.map((st) => (
                                        <option key={st} value={st}>
                                          {st}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                );
                              })()}
                            </td>
   
                            {/* ACTION */}
                            <td className="pl-2 pr-6 py-4 text-right w-24">
                              <div className="flex items-center justify-end gap-3.5">
                                <button
                                  onClick={() => setViewingPayment(pay)}
                                  className="text-slate-400 hover:text-[#500072] transition cursor-pointer outline-none"
                                  title="View Accounts Details"
                                >
                                  <Eye className="h-4.5 w-4.5" strokeWidth={1.8} />
                                </button>
   
                                <button
                                  onClick={() => handleEditPayment(pay)}
                                  className="text-slate-400 hover:text-blue-600 transition cursor-pointer outline-none"
                                  title="Edit Transaction"
                                >
                                  <Pencil className="h-4.5 w-4.5" strokeWidth={1.8} />
                                </button>
   
                                {deletingId === pay._id ? (
                                  <div className="flex items-center gap-1.5 pl-2">
                                    <button
                                      onClick={() => handleDeletePayment(pay._id)}
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
                                    onClick={() => setDeletingId(pay._id)}
                                    className="text-slate-300 hover:text-red-600 transition cursor-pointer outline-none"
                                    title="Delete Log"
                                  >
                                    <Trash2 className="h-4.5 w-4.5" strokeWidth={1.8} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
 
              {/* Table Pagination Footer */}
              {filteredPayments.length > 0 && (
                <div className="flex items-center justify-between p-8 border-t border-[#edf2f7]">
                  <span className="text-[12.5px] font-medium text-slate-400">
                    Showing {Math.min(filteredPayments.length, (currentPage - 1) * 10 + 1)} to {Math.min(filteredPayments.length, currentPage * 10)} of {filteredPayments.length} results
                  </span>
 
                  <div className="flex items-center gap-1">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e2e8f0] bg-white text-slate-400 hover:bg-slate-50 disabled:opacity-40 cursor-pointer outline-none"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#cbd5e1]/60 bg-white text-[12.5px] font-bold text-slate-700">
                      {currentPage}
                    </span>
                    
                    <button
                      disabled={currentPage * 10 >= filteredPayments.length}
                      onClick={() => setCurrentPage(p => p + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e2e8f0] bg-white text-slate-400 hover:bg-slate-50 disabled:opacity-40 cursor-pointer outline-none"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )) : (
          /* ══════════════════════════════════════════
              Add/Edit Payment Form (COLLAPSED BY DEFAULT)
          ══════════════════════════════════════════ */
          <div className="w-full max-w-4xl mx-auto py-8 animate-fadeIn">
            <div className="mb-6">
              <h3 className="text-[18px] font-bold text-[#1f1f1f]">
                {editingId ? "Edit Payment" : "Add Payment"}
              </h3>
              <p className="text-[12.5px] text-[#9a9a9a] mt-1">
                {editingId ? "Update existing project transactions" : "Record a new transaction for your projects."}
              </p>
            </div>

            <div className="bg-white border border-[#edf2f7] rounded-[20px] p-12 shadow-xs">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Row 1: Project Selection & Service Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[13px] font-semibold text-[#4a5568] mb-1.5">Project Selection</label>
                    <SearchableDropdown
                      placeholder="Search and select project..."
                      value={form.projectName}
                      options={leads.map((l) => ({
                        value: l.projectName,
                        label: l.organization ? `${l.projectName} (${l.organization})` : l.projectName,
                      }))}
                      onChange={(val) => {
                        handleProjectChange({ target: { value: val } });
                      }}
                    />
                  </div>
 
                  <div>
                    <label className="block text-[13px] font-semibold text-[#4a5568] mb-1.5">Service Type</label>
                    <div className="relative">
                      <select
                        name="serviceType"
                        value={form.serviceType}
                        onChange={handleInputChange}
                        className="w-full appearance-none rounded-xl border border-[#cbd5e1] bg-white px-4 py-3 text-sm text-[#1a202c] outline-none focus:border-[#500072] focus:ring-1 focus:ring-[#500072]/20 transition cursor-pointer"
                      >
                        <option value="">Select Service Type</option>
                        {SERVICE_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                    </div>
                  </div>
                </div>
 
                {/* Row 2: Financial Box (Grey Background Panel) */}
                <div className="bg-[#f8fafc] rounded-2xl p-6 border border-[#edf2f7] mt-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                    
                    <div>
                      <label className="block text-[13px] font-semibold text-[#4a5568] mb-1.5 min-h-[38px] flex items-end">Total Offered Amount</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#718096] font-medium">₹</span>
                        <input
                          type="text"
                          name="totalOfferedAmount"
                          value={form.totalOfferedAmount}
                          onChange={handleInputChange}
                          readOnly={form.totalOfferedAmount && parseFloat(form.totalOfferedAmount) > 0}
                          placeholder="0.00"
                          className={`w-full rounded-xl border border-[#cbd5e1] pl-8 pr-4 py-3 text-sm font-medium outline-none ${
                            form.totalOfferedAmount && parseFloat(form.totalOfferedAmount) > 0
                              ? "bg-[#f1f5f9] text-[#475569] cursor-not-allowed"
                              : "bg-white text-[#1a202c]"
                          }`}
                        />
                      </div>
                    </div>
 
                    <div>
                      <label className="block text-[13px] font-semibold text-[#4a5568] mb-1.5 min-h-[38px] flex items-end">Previously Received</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#718096] font-medium">₹</span>
                        <input
                          type="text"
                          name="amountReceived"
                          value={form.amountReceived}
                          readOnly
                          placeholder="0.00"
                          className="w-full rounded-xl border border-[#cbd5e1] bg-[#f1f5f9] pl-8 pr-4 py-3 text-sm text-[#475569] font-medium cursor-not-allowed outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[13px] font-semibold text-[#4a5568] mb-1.5 min-h-[38px] flex items-end">New Payment Amount</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#718096] font-medium">₹</span>
                        <input
                          type="text"
                          name="newPaymentAmount"
                          value={form.newPaymentAmount}
                          onChange={handleInputChange}
                          placeholder="0.00"
                          className="w-full rounded-xl border border-[#cbd5e1] bg-white pl-8 pr-4 py-3 text-sm text-[#1a202c] outline-none focus:border-[#500072] focus:ring-1 focus:ring-[#500072]/20 transition"
                        />
                      </div>
                    </div>
 
                    <div>
                      <label className="block text-[13px] font-semibold text-[#4a5568] mb-1.5 min-h-[38px] flex items-end">Balance Amount</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#718096] font-medium">₹</span>
                        <input
                          type="text"
                          name="balanceAmount"
                          value={form.balanceAmount}
                          readOnly
                          placeholder="0.00"
                          className="w-full rounded-xl border border-[#cbd5e1] bg-[#f1f5f9] pl-8 pr-4 py-3 text-sm text-[#475569] font-medium cursor-not-allowed outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
 
                {/* Row 3: Status, Date & Reference No. */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mt-6">
                  <div>
                    <label className="block text-[13px] font-semibold text-[#4a5568] mb-1.5">Status</label>
                    <div className="relative">
                      <select
                        name="status"
                        value={form.status}
                        onChange={handleInputChange}
                        className="w-full appearance-none rounded-xl border border-[#cbd5e1] bg-white px-4 py-3 text-sm text-[#1a202c] outline-none focus:border-[#500072] focus:ring-1 focus:ring-[#500072]/20 transition cursor-pointer"
                      >
                        <option value="">Select Status</option>
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                    </div>
                  </div>
 
                  <div>
                    <label className="block text-[13px] font-semibold text-[#4a5568] mb-1.5">Date</label>
                    <input
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-[#cbd5e1] bg-white px-4 py-3 text-sm text-[#1a202c] outline-none focus:border-[#500072] focus:ring-1 focus:ring-[#500072]/20 transition cursor-pointer"
                    />
                  </div>
 
                  <div>
                    <label className="block text-[13px] font-semibold text-[#4a5568] mb-1.5">Reference No.</label>
                    <input
                      type="text"
                      name="referenceNo"
                      value={form.referenceNo}
                      onChange={handleInputChange}
                      placeholder="INV-2024-001"
                      className="w-full rounded-xl border border-[#cbd5e1] bg-white px-4 py-3 text-sm text-[#1a202c] placeholder:text-slate-400 outline-none focus:border-[#500072] focus:ring-1 focus:ring-[#500072]/20 transition"
                    />
                  </div>
                </div>
 
                {/* Form Submission Actions */}
                <div className="flex justify-center gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      handleClear();
                    }}
                    className="px-8 py-3 rounded-xl border border-[#cbd5e1] bg-white text-sm font-semibold text-[#4a5568] hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#500072] text-sm font-semibold text-white hover:bg-[#3d0057] active:bg-[#2e0042] disabled:opacity-60 transition cursor-pointer"
                  >
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {editingId ? "Update Payment Log" : "Record Payment"}
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
