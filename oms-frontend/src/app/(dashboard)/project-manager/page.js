"use client";

import { useEffect, useState, useCallback } from "react";
import ProtectedPage from "@/components/auth/ProtectedPage";
import { getCurrentUser } from "@/lib/api";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Upload, 
  X, 
  ChevronDown, 
  Check, 
  FileText, 
  AlertCircle, 
  Calendar,
  AlertTriangle
} from "lucide-react";

// Mock template for "Abc Company" to replicate screenshots
const defaultAbcCompany = {
  id: "abc-company",
  projectName: "Abc Company",
  overallProgress: 78,
  currentStatus: "On Track",
  services: {
    "Branding": {
      progress: 100,
      status: "Completed",
      tasks: [
        { id: "b1", name: "Discovery & Research", completed: true },
        { id: "b2", name: "Logo Concept", completed: true },
        { id: "b3", name: "Color System", completed: true },
        { id: "b4", name: "Brand Guidelines", completed: true },
        { id: "b5", name: "Typography", completed: true },
        { id: "b6", name: "Business card", completed: true },
      ]
    },
    "Website Design": {
      progress: 60,
      status: "On Track",
      tasks: [
        { id: "w1", name: "Discovery & Research", completed: true },
        { id: "w2", name: "Logo Concept", completed: true },
        { id: "w3", name: "Color System", completed: true },
        { id: "w4", name: "Brand Guidelines", completed: false },
        { id: "w5", name: "Typography", completed: false },
        { id: "w6", name: "Business card", completed: false },
      ]
    },
    "Development": {
      progress: 100,
      status: "Completed",
      tasks: [
        { id: "d1", name: "Discovery & Research", completed: true },
        { id: "d2", name: "Logo Concept", completed: true },
        { id: "d3", name: "Color System", completed: true },
        { id: "d4", name: "Brand Guidelines", completed: true },
        { id: "d5", name: "Typography", completed: true },
        { id: "d6", name: "Business card", completed: true },
      ]
    },
    "Social Media": {
      progress: 25,
      status: "On Track",
      tasks: [
        { id: "s1", name: "Discovery & Research", completed: true },
        { id: "s2", name: "Logo Concept", completed: false },
        { id: "s3", name: "Color System", completed: false },
        { id: "s4", name: "Brand Guidelines", completed: false },
        { id: "s5", name: "Typography", completed: false },
        { id: "s6", name: "Business card", completed: false },
      ]
    }
  },
  activityLog: {
    "Branding": [
      { id: "a1", name: "Brand discovery meeting completed", date: "Oct 24, 2023", completed: true },
      { id: "a2", name: "Competitor research uploaded", date: "Oct 28, 2023", completed: true },
      { id: "a3", name: "Initial logo concepts shared", date: "Oct 30, 2023", completed: true }
    ],
    "Website Design": [
      { id: "a4", name: "Wireframe feedback incorporated", date: "Nov 05, 2023", completed: true },
      { id: "a5", name: "Homepage design sign-off", date: "Nov 12, 2023", completed: false }
    ],
    "Development": [
      { id: "a6", name: "Development environment setup", date: "Nov 20, 2023", completed: true }
    ],
    "Social Media": [
      { id: "a7", name: "Social media calendar approval", date: "Dec 01, 2023", completed: false }
    ]
  },
  paymentStatus: {
    totalAmount: 12500,
    advanceAmount: 8200,
    remainingBalance: 4300,
    collectionProgress: 65.6
  },
  sharedFiles: [
    { id: "f1", name: "Proposal_Final.pdf", size: "2.4 MB", uploaded: "Oct 12, 2023" },
    { id: "f2", name: "Invoice_OCT_2023.pdf", size: "1.1 MB", uploaded: "Oct 01, 2023" },
    { id: "f3", name: "Brand_Assets_Pack.zip", size: "45.8 MB", uploaded: "Sep 28, 2023" }
  ]
};

