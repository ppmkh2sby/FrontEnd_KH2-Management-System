import { SantriPageShell } from "@/widgets/app-shell/SantriPageShell";
import { AttendanceMineView } from "@/widgets/attendance-mine/AttendanceMineView";

export function AttendancePage() {
  return (
    <SantriPageShell>
      {({ santriDashboard, santriDashboardError, isSantriDashboardLoading }) => (
        <AttendanceMineView
          dashboard={santriDashboard}
          errorMessage={santriDashboardError}
          isLoading={isSantriDashboardLoading}
        />
      )}
    </SantriPageShell>
  );
}
