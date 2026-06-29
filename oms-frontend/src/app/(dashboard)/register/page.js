"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { backgroundImages, logos } from "@/data/images";
import CustomSelect from "@/components/ui/CustomSelect";
import { registerUser } from "@/lib/api";
import ProtectedPage from "@/components/auth/ProtectedPage";
import axiosInstance from "@/api/axiosInstance";

const roleOptions = [
  { value: "CEO", label: "CEO" },
  { value: "BDE", label: "BDE" },
  { value: "Accountant", label: "Accountant" },
  { value: "Project Manager", label: "Project Manager" },
  { value: "Client", label: "Client" },
  { value: "Sales Head", label: "Sales Head" },
];

export default function RegisterPage() {
  const router = useRouter();
  const formRef = useRef(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [selectedRole, setSelectedRole] = useState("");
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  useEffect(() => {
    if (selectedRole === "Client") {
      async function fetchProjects() {
        try {
          setLoadingProjects(true);
          const res = await axiosInstance.get("/projects");
          if (res.data && res.data.projects) {
            setProjects(res.data.projects);
          }
        } catch (err) {
          console.error("Failed to fetch projects:", err);
        } finally {
          setLoadingProjects(false);
        }
      }
      fetchProjects();
    }
  }, [selectedRole]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    const payload = {
      fullName: formData.get("fullName"),
      userName: formData.get("userName"),
      password: formData.get("password"),
      role: formData.get("role"),
      clientName: formData.get("clientName") || "",
    };

    try {
      const data = await registerUser(payload);
      setSuccess("Account created successfully!");
      setSelectedRole("");
      if (formRef.current) {
        formRef.current.reset();
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProtectedPage allowedRole="CEO, Project Manager">
      <div className="flex container-padding-x items-center justify-center py-6">
        <div className="w-full max-w-xl rounded-xl border border-[#eef0f3] bg-white p-8 md:p-10 shadow-xs">
          <div>
            <h2 className="app-heading-medium mb-2">User Registration</h2>
            <p className="app-body-muted">
              Create accounts and assign workspace roles
            </p>
          </div>

          <form ref={formRef} className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="w-full">
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-secondary-text">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                placeholder="Enter full name"
                className="w-full rounded-xl border border-transparent bg-menu-fill px-4 py-3.5 text-sm text-primary-text outline-none transition-all focus:border-card-stroke focus:bg-white focus:ring-0"
                required
              />
            </div>

            <div className="w-full">
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-secondary-text">
                User Name
              </label>
              <input
                type="text"
                name="userName"
                placeholder="Enter username"
                className="w-full rounded-xl border border-transparent bg-menu-fill px-4 py-3.5 text-sm text-primary-text outline-none transition-all focus:border-card-stroke focus:bg-white focus:ring-0"
                required
              />
            </div>

            <div className="w-full">
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-secondary-text">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                className="w-full rounded-xl border border-transparent bg-menu-fill px-4 py-3.5 text-sm text-primary-text outline-none transition-all focus:border-card-stroke focus:bg-white focus:ring-0"
                required
              />
            </div>

            <div className="w-full">
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-secondary-text">
                Role
              </label>
              <CustomSelect
                name="role"
                placeholder="Select a role"
                options={roleOptions}
                required
                onChange={(val) => setSelectedRole(val)}
              />
            </div>

            {selectedRole === "Client" && (
              <div className="space-y-2">
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-secondary-text">
                  Select Associated Project
                </label>
                {loadingProjects ? (
                  <p className="text-sm text-slate-400">Loading projects...</p>
                ) : projects.length > 0 ? (
                  <CustomSelect
                    name="clientName"
                    placeholder="Choose project"
                    options={projects.map((p) => ({
                      value: p.projectName,
                      label: p.projectName,
                    }))}
                    required
                  />
                ) : (
                  <p className="text-sm text-amber-600 font-medium">
                    No projects found. Please create a project first.
                  </p>
                )}
              </div>
            )}

            {error ? (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </p>
            ) : null}

            {success ? (
              <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-600">
                {success}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#2b0a38] to-[#7a1e9f] px-5 py-4 text-[15px] font-semibold text-white shadow-[0_12px_30px_rgba(122,30,159,0.22)] transition duration-200 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span>Creating Account...</span>
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>
      </div>
    </ProtectedPage>
  );
}
