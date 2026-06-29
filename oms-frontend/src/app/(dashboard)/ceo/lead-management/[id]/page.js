"use client";

import React, { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProtectedPage from "@/components/auth/ProtectedPage";
import { getLead, updateLead, getCurrentUser } from "@/lib/api";
import {
  ArrowLeft,
  Zap,
  CheckSquare,
  User,
  Plus,
  Loader2,
  Clock,
  Download,
  Mail,
  FileText,
  X,
  CheckCircle,
  File,
  ChevronDown,
  Pencil,
  Trash2
} from "lucide-react";

// Helper to format dates
function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const day = d.getDate();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

const STATUSES = ["Contacted", "Meeting", "Proposal", "Close", "Lost"];

export default function LeadDetailPage({ params }) {
  const router = useRouter();
  const { id } = use(params);

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // Active Tab: "activities", "todos", "contact"
  const [activeTab, setActiveTab] = useState("activities");

  // Activity Tab form states
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [activityForm, setActivityForm] = useState({
    type: "Call",
    date: "",
    subject: "",
    notes: ""
  });
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await getCurrentUser();
        if (data && data.user) {
          setCurrentUser(data.user);
        }
      } catch (err) {
        // Safe fallback
      }
    }
    loadUser();
  }, []);

  const [showTodoModal, setShowTodoModal] = useState(false);
  const [newTodo, setNewTodo] = useState({
    task: "",
    dueDate: "",
    assignee: "Select Member",
    category: "Creative",
    description: ""
  });

  // Contact Details Form state
  const [contactForm, setContactForm] = useState({
    projectName: "",
    designation: "",
    email: "",
    phone: "",
    organization: "",
    address: "",
    source: "",
    priority: "",
    status: ""
  });

  const [isEditingContact, setIsEditingContact] = useState(false);

  const fetchLeadDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getLead(id);
      let currentLead = data.lead;



      setLead(currentLead);
      setContactForm({
        projectName: currentLead.projectName || "",
        designation: currentLead.designation || "",
        email: currentLead.email || "",
        phone: currentLead.phone || "",
        organization: currentLead.organization || "",
        address: currentLead.address || "",
        source: currentLead.source || "Referral",
        priority: currentLead.priority || "Medium",
        status: currentLead.status || "Contacted"
      });
    } catch (err) {
      setError(err.message || "Failed to fetch lead details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadDetails();
  }, [id]);

  // Handle saving contact changes
  const handleSaveContact = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setSuccessMsg("");
      const updatedData = await updateLead(id, contactForm);
      setLead(updatedData.lead);
      setIsEditingContact(false);
      setSuccessMsg("Lead profile updated successfully.");
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      setError(err.message || "Failed to update lead.");
    }
  };

  // Handle saving a new activity from inline form
  const handleSaveActivity = async (e) => {
    e.preventDefault();
    if (!activityForm.subject.trim()) {
      return;
    }

    try {
      setError("");
      const timestamp = activityForm.date ? new Date(activityForm.date).toISOString() : new Date().toISOString();
      
      const activityPayload = {
        actorName: currentUser?.name || "Test CEO",
        action: `${activityForm.type}: ${activityForm.subject}`,
        type: activityForm.type.toUpperCase(),
        notes: activityForm.notes,
        timestamp: timestamp
      };

      const updatedActivities = [activityPayload, ...(lead.activities || [])];
      
      const updatedData = await updateLead(id, { activities: updatedActivities });
      setLead(updatedData.lead);
      
      // Reset & close inline form view
      setActivityForm({
        type: "Call",
        date: "",
        subject: "",
        notes: ""
      });
      setIsAddingActivity(false);
      setSuccessMsg("Activity timeline log updated.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to log new activity.");
    }
  };

  // Handle adding a new to-do
  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.task.trim()) {
      return;
    }

    try {
      setError("");
      const todoPayload = {
        task: newTodo.task,
        completed: false,
        dueDate: newTodo.dueDate ? new Date(newTodo.dueDate).toISOString() : new Date(Date.now() + 86400000).toISOString(),
        assignee: newTodo.assignee === "Select Member" ? "" : newTodo.assignee,
        category: newTodo.category,
        description: newTodo.description
      };

      const updatedTodos = [...(lead.todos || []), todoPayload];

      const updatedData = await updateLead(id, { todos: updatedTodos });
      setLead(updatedData.lead);

      setNewTodo({
        task: "",
        dueDate: "",
        assignee: "Select Member",
        category: "Creative",
        description: ""
      });
      setShowTodoModal(false);
      setSuccessMsg("New to-do item added.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to add to-do.");
    }
  };

  // Handle toggling checkmark of to-do
  const handleToggleTodo = async (index) => {
    try {
      const updatedTodos = lead.todos.map((todo, idx) => {
        if (idx === index) {
          return { ...todo, completed: !todo.completed };
        }
        return todo;
      });

      const updatedData = await updateLead(id, { todos: updatedTodos });
      setLead(updatedData.lead);
    } catch (err) {
      setError("Failed to update to-do task status.");
    }
  };

  // Handle deleting a to-do task
  const handleDeleteTodo = async (index) => {
    try {
      setError("");
      setSuccessMsg("");
      const updatedTodos = lead.todos.filter((_, idx) => idx !== index);
      const updatedData = await updateLead(id, { todos: updatedTodos });
      setLead(updatedData.lead);
      setSuccessMsg("Task deleted successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to delete to-do task.");
    }
  };

  // Handle deleting an activity log
  const handleDeleteActivity = async (index) => {
    try {
      setError("");
      setSuccessMsg("");
      const updatedActivities = lead.activities.filter((_, idx) => idx !== index);
      const updatedData = await updateLead(id, { activities: updatedActivities });
      setLead(updatedData.lead);
      setSuccessMsg("Activity log deleted.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to delete activity log.");
    }
  };

  if (loading) {
    return (
      <ProtectedPage allowedRole="CEO, BDE, Sales Head">
        <div className="flex h-96 items-center justify-center text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin mr-2 text-primary-button" />
          <span className="text-[13px] font-medium">Loading details...</span>
        </div>
      </ProtectedPage>
    );
  }

  const activities = lead?.activities || [];
  const todos = lead?.todos || [];
  const initials = lead ? lead.projectName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "P";

  return (
    <ProtectedPage allowedRole="CEO, BDE, Sales Head">
      <div className="space-y-6 pb-16">
        
        {/* Breadcrumb Navigation & Topbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/ceo/lead-management"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-card-stroke bg-white text-secondary-text hover:bg-slate-50 transition cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h2 className="text-[20px] font-bold text-primary-text">Lead Management</h2>
              <p className="text-[13px] text-secondary-text mt-0.5">Track and organized client leads</p>
            </div>
          </div>
        </div>

        {/* Dynamic Banner Alerts */}
        {successMsg && (
          <div className="flex items-center gap-3 rounded-[5px] bg-green-50 border border-green-200 px-4 py-3.5 text-[13px] font-medium text-green-700">
            <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
            {successMsg}
          </div>
        )}

        {error && (
          <div className="flex items-center justify-between rounded-[5px] bg-red-50 border border-red-200 px-4 py-3.5 text-[13px] font-medium text-red-600">
            <span>{error}</span>
            <button onClick={() => setError("")} className="cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Main Grid: Left Tabs Pane, Right Content Panel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          
          {/* LEFT: Tabs Navigation Menu */}
          <div className="md:col-span-1 space-y-2 bg-white border border-card-stroke rounded-xl p-4.5 shadow-2xs">
            <div className="flex items-center gap-3 pb-4 mb-3 border-b border-slate-100">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-menu-fill text-[12px] font-bold text-primary-button shadow-2xs">
                {initials}
              </div>
              <div className="min-w-0">
                <h4 className="text-[14px] font-bold text-slate-800 truncate leading-snug">{lead.projectName}</h4>
                <p className="text-[11.5px] text-slate-400 truncate mt-0.5">{lead.organization || "No Organization"}</p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab("activities")}
              className={`flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-[13px] font-semibold transition cursor-pointer ${
                activeTab === "activities"
                  ? "bg-menu-fill text-slate-800"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Zap className="h-4 w-4" />
                <span>Activities</span>
              </div>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                {activities.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("todos")}
              className={`flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-[13px] font-semibold transition cursor-pointer ${
                activeTab === "todos"
                  ? "bg-menu-fill text-slate-800"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckSquare className="h-4 w-4" />
                <span>To-dos</span>
              </div>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                {todos.filter(t => !t.completed).length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("contact")}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-[13px] font-semibold transition cursor-pointer ${
                activeTab === "contact"
                  ? "bg-menu-fill text-slate-800"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <User className="h-4 w-4" />
              <span>Contact Details</span>
            </button>
          </div>

          {/* RIGHT: Content View Panels */}
          <div className="md:col-span-3 bg-white border border-card-stroke rounded-xl p-6 shadow-2xs">
            
            {/* VIEW 1: Activities Tab (Timeline) */}
            {activeTab === "activities" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <div>
                    <h3 className="text-[16px] font-bold text-primary-text">Activity Timeline</h3>
                    <p className="text-[12px] text-secondary-text mt-0.5">Historical log of all updates and communications.</p>
                  </div>
                  {!isAddingActivity && (
                    <button
                      onClick={() => setIsAddingActivity(true)}
                      className="flex items-center gap-1.5 rounded-lg bg-primary-button px-4 py-2 text-[12px] font-semibold text-white hover:opacity-95 transition cursor-pointer shadow-2xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      New Activity
                    </button>
                  )}
                </div>

                {!isAddingActivity ? (
                  <>
                    {activities.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-[#e2e8f0] p-12 text-center text-[12.5px] text-slate-400">
                        No activities logged for this lead yet.
                      </div>
                    ) : (
                      <div className="relative pl-1">
                        {/* Vertical Connecting Line */}
                        <div className="absolute left-[17px] top-4 bottom-4 w-0.5 bg-slate-200" />

                        <div className="space-y-5 relative">
                          {activities.map((act, idx) => {
                            const isSystem = act.type === "SYSTEM";
                            const isUpdate = act.type === "UPDATE";
                            const isEmail = act.type === "EMAIL" || act.type === "SYSTEM_EMAIL";
                            const hasAttachment = act.file && act.file.name;
                            
                            let initialsAvatar = "U";
                            if (act.actorName) {
                              initialsAvatar = act.actorName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
                            }

                            let avatarClass = "bg-slate-100 text-slate-600 border-slate-200";
                            if (isSystem) {
                              avatarClass = "bg-slate-100 text-slate-600 border-slate-200";
                            } else if (isUpdate) {
                              avatarClass = "bg-[#f7effc] text-primary-button border-[#ebd9f2]";
                            } else if (isEmail) {
                              avatarClass = "bg-blue-50 text-blue-600 border-blue-100";
                            }

                            return (
                              <div key={act._id || idx} className="flex items-start gap-4 relative pl-10">
                                {/* Circle Timeline Point Avatar */}
                                <div className={`absolute left-0 top-[2px] flex h-9 w-9 items-center justify-center rounded-full border text-[11px] font-bold shadow-2xs ${avatarClass}`}>
                                  {isEmail && !act.actorName ? (
                                    <Mail className="h-4 w-4 text-blue-500" />
                                  ) : (
                                    initialsAvatar
                                  )}
                                </div>

                                {/* Timeline Item Card */}
                                <div className="flex-1 bg-white border border-card-stroke rounded-xl p-4.5 shadow-2xs hover:shadow-xs transition">
                                  <div className="flex justify-between items-start gap-4">
                                    <div className="space-y-1">
                                      <p className="text-[13px] font-bold text-slate-800 leading-snug">
                                        <span className="font-extrabold">{act.actorName}</span> {act.action}
                                      </p>
                                      <div className="flex items-center gap-2 mt-1.5">
                                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase ${
                                          isSystem ? "bg-slate-100 text-slate-500 border border-slate-200" :
                                          isUpdate ? "bg-[#f7effc] text-primary-button border-[#ebd9f2]" :
                                          "bg-blue-50 text-blue-600 border border-blue-100"
                                        }`}>
                                          {act.type}
                                        </span>
                                        {act.notes && (
                                          <span className="text-[12px] text-slate-500">{act.notes}</span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2.5 shrink-0 whitespace-nowrap">
                                      <span className="text-[11.5px] font-medium text-slate-400">
                                        {formatDate(act.timestamp)}
                                      </span>
                                      <button
                                        onClick={() => handleDeleteActivity(idx)}
                                        className="text-slate-400 hover:text-red-500 transition cursor-pointer p-1 rounded hover:bg-slate-50"
                                        title="Delete Activity"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Attachment Card Nested */}
                                  {hasAttachment && (
                                    <div className="flex items-center justify-between rounded-lg border border-card-stroke bg-slate-50/50 p-3 mt-3 shadow-2xs">
                                      <div className="flex items-center gap-2.5">
                                        <File className="h-5 w-5 text-slate-400" />
                                        <div>
                                          <p className="text-[12.5px] font-bold text-slate-700 leading-tight">{act.file.name}</p>
                                          <p className="text-[11px] text-slate-400 mt-0.5 leading-none">{act.file.size} • Sent via Email</p>
                                        </div>
                                      </div>
                                      <a
                                        href="#"
                                        onClick={(e) => e.preventDefault()}
                                        className="text-[12px] font-bold text-primary-button hover:underline px-3 py-1 cursor-pointer"
                                      >
                                        View
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <form onSubmit={handleSaveActivity} className="space-y-5 animate-in fade-in zoom-in-98 duration-150">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div>
                        <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Activity Type</label>
                        <div className="relative">
                          <select
                            value={activityForm.type}
                            onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value })}
                            className="w-full appearance-none rounded-lg border border-card-stroke bg-white px-4 py-2.5 text-[13.5px] text-slate-800 outline-none focus:border-primary-button focus:ring-1 focus:ring-primary-button/20 transition cursor-pointer"
                          >
                            <option value="Call">Call</option>
                            <option value="Email">Email</option>
                            <option value="Meeting">Meeting</option>
                            <option value="Update">Update</option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Date and Time</label>
                        <input
                          type="date"
                          value={activityForm.date}
                          onChange={(e) => setActivityForm({ ...activityForm, date: e.target.value })}
                          className="w-full rounded-lg border border-card-stroke bg-white px-4 py-2.5 text-[13.5px] text-slate-800 outline-none focus:border-primary-button focus:ring-1 focus:ring-primary-button/20 transition cursor-pointer"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Subject</label>
                      <input
                        type="text"
                        required
                        placeholder="Brief summary of the activity"
                        value={activityForm.subject}
                        onChange={(e) => setActivityForm({ ...activityForm, subject: e.target.value })}
                        className="w-full rounded-lg border border-card-stroke bg-white px-4 py-2.5 text-[13.5px] text-slate-800 outline-none focus:border-primary-button focus:ring-1 focus:ring-primary-button/20 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Description / Notes</label>
                      <textarea
                        rows={5}
                        placeholder="Detail the conversation or update here..."
                        value={activityForm.notes}
                        onChange={(e) => setActivityForm({ ...activityForm, notes: e.target.value })}
                        className="w-full rounded-lg border border-card-stroke bg-white px-4 py-2.5 text-[13.5px] text-slate-800 outline-none focus:border-primary-button focus:ring-1 focus:ring-primary-button/20 resize-none transition"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setIsAddingActivity(false)}
                        className="rounded-lg border border-card-stroke bg-white px-6 py-2.5 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer outline-none"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded-lg bg-primary-button px-6 py-2.5 text-[13px] font-semibold text-white transition hover:opacity-95 cursor-pointer shadow-2xs"
                      >
                        Save Activity
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* VIEW 2: To-dos Tab */}
            {activeTab === "todos" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <div>
                    <h3 className="text-[16px] font-bold text-primary-text">Pending To-dos</h3>
                    <p className="text-[12px] text-secondary-text mt-0.5">Upcoming tasks and follow-ups.</p>
                  </div>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="text-[12.5px] font-semibold text-secondary-text hover:text-slate-800 transition cursor-pointer"
                  >
                    View All &rarr;
                  </a>
                </div>

                {todos.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#e2e8f0] p-12 text-center text-[12.5px] text-slate-400">
                    No to-do items logged for this lead yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todos.map((todo, idx) => {
                      const isOverdue = !todo.completed && todo.dueDate && new Date(todo.dueDate) < new Date();
                      const d = new Date(todo.dueDate);
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      const isTomorrow = d.toDateString() === tomorrow.toDateString();

                      let dateLabel = formatDate(todo.dueDate);
                      if (isTomorrow) {
                        dateLabel = "Tomorrow";
                      }

                      return (
                        <div
                          key={todo._id || idx}
                          className="flex items-start justify-between gap-4 bg-white border border-card-stroke rounded-xl p-4.5 shadow-2xs hover:shadow-xs transition"
                        >
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={todo.completed}
                              onChange={() => handleToggleTodo(idx)}
                              className="mt-1 h-5 w-5 rounded border-card-stroke text-primary-button focus:ring-primary-button/20 cursor-pointer"
                            />
                            <div className="space-y-1 flex-1 min-w-0">
                              <p
                                className={`text-[13px] font-bold text-slate-800 leading-snug truncate ${
                                  todo.completed ? "line-through text-slate-400" : ""
                                }`}
                              >
                                {todo.task}
                              </p>
                              {todo.description && !todo.completed && (
                                <p className="text-[11.5px] text-slate-400 leading-normal mt-0.5">{todo.description}</p>
                              )}
                              
                              <div className="flex flex-wrap items-center gap-3.5 mt-2 pt-0.5">
                                {isOverdue ? (
                                  <span className="inline-flex items-center gap-1 rounded bg-red-50 border border-red-100 px-2 py-0.5 text-[9px] font-bold text-red-600 uppercase tracking-wide">
                                    <Clock className="h-3 w-3 shrink-0" />
                                    Overdue
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                                    <Clock className="h-3 w-3 shrink-0" />
                                    Due {dateLabel}
                                  </span>
                                )}

                                {todo.assignee && (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                                    <User className="h-3 w-3 shrink-0" />
                                    {todo.assignee}
                                  </span>
                                )}

                                {todo.category && (
                                  <span className="rounded bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[9px] font-bold text-slate-500 uppercase tracking-wide">
                                    {todo.category}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteTodo(idx)}
                            className="text-slate-400 hover:text-red-500 transition cursor-pointer p-1 rounded hover:bg-slate-50 shrink-0 self-start"
                            title="Delete To-do"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Dashed Add Task Trigger */}
                <div
                  onClick={() => setShowTodoModal(true)}
                  className="border border-dashed border-card-stroke bg-slate-50/50 hover:bg-slate-50 rounded-xl p-4.5 text-center cursor-pointer transition mt-4"
                >
                  <span className="flex items-center justify-center gap-2 text-[12.5px] font-bold text-slate-400 hover:text-slate-600">
                    <Plus className="h-4 w-4" />
                    Add a new task
                  </span>
                </div>
              </div>
            )}

            {/* VIEW 3: Contact Details Tab (Editable Profile form / details view) */}
            {activeTab === "contact" && (
              <div className="space-y-6">
                {!isEditingContact ? (
                  <>
                    <div className="flex items-center justify-between pb-2">
                      <h3 className="text-[17px] font-bold text-slate-800">Client and Project details</h3>
                      <button
                        onClick={() => setIsEditingContact(true)}
                        className="text-slate-500 hover:text-slate-800 transition cursor-pointer"
                      >
                        <Pencil className="h-4.5 w-4.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-[160px_20px_1fr] gap-y-6 text-[14.5px] items-center pt-4">
                      <span className="text-slate-700 font-normal">Project Name</span>
                      <span className="text-slate-400 font-normal">:</span>
                      <span className="text-slate-800 font-normal">{lead.projectName || "------"}</span>

                      <span className="text-slate-700 font-normal">Designation</span>
                      <span className="text-slate-400 font-normal">:</span>
                      <span className="text-slate-800 font-normal">{lead.designation || "------"}</span>

                      <span className="text-slate-700 font-normal">Email</span>
                      <span className="text-slate-400 font-normal">:</span>
                      <span className="text-slate-800 font-normal break-all">{lead.email || "------"}</span>

                      <span className="text-slate-700 font-normal">Source</span>
                      <span className="text-slate-400 font-normal">:</span>
                      <span className="text-slate-800 font-normal">{lead.source || "------"}</span>

                      <span className="text-slate-700 font-normal">Phone</span>
                      <span className="text-slate-400 font-normal">:</span>
                      <span className="text-slate-800 font-normal">{lead.phone || "------"}</span>

                      <span className="text-slate-700 font-normal">Organization</span>
                      <span className="text-slate-400 font-normal">:</span>
                      <span className="text-slate-800 font-normal">{lead.organization || "------"}</span>

                      <span className="text-slate-700 font-normal">Full Address</span>
                      <span className="text-slate-400 font-normal">:</span>
                      <span className="text-slate-800 font-normal">{lead.address || "------"}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                      <h3 className="text-[16px] font-bold text-primary-text">Edit Client and Project details</h3>
                      <button
                        onClick={() => setIsEditingContact(false)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-card-stroke bg-white text-secondary-text hover:text-slate-800 transition cursor-pointer shadow-2xs"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveContact} className="space-y-5 animate-in fade-in zoom-in-98 duration-150">
                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                          <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Project Name</label>
                          <input
                            type="text"
                            value={contactForm.projectName}
                            onChange={(e) => setContactForm({ ...contactForm, projectName: e.target.value })}
                            className="w-full rounded-lg border border-card-stroke bg-white px-4 py-2.5 text-[13px] text-slate-800 outline-none focus:border-primary-button focus:ring-1 focus:ring-primary-button/20 transition"
                          />
                        </div>
                        <div>
                          <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Designation</label>
                          <input
                            type="text"
                            value={contactForm.designation}
                            onChange={(e) => setContactForm({ ...contactForm, designation: e.target.value })}
                            className="w-full rounded-lg border border-card-stroke bg-white px-4 py-2.5 text-[13px] text-slate-800 outline-none focus:border-primary-button focus:ring-1 focus:ring-primary-button/20 transition"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                          <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Email</label>
                          <input
                            type="email"
                            value={contactForm.email}
                            onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                            className="w-full rounded-lg border border-card-stroke bg-white px-4 py-2.5 text-[13px] text-slate-800 outline-none focus:border-primary-button focus:ring-1 focus:ring-primary-button/20 transition"
                          />
                        </div>
                        <div>
                          <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Phone</label>
                          <input
                            type="text"
                            value={contactForm.phone}
                            onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                            className="w-full rounded-lg border border-card-stroke bg-white px-4 py-2.5 text-[13px] text-slate-800 outline-none focus:border-primary-button focus:ring-1 focus:ring-primary-button/20 transition"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                          <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Organization</label>
                          <input
                            type="text"
                            value={contactForm.organization}
                            onChange={(e) => setContactForm({ ...contactForm, organization: e.target.value })}
                            className="w-full rounded-lg border border-card-stroke bg-white px-4 py-2.5 text-[13px] text-slate-800 outline-none focus:border-primary-button focus:ring-1 focus:ring-primary-button/20 transition"
                          />
                        </div>
                        <div>
                          <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Lead Status</label>
                          <div className="relative">
                            <select
                              value={contactForm.status}
                              onChange={(e) => setContactForm({ ...contactForm, status: e.target.value })}
                              className="w-full appearance-none rounded-lg border border-card-stroke bg-white px-4 py-2.5 text-[13px] text-slate-800 outline-none focus:border-primary-button focus:ring-1 focus:ring-primary-button/20 transition cursor-pointer"
                            >
                              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Address</label>
                        <input
                          type="text"
                          value={contactForm.address}
                          onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })}
                          className="w-full rounded-lg border border-card-stroke bg-white px-4 py-2.5 text-[13px] text-slate-800 outline-none focus:border-primary-button focus:ring-1 focus:ring-primary-button/20 transition"
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingContact(false)}
                          className="rounded-lg border border-card-stroke bg-white px-6 py-2.5 text-[12.5px] font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer outline-none"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="rounded-lg bg-primary-button px-6 py-2.5 text-[12.5px] font-semibold text-white transition hover:opacity-95 cursor-pointer shadow-2xs"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            )}

          </div>
        </div>



        {/* ── MODAL 2: ADD TO-DO TASK ── */}
        {showTodoModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs z-50 p-4">
            <div className="bg-white border border-card-stroke rounded-xl shadow-lg w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4.5 bg-slate-50/50">
                <h4 className="text-[14px] font-bold text-slate-800">Add New Task</h4>
                <button
                  onClick={() => setShowTodoModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
              <form onSubmit={handleAddTodo} className="p-6 space-y-4">
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">Task Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Review homepage design"
                    value={newTodo.task}
                    onChange={(e) => setNewTodo({ ...newTodo, task: e.target.value })}
                    className="w-full rounded-lg border border-card-stroke px-3 py-2 text-[13px] text-slate-800 outline-none focus:border-primary-button focus:ring-1 focus:ring-primary-button/20 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">Due Date</label>
                    <input
                      type="date"
                      required
                      value={newTodo.dueDate}
                      onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value })}
                      className="w-full rounded-lg border border-card-stroke px-3 py-2 text-[13px] text-slate-800 outline-none focus:border-primary-button cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">Assignee</label>
                    <div className="relative">
                      <select
                        value={newTodo.assignee}
                        onChange={(e) => setNewTodo({ ...newTodo, assignee: e.target.value })}
                        className="w-full appearance-none rounded-lg border border-card-stroke px-3 py-2 text-[13px] text-slate-800 outline-none focus:border-primary-button cursor-pointer"
                      >
                        <option value="Select Member">Select Member</option>
                        <option value="Arjun Kumar">Arjun Kumar</option>
                        <option value="Akhil Sai">Akhil Sai</option>
                        <option value="Alex Rivera">Alex Rivera</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">Category</label>
                  <div className="relative">
                    <select
                      value={newTodo.category}
                      onChange={(e) => setNewTodo({ ...newTodo, category: e.target.value })}
                      className="w-full appearance-none rounded-lg border border-card-stroke px-3 py-2 text-[13px] text-slate-800 outline-none focus:border-primary-button cursor-pointer"
                    >
                      <option value="Creative">Creative</option>
                      <option value="Development">Development</option>
                      <option value="Strategy">Strategy</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Other">Other</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">Task Description</label>
                  <textarea
                    rows={4}
                    placeholder="Briefly describe the task objectives..."
                    value={newTodo.description}
                    onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                    className="w-full rounded-lg border border-card-stroke px-3 py-2 text-[13px] text-slate-800 outline-none focus:border-primary-button focus:ring-1 focus:ring-primary-button/20 resize-none transition"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowTodoModal(false)}
                    className="rounded-lg border border-card-stroke bg-white px-5 py-2 text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-primary-button px-5 py-2 text-[12px] font-semibold text-white hover:opacity-95 transition cursor-pointer"
                  >
                    Create Task
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
