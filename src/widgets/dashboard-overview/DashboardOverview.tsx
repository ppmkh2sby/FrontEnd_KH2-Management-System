import { useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import { getGenericRoleDashboard, getRoleDisplayName } from "@/shared/config/dashboard";
import { formatNumber } from "@/shared/lib/formatNumber";
import type { AuthUser } from "@/shared/types/auth";
import type {
  DashboardMetric,
  DashboardSummaryBlock,
  KafarahItem,
  MovementLogItem,
  ProgressItem,
  SantriDashboardResponse,
} from "@/shared/types/dashboard";
import { AppIcon } from "@/shared/ui/AppIcon";
import { WaliOverviewView } from "@/widgets/role-pages/RoleViews";

type DashboardOverviewProps = {
  user: AuthUser;
  santriDashboard?: SantriDashboardResponse | null;
  santriDashboardError?: string | null;
  isSantriDashboardLoading?: boolean;
};

type SantriDashboardViewModel = {
  generatedAtLabel: string;
  tags: Array<{ label: string; icon: "calendar" | "team" | "verify" | "mail" }>;
  highlights: Array<{ label: string; value: string; hint: string }>;
  metrics: DashboardMetric[];
  attendanceSummary: DashboardSummaryBlock[];
  attendanceItems: Array<{ title: string; date: string; status: string }>;
  attendanceProgressWidth: string;
  kafarahSummary: DashboardSummaryBlock[];
  kafarahItems: KafarahItem[];
  kafarahProgressWidth: string;
  progressSummary: DashboardSummaryBlock[];
  progressItems: ProgressItem[];
  movementItems: MovementLogItem[];
  recordedMovementCount: number;
};

type StaffDashboardViewModel = {
  roleLabel: string;
  tags: Array<{ label: string; icon: "calendar" | "verify" | "mail" }>;
  highlights: Array<{ label: string; value: string }>;
  metrics: DashboardMetric[];
  attendanceSummary: DashboardSummaryBlock[];
  attendanceProgressWidth: string;
  progressLeaders: Array<{ name: string; team: string; completed: string; average: string; updatedAt: string }>;
  recentLogs: Array<{ name: string; type: string; dateLabel: string; note: string; status: string }>;
};

const metricToneClass: Record<DashboardMetric["tone"], string> = {
  emerald: "text-emerald-700",
  rose: "text-rose-700",
  blue: "text-blue-700",
  amber: "text-amber-700",
};

export function DashboardOverview({
  user,
  santriDashboard,
  santriDashboardError,
  isSantriDashboardLoading,
}: DashboardOverviewProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  let content: ReactNode;

  if (user.role === "Santri") {
    content = (
      <SantriDashboard
        user={user}
        dashboard={santriDashboard ?? null}
        errorMessage={santriDashboardError ?? null}
        isLoading={Boolean(isSantriDashboardLoading)}
      />
    );
  } else if (user.role === "DewanGuru" || user.role === "Pengurus") {
    content = <StaffDashboard user={user} />;
  } else if (user.role === "WaliSantri") {
    content = <WaliOverviewView user={user} />;
  } else {
    content = <StandardRoleDashboard user={user} />;
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const normalizedX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const normalizedY = (event.clientY - bounds.top) / bounds.height - 0.5;

    setTilt({
      x: Number((normalizedY * -10).toFixed(2)),
      y: Number((normalizedX * 14).toFixed(2)),
    });
  };

  return (
    <div
      className="dashboard-stage relative isolate min-h-full overflow-hidden"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
    >
      <DashboardAmbientScene tilt={tilt} />
      <div className="relative z-10">{content}</div>
    </div>
  );
}

function DashboardAmbientScene({ tilt }: { tilt: { x: number; y: number } }) {
  const sceneStyle = {
    "--dashboard-tilt-x": `${tilt.x}deg`,
    "--dashboard-tilt-y": `${tilt.y}deg`,
  } as CSSProperties;

  return (
    <div className="dashboard-ambient" aria-hidden="true">
      <div className="dashboard-ambient__grid" />
      <div className="dashboard-ambient__glow dashboard-ambient__glow--top" />
      <div className="dashboard-ambient__glow dashboard-ambient__glow--bottom" />
      <div className="dashboard-orb" style={sceneStyle}>
        <div className="dashboard-orb__float">
          <div className="dashboard-orb__spin">
            <div className="dashboard-orb__core">
              <span className="dashboard-orb__core-shine" />
            </div>
            <div className="dashboard-orb__ring dashboard-orb__ring--one" />
            <div className="dashboard-orb__ring dashboard-orb__ring--two" />
            <div className="dashboard-orb__ring dashboard-orb__ring--three" />
            <span className="dashboard-orb__particle dashboard-orb__particle--one" />
            <span className="dashboard-orb__particle dashboard-orb__particle--two" />
            <span className="dashboard-orb__particle dashboard-orb__particle--three" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SantriDashboard({
  user,
  dashboard,
  errorMessage,
  isLoading,
}: {
  user: AuthUser;
  dashboard: SantriDashboardResponse | null;
  errorMessage: string | null;
  isLoading: boolean;
}) {
  const navigate = useNavigate();
  const quickActions = [
    { icon: "activity" as const, label: "Kehadiran Saya", href: "/dashboard/kehadiran-saya" },
    { icon: "shield" as const, label: "Kafarah Saya", href: "/dashboard/kafarah-saya" },
    { icon: "book" as const, label: "Progress Keilmuan", href: "/dashboard/progress-keilmuan" },
    { icon: "clock" as const, label: "Log Keluar/Masuk", href: "/dashboard/log-keluar-masuk/saya" },
  ];

  if (isLoading) {
    return <SantriDashboardSkeleton user={user} />;
  }

  const view = dashboard ? mapSantriDashboard(dashboard) : buildFallbackSantriDashboard(user, errorMessage);

  return (
    <div className="space-y-6">
      {!dashboard && errorMessage ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Data dashboard belum dapat dimuat. Tampilan tetap menampilkan state kosong sampai backend tersedia.
        </div>
      ) : null}

      <div className="dashboard-hero relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/90 via-white/75 to-slate-50/90 p-6 shadow-sm backdrop-blur-sm">
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-200/40 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-sky-200/30 blur-2xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-2xl space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
              <AppIcon name="dashboard" className="h-3.5 w-3.5" />
              Ringkasan Santri
            </p>
            <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
              Assalamualaikum, {dashboard?.profile.fullName ?? user.fullName}
            </h1>
            <p className="text-sm leading-relaxed text-gray-600">
              Dashboard ini merangkum data dari fitur Presensi, Kafarah, Progress Keilmuan, dan Log Keluar/Masuk dalam satu tampilan.
            </p>

            <div className="flex flex-wrap gap-2 text-xs">
              {view.tags.map((tag) => (
                <span
                  key={tag.label}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-gray-700"
                >
                  <AppIcon name={tag.icon} className="h-3.5 w-3.5 text-emerald-600" />
                  {tag.label}
                </span>
              ))}
            </div>
          </div>

          <div className="w-full max-w-sm rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Highlight</p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              {view.highlights.map((item) => (
                <div key={item.label} className="rounded-xl border border-gray-100 bg-white p-3">
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="mt-1 text-xl font-semibold text-gray-900">{item.value}</p>
                  <p className="mt-1 text-[11px] text-gray-500">{item.hint}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-gray-400">{view.generatedAtLabel}</p>
          </div>
        </div>

        <div className="relative mt-5 flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => navigate(action.href)}
              className="dashboard-action inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:border-emerald-300 hover:text-emerald-700"
            >
              <AppIcon name={action.icon} className="h-4 w-4" />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {view.metrics.map((metric) => (
          <article key={metric.label} className="dashboard-card rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{metric.value}</p>
            <p className={`mt-1 text-xs ${metricToneClass[metric.tone]}`}>{metric.hint}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <PanelCard title="Presensi Kehadiran Saya" description="Ringkasan kehadiran dan catatan terbaru." actionLabel="Lihat semua" actionHref="/dashboard/kehadiran-saya">
          <SummaryGrid items={view.attendanceSummary} accentIndex={4} accentTone="emerald" />
          <ProgressBar width={view.attendanceProgressWidth} tone="emerald" />
          <div className="mt-4 space-y-2">
            {view.attendanceItems.length > 0 ? (
              view.attendanceItems.map((item) => (
                <div key={`${item.title}-${item.date}`} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.date}</p>
                  </div>
                  <span className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusTone(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              ))
            ) : (
              <EmptyDataState label="Belum ada data presensi." />
            )}
          </div>
        </PanelCard>

        <PanelCard title="Kafarah Saya" description="Pantau setoran dan tanggungan terkini." actionLabel="Lihat semua" actionHref="/dashboard/kafarah-saya">
          <SummaryGrid items={view.kafarahSummary} accentIndex={2} accentTone="rose" />
          <ProgressBar width={view.kafarahProgressWidth} tone="emerald" />
          <p className="mt-2 text-xs text-gray-500">Progress penyelesaian kafarah: {view.kafarahProgressWidth}</p>
          <div className="mt-4 space-y-2">
            {view.kafarahItems.length > 0 ? (
              view.kafarahItems.map((item) => <KafarahEntry key={`${item.title}-${item.date}`} item={item} />)
            ) : (
              <EmptyDataState label="Belum ada data kafarah." />
            )}
          </div>
        </PanelCard>

        <PanelCard title="Log Progress Keilmuan" description="Update materi Al-Quran dan Al-Hadits terbaru." actionLabel="Lihat semua" actionHref="/dashboard/progress-keilmuan">
          <SummaryGrid items={view.progressSummary} accentIndex={4} accentTone="emerald" />
          <div className="mt-4 space-y-2">
            {view.progressItems.length > 0 ? (
              view.progressItems.map((item) => <ProgressEntry key={`${item.title}-${item.detail}`} item={item} />)
            ) : (
              <EmptyDataState label="Belum ada log progress keilmuan." />
            )}
          </div>
        </PanelCard>

        <PanelCard title="Log Keluar/Masuk" description="Status izin keluar/masuk terbaru Anda." actionLabel="Lihat semua" actionHref="/dashboard/log-keluar-masuk/saya">
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
              Tercatat: {view.recordedMovementCount}
            </span>
          </div>
          <div className="mt-4 space-y-2">
            {view.movementItems.length > 0 ? (
              view.movementItems.map((item) => <MovementEntry key={`${item.title}-${item.detail}`} item={item} />)
            ) : (
              <EmptyDataState label="Belum ada log keluar/masuk." />
            )}
          </div>
        </PanelCard>
      </div>
    </div>
  );
}

function StaffDashboard({ user }: { user: AuthUser }) {
  const view = buildStaffDashboard(user.role);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="relative h-full min-h-0">
      <div ref={scrollRef} className="sidebar-scroll h-full overflow-y-auto pr-1 scroll-smooth">
        <div className="space-y-4 pb-8">
          <div className="dashboard-hero relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/90 via-white/75 to-cyan-50/90 p-6 shadow-sm backdrop-blur-sm">
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-200/40 blur-2xl" />
            <div className="pointer-events-none absolute -left-8 -bottom-8 h-28 w-28 rounded-full bg-cyan-200/40 blur-2xl" />
            <div className="relative flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl space-y-3">
                <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  <AppIcon name="dashboard" className="h-3.5 w-3.5" />
                  Dashboard Staff
                </p>
                <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">Assalamualaikum, {user.fullName}</h1>
                <p className="text-sm leading-relaxed text-gray-600">
                  Ringkasan monitoring untuk {view.roleLabel}: rekap kehadiran, progres seluruh santri, dan log keluar/masuk terbaru.
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {view.tags.map((tag) => (
                    <span
                      key={tag.label}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-gray-700"
                    >
                      <AppIcon name={tag.icon} className="h-3.5 w-3.5 text-emerald-600" />
                      {tag.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="w-full max-w-3xl rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Highlight</p>
                <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1 text-sm">
                  {view.highlights.map((item) => (
                    <div key={item.label} className="min-w-[150px] rounded-xl border border-gray-100 bg-white p-3">
                      <p className="text-xs text-gray-500">{item.label}</p>
                      <p className="mt-1 text-xl font-semibold text-gray-900">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {view.metrics.map((metric) => (
              <article key={metric.label} className="dashboard-card rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <p className="text-xs font-medium text-gray-500">{metric.label}</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">{metric.value}</p>
                <p className={`mt-1 text-xs ${metricToneClass[metric.tone]}`}>{metric.hint}</p>
              </article>
            ))}
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <PanelCard
              title="Rekap Kehadiran Santri"
              description="Ringkasan status kehadiran seluruh data presensi."
              actionLabel="Lihat detail"
              actionHref="/dashboard/staff/kehadiran-santri"
            >
              <SummaryGrid items={view.attendanceSummary} accentIndex={4} accentTone="emerald" />
              <ProgressBar width={view.attendanceProgressWidth} tone="emerald" />
              <p className="mt-2 text-xs text-gray-500">Presensi hari ini: 0 catatan.</p>
            </PanelCard>

            <PanelCard
              title="Pencapaian Progress Santri"
              description="Peringkat rata-rata progres keilmuan per santri."
              actionLabel="Lihat detail"
              actionHref="/dashboard/staff/progress-keilmuan"
            >
              <div className="mt-4 space-y-2">
                {view.progressLeaders.length > 0 ? (
                  view.progressLeaders.map((item) => (
                    <div key={item.name} className="flex items-center justify-between gap-2 rounded-xl border border-gray-100 px-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">Tim {item.team} | {item.completed} modul selesai</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-emerald-700">{item.average}</p>
                        <p className="text-[11px] text-gray-500">{item.updatedAt}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyDataState label="Belum ada data progress santri." />
                )}
              </div>
            </PanelCard>
          </div>

          <PanelCard
            title="Log Terbaru Keluar/Masuk"
            description="Catatan terbaru aktivitas keluar/masuk seluruh santri."
            actionLabel="Lihat detail"
            actionHref="/dashboard/staff/log-keluar-masuk"
          >
            <div className="mt-4 space-y-2">
              {view.recentLogs.length > 0 ? (
                view.recentLogs.map((item) => (
                  <div key={`${item.name}-${item.dateLabel}`} className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">{item.name} | {item.type}</p>
                      <p className="text-xs text-gray-500">{item.dateLabel}</p>
                      <p className="mt-1 truncate text-xs text-gray-600">{item.note}</p>
                    </div>
                    <span className="whitespace-nowrap rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                      {item.status}
                    </span>
                  </div>
                ))
              ) : (
                <EmptyDataState label="Belum ada data log keluar/masuk." />
              )}
            </div>
          </PanelCard>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-4 right-3 z-20 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => scrollRef.current?.scrollBy({ top: -420, behavior: "smooth" })}
          className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow hover:bg-gray-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="m5.5 12 4.5-4.5 4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => scrollRef.current?.scrollBy({ top: 420, behavior: "smooth" })}
          className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow hover:bg-gray-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="m5.5 8 4.5 4.5 4.5-4.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function StandardRoleDashboard({ user }: { user: AuthUser }) {
  const preset = getGenericRoleDashboard(user.role);

  return (
    <div className="space-y-6">
      <div className="dashboard-hero relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/90 via-white/75 to-slate-50/90 p-6 shadow-sm backdrop-blur-sm">
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-200/40 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-sky-200/30 blur-2xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-2xl space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
              <AppIcon name="dashboard" className="h-3.5 w-3.5" />
              {preset.eyebrow}
            </p>
            <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">{preset.title}</h1>
            <p className="text-sm leading-relaxed text-gray-600">{preset.description}</p>
            <div className="flex flex-wrap gap-2 text-xs">
              {preset.tags.map((tag) => (
                <span
                  key={tag.label}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-gray-700"
                >
                  <AppIcon name={tag.icon} className="h-3.5 w-3.5 text-emerald-600" />
                  {tag.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {preset.metrics.map((metric) => (
          <article key={metric.label} className="dashboard-card rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{metric.value}</p>
            <p className={`mt-1 text-xs ${metricToneClass[metric.tone]}`}>{metric.hint}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <PanelCard
          title={`Dashboard ${getRoleDisplayName(user.role)}`}
          description="Kerangka dashboard mengikuti web lama dan siap dihubungkan ke endpoint backend berikutnya."
          actionLabel="Prioritas"
        >
          <div className="mt-4 space-y-2">
            {preset.modules.map((module) => (
              <div key={module.title} className="flex items-center justify-between gap-2 rounded-xl border border-gray-100 px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">{module.title}</p>
                  <p className="text-xs text-gray-500">{module.description}</p>
                </div>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 text-emerald-700">
                  <AppIcon name={module.icon} className="h-4.5 w-4.5" />
                </span>
              </div>
            ))}
          </div>
        </PanelCard>

        <PanelCard
          title="Catatan Integrasi"
          description="Tampilan sudah diselaraskan dengan web sebelumnya, data backend bisa disesuaikan setelahnya."
          actionLabel="Status"
        >
          <div className="mt-4 space-y-2">
            {[
              "Hero, metric card, dan panel kini mengikuti pola web lama.",
              "Sidebar dan dashboard memakai bahasa visual yang sama.",
              "Role ini siap dilanjutkan ke endpoint backend saat modulnya dibuka.",
            ].map((item) => (
              <div key={item} className="rounded-xl border border-gray-100 px-3 py-3 text-sm text-gray-700">
                {item}
              </div>
            ))}
          </div>
        </PanelCard>
      </div>
    </div>
  );
}

function SantriDashboardSkeleton({ user }: { user: AuthUser }) {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="h-6 w-32 rounded-full bg-gray-200" />
        <div className="mt-4 h-8 max-w-80 rounded-xl bg-gray-200" />
        <div className="mt-3 h-4 max-w-xl rounded-xl bg-gray-100" />
        <div className="mt-4 flex flex-wrap gap-2">
          <div className="h-8 w-36 rounded-lg bg-gray-100" />
          <div className="h-8 w-40 rounded-lg bg-gray-100" />
          <div className="h-8 w-44 rounded-lg bg-gray-100" />
        </div>
        <div className="mt-5 text-sm text-gray-400">Memuat ringkasan terbaru untuk {user.fullName}...</div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-28 rounded-2xl border border-gray-100 bg-white shadow-sm" />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-72 rounded-2xl border border-gray-100 bg-white shadow-sm" />
        ))}
      </div>
    </div>
  );
}

function PanelCard({
  title,
  description,
  actionLabel,
  actionHref,
  children,
}: {
  title: string;
  description: string;
  actionLabel: string;
  actionHref?: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();

  return (
    <article className="dashboard-card rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <button
          type="button"
          onClick={actionHref ? () => navigate(actionHref) : undefined}
          className={`text-xs font-semibold text-emerald-700 hover:text-emerald-800 ${actionHref ? "" : "cursor-default opacity-60"}`}
          aria-disabled={!actionHref}
        >
          {actionLabel}
        </button>
      </div>
      <div className="mt-4">{children}</div>
    </article>
  );
}

function SummaryGrid({
  items,
  accentIndex,
  accentTone,
}: {
  items: DashboardSummaryBlock[];
  accentIndex: number;
  accentTone: "emerald" | "rose";
}) {
  const accentClass = accentTone === "rose" ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700";

  return (
    <div className={`grid gap-2 text-center text-xs ${items.length >= 5 ? "grid-cols-5" : "grid-cols-3"}`}>
      {items.map((item, index) => (
        <div key={item.label} className={`rounded-lg p-2 ${index === accentIndex ? accentClass : "bg-gray-50 text-gray-700"}`}>
          <p className="text-current/80">{item.label}</p>
          <p className="font-semibold">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function ProgressBar({ width, tone }: { width: string; tone: "emerald" | "rose" }) {
  const className = tone === "rose" ? "bg-rose-500" : "bg-emerald-500";

  return (
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
      <div className={`h-full rounded-full ${className}`} style={{ width }} />
    </div>
  );
}

function KafarahEntry({ item }: { item: KafarahItem }) {
  return (
    <div className="rounded-xl border border-gray-100 px-3 py-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-gray-900">{item.title}</p>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-700">{item.date}</span>
      </div>
      <p className="mt-1 text-xs text-gray-600">{item.value}</p>
      <p className="mt-1 text-xs text-gray-500">
        {item.settled} | {item.outstanding}
      </p>
    </div>
  );
}

function ProgressEntry({ item }: { item: ProgressItem }) {
  return (
    <div className="rounded-xl border border-gray-100 px-3 py-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-gray-900">{item.title}</p>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">{item.category}</span>
      </div>
      <p className="mt-1 text-xs text-gray-500">{item.detail}</p>
      <ProgressBar width={`${item.value}%`} tone="emerald" />
    </div>
  );
}

function MovementEntry({ item }: { item: MovementLogItem }) {
  return (
    <div className="rounded-xl border border-gray-100 px-3 py-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-gray-900">{item.title}</p>
        <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
          {item.status}
        </span>
      </div>
      <p className="mt-1 text-xs text-gray-500">{item.detail}</p>
    </div>
  );
}

function EmptyDataState({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 p-4 text-center text-sm text-gray-500">
      {label}
    </div>
  );
}

function buildStaffDashboard(role: string): StaffDashboardViewModel {
  const roleLabel = role === "Pengurus" ? "Pengurus" : "Dewan Guru";

  return {
    roleLabel,
    tags: [
      { icon: "calendar", label: formatLongDate(new Date().toISOString()) },
      { icon: "verify", label: roleLabel },
      { icon: "mail", label: "Monitoring siap dihubungkan" },
    ],
    highlights: [
      { label: "Kehadiran", value: "0%" },
      { label: "Avg Progress", value: "0%" },
      { label: "Log Hari Ini", value: "0" },
      { label: "Total Santri", value: "0" },
    ],
    metrics: [
      { label: "Total Presensi", value: "0", hint: "Hadir 0 kali", tone: "emerald" },
      { label: "Santri Aktif Progres", value: "0", hint: "0 modul tuntas", tone: "blue" },
      { label: "Data Progress", value: "0", hint: "Quran 0 | Hadits 0", tone: "amber" },
      { label: "Total Log Keluar/Masuk", value: "0", hint: "Putra 0 | Putri 0", tone: "blue" },
    ],
    attendanceSummary: [
      { label: "Hadir", value: "0" },
      { label: "Izin", value: "0" },
      { label: "Sakit", value: "0" },
      { label: "Alpa", value: "0" },
      { label: "Persen", value: "0%" },
    ],
    attendanceProgressWidth: "0%",
    progressLeaders: [],
    recentLogs: [],
  };
}

function mapSantriDashboard(response: SantriDashboardResponse): SantriDashboardViewModel {
  const attendancePercentage = clampPercentage(response.attendance.persentase);
  const kafarahProgress =
    response.kafarah.totalKafarah <= 0
      ? 0
      : Math.round((response.kafarah.jumlahSetor / response.kafarah.totalKafarah) * 100);

  return {
    generatedAtLabel: `Update ${formatDateTime(response.generatedAtUtc)}`,
    tags: [
      { icon: "calendar", label: formatLongDate(response.generatedAtUtc) },
      { icon: "team", label: `Tim: ${response.profile.tim || "-"}` },
      response.profile.emailConfirmed
        ? { icon: "verify", label: "Email terverifikasi" }
        : { icon: "mail", label: "Email belum terverifikasi" },
    ],
    highlights: [
      { label: "Kehadiran", value: `${response.highlight.attendancePercentage}%`, hint: "rekap kehadiran" },
      { label: "Sisa Kafarah", value: formatNumber(response.highlight.remainingKafarah), hint: "tanggungan aktif" },
      { label: "Avg Progress", value: `${response.highlight.averageProgressPercentage}%`, hint: "capaian materi" },
      { label: "Log Tercatat", value: formatNumber(response.highlight.recordedLogs), hint: "aktivitas izin" },
    ],
    metrics: [
      { label: "Total Presensi", value: formatNumber(response.overview.totalPresensi), hint: `Hadir ${formatNumber(response.overview.hadirCount)} kali`, tone: "emerald" },
      { label: "Total Kafarah", value: formatNumber(response.overview.totalKafarah), hint: `Sisa ${formatNumber(response.overview.sisaKafarah)}`, tone: "rose" },
      { label: "Catatan Progress", value: formatNumber(response.overview.totalProgressEntries), hint: `${formatNumber(response.overview.completedProgressEntries)} materi selesai`, tone: "emerald" },
      { label: "Total Log Keluar/Masuk", value: formatNumber(response.overview.totalLogs), hint: `${formatNumber(response.overview.recordedLogCount)} data tercatat`, tone: "blue" },
    ],
    attendanceSummary: [
      { label: "Hadir", value: formatNumber(response.attendance.hadir) },
      { label: "Izin", value: formatNumber(response.attendance.izin) },
      { label: "Sakit", value: formatNumber(response.attendance.sakit) },
      { label: "Alpa", value: formatNumber(response.attendance.alpha) },
      { label: "Persen", value: `${attendancePercentage}%` },
    ],
    attendanceItems: response.attendance.recent.map((item) => ({
      title: `${item.kegiatanKategori} - ${item.waktu}`,
      date: formatDateTime(item.createdAtUtc),
      status: formatAttendanceStatus(item.status),
    })),
    attendanceProgressWidth: `${attendancePercentage}%`,
    kafarahSummary: [
      { label: "Total", value: formatNumber(response.kafarah.total) },
      { label: "Setor", value: formatNumber(response.kafarah.jumlahSetor) },
      { label: "Sisa", value: formatNumber(response.kafarah.sisaTanggungan) },
    ],
    kafarahItems: response.kafarah.recent.map((item) => ({
      title: item.jenisPelanggaranLabel,
      value: item.kafarah,
      settled: `Setor: ${formatNumber(item.jumlahSetor)}`,
      outstanding: `Tanggungan: ${formatNumber(item.sisaTanggungan)}`,
      date: formatDateOnly(item.tanggal),
    })),
    kafarahProgressWidth: `${clampPercentage(kafarahProgress)}%`,
    progressSummary: [
      { label: "Total", value: formatNumber(response.progress.total) },
      { label: "Selesai", value: formatNumber(response.progress.completed) },
      { label: "Proses", value: formatNumber(response.progress.inProgress) },
      { label: "Quran", value: formatNumber(response.progress.quran) },
      { label: "Avg", value: `${clampPercentage(response.progress.average)}%` },
    ],
    progressItems: response.progress.recent.map((item) => ({
      title: item.judul,
      detail: `${formatNumber(item.capaian)}/${formatNumber(item.target)} ${item.satuan ?? "item"} - ${formatDateTime(item.terakhirSetorUtc ?? item.updatedAtUtc)}`,
      value: clampPercentage(item.persentase),
      category: item.level ?? "Progress",
    })),
    movementItems: response.logs.recent.map((item) => ({
      title: item.jenis,
      detail: `${formatDateOnly(item.tanggalPengajuan)} - ${item.rentang ?? "-"}`,
      status: item.status,
    })),
    recordedMovementCount: response.logs.tercatat,
  };
}

function buildFallbackSantriDashboard(user: AuthUser, errorMessage: string | null): SantriDashboardViewModel {
  const today = new Date().toISOString();

  return {
    generatedAtLabel: errorMessage ? "Data belum tersedia" : `Update ${formatDateTime(today)}`,
    tags: [
      { icon: "calendar", label: formatLongDate(today) },
      { icon: "team", label: "Tim: -" },
      user.email ? { icon: "mail", label: user.email } : { icon: "mail", label: "Email belum diatur" },
    ],
    highlights: [
      { label: "Kehadiran", value: "0%", hint: "menunggu data backend" },
      { label: "Sisa Kafarah", value: "0", hint: "menunggu data backend" },
      { label: "Avg Progress", value: "0%", hint: "menunggu data backend" },
      { label: "Log Tercatat", value: "0", hint: "menunggu data backend" },
    ],
    metrics: [
      { label: "Total Presensi", value: "0", hint: "Hadir 0 kali", tone: "emerald" },
      { label: "Total Kafarah", value: "0", hint: "Sisa 0", tone: "rose" },
      { label: "Catatan Progress", value: "0", hint: "0 materi selesai", tone: "emerald" },
      { label: "Total Log Keluar/Masuk", value: "0", hint: "0 data tercatat", tone: "blue" },
    ],
    attendanceSummary: [
      { label: "Hadir", value: "0" },
      { label: "Izin", value: "0" },
      { label: "Sakit", value: "0" },
      { label: "Alpa", value: "0" },
      { label: "Persen", value: "0%" },
    ],
    attendanceItems: [],
    attendanceProgressWidth: "0%",
    kafarahSummary: [
      { label: "Total", value: "0" },
      { label: "Setor", value: "0" },
      { label: "Sisa", value: "0" },
    ],
    kafarahItems: [],
    kafarahProgressWidth: "0%",
    progressSummary: [
      { label: "Total", value: "0" },
      { label: "Selesai", value: "0" },
      { label: "Proses", value: "0" },
      { label: "Quran", value: "0" },
      { label: "Avg", value: "0%" },
    ],
    progressItems: [],
    movementItems: [],
    recordedMovementCount: 0,
  };
}

function formatAttendanceStatus(status: string): string {
  switch (status.toLowerCase()) {
    case "hadir":
      return "Hadir";
    case "izin":
      return "Izin";
    case "sakit":
      return "Sakit";
    case "alpha":
      return "Alpa";
    default:
      return status;
  }
}

function getStatusTone(status: string): string {
  switch (status) {
    case "Hadir":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "Izin":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "Sakit":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "Alpa":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-gray-200 bg-gray-50 text-gray-700";
  }
}

function clampPercentage(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function formatLongDate(value: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDateOnly(value: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}
