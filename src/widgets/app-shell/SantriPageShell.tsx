import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";
import { getDashboardNavigation } from "@/shared/config/navigation";
import { getSidebarCaption, useSantriDashboard } from "@/shared/lib/santri-dashboard";
import type { SantriDashboardResponse } from "@/shared/types/dashboard";
import { AppShell } from "@/widgets/app-shell/AppShell";

type SantriPageShellProps = {
  children: (context: {
    santriDashboard: SantriDashboardResponse | null;
    santriDashboardError: string | null;
    isSantriDashboardLoading: boolean;
  }) => ReactNode;
  contentPanelClassName?: string;
};

export function SantriPageShell({ children, contentPanelClassName }: SantriPageShellProps) {
  const { user, token, logout } = useAuth();
  const {
    santriDashboard,
    santriDashboardError,
    isSantriDashboardLoading,
  } = useSantriDashboard(user, token);

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "Santri") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AppShell
      user={user}
      navigation={getDashboardNavigation(user.role)}
      onLogout={logout}
      sidebarCaption={getSidebarCaption(user, santriDashboard)}
      contentPanelClassName={contentPanelClassName}
    >
      {children({
        santriDashboard,
        santriDashboardError,
        isSantriDashboardLoading,
      })}
    </AppShell>
  );
}
