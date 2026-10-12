import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import type { AuthUser } from "@/shared/types/auth";
import type { SantriDashboardResponse } from "@/shared/types/dashboard";
import { useAuth } from "@/app/providers/AuthProvider";
import { fetchKafarahList, fetchLogKeluarMasuk, fetchMyWaliChildren, fetchPresensiList, fetchProgressKeilmuan, fetchSantriList } from "@/shared/lib/santri-data";
import type { WaliChild } from "@/shared/types/santri-data";
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
    if (!token || !storageKey) return undefined;
    const load = () => void fetchMyWaliChildren(token).then((response) => {
      if (!active) return;
      setChildren(response.items);
      const saved = window.sessionStorage.getItem(storageKey);
      setSelectedChildId(response.items.some((child) => child.santriId === saved) ? saved : response.items[0]?.santriId ?? null);
    }).catch(() => { if (active) setError("Daftar anak belum dapat dimuat."); }).finally(() => { if (active) setIsLoading(false); });
    load();
    const handleChange = () => load();
    window.addEventListener("kh2-wali-child-change", handleChange);
    return () => { active = false; window.removeEventListener("kh2-wali-child-change", handleChange); };
  }, [storageKey, token]);
  return { child: children.find((item) => item.santriId === selectedChildId) ?? null, isLoading, error };
}

