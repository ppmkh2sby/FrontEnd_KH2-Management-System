import { AppShell } from "@/widgets/app-shell/AppShell";
import { DashboardOverview } from "@/widgets/dashboard-overview/DashboardOverview";
import { useAuth } from "@/app/providers/AuthProvider";

export function HomePage() {
  const { user, logout } = useAuth();

  return (
    <AppShell>
      <section className="page__hero">
        <span className="page__kicker">Frontend starter</span>
        <h1 className="page__title">KH2 Management System</h1>
        <p className="page__summary">
          Login frontend sudah terhubung ke backend auth. User aktif saat ini:
          {" "}
          <strong>{user?.fullName}</strong>
          {" "}
          ({user?.role}).
        </p>

        <div className="page__actions">
          <button className="button button--primary" type="button">
            Modul Santri
          </button>

          <button className="button button--ghost" type="button" onClick={() => void logout()}>
            Logout
          </button>
        </div>
      </section>

      <DashboardOverview />
    </AppShell>
  );
}