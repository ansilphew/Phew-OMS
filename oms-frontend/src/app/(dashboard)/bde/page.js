"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BdePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/bde/leads");
  }, [router]);

  return null;
}
