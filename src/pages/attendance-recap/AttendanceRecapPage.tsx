import { useEffect, useState, type ReactNode } from "react";

import { useAuth } from "@/app/providers/AuthProvider";
import { ApiError } from "@/shared/lib/http";
import {
  attendanceCategoryOptions,
  attendanceTimeOptions,
  fetchPresensiRecap,
  formatMonthInput,
} from "@/shared/lib/santri-data";
import type { AttendanceCategoryCode, AttendanceTimeCode, PresensiRecapResponse } from "@/shared/types/santri-data";
import { AppIcon } from "@/shared/ui/AppIcon";
import { SantriPageShell } from "@/widgets/app-shell/SantriPageShell";

const pageSize = 100;

export function AttendanceRecapPage() {
  return (
    <SantriPageShell contentPanelClassName="h-[calc(100vh-40px)] overflow-y-auto md:overflow-hidden">
      {() => <AttendanceRecapContent />}
    </SantriPageShell>
  );
}

function AttendanceRecapContent() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<"putra" | "putri">("putra");
  const [bulan, setBulan] = useState(formatMonthInput(new Date()));
  const [kategori, setKategori] = useState<AttendanceCategoryCode | "all">("all");
  const [waktu, setWaktu] = useState<AttendanceTimeCode | "all">("all");
  const [page, setPage] = useState(1);
  const [recap, setRecap] = useState<PresensiRecapResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    void fetchPresensiRecap(token, {
      bulan,
      gender: activeTab,
      kategori,
      waktu,
      page,
      perPage: pageSize,
    })
      .then((response) => {
        if (isMounted) {
          setRecap(response);
          setErrorMessage(null);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setErrorMessage(error instanceof ApiError ? error.message : "Rekap presensi belum dapat dimuat.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeTab, bulan, kategori, page, token, waktu]);

  const summary = recap?.summary ?? {
    totalSantri: 0,
    totalSesi: 0,
    totalInput: 0,
    hadir: 0,
    izin: 0,
    sakit: 0,
    alpa: 0,
    persentase: 0,
  };
  const pagedRows = recap?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((recap?.totalCount ?? 0) / pageSize));

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="flex-none space-y-2">
        <nav className="flex items-center gap-2 text-sm text-gray-500">
          <span>Dashboard</span>
          <AppIcon name="chevron-right" className="h-3.5 w-3.5 text-gray-400" />
          <span>Kehadiran Santri</span>
          <AppIcon name="chevron-right" className="h-3.5 w-3.5 text-gray-400" />
          <span className="font-medium text-emerald-700">Rekap Presensi KTB</span>
        </nav>

        <div>
          <h1 className="text-[22px] font-semibold text-gray-900">Rekap Presensi Bulanan</h1>
          <p className="mt-1 text-sm text-gray-600">Rekap presensi backend per santri sesuai filter aktif.</p>
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid flex-1 min-h-0 grid-cols-1 gap-4 overflow-hidden md:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="md:h-full md:min-h-0 md:pr-1">
          <div className="h-full rounded-2xl border border-gray-200 bg-white p-3.5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-gray-900">Panel Rekap</h2>
              <div className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 p-1">
                {[
                  { key: "putra", label: "Putra" },
                  { key: "putri", label: "Putri" },
                ].map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => {
                      setActiveTab(option.key as "putra" | "putri");
                      setPage(1);
                    }}
                    className={`inline-flex min-w-[58px] items-center justify-center rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${
                      activeTab === option.key ? "bg-emerald-600 text-white shadow-sm" : "text-gray-700 hover:bg-white"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-2 space-y-1.5">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2">
                <p className="text-xs font-semibold text-gray-900">Ringkasan {activeTab === "putri" ? "Putri" : "Putra"}</p>
                <div className="mt-1.5 grid grid-cols-4 gap-1.5">
                  {[
                    ["Santri", summary.totalSantri, "text-gray-900"],
                    ["Sesi", summary.totalSesi, "text-gray-900"],
                    ["Input", summary.totalInput, "text-gray-900"],
                    ["Hadir", `${summary.persentase}%`, "text-emerald-700"],
                  ].map(([label, value, tone]) => (
                    <div key={label} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5">
                      <p className="text-[10px] leading-3 text-gray-500">{label}</p>
                      <p className={`text-sm font-semibold leading-5 ${tone}`}>{value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  <SummaryChip className="text-emerald-700">Hadir: {summary.hadir}</SummaryChip>
                  <SummaryChip className="text-orange-700">Izin: {summary.izin}</SummaryChip>
                  <SummaryChip className="text-slate-600">Sakit: {summary.sakit}</SummaryChip>
                  <SummaryChip className="text-red-700">Alpa: {summary.alpa}</SummaryChip>
                </div>
              </div>
            </div>

            <div className="mt-3 border-t border-gray-200 pt-3">
              <h3 className="mb-2 text-sm font-semibold text-gray-900">Filter Rekap</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <FilterField label="Bulan">
                    <input type="month" value={bulan} onChange={(event) => { setBulan(event.target.value); setPage(1); }} className="h-9 w-full rounded-lg border border-gray-300 bg-white px-2.5 text-sm text-gray-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20" />
                  </FilterField>
                  <FilterField label="Kategori">
                    <select value={kategori} onChange={(event) => { setKategori(event.target.value as AttendanceCategoryCode | "all"); setPage(1); }} className="h-9 w-full rounded-lg border border-gray-300 bg-white px-2.5 text-sm text-gray-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20">
                      <option value="all">Semua Kategori</option>
                      {attendanceCategoryOptions.map((option) => (
                        <option key={option} value={option}>
                          {capitalize(option)}
                        </option>
                      ))}
                    </select>
                  </FilterField>
                  <FilterField label="Waktu" className="md:col-span-2">
                    <select value={waktu} onChange={(event) => { setWaktu(event.target.value as AttendanceTimeCode | "all"); setPage(1); }} className="h-9 w-full rounded-lg border border-gray-300 bg-white px-2.5 text-sm text-gray-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20">
                      <option value="all">Semua Waktu</option>
                      {attendanceTimeOptions.map((option) => (
                        <option key={option} value={option}>
                          {capitalize(option)}
                        </option>
                      ))}
                    </select>
                  </FilterField>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <button type="button" className="inline-flex h-9 items-center justify-center rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-700">
                    Tampilkan
                  </button>
                  <button type="button" onClick={() => { setBulan(formatMonthInput(new Date())); setKategori("all"); setWaktu("all"); setPage(1); }} className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-300 bg-white px-3 text-xs font-medium text-gray-700 hover:bg-gray-50">
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <section className="min-h-[420px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:flex md:h-full md:min-h-0 md:flex-col">
          <div className="border-b border-gray-200 px-4 py-2.5">
            <h3 className="text-sm font-semibold text-gray-900">Detail Data Rekap {activeTab === "putri" ? "Putri" : "Putra"}</h3>
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            <div className="h-full max-h-full flex-1 overflow-auto">
              <table className="w-full table-fixed text-sm">
                <colgroup>
                  <col className="w-[46%]" />
                  <col className="w-[11%]" />
                  <col className="w-[6.5%]" />
                  <col className="w-[6.5%]" />
                  <col className="w-[6.5%]" />
                  <col className="w-[6.5%]" />
                  <col className="w-[17%]" />
                </colgroup>
                <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50">
                  <tr>
                    {["Nama", "Total", "H", "I", "S", "A", "% Hadir"].map((label, index) => (
                      <th
                        key={label}
                        className={`px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600 ${
                          index === 0 ? "text-left" : "text-right"
                        }`}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-10 text-center text-xs text-gray-500">
                        Memuat rekap presensi...
                      </td>
                    </tr>
                  ) : pagedRows.length > 0 ? (
                    pagedRows.map((row) => (
                      <tr key={row.santriId} className="align-middle hover:bg-gray-50">
                        <td className="px-4 py-2.5 align-middle">
                          <div className="truncate text-[0.84rem] font-semibold leading-5 text-gray-900">{row.nama}</div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-right text-[0.84rem] leading-5 text-gray-700">{row.totalInput}</td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-right text-[0.84rem] font-medium leading-5 text-emerald-700">{row.hadir}</td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-right text-[0.84rem] font-medium leading-5 text-blue-700">{row.izin}</td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-right text-[0.84rem] font-medium leading-5 text-amber-700">{row.sakit}</td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-right text-[0.84rem] font-medium leading-5 text-rose-700">{row.alpa}</td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-right text-[0.84rem] font-semibold leading-5 text-gray-900">
                          {row.persentase}%
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-3 py-10 text-center text-xs text-gray-500">
                        Belum ada data presensi untuk filter ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {(recap?.totalCount ?? 0) > pageSize ? (
            <div className="border-t border-gray-200 px-4 py-2.5 text-sm">
              <div className="flex items-center justify-between">
                <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 disabled:cursor-not-allowed disabled:text-gray-400">
                  Previous
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((value) => (
                    <button key={value} type="button" onClick={() => setPage(value)} className={`rounded-lg px-2.5 py-1.5 text-[10px] font-medium ${page === value ? "bg-emerald-100 text-emerald-700" : "text-gray-600 hover:bg-gray-50"}`}>
                      {value}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 disabled:cursor-not-allowed disabled:text-gray-400">
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function FilterField({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`space-y-1 ${className ?? ""}`}>
      <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-600">{label}</label>
      {children}
    </div>
  );
}

function SummaryChip({ className, children }: { className: string; children: ReactNode }) {
  return <span className={`text-[0.68rem] font-semibold leading-[0.95rem] ${className}`}>{children}</span>;
}

function capitalize(value: string) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : value;
}
