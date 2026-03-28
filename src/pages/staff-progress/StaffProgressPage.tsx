import { RolePageShell } from "@/widgets/app-shell/RolePageShell";
import { StaffProgressView } from "@/widgets/role-pages/RoleViews";

export function StaffProgressPage() {
  return (
    <RolePageShell allowedRoles={["DewanGuru", "Pengurus"]} contentPanelClassName="h-[calc(100vh-40px)] overflow-hidden">
      <StaffProgressView />
    </RolePageShell>
  );
}
