"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { backgroundImages, logos } from "@/data/images";
import { loginUser } from "@/lib/api";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    userName: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser(formData);
      router.push(data.redirectTo || "/");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex container-padding-x items-center justify-center  py-8 ">
      <div className="w-full  rounded-none bg-white ">
        <div className="grid  w-full lg:grid-cols-2">
          <div className="relative hidden max-h-[90vh] lg:block">
            <img
              src={backgroundImages.loginBackground}
              alt="Login Background"
              className="h-full w-full rounded-l-[10px] object-cover"
            />
            <div className="absolute inset-0 " />
            <div className="absolute inset-x-0 top-6 px-10 py-10 text-white">
              <img src={logos.Phewlogo} alt="Logo" />
            </div>
            <div className="absolute bottom-12 left-8 right-8 px-2 text-white">
              <p className="text-[60px]  font-['Times_New_Roman']">
                <span className="italic"> Designed for</span>
                <br />
                Seamless Operations
              </p>
            </div>
          </div>

          <div className="flex  items-center justify-center ">
            <div className="w-full max-w-119.5 lg:pt-1">
              <div>
                <h1 className="text-[35px] font-['Inter',sans-serif]">
                  Enter Your Workspace
                </h1>
                <p className="  text-[20px] font-light text-[#9D9D9D]">Manage workflows with ease.</p>
              </div>

              <form className="mt-10 space-y-6 lg:mt-12" onSubmit={handleSubmit}>
                <div>
                  <input
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    placeholder="User Name"
                    className="w-full border-0 border-b border-black/40  bg-transparent px-0 pb-5 text-[16px]  outline-none "
                  />
                </div>

                <div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className="w-full border-0 border-b border-black/40 bg-transparent px-0 pb-5  text-[16px]  outline-none "
                  />
                </div>

                {error ? (
                  <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
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
                      <span>Logging in...</span>
                    </>
                  ) : (
                    "Login"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