export function WaliChildNavigation({
  activeTab,
  childName,
  childNis,
}: {
  activeTab: WaliTabKey;
  childName?: string;
  childNis?: string;
}) {
  const { user, token } = useAuth();
  const [children, setChildren] = useState<WaliChild[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const storageKey = user ? `kh2-wali-child:${user.userId}` : null;

  useEffect(() => {
    let active = true;
    if (!token || !storageKey) return undefined;

    void fetchMyWaliChildren(token).then((response) => {
      if (!active) return;
      setChildren(response.items);
      const saved = window.sessionStorage.getItem(storageKey);
      const selected = response.items.some((child) => child.santriId === saved)
        ? saved
        : response.items[0]?.santriId ?? null;
      setSelectedChildId(selected);
      if (selected) window.sessionStorage.setItem(storageKey, selected);
    }).catch(() => {
      if (active) setError("Daftar anak belum dapat dimuat. Coba muat ulang halaman.");
    }).finally(() => {
      if (active) setIsLoading(false);
    });
    return () => { active = false; };
  }, [storageKey, token]);

  const selectedChild = children.find((child) => child.santriId === selectedChildId);
  const displayedName = selectedChild?.fullName ?? childName;
  const displayedNis = selectedChild?.nis ?? childNis;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-600">Sedang dipantau</p>
          <h2 className="text-2xl font-semibold text-gray-900">{isLoading ? "Memuat data anak..." : displayedName ?? "Belum ada anak terhubung"}</h2>
          <p className="mt-1 text-sm text-gray-500">
            {error ?? (displayedName ? `NIS ${displayedNis ?? "-"}` : "Akun ini belum memiliki relasi Santri yang dapat dipantau.")}
          </p>
        </div>

        {children.length > 1 ? (
          <label className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 sm:text-sm">
            <AppIcon name="users" className="h-4 w-4" />
            <span className="sr-only">Pilih anak</span>
            <select value={selectedChildId ?? ""} onChange={(event) => { setSelectedChildId(event.target.value); if (storageKey) window.sessionStorage.setItem(storageKey, event.target.value); window.dispatchEvent(new Event("kh2-wali-child-change")); }} className="bg-transparent outline-none">
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
  dashboard,
  errorMessage,
  isLoading,
}: {
  user: AuthUser;
  dashboard: SantriDashboardResponse | null;
  errorMessage: string | null;
  isLoading: boolean;
}) {
  // Never reuse the Santri /me dashboard for Wali. It is not a child-scoped
  // contract and could display the wrong identity. The selector has its own
  // relation endpoint; detailed child reads await the frozen BE query shape.
  void dashboard;

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
          {isLoading ? "Dashboard Anak: Menghubungkan data" : "Dashboard Anak"}
        </h2>
        <p className="mt-3 text-sm text-gray-600">
          {errorMessage ?? "Pilih anak yang terhubung. Data rinci hanya ditampilkan dari endpoint yang dibatasi backend."}
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
        <MetricCard label="Kehadiran" value="—" hint="Menunggu read model anak yang dipilih." accent="text-emerald-700" />
        <MetricCard label="Progress Keilmuan" value="—" hint="Tidak menampilkan nilai buatan." />
        <MetricCard label="Kafarah" value="—" hint="Lihat tab Kafarah setelah kontrak read model tersedia." />
        <MetricCard label="Log Keluar/Masuk" value="—" hint="Data tidak dibaca dari dashboard Santri." />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <SectionCard
          title="Kehadiran Terbaru"
          description="5 data kehadiran terakhir"
          actionLabel="Lihat semua"
          actionHref="/dashboard/wali/presensi"
        >
          <EmptyBox label="Read model child-scoped belum tersedia di kontrak frontend." />
        </SectionCard>

        <SectionCard
          title="Progress Keilmuan"
          description="5 update progres terakhir"
          actionLabel="Lihat semua"
          actionHref="/dashboard/wali/progress-keilmuan"
        >
          <EmptyBox label="Read model child-scoped belum tersedia di kontrak frontend." />
        </SectionCard>

        <SectionCard
          title="Log Keluar/Masuk"
          description="5 data log terakhir"
          actionLabel="Lihat semua"
          actionHref="/dashboard/wali/log-keluar-masuk"
        >
          <EmptyBox label="Read model child-scoped belum tersedia di kontrak frontend." />
        </SectionCard>
      </div>
    </div>
  );
}

export function WaliPresensiView() {
  const { token } = useAuth();
  const { child, isLoading: isChildLoading, error: childError } = useWaliSelectedChild();
  const [records, setRecords] = useState<Array<{ id: string; tanggal: string; status: string; keterangan: string | null }>>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { let active = true; if (!token || !child) return undefined; void fetchPresensiList(token, child.santriId).then((r) => { if (active) setRecords(r.items); }).catch(() => { if (active) setError("Presensi anak belum dapat dimuat."); }); return () => { active = false; }; }, [child, token]);
  const hadir = records.filter((item) => item.status === "hadir").length;
  return (
    <div className="space-y-6">
      <WaliChildNavigation activeTab="presensi" />

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500">Ringkasan Presensi</p>
            <h2 className="text-2xl font-semibold text-gray-900">{child?.fullName ?? "Pilih anak untuk melihat presensi"}</h2>
            <p className="text-sm text-gray-500">30 catatan kehadiran terakhir.</p>
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
          <MetricCard label="Catatan" value={isChildLoading ? "…" : String(records.length)} />
          <MetricCard label="Hadir" value={String(hadir)} valueClassName="text-emerald-600" />
          <MetricCard label="Izin/Sakit" value={String(records.filter((item) => item.status === "izin" || item.status === "sakit").length)} valueClassName="text-amber-500" />
          <MetricCard label="Persentase Kehadiran" value={records.length ? `${((hadir / records.length) * 100).toFixed(1)}%` : "—"} />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="Timeline Presensi" description="5 catatan terbaru">
          <EmptyBox label={childError ?? error ?? (child ? (records[0] ? `${records[0].tanggal}: ${records[0].status}` : "Belum ada catatan presensi.") : "Pilih anak terlebih dahulu.")} />
        </SectionCard>

        <SectionCard title="Catatan Perlu Tindak Lanjut" description="Konfirmasi kepada musyrif jika diperlukan.">
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
              <tr>
                <td colSpan={3} className="py-3 text-center text-gray-500">
                  Belum ada data.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function WaliProgressView() {
  const [category, setCategory] = useState<"al-quran" | "al-hadits">("al-quran");
  const { token } = useAuth();
  const { child } = useWaliSelectedChild();
  const [progress, setProgress] = useState<{ total: number; completed: number; inProgress: number; average: number } | null>(null);
  useEffect(() => { let active = true; if (!token || !child) return undefined; void fetchProgressKeilmuan(token, category, child.nis).then((r) => { if (active) setProgress(r.summary); }); return () => { active = false; }; }, [category, child, token]);

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
          <MetricCard label="Total Modul" value={progress ? String(progress.total) : "—"} />
          <MetricCard label="Selesai" value={progress ? String(progress.completed) : "—"} valueClassName="text-emerald-600" />
          <MetricCard label="Sedang Dikerjakan" value={progress ? String(progress.inProgress) : "—"} valueClassName="text-orange-500" />
          <MetricCard label="Rata-rata Pencapaian" value={progress ? `${progress.average}%` : "—"} />
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
            <div className="px-4 py-10 text-center text-sm text-gray-500">Belum ada data progress keilmuan.</div>
          </div>

          <StaticPagination />
        </div>

        <div className="flex min-h-[460px] flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-gray-900">Update Terbaru</h3>
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">0 catatan</span>
          </div>
          <div className="mt-4 flex-1">
            <EmptyBox label="Belum ada update progress." />
          </div>
        </div>
      </div>
    </div>
  );
}

export function WaliLogView() {
  const { token } = useAuth();
  const { child } = useWaliSelectedChild();
  const [records, setRecords] = useState<Array<{ id: string; tanggal: string; tujuan: string; status: string }>>([]);
  useEffect(() => { let active = true; if (!token || !child) return undefined; void fetchLogKeluarMasuk(token, { page: 1, perPage: 100, santriId: child.santriId }).then((r) => { if (active) setRecords(r.items); }); return () => { active = false; }; }, [child, token]);
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

      <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
        {child ? (records.length ? records.slice(0, 5).map((item) => `${item.tanggal} — ${item.tujuan} (${item.status})`).join("\n") : "Belum ada data log keluar/masuk.") : "Pilih anak terlebih dahulu."}
      </div>
    </div>
  );
}

