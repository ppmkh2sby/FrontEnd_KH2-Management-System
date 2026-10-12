import { useEffect, useState } from "react";

import { ApiError, http } from "@/shared/lib/http";
import type { AuthUser } from "@/shared/types/auth";
import type { SantriDashboardResponse } from "@/shared/types/dashboard";

export function useSantriDashboard(user: AuthUser | null, token: string | null) {
  const [santriDashboard, setSantriDashboard] = useState<SantriDashboardResponse | null>(null);
  const [santriDashboardError, setSantriDashboardError] = useState<string | null>(null);
  const [isSantriDashboardLoading, setIsSantriDashboardLoading] = useState(false);

  useEffect(() => {
    if (!user || !token || user.role !== "Santri") {
      setSantriDashboard(null);
      setSantriDashboardError(null);
      setIsSantriDashboardLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadDashboard() {
      setIsSantriDashboardLoading(true);
      setSantriDashboardError(null);

      try {
        const response = await http<SantriDashboardResponse>("/api/v1/dashboard/santri/me", {
          method: "GET",
          accessToken: token,
          signal: controller.signal,
        });

        setSantriDashboard(response);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setSantriDashboard(null);
        setSantriDashboardError(
          error instanceof ApiError ? error.message : "Dashboard santri belum dapat dimuat."
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsSantriDashboardLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => controller.abort();
  }, [token, user]);

  return {
    santriDashboard,
    santriDashboardError,
    isSantriDashboardLoading,
  };
}

export function getSidebarCaption(user: AuthUser, dashboard: SantriDashboardResponse | null) {
  switch (user.role) {
    case "DewanGuru":
      return "Dewan Guru KH2";
    case "Pengurus":
      return "Pengurus KH2";
    case "WaliSantri":
      return "Wali Santri KH2";
    case "Admin":
      return "Admin KH2";
    case "Santri":
      return `Tim: ${dashboard?.profile.tim || "-"}`;
    default:
      return user.role;
  }
}
