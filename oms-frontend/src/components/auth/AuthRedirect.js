"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/api";

export default function AuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      try {
        const data = await getCurrentUser();
        router.replace(data.redirectTo || "/");
      } catch (error) {
        router.replace("/login");
      }
    }

    checkUser();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf8fc] px-4">
      <p className="text-sm text-slate-500">Checking your login...</p>
    </div>
  );
}
