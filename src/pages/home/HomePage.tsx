import { Navigate } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";
import { getDashboardNavigation } from "@/shared/config/navigation";
import { getSidebarCaption, useSantriDashboard } from "@/shared/lib/santri-dashboard";
import { AppShell } from "@/widgets/app-shell/AppShell";
import { DashboardOverview } from "@/widgets/dashboard-overview/DashboardOverview";

export function HomePage() {
  const { user, token, logout } = useAuth();
  const {
    santriDashboard,
    santriDashboardError,
    isSantriDashboardLoading,
  } = useSantriDashboard(user, token);

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  const contentPanelClassName =
    user.role === "DewanGuru" || user.role === "Pengurus"
      ? "h-[calc(100vh-40px)] overflow-hidden"
      : user.role === "WaliSantri"
        ? "h-[calc(100vh-40px)] overflow-y-auto"
        : undefined;

  return (
    <AppShell
      user={user}
      navigation={getDashboardNavigation(user.role, santriDashboard?.profile.tim)}
      onLogout={logout}
      sidebarCaption={getSidebarCaption(user, santriDashboard)}
      contentPanelClassName={contentPanelClassName}
    >
      <DashboardOverview
        user={user}
        santriDashboard={santriDashboard}
        santriDashboardError={santriDashboardError}
        isSantriDashboardLoading={isSantriDashboardLoading}
      />
    </AppShell>
  );
}
