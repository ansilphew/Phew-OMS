"use client";

import React, { useState, useEffect, useCallback } from "react";
import ProtectedPage from "@/components/auth/ProtectedPage";
import { getLeads } from "@/lib/api";
import {
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  ExternalLink,
  Loader2,
  CheckCircle2,
  ShieldAlert,
  ArrowUpRight
} from "lucide-react";

// --- Helpers ---
function getInitials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function BDEClientsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  const fetchClientsData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getLeads();
      setLeads(data.leads || []);
    } catch (err) {
      console.error("Error fetching clients for BDE:", err);
      setError("Failed to load clients directory.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientsData();
  }, [fetchClientsData]);

  // Filter won accounts (status === "Close")
  const wonClients = leads.filter((lead) => lead.status === "Close");

  // Search filter
  const filteredClients = wonClients.filter((client) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const orgMatch = client.organization?.toLowerCase().includes(q);
      const nameMatch = client.projectName?.toLowerCase().includes(q);
      const emailMatch = client.email?.toLowerCase().includes(q);
      const phoneMatch = client.phone?.toLowerCase().includes(q);
      if (!orgMatch && !nameMatch && !emailMatch && !phoneMatch) return false;
    }
    return true;
  });

  return (
    <ProtectedPage allowedRole="BDE" title="BDE Clients Directory">
      <div className="space-y-6 pb-16">
        
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-slate-800">Registered Clients Directory</h2>
          <p className="text-xs text-slate-400 font-medium">
            Review active corporate accounts, profile contact points, and converted pipeline accounts.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex w-full items-center gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3.5 text-xs font-semibold text-red-650 animate-fadeIn">
            <ShieldAlert className="h-4.5 w-4.5 text-red-500" />
            {error}
          </div>
        )}

        {/* Search Filter Panel */}
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search registered clients by company name, project name, or email..."
              className="w-full rounded-xl border border-[#cbd5e1] bg-white pl-10 pr-4 py-2.5 text-xs text-[#1a202c] placeholder:text-slate-400 outline-none focus:border-[#500072] transition"
            />
          </div>
        </div>

        {/* Grid Directory / Dynamic Rendering */}
        {loading ? (
          <div className="flex h-[35vh] items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-[#500072]" />
              <span className="text-xs font-semibold text-slate-400">Loading clients directory...</span>
            </div>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center max-w-2xl mx-auto py-16 shadow-[0_4px_20px_rgba(0,0,0,0.01)] animate-fadeIn">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-400 mb-4 border border-slate-100">
              <Users className="h-6 w-6 text-slate-500" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">No Registered Clients Found</h3>
            {searchQuery ? (
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                We couldn't find any clients matching your search. Try broadening your keywords.
              </p>
            ) : (
              <>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Once a sales pipeline lead's status is updated to <span className="font-bold text-green-600">Close</span>, they are converted and listed here automatically.
                </p>
                <div className="mt-6">
                  <a
                    href="/bde/leads"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-[#500072] hover:bg-[#3d0057] transition rounded-xl shadow-xs"
                  >
                    Go to Pipeline
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredClients.map((client) => {
              const initials = client.organization
                ? getInitials(client.organization)
                : getInitials(client.projectName || "Client");

              return (
                <div
                  key={client._id}
                  className="rounded-2xl border border-slate-150 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.01)] hover:border-[#500072]/20 hover:shadow-xs transition duration-200 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    
                    {/* Client Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-[12px] font-extrabold text-green-700 border border-green-100">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-[14px] font-bold text-slate-800 leading-tight truncate">
                            {client.organization || "No Org Name"}
                          </h4>
                          {client.designation ? (
                            <span className="text-[10px] bg-slate-50 text-slate-500 font-bold border border-slate-100 px-1.5 py-0.5 rounded mt-1 inline-block">
                              👤 {client.designation}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Corporate Account</span>
                          )}
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-green-50 text-green-700 border border-green-100">
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                        Active
                      </span>
                    </div>

                    {/* Associated Project / Service */}
                    <div className="bg-[#f8fafc] rounded-xl p-3 border border-slate-100/70 space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                        Workspace Project
                      </span>
                      <p className="text-[12.5px] font-bold text-slate-700 flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                        {client.projectName}
                      </p>
                    </div>

                    {/* Contact details */}
                    <div className="space-y-2.5 text-xs text-slate-500 font-medium pt-1">
                      {client.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{client.phone}</span>
                        </div>
                      )}
                      {client.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{client.email}</span>
                        </div>
                      )}
                      {client.address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{client.address}</span>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Actions Bar */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2">
                    {client.email && (
                      <a
                        href={`mailto:${client.email}`}
                        className="flex-1 py-2 px-3 text-center border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-[11px] font-bold rounded-lg transition"
                      >
                        Email Client
                      </a>
                    )}
                    {client.phone && (
                      <a
                        href={`tel:${client.phone}`}
                        className="flex items-center justify-center h-8.5 w-8.5 border border-slate-250 hover:border-slate-300 text-slate-600 rounded-lg hover:bg-slate-55 transition"
                        title="Call Client"
                      >
                        <Phone className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </ProtectedPage>
  );
}
