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
          <button
            className="inline-flex min-h-[3.3rem] items-center justify-center rounded-full border border-transparent bg-[linear-gradient(135deg,#174c34_0%,#2d7a56_100%)] px-5 py-3 font-bold text-white shadow-[0_18px_34px_rgba(16,53,37,0.24)] transition hover:-translate-y-px hover:shadow-[0_22px_40px_rgba(16,53,37,0.3)]"
            type="button"
          >
            Modul Santri
          </button>

          <button
            className="inline-flex min-h-[3.3rem] items-center justify-center rounded-full border border-white/12 bg-white/5 px-5 py-3 font-bold text-inherit transition hover:bg-white/8"
            type="button"
            onClick={() => void logout()}
          >
            Logout
          </button>
        </div>
      </section>

      <DashboardOverview />
    </AppShell>
  );
}
