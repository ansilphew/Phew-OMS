"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedPage from "@/components/auth/ProtectedPage";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";

const CURRENCY_SYMBOLS = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

const STATUS_STYLES = {
  Approved: "bg-green-50 border border-green-200 text-green-700",
  Rejected: "bg-red-50 border border-red-200 text-red-600",
  Pending:  "bg-amber-50 border border-amber-200 text-amber-600",
};

export default function ProposalDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchProposal = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/proposals/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Proposal not found.");
      const data = await res.json();
      setProposal(data.proposal);
    } catch (err) {
      setError(err.message || "Failed to load proposal.");
    } finally {
      setLoading(false);
    }
  }, [API, id]);

  useEffect(() => {
    if (id) fetchProposal();
  }, [id, fetchProposal]);

  // ── Helpers ─────────────────────────────────────────────────
  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

  const formatAmount = (amount, currency) => {
    if (amount === undefined || amount === null) return "—";
    const sym = CURRENCY_SYMBOLS[currency] || "";
    return `${sym} ${Number(amount).toLocaleString("en-IN")}`;
  };

  // ── Loading State ────────────────────────────────────────────
  if (loading) {
    return (
      <ProtectedPage allowedRole="CEO, BDE, Accountant, Sales Head">
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#500072]" />
        </div>
      </ProtectedPage>
    );
  }

  // ── Error State ──────────────────────────────────────────────
  if (error || !proposal) {
    return (
      <ProtectedPage allowedRole="CEO, BDE, Accountant, Sales Head">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-slate-500">
          <AlertCircle className="h-10 w-10 text-red-400" />
          <p className="text-[14px] font-medium">{error || "Proposal not found."}</p>
          <button
            onClick={() => router.push("/ceo/proposal-management")}
            className="flex items-center gap-2 rounded-xl bg-[#500072] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[#3d0057] transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Proposals
          </button>
        </div>
      </ProtectedPage>
    );
  }

  const rows = [
    { label: "Project Name",   value: proposal.clientName || "—" },
    { label: "Reference No",   value: proposal.refNo || "—" },
    { label: "Category",       value: proposal.category || "—" },
    { label: "Contact No",     value: proposal.contactNumber || "—" },
    { label: "Date",           value: formatDate(proposal.date) },
    { label: "Currency",       value: proposal.currency ? `${proposal.currency} (${CURRENCY_SYMBOLS[proposal.currency] || ""})` : "—" },
    { label: "Amount",         value: formatAmount(proposal.amount, proposal.currency) },
    { label: "GST Amount",     value: proposal.gstAmount || "—" },
    { label: "Status",         value: proposal.status || "—" },
  ];

  const statusStyle = STATUS_STYLES[proposal.status] || STATUS_STYLES.Pending;

  return (
    <ProtectedPage allowedRole="CEO, BDE, Accountant, Sales Head">
      <div className="max-w-2xl mx-auto space-y-6 pb-16">

        {/* Back button */}
        <button
          onClick={() => router.push("/ceo/proposal-management")}
          className="flex items-center gap-2 text-[13px] font-semibold text-slate-500 hover:text-[#500072] transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Proposals
        </button>

        {/* Detail Card */}
        <div className="bg-white rounded-2xl border border-[#e8edf3] shadow-sm overflow-hidden">

          {/* Card Header */}
          <div className="px-8 py-6 border-b border-[#edf2f7]">
            <h2 className="text-[18px] font-bold text-[#1a202c]">Proposal Details</h2>
            <p className="text-[12.5px] text-slate-400 mt-0.5">Full information for this proposal</p>
          </div>

          {/* Status Badge */}
          <div className="px-8 py-4 border-b border-[#edf2f7] flex items-center gap-3">
            <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[12px] font-bold uppercase tracking-widest ${statusStyle}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {proposal.status}
            </span>
          </div>

          {/* Key-Value Rows */}
          <div className="px-8 py-4 divide-y divide-[#f1f5f9]">
            {rows.map(({ label, value }) => (
              <div key={label} className="flex items-start py-4">
                {/* Label */}
                <span className="w-40 shrink-0 text-[13.5px] font-semibold text-slate-500">
                  {label}
                </span>
                {/* Colon */}
                <span className="mx-5 text-[13.5px] text-slate-300 select-none">:</span>
                {/* Value */}
                <span className="flex-1 text-[14px] font-medium text-[#1a202c] break-words leading-relaxed">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </ProtectedPage>
  );
}
