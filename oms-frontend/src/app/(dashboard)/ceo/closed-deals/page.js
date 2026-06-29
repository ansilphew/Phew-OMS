"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedPage from "@/components/auth/ProtectedPage";
import axiosInstance from "@/api/axiosInstance";
import { Globe, FileCheck, MessageSquare, ArrowLeft, Loader2, Trophy, Search } from "lucide-react";

const typeStyles = {
  project: {
    icon: Globe,
    accentColor: "border-l-[#4080ff]",
    iconBg: "bg-[#edf5ff]",
    iconColor: "text-[#3b82f6]",
    label: "Project",
    labelStyle: "bg-[#edf5ff] text-[#3b82f6]",
  },
  proposal: {
    icon: FileCheck,
    accentColor: "border-l-[#10b981]",
    iconBg: "bg-[#eefcf3]",
    iconColor: "text-[#10b981]",
    label: "Proposal",
    labelStyle: "bg-[#eefcf3] text-[#10b981]",
  },
  lead: {
    icon: MessageSquare,
    accentColor: "border-l-[#8b5cf6]",
    iconBg: "bg-[#f3f0ff]",
    iconColor: "text-[#8b5cf6]",
    label: "Lead",
    labelStyle: "bg-[#f3f0ff] text-[#8b5cf6]",
  },
};

export default function ClosedDealsPage() {
  const router = useRouter();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function fetchDeals() {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/dashboard/recent-winnings");
        if (res.data && res.data.success && isMounted) {
          // Filter to only include Closed Leads and Approved Proposals (these represent closed deals)
          const filteredDeals = (res.data.winnings || []).filter(
            (w) => w.type === "lead" || w.type === "proposal"
          );
          setDeals(filteredDeals);
        }
      } catch (err) {
        console.error("Failed to load closed deals:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchDeals();
    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = deals.filter((d) => {
    const matchSearch =
      !search ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.subtitle.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <ProtectedPage allowedRole="CEO">
      <div className="space-y-8 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/ceo")}
              className="flex items-center justify-center h-9 w-9 rounded-xl border border-[#e2e8f0] bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition cursor-pointer shadow-xs"
              title="Back to Dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-[#8b5cf6]" />
                <h1 className="app-heading-title">Closed Deals</h1>
                {!loading && (
                  <span className="rounded-lg bg-[#f3f0ff] px-2.5 py-0.5 text-[11px] font-bold text-[#8b5cf6] tracking-wide">
                    {filtered.length} TOTAL
                  </span>
                )}
              </div>
              <p className="app-body-muted mt-0.5">
                All closed business leads and approved client proposals
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-[#edf2f7] rounded-[20px] p-6 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search deals by client or project…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-[#e2e8f0] bg-[#fafafa] pl-10 pr-4 py-2.5 text-[13px] text-slate-700 placeholder:text-slate-400 outline-none focus:border-[#500072] focus:ring-1 focus:ring-[#500072]/20 transition"
              />
            </div>
          </div>
        </div>

        {/* Deals Table */}
        <div className="bg-white border border-[#edf2f7] rounded-[20px] shadow-xs overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-24 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin mr-3" />
              <span className="text-sm font-medium">Loading closed deals…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
              <Trophy className="h-10 w-10 opacity-30" />
              <p className="app-body-text">
                {search ? "No results match your search query." : "No closed deals recorded yet."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#f1f5f9]">
              {/* Table header */}
              <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-8 py-3.5 bg-[#fafafa] border-b border-[#ececec]">
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider w-8">#</span>
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">DETAILS</span>
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">TYPE</span>
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider text-right">CLOSED WHEN</span>
              </div>

              {filtered.map((deal, idx) => {
                const style = typeStyles[deal.type] || typeStyles.project;
                const Icon = style.icon;
                return (
                  <div
                    key={deal.id}
                    className={`grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center px-8 py-4 hover:bg-[#fafafa] transition-colors border-l-[3px] ${style.accentColor}`}
                  >
                    {/* Index */}
                    <span className="text-[12px] font-medium text-slate-400 w-8">
                      {String(idx + 1).padStart(2, "0")}
                    </span>

                    {/* Details */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] ${style.iconBg}`}>
                        <Icon className={`h-4.5 w-4.5 ${style.iconColor}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-semibold text-slate-800 truncate">{deal.title}</p>
                        <p className="text-[12px] text-slate-400 truncate mt-0.5">{deal.subtitle}</p>
                      </div>
                    </div>

                    {/* Type badge */}
                    <span className={`px-2.5 py-0.5 rounded-[6px] text-[11px] font-bold uppercase tracking-wide ${style.labelStyle}`}>
                      {style.label}
                    </span>

                    {/* Time */}
                    <span className="text-[12px] font-medium text-slate-400 text-right whitespace-nowrap">
                      {deal.time}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedPage>
  );
}
