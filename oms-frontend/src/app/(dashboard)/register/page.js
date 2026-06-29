"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { backgroundImages, logos } from "@/data/images";
import CustomSelect from "@/components/ui/CustomSelect";
import { registerUser } from "@/lib/api";
import ProtectedPage from "@/components/auth/ProtectedPage";

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
          const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
          const res = await fetch(`${apiBase}/projects`, { credentials: "include" });
          if (res.ok) {
            const data = await res.json();
            if (data && data.projects) {
              setProjects(data.projects);
            }
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
      <div className="flex container-padding-x items-center justify-center py-8">
        <div className="w-full rounded-none bg-white">
          <div className="grid w-full lg:grid-cols-2">
            <div className="relative hidden max-h-[90vh] lg:block">
              <img
                src={backgroundImages.loginBackground}
                alt="Login Background"
                className="h-full w-full rounded-l-[10px] object-cover"
              />
              <div className="absolute inset-0" />
              <div className="absolute inset-x-0 top-6 px-10 py-10 text-white">
                <img src={logos.Phewlogo} alt="Logo" />
              </div>
              <div className="absolute bottom-12 left-8 right-8 px-2 text-white">
                <p className="text-[60px] font-['Times_New_Roman'] leading-tight">
                  <span className="italic"> Designed for</span>
                  <br />
                  Seamless Operations
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="w-full max-w-119.5 lg:pt-1">
                <div>
                  <h1 className="text-[35px] font-['Inter',sans-serif]">
                    User Registration
                  </h1>
                  <p className="text-[20px] font-light text-[#9D9D9D]">
                    Create accounts and assign workspace roles
                  </p>
                </div>

                <form ref={formRef} className="mt-10 space-y-6 lg:mt-12" onSubmit={handleSubmit}>
                  <div>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Full Name"
                      className="w-full border-0 border-b border-black/40 bg-transparent px-0 pb-5 text-[16px] outline-none focus:border-[#7a1e9f]"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="userName"
                      placeholder="User Name"
                      className="w-full border-0 border-b border-black/40 bg-transparent px-0 pb-5 text-[16px] outline-none focus:border-[#7a1e9f]"
                      required
                    />
                  </div>

                  <div>
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      className="w-full border-0 border-b border-black/40 bg-transparent px-0 pb-5 text-[16px] outline-none focus:border-[#7a1e9f]"
                      required
                    />
                  </div>

                  <CustomSelect
                    name="role"
                    placeholder="Role"
                    options={roleOptions}
                    required
                    onChange={(val) => setSelectedRole(val)}
                  />

                  {selectedRole === "Client" && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 block">Select Associated Project</label>
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
                    className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-linear-to-r from-[#2b0a38] to-[#7a1e9f] px-5 py-4 text-[15px] font-semibold text-white shadow-[0_12px_30px_rgba(122,30,159,0.22)] transition duration-200 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
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
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}
