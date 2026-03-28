import { RolePageShell } from "@/widgets/app-shell/RolePageShell";
import { WaliPresensiView } from "@/widgets/role-pages/RoleViews";

export function WaliPresensiPage() {
  return (
    <RolePageShell allowedRoles={["WaliSantri"]} contentPanelClassName="h-[calc(100vh-40px)] overflow-y-auto">
      <WaliPresensiView />
    </RolePageShell>
  );
}
