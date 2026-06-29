"use client";

import { useEffect, useState } from "react";
import ProtectedPage from "@/components/auth/ProtectedPage";
import { getCurrentUser } from "@/lib/api";
import axiosInstance from "@/api/axiosInstance";
import {
  Award,
  Briefcase,
  HelpCircle,
  BellRing,
  Calendar,
  Globe,
  Server,
  AlertTriangle,
  ClipboardList,
  ShieldCheck,
  Wallet,
  ExternalLink,
  Download,
  Eye,
  BarChart3
} from "lucide-react";

export default function ClientPage() {
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeActivityTab, setActiveActivityTab] = useState("All Activity");
  
  // Dashboard viewMode: "dashboard" or "history"
  const [viewMode, setViewMode] = useState("dashboard");
  const [activeTxTab, setActiveTxTab] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const userData = await getCurrentUser();
        setUser(userData.user);

        const res = await axiosInstance.get("/dashboard/client-stats");
        if (res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Error loading client dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  // Filter activities based on tab
  const getFilteredActivities = () => {
    if (!data || !data.activityLog) return [];
    if (activeActivityTab === "All Activity") return data.activityLog;
    
    return data.activityLog.filter(act => {
      const type = (act.type || "").toLowerCase();
      if (activeActivityTab === "Creative") return type.includes("creative") || type.includes("design") || type.includes("brand");
      if (activeActivityTab === "Web") return type.includes("web") || type.includes("dev") || type.includes("host");
      if (activeActivityTab === "Marketing") return type.includes("marketing") || type.includes("social") || type.includes("seo");
      return true;
    });
  };

  // Filter transactions based on tab
  const getFilteredTransactions = () => {
    if (!data || !data.transactions) return [];
    if (activeTxTab === "All") return data.transactions;
    return data.transactions.filter(tx => tx.status === activeTxTab);
  };

  if (loading) {
    return (
      <ProtectedPage allowedRole="Client">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <span className="h-10 w-10 animate-spin rounded-full border-4 border-[#7a1e9f] border-t-transparent" />
            <span className="text-sm font-semibold text-slate-500">Loading your workspace...</span>
          </div>
        </div>
      </ProtectedPage>
    );
  }

  if (!data || !data.hasProject) {
    return (
      <ProtectedPage allowedRole="Client">
        <div className="space-y-8">
          <div className="rounded-2xl bg-gradient-to-r from-[#2b0a38] to-[#7a1e9f] p-8 text-white shadow-sm">
            <h1 className="text-2xl font-bold">Welcome Back, {user?.fullName || "Client"}!</h1>
            <p className="mt-2 text-sm text-white/80">
              Your client profile has been registered. We are setting up your project dashboard board right now.
            </p>
          </div>

          <div className="rounded-2xl border-2 border-dashed border-[#eef0f3] bg-white p-16 text-center">
            <Briefcase className="mx-auto h-16 w-16 text-slate-300" />
            <h3 className="mt-6 text-xl font-bold text-slate-700">Project Onboarding In Progress</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
              We are preparing your workspace board and onboarding details. Our development sprint tracking metrics
              will be live here shortly.
            </p>
          </div>
        </div>
      </ProtectedPage>
    );
  }

  const {
    overallProgress,
    pendingTasks,
    pendingTasksText,
    pendingPayment,
    paymentDetails,
    activeServices,
    milestones,
  } = data;

  const filteredActivities = getFilteredActivities();
  const filteredTransactions = getFilteredTransactions();

  // Simple Pagination config for transactions (5 items per page)
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  return (
    <ProtectedPage allowedRole="Client">
      <div className="space-y-6">
        
        {/* Header Title Section */}
        <div className="flex items-center justify-between pb-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 font-sans tracking-tight">Project Workspace Overview</h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Workspace associated with: {data.clientName}</p>
          </div>
          {viewMode === "history" && (
            <button
              onClick={() => {
                setViewMode("dashboard");
                setCurrentPage(1);
              }}
              className="px-4 py-2 text-xs font-bold text-[#7a1e9f] hover:bg-slate-50 border border-slate-200 rounded-xl transition duration-150 cursor-pointer"
            >
              ← Back to Dashboard
            </button>
          )}
        </div>

        {viewMode === "dashboard" ? (
          <>
            {/* Metrics Grid */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              
              {/* Overall Progress Card */}
              <div className="rounded-2xl border border-[#eef0f3] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.01)] hover:shadow-xs transition duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Overall Progress</span>
                  <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                    <BarChart3 className="h-4.5 w-4.5" />
                  </div>
                </div>
                <p className="mt-2 text-3xl font-extrabold text-slate-850 font-sans">{overallProgress}%</p>
                <div className="mt-4 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${overallProgress}%` }} 
                  />
                </div>
              </div>

              {/* Pending Tasks Card */}
              <div className="rounded-2xl border border-[#eef0f3] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.01)] hover:shadow-xs transition duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Tasks</span>
                  <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
                    <ClipboardList className="h-4.5 w-4.5" />
                  </div>
                </div>
                <p className="mt-2 text-3xl font-extrabold text-slate-850 font-sans">{pendingTasks}</p>
                <span className="text-[11px] text-slate-400 font-semibold block mt-3">{pendingTasksText}</span>
              </div>

              {/* Pending Payment Card */}
              <div className="rounded-2xl border border-[#eef0f3] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.01)] hover:shadow-xs transition duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Payment</span>
                  <div className="rounded-lg bg-red-50 p-2 text-red-500">
                    <Wallet className="h-4.5 w-4.5" />
                  </div>
                </div>
                <p className="mt-2 text-3xl font-extrabold text-slate-850 font-sans">
                  ₹{pendingPayment >= 1000 ? `${(pendingPayment / 1000).toFixed(0)}k` : pendingPayment}
                </p>
                <span className="text-[11px] text-red-500 font-semibold block mt-3">
                  {pendingPayment > 0 ? "Overdue by 2 days" : "No balance due"}
                </span>
              </div>

              {/* Active Services Card */}
              <div className="rounded-2xl border border-[#eef0f3] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.01)] hover:shadow-xs transition duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Services</span>
                  <div className="rounded-lg bg-green-50 p-2 text-green-600">
                    <ShieldCheck className="h-4.5 w-4.5" />
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {activeServices.map((service, idx) => {
                    const colors = [
                      "bg-blue-50 text-blue-600 border-blue-100",
                      "bg-green-50 text-green-600 border-green-100",
                      "bg-amber-50 text-amber-600 border-amber-100"
                    ];
                    const cls = colors[idx % colors.length];
                    return (
                      <span 
                        key={service} 
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border tracking-wider ${cls}`}
                      >
                        {service}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Dashboard Main Content Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              
              {/* Left Column: Milestones & Payments */}
              <div className="space-y-6 lg:col-span-2">
                
                {/* Project Milestones Card */}
                <div className="rounded-2xl border border-[#eef0f3] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
                  <h2 className="text-base font-bold text-slate-800 mb-5 font-sans">Project Milestones</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {milestones.map((milestone) => {
                      const isCompleted = milestone.status === "Completed";
                      const isInReview = milestone.status === "In Review";
                      const isActive = milestone.status === "Active" || milestone.status === "Delayed";

                      const badgeCls = isCompleted 
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                        : isInReview 
                        ? "bg-blue-50 text-blue-600 border-blue-100" 
                        : isActive 
                        ? "bg-amber-50 text-amber-600 border-amber-100" 
                        : "bg-slate-100 text-slate-500 border-slate-200";

                      const barCls = isCompleted 
                        ? "bg-emerald-500" 
                        : isInReview 
                        ? "bg-blue-500" 
                        : isActive 
                        ? "bg-amber-500" 
                        : "bg-slate-400";

                      return (
                        <div 
                          key={milestone.name} 
                          className="rounded-xl border border-slate-100 bg-white p-4 hover:border-slate-200 transition duration-150"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[13px] font-bold text-slate-700">{milestone.name}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${badgeCls}`}>
                              {milestone.status}
                            </span>
                          </div>
                          <p className="mt-3 text-2xl font-extrabold text-slate-850">{milestone.percentage}%</p>
                          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${barCls}`} 
                              style={{ width: `${milestone.percentage}%` }} 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Payment Status Card */}
                <div className="rounded-2xl border border-[#eef0f3] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
                  <h2 className="text-base font-bold text-slate-800 mb-5 font-sans">Payment Status</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <span>Paid (₹{paymentDetails.paid.toLocaleString()})</span>
                      <span>Total (₹{paymentDetails.total.toLocaleString()})</span>
                    </div>
                    
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full" 
                        style={{ width: `${(paymentDetails.paid / paymentDetails.total) * 100}%` }} 
                      />
                    </div>
                    
                    <div className="text-sm font-semibold text-slate-800 pt-1">
                      Remaining Balance: <span className="font-extrabold">₹{paymentDetails.balance.toLocaleString()}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-xs">
                      <div>
                        <span className="block text-slate-400 font-bold uppercase tracking-wider mb-1">Last Payment</span>
                        <span className="font-extrabold text-slate-700">{paymentDetails.lastPaymentDate}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-bold uppercase tracking-wider mb-1">Next Due</span>
                        <span className="font-extrabold text-red-500">{paymentDetails.nextDueDate}</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button 
                        type="button" 
                        onClick={() => {
                          setViewMode("history");
                          setCurrentPage(1);
                        }}
                        className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-[#7a1e9f] hover:text-[#5f137e] text-xs font-bold transition duration-155 cursor-pointer text-center"
                      >
                        View Payment History
                      </button>
                    </div>
                  </div>
                </div>

                {/* Shared Resources Card */}
                <div className="rounded-2xl border border-[#eef0f3] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
                  <h2 className="text-base font-bold text-slate-800 mb-4 font-sans">Shared Resources</h2>
                  <a 
                    href="https://drive.google.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex flex-col items-center justify-center p-6 border border-slate-150 hover:border-slate-300 rounded-xl bg-slate-50/20 hover:bg-slate-55 transition group cursor-pointer"
                  >
                    <svg className="h-7 w-7 shrink-0 transition-transform group-hover:scale-105" viewBox="0 0 100 87" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M30 0h40l30 52H70L30 0z" fill="#1967D2"/>
                      <path d="M70 52H0L35 87h70L70 52z" fill="#FBBC05"/>
                      <path d="M30 0L0 52l15 26 35-61L30 0z" fill="#137333"/>
                    </svg>
                    <span className="text-xs font-bold text-slate-600 mt-3 group-hover:text-slate-850 flex items-center gap-1">
                      Access Project Assets on Google Drive
                      <ExternalLink className="h-3 w-3 opacity-60" />
                    </span>
                  </a>
                </div>

              </div>

              {/* Right Column: Activity Log */}
              <div className="space-y-6 lg:col-span-1">
                
                {/* Activity Log Card */}
                <div className="rounded-2xl border border-[#eef0f3] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.01)] h-full flex flex-col">
                  <h2 className="text-base font-bold text-slate-800 mb-4 font-sans">Activity Log</h2>
                  
                  {/* Filter Tabs */}
                  <div className="flex flex-wrap gap-1 bg-slate-50/80 p-1 rounded-xl border border-slate-100">
                    {["All Activity", "Creative", "Web", "Marketing"].map((tab) => {
                      const isActive = activeActivityTab === tab;
                      return (
                        <button
                          key={tab}
                          onClick={() => setActiveActivityTab(tab)}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold transition text-center whitespace-nowrap cursor-pointer ${
                            isActive 
                              ? "bg-[#7a1e9f] text-white shadow-xs" 
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          {tab === "All Activity" ? "All Activity" : tab}
                        </button>
                      );
                    })}
                  </div>

                  {/* Timeline list */}
                  <div className="mt-6 relative flex-1 pl-4 border-l border-slate-100 space-y-6">
                    {filteredActivities.length > 0 ? (
                      filteredActivities.map((act) => {
                        const type = (act.type || "").toLowerCase();
                        let dotColor = "bg-blue-500";
                        if (type.includes("creative") || type.includes("design") || type.includes("brand")) {
                          dotColor = "bg-blue-500";
                        } else if (type.includes("web") || type.includes("dev") || type.includes("host")) {
                          dotColor = "bg-emerald-500";
                        } else if (type.includes("marketing") || type.includes("social") || type.includes("seo")) {
                          dotColor = "bg-amber-500";
                        }

                        return (
                          <div key={act.id} className="relative">
                            {/* Timeline dot */}
                            <div className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white ring-4 ring-transparent ${dotColor}`} />
                            
                            <div>
                              <p className="text-xs font-bold text-slate-850 leading-tight">{act.title}</p>
                              <p className="text-[10px] text-slate-400 font-semibold mt-1">{act.subtitle}</p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center text-xs text-slate-400 py-12">
                        No recent activities in this category.
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          </>
        ) : (
          /* Transactions View Mode */
          <div className="rounded-2xl border border-[#eef0f3] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.01)] overflow-hidden">
            
            {/* Transaction Header */}
            <div className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 gap-4">
              <h2 className="text-base font-bold text-slate-800 font-sans">Detailed Transactions</h2>
              
              {/* Transaction Filters */}
              <div className="flex gap-1 bg-slate-50/80 p-1 rounded-xl border border-slate-100 self-start sm:self-auto">
                {["All", "Paid", "Pending"].map((tab) => {
                  const isActive = activeTxTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTxTab(tab);
                        setCurrentPage(1);
                      }}
                      className={`py-1.5 px-4 rounded-lg text-xs font-bold transition cursor-pointer ${
                        isActive 
                          ? "bg-[#7a1e9f] text-white shadow-xs" 
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-slate-50/30">
                    <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-6 py-4 border-b border-slate-100">
                      Date
                    </th>
                    <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-6 py-4 border-b border-slate-100">
                      Description
                    </th>
                    <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-6 py-4 border-b border-slate-100">
                      Amount
                    </th>
                    <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-6 py-4 border-b border-slate-100">
                      Status
                    </th>
                    <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-6 py-4 border-b border-slate-100">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedTransactions.length > 0 ? (
                    paginatedTransactions.map((tx) => {
                      const isPaid = tx.status === "Paid";
                      const isPending = tx.status === "Pending";
                      
                      const badgeCls = isPaid 
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                        : isPending 
                        ? "bg-blue-50 text-blue-600 border-blue-100" 
                        : "bg-red-50 text-red-600 border-red-100";

                      const actIcon = tx.action === "Invoice" 
                        ? <Download className="h-3.5 w-3.5" /> 
                        : tx.action === "Preview" 
                        ? <Eye className="h-3.5 w-3.5" /> 
                        : <Wallet className="h-3.5 w-3.5" />;

                      const isPayNow = tx.action === "Pay Now";

                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/20 transition duration-150">
                          <td className="px-6 py-4 text-xs font-semibold text-slate-500 whitespace-nowrap">
                            {tx.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-xs font-bold text-slate-800">{tx.description}</div>
                            <div className="text-[10px] font-semibold text-slate-400 mt-0.5">{tx.invoiceNo}</div>
                          </td>
                          <td className="px-6 py-4 text-xs font-extrabold text-slate-800 whitespace-nowrap">
                            ₹{tx.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${badgeCls}`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              type="button"
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                                isPayNow 
                                  ? "bg-[#7a1e9f] hover:bg-[#621382] text-white border-[#7a1e9f]" 
                                  : "text-slate-600 hover:bg-slate-50 border-slate-200"
                              }`}
                            >
                              {actIcon}
                              <span>{tx.action}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-xs text-slate-400 font-semibold">
                        No transactions found in this category.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100 bg-slate-50/30">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Showing {paginatedTransactions.length > 0 ? startIndex + 1 : 0}-
                {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of{" "}
                {filteredTransactions.length} transactions
              </span>

              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  {/* Prev Button */}
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                        currentPage === pageNum
                          ? "bg-[#7a1e9f] text-white border-[#7a1e9f] shadow-xs"
                          : "text-slate-500 hover:bg-slate-50 border-slate-200"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  {/* Next Button */}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </ProtectedPage>
  );
}
