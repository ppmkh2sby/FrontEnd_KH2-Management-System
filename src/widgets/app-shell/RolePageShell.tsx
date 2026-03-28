import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";
import { getDashboardNavigation } from "@/shared/config/navigation";
import type { AppRole } from "@/shared/types/auth";
import { AppShell } from "@/widgets/app-shell/AppShell";

type RolePageShellProps = {
  children: ReactNode;
  allowedRoles: AppRole[];
  contentPanelClassName?: string;
};

export function RolePageShell({
  children,
  allowedRoles,
  contentPanelClassName,
}: RolePageShellProps) {
  const { user, token, logout } = useAuth();

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role as AppRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AppShell
      user={user}
      navigation={getDashboardNavigation(user.role)}
      onLogout={logout}
      contentPanelClassName={contentPanelClassName}
    >
      {children}
    </AppShell>
  );
}
