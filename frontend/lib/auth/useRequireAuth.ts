"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, dashboardPathForPapel } from "./AuthContext";
import type { Papel } from "@/lib/api/types";

export function useRequireAuth(papel?: Papel) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (papel && user.papel !== papel) {
      router.replace(dashboardPathForPapel(user.papel));
    }
  }, [isLoading, user, papel, router]);

  return { user, isLoading };
}