export function WaliKafarahView() {
  const { token } = useAuth();
  const { child } = useWaliSelectedChild();
  const [records, setRecords] = useState<Array<{ id: string; jenisPelanggaranLabel: string; sisaTanggungan: number }>>([]);
  useEffect(() => { let active = true; if (!token || !child) return undefined; void fetchKafarahList(token, child.santriId).then((r) => { if (active) setRecords(r.items); }); return () => { active = false; }; }, [child, token]);
  return (
    <div className="space-y-6">
      <WaliChildNavigation activeTab="kafarah" />
      <SectionCard title="Kafarah Anak" description="Pemantauan tanggungan anak yang dipilih.">
        <EmptyBox label={child ? (records.length ? records.map((item) => `${item.jenisPelanggaranLabel}: sisa ${item.sisaTanggungan}`).join("\n") : "Belum ada data Kafarah.") : "Pilih anak terlebih dahulu."} />
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
  const [santriCount, setSantriCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    if (!token) return undefined;
    void fetchSantriList(token).then((response) => { if (active) setSantriCount(response.totalCount); });
    return () => { active = false; };
  }, [token]);

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
            onClick={() => setCategory(tab.key)}
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
              onClick={() => setGenderFilter(item.key)}
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
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Cari nama/kelas/tim/kode"
            className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600/20"
          />
        </label>
      </div>

      <div className="space-y-2 overflow-hidden">
        <div className="grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <CompactMetricCard label="Total Santri" value={santriCount === null ? "…" : String(santriCount)} />
          <CompactMetricCard label="Santri Aktif Progres" value="—" />
          <CompactMetricCard label="Rata-rata Kelas" value="—" />
          <CompactMetricCard label={`Modul Tuntas | Target ${category === "al-hadits" ? "31" : "30"}`} value="—" />
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
                  <th className="w-[12%] px-3 py-1 text-left">Lihat Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-sm text-gray-500">
                    {searchQuery.trim() ? "Belum ada data santri yang cocok." : "Belum ada data santri."}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <StaticPagination compact />
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

  useEffect(() => {
    let active = true;
    if (!token) return undefined;
    void fetchLogKeluarMasuk(token, { page: 1, perPage: 100, scope: "team" }).then((response) => {
      if (active) setRecords(response.items);
    }).catch(() => { if (active) setLoadError("Data log belum dapat dimuat."); });
    return () => { active = false; };
  }, [token]);

  const matchingRecords = records.filter((record) => `${record.santriNama} ${record.tujuan}`.toLowerCase().includes(searchQuery.toLowerCase()));

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
              onChange={(event) => setSearchQuery(event.target.value)}
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
              onClick={() => setGenderFilter(item.key)}
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
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
          {loadError ?? (matchingRecords.length ? matchingRecords.slice(0, 5).map((record) => `${record.tanggal} — ${record.santriNama}: ${record.tujuan} (${record.status})`).join("\n") : searchQuery.trim() ? "Belum ada data log keluar/masuk yang cocok." : "Belum ada data log keluar/masuk.")}
        </div>
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
