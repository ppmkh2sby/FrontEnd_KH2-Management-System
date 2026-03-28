import { RolePageShell } from "@/widgets/app-shell/RolePageShell";
import { StaffAttendanceView } from "@/widgets/role-pages/RoleViews";

export function StaffAttendancePage() {
  return (
    <RolePageShell allowedRoles={["DewanGuru", "Pengurus"]} contentPanelClassName="h-[calc(100vh-40px)] overflow-y-auto">
      <StaffAttendanceView />
    </RolePageShell>
  );
}
