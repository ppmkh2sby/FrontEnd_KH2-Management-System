import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import type { AuthUser } from "@/shared/types/auth";
import type { SantriDashboardResponse } from "@/shared/types/dashboard";
import { useAuth } from "@/app/providers/AuthProvider";
import { fetchKafarahList, fetchLogKeluarMasuk, fetchMyWaliChildren, fetchPresensiList, fetchStaffProgress, fetchWaliProgressDetail } from "@/shared/lib/santri-data";
import type { KafarahListResponse, LogKeluarMasukListResponse, PresensiItem, PresensiListResponse, ProgressKeilmuanDetailResponse, ProgressKeilmuanStaffPageResponse, WaliChild } from "@/shared/types/santri-data";
import { AppIcon } from "@/shared/ui/AppIcon";

type WaliTabKey = "overview" | "presensi" | "progress" | "kafarah" | "log";

const waliTabs: Array<{ key: WaliTabKey; label: string; href: string }> = [
  { key: "overview", label: "Overview", href: "/dashboard" },
  { key: "presensi", label: "Presensi", href: "/dashboard/wali/presensi" },
  { key: "progress", label: "Progress", href: "/dashboard/wali/progress-keilmuan" },
  { key: "kafarah", label: "Kafarah", href: "/dashboard/wali/kafarah" },
  { key: "log", label: "Log Keluar/Masuk", href: "/dashboard/wali/log-keluar-masuk" },
];