export default function ProjectManagerPage() {
  const [user, setUser] = useState(null);
  const [dbProjects, setDbProjects] = useState([]);
  const [projectsData, setProjectsData] = useState({});
  const [selectedProjectId, setSelectedProjectId] = useState("abc-company");
  const [activeActivityTab, setActiveActivityTab] = useState("Branding");

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskModalCategory, setTaskModalCategory] = useState("Branding");
  const [newTaskName, setNewTaskName] = useState("");

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editTotalAmount, setEditTotalAmount] = useState("");
  const [editAdvanceAmount, setEditAdvanceAmount] = useState("");

  const [isStatusEditOpen, setIsStatusEditOpen] = useState(false);
  const [editStatus, setEditStatus] = useState("On Track");
  const [editProgress, setEditProgress] = useState(78);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFileSize, setNewFileSize] = useState("1.5 MB");

  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [replaceFileId, setReplaceFileId] = useState(null);
  const [replaceFileName, setReplaceFileName] = useState("");
  const [replaceFileSize, setReplaceFileSize] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Initialize and load
  useEffect(() => {
    async function loadInitialData() {
      try {
        const userData = await getCurrentUser();
        setUser(userData.user);

        // Fetch DB Projects
        const res = await fetch(`${API_BASE}/projects`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const list = data.projects || [];
          setDbProjects(list);

          // Build state mappings for projects
          const initialData = { "abc-company": defaultAbcCompany };
          
          list.forEach(p => {
            // Check if project has custom values, else assign defaults
            const baseProgress = p.currentStatus === "Completed" ? 100 : 50;
            initialData[p._id] = {
              id: p._id,
              projectName: p.projectName,
              overallProgress: baseProgress,
              currentStatus: p.currentStatus || "On Track",
              services: {
                "Branding": {
                  progress: p.currentStatus === "Completed" ? 100 : 75,
                  status: p.currentStatus === "Completed" ? "Completed" : "On Track",
                  tasks: [
                    { id: `${p._id}-b1`, name: "Discovery & Research", completed: true },
                    { id: `${p._id}-b2`, name: "Logo Concept", completed: true },
                    { id: `${p._id}-b3`, name: "Color System", completed: p.currentStatus === "Completed" },
                    { id: `${p._id}-b4`, name: "Brand Guidelines", completed: p.currentStatus === "Completed" },
                  ]
                },
                "Website Design": {
                  progress: p.currentStatus === "Completed" ? 100 : 40,
                  status: p.currentStatus === "Completed" ? "Completed" : "On Track",
                  tasks: [
                    { id: `${p._id}-w1`, name: "Discovery & Research", completed: true },
                    { id: `${p._id}-w2`, name: "Logo Concept", completed: p.currentStatus === "Completed" },
                    { id: `${p._id}-w3`, name: "Color System", completed: false },
                  ]
                },
                "Development": {
                  progress: p.currentStatus === "Completed" ? 100 : 20,
                  status: p.currentStatus === "Completed" ? "Completed" : "On Track",
                  tasks: [
                    { id: `${p._id}-d1`, name: "Discovery & Research", completed: true },
                    { id: `${p._id}-d2`, name: "Development Build Setup", completed: false },
                  ]
                },
                "Social Media": {
                  progress: p.currentStatus === "Completed" ? 100 : 0,
                  status: p.currentStatus === "Completed" ? "Completed" : "On Track",
                  tasks: [
                    { id: `${p._id}-s1`, name: "Discovery & Research", completed: false },
                  ]
                }
              },
              activityLog: {
                "Branding": [
                  { id: `${p._id}-a1`, name: "Kickoff meeting completed", date: "Oct 24, 2023", completed: true }
                ],
                "Website Design": [],
                "Development": [],
                "Social Media": []
              },
              paymentStatus: {
                totalAmount: p.amount ? parseFloat(p.amount) : 10000,
                advanceAmount: p.amount ? parseFloat(p.amount) * 0.6 : 6000,
                remainingBalance: p.amount ? parseFloat(p.amount) * 0.4 : 4000,
                collectionProgress: 60.0
              },
              sharedFiles: [
                { id: `${p._id}-f1`, name: "Project_Brief.pdf", size: "1.2 MB", uploaded: "Oct 15, 2023" }
              ]
            };
          });

          // Restore from localStorage if exists
          const saved = localStorage.getItem("pm_dashboard_projects");
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              // Merge saved state with fresh db projects (to support added projects)
              const merged = { ...initialData, ...parsed };
              setProjectsData(merged);
            } catch (e) {
              setProjectsData(initialData);
            }
          } else {
            setProjectsData(initialData);
          }
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      }
    }

    loadInitialData();
  }, [API_BASE]);

  // Save updates helper
  const saveProjectsState = useCallback((updatedData) => {
    setProjectsData(updatedData);
    localStorage.setItem("pm_dashboard_projects", JSON.stringify(updatedData));
  }, []);

  const activeProject = projectsData[selectedProjectId] || defaultAbcCompany;

  // Toggle task completion and update progress values
  const handleToggleTask = (serviceName, taskId) => {
    const project = { ...activeProject };
    const service = { ...project.services[serviceName] };
    const tasks = service.tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, completed: !t.completed };
      }
      return t;
    });

    // Calculate percentage
    const completedCount = tasks.filter(t => t.completed).length;
    const totalCount = tasks.length;
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    // Update status
    let status = "On Track";
    if (progress === 100) {
      status = "Completed";
    } else if (progress > 0) {
      status = "On Track";
    }

    project.services[serviceName] = { ...service, tasks, progress, status };

    // Calculate Overall Project Progress as average of services
    const servicesArray = Object.values(project.services);
    const avgProgress = Math.round(servicesArray.reduce((acc, s) => acc + s.progress, 0) / servicesArray.length);
    project.overallProgress = avgProgress;

    const updated = { ...projectsData, [selectedProjectId]: project };
    saveProjectsState(updated);
  };

  // Toggle activity checkbox
  const handleToggleActivity = (serviceName, activityId) => {
    const project = { ...activeProject };
    const activities = project.activityLog[serviceName].map(act => {
      if (act.id === activityId) {
        return { ...act, completed: !act.completed };
      }
      return act;
    });
    project.activityLog[serviceName] = activities;

    const updated = { ...projectsData, [selectedProjectId]: project };
    saveProjectsState(updated);
  };

  // Add Task inside category
  const handleAddTask = () => {
    if (!newTaskName.trim()) return;

    const project = { ...activeProject };
    const service = { ...project.services[taskModalCategory] };
    const newTask = {
      id: `custom-t-${Date.now()}`,
      name: newTaskName.trim(),
      completed: false
    };

    const tasks = [...service.tasks, newTask];
    const completedCount = tasks.filter(t => t.completed).length;
    const totalCount = tasks.length;
    const progress = Math.round((completedCount / totalCount) * 100);
    const status = progress === 100 ? "Completed" : "On Track";

    project.services[taskModalCategory] = { ...service, tasks, progress, status };

    // Update overall
    const servicesArray = Object.values(project.services);
    const avgProgress = Math.round(servicesArray.reduce((acc, s) => acc + s.progress, 0) / servicesArray.length);
    project.overallProgress = avgProgress;

    const updated = { ...projectsData, [selectedProjectId]: project };
    saveProjectsState(updated);

    setNewTaskName("");
    setIsTaskModalOpen(false);
    showNotification("Task added successfully!");
  };

  // Save updated project overview progress and status
  const handleSaveOverviewUpdate = async () => {
    const project = { ...activeProject };
    project.overallProgress = Number(editProgress);
    project.currentStatus = editStatus;

    // Persist to backend if a real database project is selected
    if (selectedProjectId !== "abc-company") {
      try {
        const res = await fetch(`${API_BASE}/projects/${selectedProjectId}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentStatus: editStatus
          })
        });
        if (!res.ok) {
          throw new Error("Failed to update status on server");
        }
      } catch (err) {
        console.error("Error saving project details to backend:", err);
      }
    }

    const updated = { ...projectsData, [selectedProjectId]: project };
    saveProjectsState(updated);
    setIsStatusEditOpen(false);
    showNotification("Overall project overview updated!");
  };

  // Edit payments details
  const handleSavePaymentUpdate = () => {
    const total = parseFloat(editTotalAmount) || 0;
    const advance = parseFloat(editAdvanceAmount) || 0;
    const remaining = Math.max(0, total - advance);
    const progress = total > 0 ? Math.round((advance / total) * 1000) / 10 : 0;

    const project = { ...activeProject };
    project.paymentStatus = {
      totalAmount: total,
      advanceAmount: advance,
      remainingBalance: remaining,
      collectionProgress: progress
    };

    const updated = { ...projectsData, [selectedProjectId]: project };
    saveProjectsState(updated);
    setIsPaymentModalOpen(false);
    showNotification("Payment status details updated!");
  };

  // Helper to format bytes to human-readable sizes
  const formatBytes = (bytes, decimals = 1) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  // Handle local file selection for uploading
  const handleUploadFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewFileName(file.name);
    setNewFileSize(formatBytes(file.size));
  };

  // Handle local file selection for replacing
  const handleReplaceFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setReplaceFileName(file.name);
    setReplaceFileSize(formatBytes(file.size));
  };

  // Add/Upload file mockup
  const handleUploadFile = () => {
    if (!newFileName.trim()) return;

    const project = { ...activeProject };
    const newFile = {
      id: `file-f-${Date.now()}`,
      name: newFileName,
      size: newFileSize,
      uploaded: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
    };

    project.sharedFiles = [...project.sharedFiles, newFile];

    const updated = { ...projectsData, [selectedProjectId]: project };
    saveProjectsState(updated);
    setNewFileName("");
    setNewFileSize("0 Bytes");
    setIsUploadModalOpen(false);
    showNotification("File uploaded successfully!");
  };

  // Replace file mockup
  const handleReplaceFile = () => {
    if (!replaceFileName.trim()) return;

    const project = { ...activeProject };
    project.sharedFiles = project.sharedFiles.map(file => {
      if (file.id === replaceFileId) {
        return {
          ...file,
          name: replaceFileName,
          size: replaceFileSize || file.size,
          uploaded: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
        };
      }
      return file;
    });

    const updated = { ...projectsData, [selectedProjectId]: project };
    saveProjectsState(updated);
    setIsReplaceModalOpen(false);
    setReplaceFileName("");
    setReplaceFileSize("");
    showNotification("File replaced successfully!");
  };

  // Delete file
  const handleDeleteFile = (fileId) => {
    const project = { ...activeProject };
    project.sharedFiles = project.sharedFiles.filter(f => f.id !== fileId);

    const updated = { ...projectsData, [selectedProjectId]: project };
    saveProjectsState(updated);
    showNotification("File deleted successfully!");
  };

  // Add activity log mockup
  const handleAddActivityLog = () => {
    const actionName = prompt("Enter new activity details:");
    if (!actionName || !actionName.trim()) return;

    const project = { ...activeProject };
    const newAct = {
      id: `act-${Date.now()}`,
      name: actionName.trim(),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      completed: false
    };

    project.activityLog[activeActivityTab] = [...project.activityLog[activeActivityTab], newAct];

    const updated = { ...projectsData, [selectedProjectId]: project };
    saveProjectsState(updated);
    showNotification("Activity log added successfully!");
  };

  const showNotification = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  // Open modals helper
  const openEditStatus = () => {
    setEditStatus(activeProject.currentStatus);
    setEditProgress(activeProject.overallProgress);
    setIsStatusEditOpen(true);
  };

  const openEditPayment = () => {
    setEditTotalAmount(activeProject.paymentStatus?.totalAmount || "");
    setEditAdvanceAmount(activeProject.paymentStatus?.advanceAmount || "");
    setIsPaymentModalOpen(true);
  };

  return (
    <ProtectedPage allowedRole="Project Manager">
      <div className="space-y-6">
        
        {/* Success Alert Toast */}
        {successMessage && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition duration-200">
            <Check className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Header and Project Selector */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Project Workspace Overview</h1>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Manage live development sprints and upload files</p>
          </div>

          <div className="w-64">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Project Selection
            </label>
            <div className="relative">
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full appearance-none rounded-xl border border-[#D8D8D8] bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-purple-600 transition"
              >
                <option value="abc-company">Abc Company (Mockup Template)</option>
                {dbProjects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.projectName}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>
          </div>
        </div>

        {/* Overall Project Progress card */}
        <div className="rounded-2xl border border-[#eef0f3] bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                Overall Project Progress
              </h2>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 leading-none">
                  {activeProject.overallProgress}%
                </span>
                <span className="text-xs font-semibold text-slate-400">Completed</span>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${activeProject.overallProgress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Project Status
                </span>
                <span className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-bold ${
                  activeProject.currentStatus === "Completed"
                    ? "bg-emerald-50 text-emerald-600"
                    : activeProject.currentStatus === "Delayed"
                    ? "bg-red-50 text-red-600"
                    : activeProject.currentStatus === "At Risk"
                    ? "bg-amber-50 text-amber-600"
                    : "bg-[#F1F5F9] text-slate-700"
                }`}>
                  {activeProject.currentStatus}
                </span>
              </div>

              <button
                onClick={openEditStatus}
                className="mt-4 flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition cursor-pointer"
                title="Edit status and progress"
              >
                <Pencil className="h-4 w-4" />
              </button>

              <button
                onClick={() => showNotification("Overall status updates saved successfully!")}
                className="mt-4 rounded-xl bg-[#4d0069] px-4 py-2 text-xs font-bold text-white hover:bg-purple-800 transition cursor-pointer"
              >
                Save update
              </button>
            </div>
          </div>
        </div>

        {/* Service Progress Section */}
        <div>
          <h2 className="text-base font-bold text-slate-800 tracking-tight mb-4">Service Progress</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {Object.keys(activeProject.services).map((serviceName) => {
              const service = activeProject.services[serviceName];
              
              let barColor = "bg-blue-500";
              let badgeColor = "bg-blue-50 text-blue-600";
              if (service.status === "Completed") {
                barColor = "bg-emerald-500";
                badgeColor = "bg-emerald-50 text-emerald-600";
              } else if (serviceName === "Development") {
                barColor = "bg-rose-500";
                badgeColor = "bg-rose-50 text-rose-600";
              }

              return (
                <div key={serviceName} className="rounded-2xl border border-[#eef0f3] bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-slate-800 text-base">{serviceName}</h3>
                    <button
                      onClick={() => {
                        setTaskModalCategory(serviceName);
                        setIsTaskModalOpen(true);
                      }}
                      className="flex items-center gap-1 text-[11px] font-extrabold text-[#4d0069] hover:underline cursor-pointer"
                    >
                      <Plus className="h-3 w-3" strokeWidth={2.5} /> Add Task
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-semibold">Overall:</span>
                      <span className="font-extrabold text-slate-800">{service.progress}%</span>
                    </div>
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${badgeColor}`}>
                      {service.status}
                    </span>
                  </div>

                  <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div 
                      className={`h-full ${barColor} rounded-full transition-all duration-300`}
                      style={{ width: `${service.progress}%` }}
                    />
                  </div>

                  {/* Checklist */}
                  <div className="mt-5 space-y-3.5">
                    {service.tasks.map((task) => (
                      <label 
                        key={task.id} 
                        className="flex items-center gap-3 group cursor-pointer"
                      >
                        <div className="relative">
                          <input 
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => handleToggleTask(serviceName, task.id)}
                            className="peer sr-only"
                          />
                          <div className="h-5 w-5 rounded-full border border-slate-300 bg-white peer-checked:bg-[#4d0069] peer-checked:border-[#4d0069] flex items-center justify-center transition">
                            <Check className="h-3 w-3 text-white scale-0 peer-checked:scale-100 transition" strokeWidth={3} />
                          </div>
                        </div>
                        <span className={`text-[13px] font-medium leading-none text-slate-700 transition ${
                          task.completed ? "line-through text-slate-400 font-normal" : "group-hover:text-slate-900"
                        }`}>
                          {task.name}
                        </span>
                      </label>
                    ))}
                    {service.tasks.length === 0 && (
                      <div className="text-center text-xs text-slate-400 py-4">
                        No tasks created. Click "Add Task" to start.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity Log and Payment Status */}
        <div className="grid gap-6 lg:grid-cols-2">
          
          {/* Activity Log Card */}
          <div className="rounded-2xl border border-[#eef0f3] bg-white p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-base">Activity Log</h3>
                <button
                  onClick={handleAddActivityLog}
                  className="flex items-center gap-1 text-[11px] font-extrabold text-[#4d0069] hover:underline cursor-pointer"
                >
                  <Plus className="h-3 w-3" strokeWidth={2.5} /> Add Activity
                </button>
              </div>

              {/* Tabs */}
              <div className="mt-4 flex gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
                {Object.keys(activeProject.services).map((tab) => {
                  const isActive = activeActivityTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveActivityTab(tab)}
                      className={`flex-1 py-1.5 px-1 rounded-lg text-[10px] font-bold transition text-center whitespace-nowrap cursor-pointer ${
                        isActive 
                          ? "bg-[#4d0069] text-white shadow-xs" 
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>

              {/* Log Timeline List */}
              <div className="mt-6 pl-4 border-l border-slate-100 space-y-5">
                {(activeProject.activityLog[activeActivityTab] || []).map((act) => (
                  <label key={act.id} className="flex items-start gap-3 group cursor-pointer">
                    <div className="relative mt-0.5">
                      <input 
                        type="checkbox"
                        checked={act.completed}
                        onChange={() => handleToggleActivity(activeActivityTab, act.id)}
                        className="peer sr-only"
                      />
                      <div className="h-4 w-4 rounded-full border border-slate-350 bg-white peer-checked:bg-[#4d0069] peer-checked:border-[#4d0069] flex items-center justify-center transition">
                        <Check className="h-2.5 w-2.5 text-white scale-0 peer-checked:scale-100 transition" strokeWidth={3} />
                      </div>
                    </div>
                    <div>
                      <p className={`text-[13px] font-semibold text-slate-850 leading-tight transition ${
                        act.completed ? "line-through text-slate-400" : ""
                      }`}>
                        {act.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1">
                        Due {act.date}
                      </p>
                    </div>
                  </label>
                ))}
                {(!activeProject.activityLog[activeActivityTab] || activeProject.activityLog[activeActivityTab].length === 0) && (
                  <div className="text-center text-xs text-slate-400 py-10 pl-0 border-l-0">
                    No logged activity in this category.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Status Card */}
          <div className="rounded-2xl border border-[#eef0f3] bg-white p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3">
              Payment Status
            </h3>

            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-slate-50 p-3">
                  <span className="block text-[9px] font-bold text-slate-450 uppercase tracking-wider mb-1">
                    Total Amount
                  </span>
                  <span className="text-sm font-extrabold text-slate-800">
                    ${activeProject.paymentStatus?.totalAmount?.toLocaleString() || "0"}
                  </span>
                </div>

                <div className="rounded-xl bg-slate-50 p-3">
                  <span className="block text-[9px] font-bold text-slate-450 uppercase tracking-wider mb-1">
                    Advance Amount
                  </span>
                  <span className="text-sm font-extrabold text-slate-800">
                    ${activeProject.paymentStatus?.advanceAmount?.toLocaleString() || "0"}
                  </span>
                </div>

                <div className="rounded-xl bg-rose-50/50 p-3 border border-rose-100">
                  <span className="block text-[9px] font-bold text-rose-500 uppercase tracking-wider mb-1">
                    Remaining Balance
                  </span>
                  <span className="text-sm font-extrabold text-red-600">
                    ${activeProject.paymentStatus?.remainingBalance?.toLocaleString() || "0"}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  <span>Collection Progress</span>
                  <span className="text-slate-700">{activeProject.paymentStatus?.collectionProgress || 0}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className="h-full bg-blue-650 rounded-full" 
                    style={{ width: `${activeProject.paymentStatus?.collectionProgress || 0}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3 border-t border-slate-100">
                <button
                  onClick={openEditPayment}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-650 hover:bg-slate-50 text-xs font-bold transition cursor-pointer text-center"
                >
                  Edit Payment
                </button>

                <button
                  onClick={() => showNotification("Payment status update request sent!")}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#4d0069] hover:bg-purple-800 text-white text-xs font-bold transition cursor-pointer text-center"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Shared Files Table */}
        <div className="rounded-2xl border border-[#eef0f3] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="font-bold text-slate-800 text-base">Shared Files</h3>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-[#4d0069] hover:bg-purple-800 text-white text-xs font-bold px-4 py-2 transition cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5" /> Upload File
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                  <th className="py-2.5 font-bold">File Name</th>
                  <th className="py-2.5 font-bold">Size</th>
                  <th className="py-2.5 font-bold">Uploaded</th>
                  <th className="py-2.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {activeProject.sharedFiles.map((file) => (
                  <tr key={file.id} className="text-xs text-slate-700 hover:bg-slate-50/50 transition">
                    <td className="py-3.5 flex items-center gap-2">
                      <FileText className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                      <span className="font-bold text-slate-800">{file.name}</span>
                    </td>
                    <td className="py-3.5 text-slate-500 font-semibold">{file.size}</td>
                    <td className="py-3.5 text-slate-500 font-semibold">{file.uploaded}</td>
                    <td className="py-3.5 text-right space-x-4">
                      <button
                        onClick={() => {
                          setReplaceFileId(file.id);
                          setReplaceFileName(file.name);
                          setIsReplaceModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                      >
                        <Pencil className="h-3 w-3" /> Replace
                      </button>
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="inline-flex items-center text-rose-500 hover:text-rose-700 transition cursor-pointer"
                        title="Delete file"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {activeProject.sharedFiles.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-xs text-slate-400 font-semibold">
                      No files uploaded. Click "Upload File" to share resource.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL 1: Add Task Modal */}
        {isTaskModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
              <button 
                onClick={() => setIsTaskModalOpen(false)}
                className="absolute right-4 top-4 text-slate-450 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="text-base font-extrabold text-slate-800 mb-4">
                Add {taskModalCategory} Task
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Select Category
                  </label>
                  <div className="relative">
                    <select
                      value={taskModalCategory}
                      onChange={(e) => setTaskModalCategory(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-[#D8D8D8] bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-purple-600"
                    >
                      <option value="Branding">Branding</option>
                      <option value="Website Design">Website Design</option>
                      <option value="Development">Development</option>
                      <option value="Social Media">Social Media</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Task Name
                  </label>
                  <input
                    type="text"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    placeholder="e.g., Design homepage layout"
                    className="w-full rounded-xl border border-[#D8D8D8] px-4 py-2.5 text-sm text-slate-800 placeholder-slate-350 outline-none focus:border-purple-600"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => setIsTaskModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleAddTask}
                    className="flex-1 py-2.5 rounded-xl bg-[#4d0069] text-white text-xs font-bold hover:bg-purple-800 transition cursor-pointer"
                  >
                    Create Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: Edit Payment Modal */}
        {isPaymentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
              <button 
                onClick={() => setIsPaymentModalOpen(false)}
                className="absolute right-4 top-4 text-slate-450 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="text-base font-extrabold text-slate-800 mb-4">
                Edit Payment Details
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Total Amount ($)
                  </label>
                  <input
                    type="number"
                    value={editTotalAmount}
                    onChange={(e) => setEditTotalAmount(e.target.value)}
                    placeholder="e.g. 12500"
                    className="w-full rounded-xl border border-[#D8D8D8] px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Advance Amount ($)
                  </label>
                  <input
                    type="number"
                    value={editAdvanceAmount}
                    onChange={(e) => setEditAdvanceAmount(e.target.value)}
                    placeholder="e.g. 8200"
                    className="w-full rounded-xl border border-[#D8D8D8] px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-purple-600"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-650 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSavePaymentUpdate}
                    className="flex-1 py-2.5 rounded-xl bg-[#4d0069] text-white text-xs font-bold hover:bg-purple-800 transition cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 3: Edit Status and Progress */}
        {isStatusEditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
              <button 
                onClick={() => setIsStatusEditOpen(false)}
                className="absolute right-4 top-4 text-slate-450 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="text-base font-extrabold text-slate-800 mb-4">
                Update Project Overview
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Project Status
                  </label>
                  <div className="relative">
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-[#D8D8D8] bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-purple-600"
                    >
                      <option value="On Track">On Track</option>
                      <option value="At Risk">At Risk</option>
                      <option value="Delayed">Delayed</option>
                      <option value="Completed">Completed</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    <span>Overall Progress</span>
                    <span>{editProgress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={editProgress}
                    onChange={(e) => setEditProgress(e.target.value)}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#4d0069]"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => setIsStatusEditOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-650 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSaveOverviewUpdate}
                    className="flex-1 py-2.5 rounded-xl bg-[#4d0069] text-white text-xs font-bold hover:bg-purple-800 transition cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 4: Upload File Modal */}
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
              <button 
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setNewFileName("");
                  setNewFileSize("0 Bytes");
                }}
                className="absolute right-4 top-4 text-slate-450 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="text-base font-extrabold text-slate-800 mb-4">
                Upload New Resource
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Select File
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={newFileName || "No file selected"}
                      placeholder="e.g. Design_Guidelines.pdf"
                      className="flex-1 rounded-xl border border-[#D8D8D8] bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById("file-picker-upload").click()}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-750 bg-slate-50 text-xs font-bold hover:bg-slate-100 transition cursor-pointer shrink-0"
                    >
                      Browse...
                    </button>
                  </div>
                  <input
                    type="file"
                    id="file-picker-upload"
                    className="hidden"
                    onChange={handleUploadFileChange}
                  />
                </div>



                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => {
                      setIsUploadModalOpen(false);
                      setNewFileName("");
                      setNewFileSize("0 Bytes");
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-650 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    disabled={!newFileName}
                    onClick={handleUploadFile}
                    className="flex-1 py-2.5 rounded-xl bg-[#4d0069] disabled:opacity-50 text-white text-xs font-bold hover:bg-purple-800 transition cursor-pointer"
                  >
                    Upload File
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 5: Replace File Modal */}
        {isReplaceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
              <button 
                onClick={() => {
                  setIsReplaceModalOpen(false);
                  setReplaceFileName("");
                  setReplaceFileSize("");
                }}
                className="absolute right-4 top-4 text-slate-450 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="text-base font-extrabold text-slate-800 mb-4">
                Replace File Resource
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Select Replacement File
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={replaceFileName || "No replacement selected"}
                      placeholder="e.g. Brand_Guidelines_v2.pdf"
                      className="flex-1 rounded-xl border border-[#D8D8D8] bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById("file-picker-replace").click()}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-750 bg-slate-50 text-xs font-bold hover:bg-slate-100 transition cursor-pointer shrink-0"
                    >
                      Browse...
                    </button>
                  </div>
                  <input
                    type="file"
                    id="file-picker-replace"
                    className="hidden"
                    onChange={handleReplaceFileChange}
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => {
                      setIsReplaceModalOpen(false);
                      setReplaceFileName("");
                      setReplaceFileSize("");
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-650 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    disabled={!replaceFileName}
                    onClick={handleReplaceFile}
                    className="flex-1 py-2.5 rounded-xl bg-[#4d0069] disabled:opacity-50 text-white text-xs font-bold hover:bg-purple-800 transition cursor-pointer"
                  >
                    Replace File
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </ProtectedPage>
  );
}
