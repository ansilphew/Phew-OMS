"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/api";

export default function ProtectedPage({ allowedRole, children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await getCurrentUser();

        if (!data || !data.user) {
          router.replace("/login");
          return;
        }

        if (allowedRole) {
          const roles = typeof allowedRole === "string"
            ? allowedRole.split(",").map(r => r.trim())
            : Array.isArray(allowedRole)
              ? allowedRole
              : [allowedRole];

          if (!roles.includes(data.user.role)) {
            router.replace(data.redirectTo || "/login");
            return;
          }
        }

        setLoading(false);
      } catch (requestError) {
        router.replace("/login");
      }
    }

    loadUser();
  }, [allowedRole, router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#65008c]/20 border-t-[#65008c]" />
          <p className="text-sm text-slate-500 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
