import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";
import { getDashboardNavigation } from "@/shared/config/navigation";
import { getSidebarCaption, useSantriDashboard } from "@/shared/lib/santri-dashboard";
import { canAccessSantriTeam } from "@/shared/lib/santri-team";
import type { SantriDashboardResponse } from "@/shared/types/dashboard";
import { AppShell } from "@/widgets/app-shell/AppShell";

type SantriPageShellProps = {
  children: (context: {
    santriDashboard: SantriDashboardResponse | null;
    santriDashboardError: string | null;
    isSantriDashboardLoading: boolean;
  }) => ReactNode;
  contentPanelClassName?: string;
  allowedTeams?: readonly string[];
};

export function SantriPageShell({ children, contentPanelClassName, allowedTeams }: SantriPageShellProps) {
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

  // The dashboard request begins in an effect. On the first render its loading
  // state is still false, so do not reject a team-only page until the profile
  // has either loaded or reported an error.
  const isCheckingTeamAccess = Boolean(
    allowedTeams?.length &&
      (isSantriDashboardLoading || (!santriDashboard && !santriDashboardError))
  );

  if (isCheckingTeamAccess) {
    return (
      <AppShell
        user={user}
        navigation={getDashboardNavigation(user.role)}
        onLogout={logout}
        sidebarCaption="Memeriksa akses tim..."
        contentPanelClassName={contentPanelClassName}
      >
        <div className="grid min-h-64 place-items-center text-sm font-medium text-gray-500">
          Memeriksa akses tim...
        </div>
      </AppShell>
    );
  }

  if (allowedTeams?.length && !canAccessSantriTeam(santriDashboard?.profile.tim, allowedTeams)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AppShell
      user={user}
      navigation={getDashboardNavigation(user.role, santriDashboard?.profile.tim)}
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
