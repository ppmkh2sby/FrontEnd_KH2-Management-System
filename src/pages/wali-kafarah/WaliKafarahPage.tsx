import { RolePageShell } from "@/widgets/app-shell/RolePageShell";
import { WaliKafarahView } from "@/widgets/role-pages/RoleViews";

export function WaliKafarahPage() {
  return (
    <RolePageShell allowedRoles={["WaliSantri"]} contentPanelClassName="h-[calc(100vh-40px)] overflow-y-auto">
      <WaliKafarahView />
    </RolePageShell>
  );
}
