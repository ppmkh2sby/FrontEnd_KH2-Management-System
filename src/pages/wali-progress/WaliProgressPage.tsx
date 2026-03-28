import { RolePageShell } from "@/widgets/app-shell/RolePageShell";
import { WaliProgressView } from "@/widgets/role-pages/RoleViews";

export function WaliProgressPage() {
  return (
    <RolePageShell allowedRoles={["WaliSantri"]} contentPanelClassName="h-[calc(100vh-40px)] overflow-y-auto">
      <WaliProgressView />
    </RolePageShell>
  );
}