function useWaliSelectedChild() {
  const { user, token } = useAuth();
  const [children, setChildren] = useState<WaliChild[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const storageKey = user ? `kh2-wali-child:${user.userId}` : null;
  useEffect(() => {
    let active = true;
    if (!token || !storageKey) {
      setIsLoading(false);
      setError("Sesi login tidak tersedia.");
      return undefined;
    }
    const load = () => {
      setIsLoading(true);
      setError(null);
      setSelectedChildId(null);
      void fetchMyWaliChildren(token).then((response) => {
      if (!active) return;
      setChildren(response.items);
      const saved = window.sessionStorage.getItem(storageKey);
      const selected = response.items.some((child) => child.santriId === saved) ? saved : response.items[0]?.santriId ?? null;
      setSelectedChildId(selected);
      if (selected) window.sessionStorage.setItem(storageKey, selected);
      else window.sessionStorage.removeItem(storageKey);
    }).catch(() => { if (active) { setChildren([]); setError("Daftar anak belum dapat dimuat."); } }).finally(() => { if (active) setIsLoading(false); });
    };
    load();
    const handleChange = () => load();
    window.addEventListener("kh2-wali-child-change", handleChange);
    return () => { active = false; window.removeEventListener("kh2-wali-child-change", handleChange); };
  }, [storageKey, token]);
  const selectChild = (id: string) => {
    if (!storageKey || !children.some((child) => child.santriId === id)) return;
    window.sessionStorage.setItem(storageKey, id);
    setSelectedChildId(id);
    window.dispatchEvent(new Event("kh2-wali-child-change"));
  };
  return { children, selectedChildId, child: children.find((item) => item.santriId === selectedChildId) ?? null, isLoading, error, selectChild };
}

export function WaliChildNavigation({ activeTab }: { activeTab: WaliTabKey }) {
  const { children, selectedChildId, child, isLoading, error, selectChild } = useWaliSelectedChild();

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-600">Sedang dipantau</p>
          <h2 className="text-2xl font-semibold text-gray-900">{isLoading ? "Memuat data anak..." : child?.fullName ?? "Belum ada anak terhubung"}</h2>
          <p className="mt-1 text-sm text-gray-500">
            {error ?? (child ? `NIS ${child.nis}` : "Akun ini belum memiliki relasi Santri yang dapat dipantau.")}
          </p>
        </div>

        {children.length > 1 ? (
          <label className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 sm:text-sm">
            <AppIcon name="users" className="h-4 w-4" />
            <span className="sr-only">Pilih anak</span>
            <select value={selectedChildId ?? ""} onChange={(event) => selectChild(event.target.value)} className="bg-transparent outline-none">
              {children.map((child) => <option key={child.santriId} value={child.santriId}>{child.fullName}</option>)}
            </select>
          </label>
        ) : null}
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 text-sm whitespace-nowrap">
        {waliTabs.map((tab) => {
          const isActive = tab.key === activeTab;

          return (
            <Link
              key={tab.key}
              to={tab.href}
              className={`shrink-0 inline-flex items-center gap-2 rounded-full border px-4 py-2 ${
                isActive
                  ? "border-emerald-500 bg-emerald-50 font-semibold text-emerald-700"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function WaliOverviewView({
  user,
  errorMessage,
  isLoading,
}: {
  user: AuthUser;
  dashboard: SantriDashboardResponse | null;
  errorMessage: string | null;
  isLoading: boolean;
}) {
  const { token } = useAuth();
  const { child, isLoading: isChildLoading, error: childError } = useWaliSelectedChild();
  const [overview, setOverview] = useState<{
    presensi: PresensiListResponse;
    kafarah: KafarahListResponse;
    progress: ProgressKeilmuanDetailResponse;
    logs: LogKeluarMasukListResponse;
  } | null>(null);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [isOverviewLoading, setIsOverviewLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setOverview(null);
    setOverviewError(null);
    setIsOverviewLoading(false);
    if (!token || !child) return () => { active = false; };
    setIsOverviewLoading(true);
    void Promise.all([
      fetchPresensiList(token, child.santriId, 1, 5),
      fetchKafarahList(token, child.santriId, 1, 5),
      fetchWaliProgressDetail(token, child.nis),
      fetchLogKeluarMasuk(token, { page: 1, perPage: 5, santriId: child.santriId }),
    ]).then(([presensi, kafarah, progress, logs]) => {
      if (active) setOverview({ presensi, kafarah, progress, logs });
    }).catch(() => { if (active) setOverviewError("Ringkasan anak belum dapat dimuat. Periksa akses atau koneksi lalu coba lagi."); })
      .finally(() => { if (active) setIsOverviewLoading(false); });
    return () => { active = false; };
  }, [child?.santriId, child?.nis, token]);

  const featureCards = [
    {
      label: "Dashboard Anak",
      description: "Ringkasan performa anak",
      icon: "dashboard" as const,
      href: "/dashboard",
      accent: "border-emerald-100 bg-emerald-50/70",
    },
    {
      label: "Kehadiran",
      description: "Lihat presensi harian",
      icon: "activity" as const,
      href: "/dashboard/wali/presensi",
      accent: "border-sky-100 bg-sky-50/70",
    },
    {
      label: "Progress Keilmuan",
      description: "Pantau progres belajar",
      icon: "book" as const,
      href: "/dashboard/wali/progress-keilmuan",
      accent: "border-violet-100 bg-violet-50/70",
    },
    {
      label: "Log Keluar/Masuk",
      description: "Riwayat aktivitas keluar",
      icon: "clock" as const,
      href: "/dashboard/wali/log-keluar-masuk",
      accent: "border-amber-100 bg-amber-50/70",
    },
  ];

  return (
    <div className="space-y-6">
      <WaliChildNavigation activeTab="overview" />

      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-white p-6">
        <p className="text-sm text-emerald-600">Assalamualaikum, {user.fullName}</p>
        <h2 className="mt-1 text-2xl font-semibold text-gray-900">
          {isLoading || isChildLoading ? "Dashboard Anak: Menghubungkan data" : "Dashboard Anak"}
        </h2>
        <p className="mt-3 text-sm text-gray-600">
          {childError ?? overviewError ?? errorMessage ?? (child ? `Ringkasan data ${child.fullName} dari API yang dibatasi backend.` : "Pilih anak yang terhubung untuk melihat ringkasan.")}
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          <span className="inline-flex items-center gap-2 rounded-xl border border-emerald-100 bg-white px-3 py-2">
            <AppIcon name="verify" className="h-4 w-4 text-emerald-500" />
            {user.emailConfirmed ? "Email wali terverifikasi" : "Email tidak diperlukan untuk mengakses dashboard"}
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {featureCards.map((card) => (
          <Link
            key={card.label}
            to={card.href}
            className={`rounded-2xl border p-4 shadow-sm transition hover:shadow ${card.accent}`}
          >
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-white p-2 text-gray-700">
                <AppIcon name={card.icon} className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-900">{card.label}</p>
                <p className="text-xs text-gray-500">{card.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Catatan Kehadiran" value={overview ? String(overview.presensi.totalCount) : "—"} hint={isOverviewLoading ? "Memuat..." : "Dari data anak terpilih"} accent="text-emerald-700" />
        <MetricCard label="Modul Selesai" value={overview ? String(overview.progress.quran.summary.completed + overview.progress.hadits.summary.completed) : "—"} />
        <MetricCard label="Catatan Kafarah" value={overview ? String(overview.kafarah.totalCount) : "—"} />
        <MetricCard label="Log Keluar/Masuk" value={overview ? String(overview.logs.totalCount) : "—"} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <SectionCard
          title="Kehadiran Terbaru"
          description="5 data kehadiran terakhir"
          actionLabel="Lihat semua"
          actionHref="/dashboard/wali/presensi"
        >
          {overview?.presensi.items.length ? overview.presensi.items.map((item) => <p key={item.id} className="border-b border-gray-100 py-2 text-sm">{item.tanggal} · {item.status} · {item.kegiatan}</p>) : <EmptyBox label={isOverviewLoading ? "Memuat..." : overviewError ?? "Belum ada presensi."} />}
        </SectionCard>

        <SectionCard
          title="Progress Keilmuan"
          description="5 update progres terakhir"
          actionLabel="Lihat semua"
          actionHref="/dashboard/wali/progress-keilmuan"
        >
          {overview ? [...overview.progress.quran.recentUpdates, ...overview.progress.hadits.recentUpdates].slice(0, 5).map((item) => <p key={item.id} className="border-b border-gray-100 py-2 text-sm">{item.judul} · {item.persentase}%</p>) : <EmptyBox label={isOverviewLoading ? "Memuat..." : overviewError ?? "Belum ada update progres."} />}
        </SectionCard>

        <SectionCard
          title="Log Keluar/Masuk"
          description="5 data log terakhir"
          actionLabel="Lihat semua"
          actionHref="/dashboard/wali/log-keluar-masuk"
        >
          {overview?.logs.items.length ? overview.logs.items.map((item) => <p key={item.id} className="border-b border-gray-100 py-2 text-sm">{item.tanggal} · {item.tujuan} · {item.status}</p>) : <EmptyBox label={isOverviewLoading ? "Memuat..." : overviewError ?? "Belum ada log."} />}
        </SectionCard>
      </div>
    </div>
  );
}

export function WaliPresensiView() {
  const { token } = useAuth();
  const { child, isLoading: isChildLoading, error: childError } = useWaliSelectedChild();
  const [records, setRecords] = useState<PresensiItem[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { setPage(1); }, [child?.santriId]);
  useEffect(() => {
    let active = true;
    setRecords([]); setTotalCount(null); setError(null); setIsLoading(false);
    if (!token || !child) return () => { active = false; };
    setIsLoading(true);
    void fetchPresensiList(token, child.santriId, page, 20).then((response) => {
      if (active) { setRecords(response.items); setTotalCount(response.totalCount); }
    }).catch(() => { if (active) setError("Presensi anak belum dapat dimuat atau akses ditolak."); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [child?.santriId, page, token]);
  const hadir = records.filter((item) => item.status === "hadir").length;
  return (
    <div className="space-y-6">
      <WaliChildNavigation activeTab="presensi" />

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500">Ringkasan Presensi</p>
            <h2 className="text-2xl font-semibold text-gray-900">{child?.fullName ?? "Pilih anak untuk melihat presensi"}</h2>
            <p className="text-sm text-gray-500">Riwayat presensi anak terpilih, 20 catatan per halaman.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-gray-600 hover:text-gray-800">
              <AppIcon name="arrow-left" className="h-4 w-4" />
              Kembali
            </Link>
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-400"
            >
              <AppIcon name="log" className="h-4 w-4" />
              Unduh Rekap
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Total Catatan" value={totalCount === null ? "—" : String(totalCount)} />
          <MetricCard label="Hadir di Halaman Ini" value={totalCount === null ? "—" : String(hadir)} valueClassName="text-emerald-600" />
          <MetricCard label="Izin/Sakit di Halaman Ini" value={totalCount === null ? "—" : String(records.filter((item) => item.status === "izin" || item.status === "sakit").length)} valueClassName="text-amber-500" />
          <MetricCard label="Kehadiran Halaman Ini" value={records.length ? `${((hadir / records.length) * 100).toFixed(1)}%` : "—"} />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="Timeline Presensi" description="5 catatan terbaru">
          {records.length ? records.slice(0, 5).map((item) => <p key={item.id} className="border-b border-gray-100 py-2 text-sm">{item.tanggal} · {item.status} · {item.kegiatan}</p>) : <EmptyBox label={childError ?? error ?? (isChildLoading || isLoading ? "Memuat presensi..." : child ? "Belum ada catatan presensi." : "Pilih anak terlebih dahulu.")} />}
        </SectionCard>

        <SectionCard title="Catatan Perlu Tindak Lanjut" description="Konfirmasi kepada musyrif jika diperlukan.">
          {records.filter((item) => item.status === "izin" || item.status === "alpa").slice(0, 5).map((item) => <p key={item.id} className="border-b border-gray-100 py-2 text-sm">{item.tanggal} · {item.status} · {item.keterangan ?? "Tanpa keterangan"}</p>)}
          {!records.some((item) => item.status === "izin" || item.status === "alpa") ? <EmptyBox label="Tidak ada izin/alpa pada halaman ini." /> : null}
        </SectionCard>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-lg font-semibold">Riwayat Presensi · Halaman {page}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2">Tanggal</th>
                <th className="py-2">Status</th>
                <th className="py-2">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {records.map((item) => <tr key={item.id} className="border-t border-gray-100"><td className="py-3">{item.tanggal}</td><td>{item.status}</td><td>{item.keterangan ?? "—"}</td></tr>)}
              {!records.length ? <tr><td colSpan={3} className="py-3 text-center text-gray-500">{childError ?? error ?? (isLoading ? "Memuat..." : "Belum ada data.")}</td></tr> : null}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-end gap-3 text-sm">
          <button type="button" disabled={page <= 1 || isLoading} onClick={() => setPage((value) => value - 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Sebelumnya</button>
          <span>Halaman {page}</span>
          <button type="button" disabled={isLoading || totalCount === null || page * 20 >= totalCount} onClick={() => setPage((value) => value + 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Berikutnya</button>
        </div>
      </div>
    </div>
  );
}

export function WaliProgressView() {
  const [category, setCategory] = useState<"al-quran" | "al-hadits">("al-quran");
  const { token } = useAuth();
  const { child, isLoading: isChildLoading, error: childError } = useWaliSelectedChild();
  const [detail, setDetail] = useState<ProgressKeilmuanDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    let active = true;
    setDetail(null);
    setError(null);
    setIsLoading(false);
    if (!token || !child) return () => { active = false; };
    setIsLoading(true);
    void fetchWaliProgressDetail(token, child.nis).then((response) => {
      if (active) setDetail(response);
    }).catch(() => { if (active) setError("Progress anak belum dapat dimuat atau akses ditolak."); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [child?.santriId, child?.nis, token]);
  const progress = category === "al-quran" ? detail?.quran : detail?.hadits;

  return (
    <div className="space-y-6">
      <WaliChildNavigation activeTab="progress" />

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500">Progress Keilmuan</p>
            <p className="text-sm text-gray-500">Ringkasan capaian Al-Quran dan Hadits anak Anda.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Total Modul" value={progress ? String(progress.summary.total) : "—"} />
          <MetricCard label="Selesai" value={progress ? String(progress.summary.completed) : "—"} valueClassName="text-emerald-600" />
          <MetricCard label="Sedang Dikerjakan" value={progress ? String(progress.summary.inProgress) : "—"} valueClassName="text-orange-500" />
          <MetricCard label="Rata-rata Pencapaian" value={progress ? `${progress.summary.average}%` : "—"} />
        </div>
      </div>

      <div className="grid min-h-0 gap-5 xl:grid-cols-[1fr_320px]">
        <div className="flex min-h-[460px] flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-gray-500">Ringkasan Progress</p>
              <h3 className="text-xl font-semibold text-gray-900">
                {category === "al-hadits" ? "Materi Al-Hadits" : "Materi Al-Quran"}
              </h3>
              <p className="text-sm text-gray-500">Progress halaman dan jumlah juz ditampilkan per modul.</p>
            </div>
            <div className="inline-flex rounded-xl border border-gray-200 p-1">
              <button
                type="button"
                onClick={() => setCategory("al-quran")}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  category === "al-quran" ? "bg-emerald-600 text-white shadow-sm" : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Quran
              </button>
              <button
                type="button"
                onClick={() => setCategory("al-hadits")}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  category === "al-hadits" ? "bg-emerald-600 text-white shadow-sm" : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Hadits
              </button>
            </div>
          </div>

          <div className="mt-5 flex-1 overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <div className="min-w-[560px] grid grid-cols-[minmax(120px,165px)_minmax(145px,170px)_1fr] items-center border-b border-gray-200 bg-gray-50 px-4 py-2 text-[10px] font-semibold uppercase text-gray-600">
              <div>{category === "al-hadits" ? "Hadits" : "Juz"}</div>
              <div>Progress Halaman</div>
              <div className="text-center">Persentase</div>
            </div>
            {progress?.modules.length ? progress.modules.map((module) => (
              <div key={module.judul} className="grid min-w-[560px] grid-cols-[minmax(120px,165px)_minmax(145px,170px)_1fr] items-center border-b border-gray-100 px-4 py-3 text-sm">
                <span>{module.judul}</span><span>{module.value ?? "—"} / {module.target}</span><span className="text-center">{module.persentase}%</span>
              </div>
            )) : <div className="px-4 py-10 text-center text-sm text-gray-500">{childError ?? error ?? (isChildLoading || isLoading ? "Memuat progress..." : "Belum ada data progress keilmuan.")}</div>}
          </div>
        </div>

        <div className="flex min-h-[460px] flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-gray-900">Update Terbaru</h3>
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">{progress ? progress.recentUpdates.length : "—"} catatan</span>
          </div>
          <div className="mt-4 flex-1">
            {progress?.recentUpdates.length ? progress.recentUpdates.map((item) => <p key={item.id} className="border-b border-gray-100 py-2 text-sm">{item.judul} · {item.capaian}/{item.target} {item.satuan ?? ""} · {item.persentase}%</p>) : <EmptyBox label={error ?? "Belum ada update progress."} />}
          </div>
        </div>
      </div>
    </div>
  );
}

export function WaliLogView() {
  const { token } = useAuth();
  const { child, isLoading: isChildLoading, error: childError } = useWaliSelectedChild();
  const [records, setRecords] = useState<Array<{ id: string; tanggal: string; tujuan: string; status: string }>>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [child?.santriId]);
  useEffect(() => {
    let active = true;
    setRecords([]); setTotalCount(null); setError(null); setIsLoading(false);
    if (!token || !child) return () => { active = false; };
    setIsLoading(true);
    void fetchLogKeluarMasuk(token, { page, perPage: 20, santriId: child.santriId }).then((response) => {
      if (active) { setRecords(response.items); setTotalCount(response.totalCount); }
    }).catch(() => { if (active) setError("Log anak belum dapat dimuat atau akses ditolak."); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [child?.santriId, page, token]);
  return (
    <div className="space-y-6">
      <WaliChildNavigation activeTab="log" />

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500">Log Keluar/Masuk</p>
            <h2 className="text-2xl font-semibold text-gray-900">{child?.fullName ?? "Pilih anak untuk melihat log"}</h2>
            <p className="text-sm text-gray-500">Pantau seluruh data keluar/masuk anak Anda.</p>
          </div>
          <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:text-gray-800">
            <AppIcon name="arrow-left" className="h-4 w-4" />
            Kembali
          </Link>
        </div>
        <p className="mt-2 text-sm text-gray-500">Data ini menampilkan riwayat log yang diinput langsung oleh akun santri.</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-700">
        <p className="mb-3 text-xs text-gray-500">{totalCount === null ? "Total belum tersedia" : `Menampilkan ${records.length} dari ${totalCount} catatan`}</p>
        {records.length ? records.map((item) => <p key={item.id} className="border-t border-gray-100 py-3">{item.tanggal} · {item.tujuan} · {item.status}</p>) : <p>{childError ?? error ?? (isChildLoading || isLoading ? "Memuat log..." : child ? "Belum ada data log keluar/masuk." : "Pilih anak terlebih dahulu.")}</p>}
        {totalCount !== null && totalCount > 20 ? <div className="flex justify-end gap-3 pt-3 text-xs"><span>Halaman {page} dari {Math.ceil(totalCount / 20)}</span><button type="button" disabled={page <= 1 || isLoading} onClick={() => setPage(page - 1)} className="disabled:opacity-40">Sebelumnya</button><button type="button" disabled={page * 20 >= totalCount || isLoading} onClick={() => setPage(page + 1)} className="disabled:opacity-40">Berikutnya</button></div> : null}
      </div>
    </div>
  );
}

export function WaliKafarahView() {
  const { token } = useAuth();
  const { child, isLoading: isChildLoading, error: childError } = useWaliSelectedChild();
  const [records, setRecords] = useState<Array<{ id: string; jenisPelanggaranLabel: string; sisaTanggungan: number }>>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [child?.santriId]);
  useEffect(() => {
    let active = true;
    setRecords([]); setTotalCount(null); setError(null); setIsLoading(false);
    if (!token || !child) return () => { active = false; };
    setIsLoading(true);
    void fetchKafarahList(token, child.santriId, page, 20).then((response) => {
      if (active) { setRecords(response.items); setTotalCount(response.totalCount); }
    }).catch(() => { if (active) setError("Kafarah anak belum dapat dimuat atau akses ditolak."); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [child?.santriId, page, token]);
  return (
    <div className="space-y-6">
      <WaliChildNavigation activeTab="kafarah" />
      <SectionCard title="Kafarah Anak" description="Pemantauan tanggungan anak yang dipilih.">
        <p className="mb-3 text-xs text-gray-500">{totalCount === null ? "Total belum tersedia" : `Menampilkan ${records.length} dari ${totalCount} catatan`}</p>
        {records.length ? records.map((item) => <p key={item.id} className="border-b border-gray-100 py-3 text-sm">{item.jenisPelanggaranLabel} · sisa {item.sisaTanggungan}</p>) : <EmptyBox label={childError ?? error ?? (isChildLoading || isLoading ? "Memuat kafarah..." : child ? "Belum ada data Kafarah." : "Pilih anak terlebih dahulu.")} />}
        {totalCount !== null && totalCount > 20 ? <div className="flex justify-end gap-3 pt-3 text-xs"><span>Halaman {page} dari {Math.ceil(totalCount / 20)}</span><button type="button" disabled={page <= 1 || isLoading} onClick={() => setPage(page - 1)} className="disabled:opacity-40">Sebelumnya</button><button type="button" disabled={page * 20 >= totalCount || isLoading} onClick={() => setPage(page + 1)} className="disabled:opacity-40">Berikutnya</button></div> : null}
      </SectionCard>
    </div>
  );
}

export function StaffAttendanceView() {
  const { token } = useAuth();
  const [records, setRecords] = useState<Array<{ id: string; tanggal: string; status: string; keterangan: string | null }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!token) return undefined;
    void fetchPresensiList(token).then((response) => {
      if (active) setRecords(response.items);
    }).catch(() => {
      if (active) setError("Data presensi belum dapat dimuat.");
    }).finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [token]);

  const hadir = records.filter((record) => record.status === "hadir").length;
  const izin = records.filter((record) => record.status === "izin" || record.status === "sakit").length;
  const percentage = records.length ? `${((hadir / records.length) * 100).toFixed(1)}%` : "—";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500">Ringkasan Presensi</p>
            <h2 className="text-2xl font-semibold text-gray-900">30 catatan terakhir</h2>
          </div>
          <div className="flex gap-2 text-sm">
            <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-gray-600 hover:text-gray-800">
              <AppIcon name="arrow-left" className="h-4 w-4" />
              Kembali
            </Link>
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-400"
            >
              <AppIcon name="log" className="h-4 w-4" />
              Unduh Rekap
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Catatan Dimuat" value={isLoading ? "…" : String(records.length)} />
          <MetricCard label="Hadir" value={isLoading ? "…" : String(hadir)} valueClassName="text-emerald-600" />
          <MetricCard label="Izin/Sakit" value={isLoading ? "…" : String(izin)} valueClassName="text-amber-500" />
          <MetricCard label="Persentase Kehadiran" value={isLoading ? "…" : percentage} />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="Timeline Presensi" description="5 catatan terbaru">
          <EmptyBox label={error ?? (isLoading ? "Memuat catatan presensi..." : records[0] ? `${records[0].tanggal}: ${records[0].status}` : "Belum ada catatan presensi.")} />
        </SectionCard>

        <SectionCard title="Catatan Perlu Tindak Lanjut" description="Ambil tindakan pada izin/alpa terbaru.">
          <EmptyBox label="Tidak ada izin/alpa terbaru." />
        </SectionCard>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-lg font-semibold">Riwayat Presensi Lengkap</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2">Tanggal</th>
                <th className="py-2">Status</th>
                <th className="py-2">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {records.slice(0, 30).map((record) => <tr key={record.id}><td className="py-2">{record.tanggal}</td><td className="py-2">{record.status}</td><td className="py-2">{record.keterangan ?? "-"}</td></tr>)}
              {!isLoading && !error && records.length === 0 ? <tr><td colSpan={3} className="py-3 text-center text-gray-500">Belum ada data.</td></tr> : null}
              {error ? <tr><td colSpan={3} className="py-3 text-center text-rose-700">{error}</td></tr> : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function StaffProgressView() {
  const [category, setCategory] = useState<"al-quran" | "al-hadits">("al-quran");
  const [genderFilter, setGenderFilter] = useState<"all" | "putra" | "putri">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { token } = useAuth();
  const [page, setPage] = useState(1);
  const [response, setResponse] = useState<ProgressKeilmuanStaffPageResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!token) { setLoading(false); setLoadError("Sesi login tidak tersedia."); return undefined; }
    setLoading(true);
    setLoadError(null);
    setResponse(null);
    void fetchStaffProgress(token, category, { gender: genderFilter, q: searchQuery, page, perPage: 8 })
      .then((result) => { if (active) setResponse(result); })
      .catch(() => { if (active) setLoadError("Data progres belum dapat dimuat."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token, category, genderFilter, searchQuery, page]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-1.5 overflow-hidden">
      <div className="shrink-0 space-y-0.5">
        <h1 className="text-lg font-semibold text-gray-900">Progress Keilmuan Seluruh Santri</h1>
        <p className="text-xs text-gray-500">Akses monitoring untuk dewan guru dan pengurus pada seluruh data santri.</p>
      </div>

      <div className="mb-3 mt-6 flex shrink-0 items-center gap-6 border-b border-gray-200">
        {[
          { key: "al-quran" as const, label: "Al-Quran" },
          { key: "al-hadits" as const, label: "Al-Hadits" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => { setCategory(tab.key); setPage(1); }}
            className={`pb-2.5 text-sm font-medium ${
              category === tab.key ? "border-b-2 border-emerald-600 text-emerald-700" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="shrink-0">
        <div className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
          {[
            { key: "all" as const, label: "Semua" },
            { key: "putra" as const, label: "Putra" },
            { key: "putri" as const, label: "Putri" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => { setGenderFilter(item.key); setPage(1); }}
              className={`inline-flex min-w-[72px] items-center justify-center rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                genderFilter === item.key ? "bg-emerald-600 text-white shadow-sm" : "text-gray-700 hover:bg-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm">
        <p className="text-sm font-semibold text-gray-900">Daftar Progres Santri</p>
        <label className="relative w-full sm:w-72">
          <AppIcon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => { setSearchQuery(event.target.value); setPage(1); }}
            placeholder="Cari nama/kelas/tim/kode"
            className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600/20"
          />
        </label>
      </div>

      <div className="space-y-2 overflow-hidden">
        <div className="grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <CompactMetricCard label="Total Santri" value={response ? String(response.summary.totalSantri) : "—"} />
          <CompactMetricCard label="Santri Aktif Progres" value={response ? String(response.summary.activeSantri) : "—"} />
          <CompactMetricCard label="Rata-rata Kelas" value={response ? String(response.summary.average) : "—"} />
          <CompactMetricCard label={`Modul Tuntas / ${response?.summary.moduleCount ?? "—"}`} value={response ? String(response.summary.completedModules) : "—"} />
        </div>

        <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed text-[13px] leading-5">
              <thead className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="w-[34%] px-4 py-1 text-left">Santri</th>
                  <th className="w-[9%] px-3 py-1 text-left">Kelas</th>
                  <th className="w-[12%] px-3 py-1 text-left">Tim</th>
                  <th className="w-[10%] px-3 py-1 text-right">Selesai</th>
                  <th className="w-[13%] px-3 py-1 text-right">Dikerjakan</th>
                  <th className="w-[10%] px-3 py-1 text-right">Rata-rata</th>
                  <th className="w-[12%] px-3 py-1 text-left">Diperbarui</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {response?.rows.map((row) => (
                  <tr key={row.santriId}>
                    <td className="px-4 py-2 font-medium text-gray-900">{row.nama}<span className="block text-xs text-gray-500">{row.code}</span></td>
                    <td className="px-3 py-2">{row.kelas || "—"}</td>
                    <td className="px-3 py-2">{row.tim || "—"}</td>
                    <td className="px-3 py-2 text-right">{row.completed}</td>
                    <td className="px-3 py-2 text-right">{row.inProgress}</td>
                    <td className="px-3 py-2 text-right">{row.average}</td>
                    <td className="px-3 py-2">{row.updatedAtUtc ? new Date(row.updatedAtUtc).toLocaleDateString("id-ID") : "—"}</td>
                  </tr>
                ))}
                {!response?.rows.length ? <tr><td colSpan={7} className="px-4 py-6 text-center text-sm text-gray-500">{loading ? "Memuat progres…" : loadError ?? "Belum ada data santri yang cocok."}</td></tr> : null}
              </tbody>
            </table>
          </div>

          {response && response.totalCount > response.perPage ? <div className="flex items-center justify-end gap-3 p-3 text-xs"><span>Halaman {response.page} dari {Math.ceil(response.totalCount / response.perPage)}</span><button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="disabled:opacity-40">Sebelumnya</button><button type="button" disabled={page * response.perPage >= response.totalCount} onClick={() => setPage(page + 1)} className="disabled:opacity-40">Berikutnya</button></div> : null}
        </div>
      </div>
    </div>
  );
}

export function StaffLogView() {
  const [genderFilter, setGenderFilter] = useState<"all" | "putra" | "putri">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { token } = useAuth();
  const [records, setRecords] = useState<Array<{ id: string; tanggal: string; santriNama: string; tujuan: string; status: string }>>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;
    if (!token) { setLoading(false); setLoadError("Sesi login tidak tersedia."); return undefined; }
    setLoading(true);
    setLoadError(null);
    setRecords([]);
    void fetchLogKeluarMasuk(token, { page, perPage: 20, scope: "team", gender: genderFilter === "all" ? undefined : genderFilter, search: searchQuery }).then((response) => {
      if (active) { setRecords(response.items); setTotalCount(response.totalCount); }
    }).catch(() => { if (active) setLoadError("Data log belum dapat dimuat."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token, genderFilter, searchQuery, page]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500">Monitoring Log Keluar/Masuk</p>
            <h2 className="text-2xl font-semibold text-gray-900">Semua Santri</h2>
            <p className="mt-1 text-sm text-gray-500">Pengurus dan dewan guru dapat melihat seluruh log santri.</p>
          </div>

          <label className="relative w-full sm:w-56">
            <AppIcon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => { setSearchQuery(event.target.value); setPage(1); }}
              placeholder="Cari nama/tujuan"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 pl-9 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { key: "all" as const, label: "Semua" },
            { key: "putra" as const, label: "Putra" },
            { key: "putri" as const, label: "Putri" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => { setGenderFilter(item.key); setPage(1); }}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                genderFilter === item.key ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <p className="mb-3 text-xs text-gray-500">{loading ? "Memuat log…" : loadError ?? `${totalCount} catatan ditemukan`}</p>
        <div className="divide-y divide-gray-100">
          {records.map((record) => <div key={record.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><span className="font-medium text-gray-900">{record.santriNama}</span><span className="text-gray-600">{record.tanggal} · {record.tujuan} · {record.status}</span></div>)}
          {!loading && !loadError && records.length === 0 ? <p className="py-5 text-center text-sm text-gray-500">Belum ada data log keluar/masuk.</p> : null}
        </div>
        {totalCount > 20 ? <div className="flex justify-end gap-3 pt-3 text-xs"><span>Halaman {page} dari {Math.ceil(totalCount / 20)}</span><button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="disabled:opacity-40">Sebelumnya</button><button type="button" disabled={page * 20 >= totalCount} onClick={() => setPage(page + 1)} className="disabled:opacity-40">Berikutnya</button></div> : null}
      </div>
    </div>
  );
}

function SectionCard({
  title,
  description,
  children,
  actionLabel,
  actionHref,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        {actionLabel && actionHref ? (
          <Link to={actionHref} className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">
            {actionLabel}
          </Link>
        ) : null}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  hint,
  accent,
  valueClassName,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`mt-2 text-2xl font-semibold text-gray-900 ${valueClassName ?? ""}`}>{value}</p>
      <p className={`mt-1 text-xs text-gray-500 ${accent ?? ""}`}>{hint ?? " "}</p>
    </div>
  );
}

function CompactMetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex h-[72px] flex-col justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm">
      <p className="text-[11px] leading-4 text-gray-500">{label}</p>
      <p className="mt-1 text-[34px] font-semibold leading-none text-gray-900 tabular-nums">{value}</p>
    </div>
  );
}

function EmptyBox({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 p-5 text-center text-sm text-gray-500">
      {label}
    </div>
  );
}

function StaticPagination({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`${compact ? "border-t border-gray-200 bg-white px-4 py-2" : "mt-4"} flex items-center justify-between gap-3`}>
      <button
        type="button"
        disabled
        className={`inline-flex items-center gap-2 rounded-xl border border-gray-200 ${
          compact ? "px-3 py-2 text-xs" : "px-3 py-2 text-sm"
        } text-gray-400`}
      >
        <AppIcon name="arrow-left" className="h-4 w-4" />
        Previous
      </button>

      <div className="flex items-center gap-1">
        <button
          type="button"
          className={`rounded-lg bg-gray-100 ${
            compact ? "h-8 min-w-[32px] px-2 text-xs" : "h-8 w-8 text-sm"
          } font-medium text-gray-900`}
        >
          1
        </button>
      </div>

      <button
        type="button"
        disabled
        className={`inline-flex items-center gap-2 rounded-xl border border-gray-300 ${
          compact ? "px-3 py-2 text-xs" : "px-3 py-2 text-sm"
        } text-gray-400`}
      >
        Next
        <AppIcon name="arrow-right" className="h-4 w-4" />
      </button>
    </div>
  );
}
