"use client";

import React, { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedPage from "@/components/auth/ProtectedPage";
import { getCurrentUser } from "@/lib/api";
import axiosInstance from "@/api/axiosInstance";
import { ArrowLeft, Lock, Mail, Phone, MapPin, Calendar, Briefcase, CheckCircle } from "lucide-react";

export default function LeadDetailPage({ params }) {
  const router = useRouter();
  const { id } = use(params);

  const [lead, setLead] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // 1. Fetch user role
        const userData = await getCurrentUser();
        setUserRole(userData?.user?.role || "");

        // 2. Fetch Lead details
        const leadRes = await axiosInstance.get(`/leads/${id}`);
        const leadData = leadRes.data.lead;
        setLead(leadData);

        // 3. Fetch Payments
        try {
          const paymentsRes = await axiosInstance.get("/payments");
          const allPayments = paymentsRes.data.payments || [];
          // Filter payments matching the lead's project name
          const matched = allPayments.filter(
            (p) => p.projectName?.toLowerCase() === leadData.projectName?.toLowerCase()
          );
          setPayments(matched);
        } catch (payErr) {
          console.warn("Failed to fetch payments", payErr);
        }

      } catch (err) {
        console.error(err);
        setError("Failed to load details. The lead may not exist or you lack permission.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const isCeoOrBde = ["CEO", "BDE", "Sales Head"].includes(userRole);
  const isPm = userRole === "Project Manager";
  const isAccountant = userRole === "Accountant";

  // Financial summary calculated from matched payments
  const totalOffered = payments.length > 0 ? (payments[0].totalOfferedAmount || 0) : 0;
  const totalReceived = payments.reduce((sum, p) => sum + (p.amountReceived || 0), 0);
  const balance = totalOffered - totalReceived;

  const renderField = (label, value, isRestricted, icon) => {
    if (isRestricted) {
      return (
        <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">{label}</span>
            <span className="text-xs text-slate-500 font-semibold mt-1 block">Restricted (Access Denied)</span>
          </div>
          <Lock className="h-4 w-4 text-slate-300" />
        </div>
      );
    }
    return (
      <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">{label}</span>
          <span className="text-sm font-bold text-slate-700 mt-1 block max-w-[170px] truncate" title={value}>
            {value || "—"}
          </span>
        </div>
        {icon && <div className="text-slate-400 shrink-0 ml-3">{icon}</div>}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#65008c]/20 border-t-[#65008c]" />
          <p className="text-sm text-slate-500 font-medium">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="p-8 text-center bg-red-50 border border-red-100 rounded-2xl max-w-xl mx-auto my-12">
        <p className="text-red-700 font-semibold">{error || "Lead not found."}</p>
        <button 
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <ProtectedPage>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
              lead.priority === "High" ? "bg-red-50 text-red-700" :
              lead.priority === "Medium" ? "bg-orange-50 text-orange-700" : "bg-slate-100 text-slate-700"
            }`}>
              {lead.priority} Priority
            </span>
            <span className="px-2.5 py-1 text-xs font-bold bg-purple-50 text-purple-700 rounded-full">
              {lead.status} Status
            </span>
          </div>
        </div>

        {/* Lead Identity Summary Card */}
        <div className="rounded-2xl bg-gradient-to-r from-[#2b0a38] to-[#7a1e9f] p-8 text-white shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase opacity-75">Workspace Lead details</span>
            <h1 className="text-2xl font-bold mt-1.5">{lead.projectName}</h1>
            <p className="mt-1 text-sm text-white/80">Organization: {lead.organization || "No Organization Specified"}</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold px-3 py-1 bg-white/10 rounded-full">
              Role: {userRole}
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* General Metadata */}
          <div className="bg-white border border-[#eef0f3] rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#65008c] border-b pb-2">
              Lead Specifications
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {renderField("Project Name", lead.projectName, false, <Briefcase className="h-4 w-4" />)}
              {renderField("Client Organization", lead.organization, userRole === "Client")}
              {renderField("Lead Status", lead.status, false, <CheckCircle className="h-4 w-4" />)}
              {renderField("Designation", lead.designation, !["CEO", "BDE", "Sales Head", "Project Manager"].includes(userRole))}
              {renderField("Lead Source", lead.source, !["CEO", "BDE", "Sales Head", "Project Manager"].includes(userRole))}
              {renderField("Created By", lead.createdBy?.fullName || "System Seeder", !["CEO", "BDE", "Sales Head", "Project Manager"].includes(userRole))}
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-white border border-[#eef0f3] rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#65008c] border-b pb-2 flex items-center justify-between">
              <span>Client Contact Information</span>
              {userRole !== "CEO" && <Lock className="h-3.5 w-3.5 text-slate-400" />}
            </h3>
            <div className="space-y-4">
              {renderField("Email Address", lead.email, userRole !== "CEO", <Mail className="h-4 w-4" />)}
              {renderField("Phone Number", lead.phone, userRole !== "CEO", <Phone className="h-4 w-4" />)}
              {renderField("Office Address", lead.address, userRole !== "CEO", <MapPin className="h-4 w-4" />)}
            </div>
          </div>
        </div>

        {/* Financials & Payments Details (CEO & Accountant only) */}
        <div className="bg-white border border-[#eef0f3] rounded-2xl p-6 shadow-xs space-y-5">
          <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#65008c] border-b pb-2 flex items-center justify-between">
            <span>Project Financials & Payments</span>
            {!["CEO", "Accountant"].includes(userRole) && <Lock className="h-3.5 w-3.5 text-slate-400" />}
          </h3>

          {!["CEO", "Accountant"].includes(userRole) ? (
            <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-slate-100 rounded-xl text-slate-400">
              <Lock className="h-8 w-8 mb-2" />
              <p className="text-sm font-semibold">Payment details are restricted to CEO and Accountant roles only.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Financial Stats Grid */}
              <div className="grid gap-4.5 sm:grid-cols-3">
                <div className="p-4.5 bg-slate-50 border border-slate-100 rounded-2xl">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Contract offered</span>
                  <span className="text-2xl font-bold text-slate-800 mt-1 block">
                    ${totalOffered.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="p-4.5 bg-green-50/50 border border-green-100/50 rounded-2xl">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-green-600 block">Total Amount Received</span>
                  <span className="text-2xl font-bold text-green-700 mt-1 block">
                    ${totalReceived.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="p-4.5 bg-orange-50/50 border border-orange-100/50 rounded-2xl">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 block">Total Outstanding Balance</span>
                  <span className="text-2xl font-bold text-orange-700 mt-1 block">
                    ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Transactions History Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Transaction Ledger History
                </h4>
                {payments.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Reference No</th>
                          <th className="px-4 py-3">Service Type</th>
                          <th className="px-4 py-3">Amount Received</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 font-medium text-slate-600">
                        {payments.map((p) => (
                          <tr key={p._id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3">{p.date ? new Date(p.date).toLocaleDateString() : "—"}</td>
                            <td className="px-4 py-3 font-mono">{p.referenceNo}</td>
                            <td className="px-4 py-3">{p.serviceType}</td>
                            <td className="px-4 py-3 text-slate-800 font-semibold">${(p.amountReceived || 0).toLocaleString()}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                p.status === "Completed" ? "bg-green-50 text-green-700" :
                                p.status === "Ongoing" ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-orange-700"
                              }`}>
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 text-center border border-dashed rounded-xl text-slate-400 italic">
                    No payment collections have been recorded for this lead's project.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Activities and Comments Feed (CEO, BDE, PM only) */}
        {["CEO", "BDE", "Sales Head", "Project Manager"].includes(userRole) && (
          <div className="bg-white border border-[#eef0f3] rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#65008c] border-b pb-2">
              Activities & Comments Feed
            </h3>
            {lead.activities && lead.activities.length > 0 ? (
              <div className="space-y-4">
                {lead.activities.map((act, index) => (
                  <div key={index} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs space-y-1.5 max-w-2xl">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="font-semibold">{act.actorName} ({act.action})</span>
                      <span>{new Date(act.timestamp).toLocaleString()}</span>
                    </div>
                    {act.notes && <p className="text-slate-700 font-medium leading-relaxed">{act.notes}</p>}
                    {act.file && act.file.url && (
                      <div className="pt-1.5">
                        <a 
                          href={act.file.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-[#65008c] hover:underline font-bold"
                        >
                          📎 {act.file.name || "Attachment"} ({act.file.size || "Unknown Size"})
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">No activity logs recorded for this lead.</p>
            )}
          </div>
        )}

        {/* Tasks and Checklist (CEO, BDE, PM only) */}
        {["CEO", "BDE", "Sales Head", "Project Manager"].includes(userRole) && (
          <div className="bg-white border border-[#eef0f3] rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#65008c] border-b pb-2">
              Tasks Checklist
            </h3>
            {lead.todos && lead.todos.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {lead.todos.map((todo, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 border border-slate-100 rounded-2xl bg-slate-50/50 text-xs">
                    <input 
                      type="checkbox" 
                      checked={todo.completed} 
                      disabled 
                      className="mt-0.5 rounded border-slate-300 text-[#65008c] focus:ring-[#65008c] h-4 w-4 cursor-not-allowed"
                    />
                    <div className="space-y-1">
                      <p className={`font-semibold text-slate-800 ${todo.completed ? "line-through text-slate-400 font-normal" : ""}`}>
                        {todo.task}
                      </p>
                      {todo.description && <p className="text-slate-500 font-medium">{todo.description}</p>}
                      {todo.dueDate && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold mt-1">
                          <Calendar className="h-3 w-3" />
                          <span>Due: {new Date(todo.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">No tasks assigned for this lead.</p>
            )}
          </div>
        )}
      </div>
    </ProtectedPage>
  );
}
