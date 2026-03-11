import { AppShell } from "@/widgets/app-shell/AppShell";
import { DashboardOverview } from "@/widgets/dashboard-overview/DashboardOverview";

export function HomePage() {
  return (
    <AppShell>
      <section className="page__hero">
        <div className="page__kicker">Frontend starter</div>
        <h1 className="page__title">KH2 Management System</h1>
        <p className="page__summary">
          Fondasi awal React + TypeScript dengan struktur folder yang rapi,
          alias import, dan komponen dasar yang siap dikembangkan per modul.
        </p>

        <div className="page__actions">
          <button className="button button--primary" type="button">
            Mulai Bangun Modul
          </button>
          <button className="button button--ghost" type="button">
            Lihat Struktur Folder
          </button>
        </div>
      </section>

      <DashboardOverview />
    </AppShell>
  );
}
