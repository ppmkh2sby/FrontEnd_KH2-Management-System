import { RolePageShell } from "@/widgets/app-shell/RolePageShell";
import { WaliLogView } from "@/widgets/role-pages/RoleViews";

export function WaliLogPage() {
  return (
    <RolePageShell allowedRoles={["WaliSantri"]} contentPanelClassName="h-[calc(100vh-40px)] overflow-y-auto">
      <WaliLogView />
    </RolePageShell>
  );
}
