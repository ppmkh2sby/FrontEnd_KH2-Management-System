import { useState } from "react";
import { Link } from "react-router-dom";

import type { AuthUser } from "@/shared/types/auth";
import type { SantriDashboardResponse } from "@/shared/types/dashboard";
import { AppIcon } from "@/shared/ui/AppIcon";

type WaliTabKey = "overview" | "presensi" | "progress" | "log";

const waliTabs: Array<{ key: WaliTabKey; label: string; href: string }> = [
  { key: "overview", label: "Overview", href: "/dashboard" },
  { key: "presensi", label: "Presensi", href: "/dashboard/wali/presensi" },
  { key: "progress", label: "Progress", href: "/dashboard/wali/progress-keilmuan" },
  { key: "log", label: "Log Keluar/Masuk", href: "/dashboard/wali/log-keluar-masuk" },
];

export function WaliChildNavigation({
  activeTab,
  childName,
  childNis,
}: {
  activeTab: WaliTabKey;
  childName?: string;
  childNis?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-600">Sedang dipantau</p>
          <h2 className="text-2xl font-semibold text-gray-900">{childName ?? "Data anak belum tersedia"}</h2>
          <p className="mt-1 text-sm text-gray-500">
            {childName ? `NIS ${childNis ?? "-"}` : "Hubungkan data santri saat backend role wali sudah siap."}
          </p>
        </div>

        <button
          type="button"
          disabled
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-400 sm:text-sm"
        >
          <AppIcon name="users" className="h-4 w-4" />
          Profil Wali
        </button>
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
  const child = dashboard?.profile;
  const attendance = dashboard?.attendance;
  const progress = dashboard?.progress;
  const logs = dashboard?.logs;

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
      <WaliChildNavigation activeTab="overview" childName={child?.fullName} childNis={child?.nis} />

      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-white p-6">
        <p className="text-sm text-emerald-600">Assalamualaikum, {user.fullName}</p>
        <h2 className="mt-1 text-2xl font-semibold text-gray-900">
          {isLoading ? "Dashboard Anak: Menghubungkan data" : `Dashboard Anak: ${child?.fullName ?? "Data anak belum tersedia"}`}
        </h2>
        <p className="mt-3 text-sm text-gray-600">
          {errorMessage ?? "Ringkasan kehadiran, progress keilmuan, dan aktivitas anak Anda."}
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          <span className="inline-flex items-center gap-2 rounded-xl border border-emerald-100 bg-white px-3 py-2">
            <AppIcon name="verify" className="h-4 w-4 text-emerald-500" />
            {user.emailConfirmed ? "Email wali terverifikasi" : "Mohon verifikasi email wali"}
          </span>
          <span className="inline-flex items-center gap-2 rounded-xl border border-emerald-100 bg-white px-3 py-2">
            <AppIcon name="users" className="h-4 w-4 text-emerald-500" />
            Kode santri: <span className="font-mono text-gray-900">{child?.nis ?? "-"}</span>
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
        <MetricCard
          label="Kehadiran Tercatat"
          value={String(attendance?.total ?? 0)}
          hint={`Hadir ${attendance?.hadir ?? 0} | Izin ${attendance?.izin ?? 0} | Alpa ${attendance?.alpha ?? 0}`}
          accent="text-emerald-700"
        />
        <MetricCard label="Persentase Kehadiran" value={`${attendance?.persentase ?? 0}%`} hint="Dari seluruh data presensi anak" />
        <MetricCard label="Progress Keilmuan" value={`${progress?.average ?? 0}%`} hint={`${progress?.completed ?? 0} selesai • ${progress?.inProgress ?? 0} berjalan`} />
        <MetricCard label="Log Keluar/Masuk" value={String(logs?.total ?? 0)} hint={`${logs?.tercatat ?? 0} data tercatat`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <SectionCard
          title="Kehadiran Terbaru"
          description="5 data kehadiran terakhir"
          actionLabel="Lihat semua"
          actionHref="/dashboard/wali/presensi"
        >
          <EmptyBox label={attendance?.recent[0] ? `${attendance.recent[0].nama}: ${attendance.recent[0].status}` : "Belum ada data kehadiran."} />
        </SectionCard>

        <SectionCard
          title="Progress Keilmuan"
          description="5 update progres terakhir"
          actionLabel="Lihat semua"
          actionHref="/dashboard/wali/progress-keilmuan"
        >
          <EmptyBox label={progress?.recent[0] ? progress.recent[0].judul : "Belum ada data progress."} />
        </SectionCard>

        <SectionCard
          title="Log Keluar/Masuk"
          description="5 data log terakhir"
          actionLabel="Lihat semua"
          actionHref="/dashboard/wali/log-keluar-masuk"
        >
          <EmptyBox label={logs?.recent[0] ? `${logs.recent[0].jenis}: ${logs.recent[0].status}` : "Belum ada data log keluar/masuk."} />
        </SectionCard>
      </div>
    </div>
  );
}

export function WaliPresensiView() {
  return (
    <div className="space-y-6">
      <WaliChildNavigation activeTab="presensi" />

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500">Ringkasan Presensi</p>
            <h2 className="text-2xl font-semibold text-gray-900">Data santri belum tersedia</h2>
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
          <MetricCard label="Total Pertemuan" value="0" />
          <MetricCard label="Hadir" value="0" valueClassName="text-emerald-600" />
          <MetricCard label="Izin/Terlambat" value="0" valueClassName="text-amber-500" />
          <MetricCard label="Persentase Kehadiran" value="0%" />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="Timeline Presensi" description="5 catatan terbaru">
          <EmptyBox label="Belum ada catatan presensi." />
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
          <MetricCard label="Total Modul" value="0" />
          <MetricCard label="Selesai" value="0" valueClassName="text-emerald-600" />
          <MetricCard label="Sedang Dikerjakan" value="0" valueClassName="text-orange-500" />
          <MetricCard label="Rata-rata Pencapaian" value="0%" />
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
  return (
    <div className="space-y-6">
      <WaliChildNavigation activeTab="log" />

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500">Log Keluar/Masuk</p>
            <h2 className="text-2xl font-semibold text-gray-900">Data santri belum tersedia</h2>
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
        Belum ada data log keluar/masuk.
      </div>
    </div>
  );
}

export function StaffAttendanceView() {
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
          <MetricCard label="Total Pertemuan" value="0" />
          <MetricCard label="Hadir" value="0" valueClassName="text-emerald-600" />
          <MetricCard label="Izin" value="0" valueClassName="text-amber-500" />
          <MetricCard label="Persentase Kehadiran" value="0%" />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="Timeline Presensi" description="5 catatan terbaru">
          <EmptyBox label="Belum ada catatan presensi." />
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

export function StaffProgressView() {
  const [category, setCategory] = useState<"al-quran" | "al-hadits">("al-quran");
  const [genderFilter, setGenderFilter] = useState<"all" | "putra" | "putri">("all");
  const [searchQuery, setSearchQuery] = useState("");

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
          <CompactMetricCard label="Total Santri" value="0" />
          <CompactMetricCard label="Santri Aktif Progres" value="0" />
          <CompactMetricCard label="Rata-rata Kelas" value="0%" />
          <CompactMetricCard label={`Modul Tuntas | Target ${category === "al-hadits" ? "31" : "30"}`} value="0" />
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
          {searchQuery.trim() ? "Belum ada data log keluar/masuk yang cocok." : "Belum ada data log keluar/masuk."}
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
