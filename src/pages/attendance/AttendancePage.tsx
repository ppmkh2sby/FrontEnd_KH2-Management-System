import { Navigate } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";
import { getDashboardNavigation } from "@/shared/config/navigation";
import { getSidebarCaption, useSantriDashboard } from "@/shared/lib/santri-dashboard";
import { AppShell } from "@/widgets/app-shell/AppShell";
import { AttendanceMineView } from "@/widgets/attendance-mine/AttendanceMineView";

export function AttendancePage() {
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
    >
      <AttendanceMineView
        dashboard={santriDashboard}
        errorMessage={santriDashboardError}
        isLoading={isSantriDashboardLoading}
      />
    </AppShell>
  );
}
