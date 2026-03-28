import { RolePageShell } from "@/widgets/app-shell/RolePageShell";
import { StaffLogView } from "@/widgets/role-pages/RoleViews";

export function StaffLogPage() {
  return (
    <RolePageShell allowedRoles={["DewanGuru", "Pengurus"]} contentPanelClassName="h-[calc(100vh-40px)] overflow-y-auto">
      <StaffLogView />
    </RolePageShell>
  );
}
