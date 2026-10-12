import { useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";

import type { SantriDashboardResponse } from "@/shared/types/dashboard";
import { AppIcon } from "@/shared/ui/AppIcon";

type AttendanceMineViewProps = {
  dashboard: SantriDashboardResponse | null;
  errorMessage: string | null;
  isLoading: boolean;
};

type AttendanceRow = {
  id: string;
  dateKey: string;
  dateLabel: string;
  dayLabel: string;
  category: string;
  time: string;
  status: string;
  note: string;
};

type AttendanceFilters = {
  date: string;
  month: string;
  status: string[];
  category: string[];
  time: string[];
};

const pageSize = 6;

export function AttendanceMineView({ dashboard, errorMessage, isLoading }: AttendanceMineViewProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<AttendanceFilters>({
    date: "",
    month: "",
    status: [],
    category: [],
    time: [],
  });

  const rows = buildAttendanceRows(dashboard);
  const latestUpdates = rows.slice(0, 5);
  const stats = dashboard
    ? {
        totalSessions: dashboard.attendance.total,
        hadir: dashboard.attendance.hadir,
        izin: dashboard.attendance.izin,
        sakit: dashboard.attendance.sakit,
        alpa: dashboard.attendance.alpha,
        percentage: dashboard.attendance.persentase,
      }
    : { totalSessions: 0, hadir: 0, izin: 0, sakit: 0, alpa: 0, percentage: 0 };

  const filteredRows = rows.filter((row) => {
    const searchNeedle = search.trim().toLowerCase();
    const dateMatches = !filters.date || row.dateKey === filters.date;
    const monthMatches = !filters.month || row.dateKey.startsWith(filters.month);
    const statusMatches = filters.status.length === 0 || filters.status.includes(row.status.toLowerCase());
    const categoryMatches = filters.category.length === 0 || filters.category.includes(row.category.toLowerCase());
    const timeMatches = filters.time.length === 0 || filters.time.includes(row.time.toLowerCase());
    const searchMatches =
      searchNeedle === "" ||
      row.category.toLowerCase().includes(searchNeedle) ||
      row.note.toLowerCase().includes(searchNeedle) ||
      row.status.toLowerCase().includes(searchNeedle);

    return dateMatches && monthMatches && statusMatches && categoryMatches && timeMatches && searchMatches;
  });

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const pagedRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const activeFilterCount =
    filters.status.length + filters.category.length + filters.time.length + (filters.date ? 1 : 0) + (filters.month ? 1 : 0);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filters]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-5 w-44 rounded-lg bg-gray-200" />
        <div className="h-16 w-full rounded-2xl bg-gray-100" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="h-28 rounded-xl border border-gray-200 bg-white" />
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-[1fr_375px]">
          <div className="h-[520px] rounded-xl border border-gray-200 bg-white" />
          <div className="h-[520px] rounded-xl border border-gray-200 bg-white" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="text-sm text-gray-500">
          <span>Dashboard</span>
          <span className="mx-2">{">"}</span>
          <span className="text-gray-900">Kehadiran Saya</span>
        </div>

        <div>
          <h1 className="text-2xl font-semibold leading-8 text-gray-900">Kehadiran Saya</h1>
          <p className="mt-1 text-xs leading-relaxed text-gray-600">
            Lorem ipsum dolor sit amet consectetur. Volutpat tellus facilisi nulla commodo non libero quis.
          </p>
          {errorMessage ? (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {errorMessage}
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {[
            ["Total Sesi", stats.totalSessions],
            ["Hadir", stats.hadir],
            ["Izin", stats.izin],
            ["Sakit", stats.sakit],
            ["Alpa", stats.alpa],
            ["Persentase Kehadiran", `${stats.percentage}%`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-gray-200 bg-white px-4 py-3.5 shadow-sm">
              <p className="text-xs font-medium leading-tight text-gray-600">{label}</p>
              <p className="mt-1.5 text-2xl font-semibold leading-8 text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_375px]">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-4 py-3.5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-base font-semibold leading-6 text-gray-900">Riwayat Keseluruhan Kehadiran</h2>
                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                  <div className="relative w-full sm:w-auto">
                    <svg
                      className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <circle cx="8.75" cy="8.75" r="4.75" />
                      <path d="m12.5 12.5 4 4" />
                    </svg>
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Cari..."
                      className="w-full rounded-lg border border-gray-200 bg-white py-1.5 pl-8 pr-2.5 text-xs placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 sm:w-56"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen(true)}
                    className="relative inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M4 5h12" />
                      <path d="M7 10h6" />
                      <path d="M9 15h2" />
                    </svg>
                    Filter
                    {activeFilterCount > 0 ? (
                      <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-semibold text-white">
                        {activeFilterCount}
                      </span>
                    ) : null}
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    {["Tanggal", "Kategori", "Waktu", "Status Kehadiran", "Catatan"].map((label) => (
                      <th key={label} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-gray-600">
                        <div className="flex items-center gap-0.5">
                          {label}
                          <SortIcon />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {pagedRows.length > 0 ? (
                    pagedRows.map((row) => (
                      <tr key={row.id} className="transition-colors hover:bg-gray-50">
                        <td className="px-4 py-3 text-xs font-medium text-gray-900">{row.dateLabel}</td>
                        <td className="px-4 py-3 text-xs text-gray-600">{row.category}</td>
                        <td className="px-4 py-3 text-xs text-gray-600">{row.time}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold ${getStatusClass(row.status)}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">{row.note}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <svg className="h-10 w-10 text-gray-300" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M4.75 4.5h10.5A1.75 1.75 0 0 1 17 6.25v7.5A1.75 1.75 0 0 1 15.25 15.5H4.75A1.75 1.75 0 0 1 3 13.75v-7.5A1.75 1.75 0 0 1 4.75 4.5Z" />
                            <path d="M6.5 8h7" />
                            <path d="M6.5 11h4.5" />
                          </svg>
                          <p className="text-xs font-medium text-gray-500">Belum ada data kehadiran.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {filteredRows.length > pageSize ? (
              <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm disabled:cursor-not-allowed disabled:text-gray-400"
                >
                  Previous
                </button>
                <div className="flex gap-1.5">
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`flex h-9 min-w-[36px] items-center justify-center rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                        currentPage === page
                          ? "bg-emerald-100 text-emerald-700"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm disabled:cursor-not-allowed disabled:text-gray-400"
                >
                  Next
                </button>
              </div>
            ) : null}
          </div>

          <div className="h-fit overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-3.5 py-3">
              <h3 className="text-base font-semibold leading-6 text-gray-900">Update Terbaru</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {latestUpdates.length > 0 ? (
                latestUpdates.map((item) => (
                  <div key={item.id} className="px-3.5 py-3">
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <p className="flex-1 text-sm font-semibold leading-5 text-gray-900">
                        {item.category} {item.time}
                      </p>
                      <span className={`whitespace-nowrap text-[10px] font-semibold ${getStatusClass(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs font-medium leading-tight text-gray-500">{item.dayLabel}</p>
                  </div>
                ))
              ) : (
                <div className="px-3.5 py-10 text-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <AppIcon name="clock" className="h-8 w-8 text-gray-300" />
                    <p className="text-xs font-medium text-gray-500">Belum ada update terbaru.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isFilterOpen ? (
        <div className="fixed inset-0 z-50">
          <button type="button" className="absolute inset-0 bg-gray-900/50" onClick={() => setIsFilterOpen(false)} aria-label="Tutup filter" />
          <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl transition-transform duration-300 ease-in-out">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <button type="button" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500" onClick={() => setIsFilterOpen(false)}>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="m5 5 10 10" />
                  <path d="M15 5 5 15" />
                </svg>
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              <FilterField label="Tanggal">
                <input
                  type="date"
                  value={filters.date}
                  onChange={(event) => setFilters((current) => ({ ...current, date: event.target.value }))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                />
              </FilterField>
              <FilterField label="Bulan">
                <input
                  type="month"
                  value={filters.month}
                  onChange={(event) => setFilters((current) => ({ ...current, month: event.target.value }))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                />
              </FilterField>
              <CheckboxFilter label="Status Kehadiran" values={["hadir", "izin", "sakit", "alpa"]} selected={filters.status} onToggle={(value) => toggleFilterValue("status", value, setFilters)} />
              <CheckboxFilter label="Kategori" values={["sambung", "asrama"]} selected={filters.category} onToggle={(value) => toggleFilterValue("category", value, setFilters)} />
              <CheckboxFilter label="Waktu" values={["subuh", "pagi", "siang", "sore", "malam"]} selected={filters.time} onToggle={(value) => toggleFilterValue("time", value, setFilters)} />
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setFilters({ date: "", month: "", status: [], category: [], time: [] })}
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Clear all
              </button>
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsFilterOpen(false)} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50">
                  Cancel
                </button>
                <button type="button" onClick={() => setIsFilterOpen(false)} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700">
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-900">{label}</h3>
      {children}
    </div>
  );
}

function CheckboxFilter({
  label,
  values,
  selected,
  onToggle,
}: {
  label: string;
  values: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-900">{label}</h3>
      <div className="space-y-2.5 pl-2">
        {values.map((value) => (
          <label key={value} className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={selected.includes(value)}
              onChange={() => onToggle(value)}
              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            {label === "Status Kehadiran" ? <StatusFilterBadge value={value} /> : <span className="text-sm capitalize text-gray-700">{value}</span>}
          </label>
        ))}
      </div>
    </div>
  );
}

function StatusFilterBadge({ value }: { value: string }) {
  const status = mapStatus(value);

  return (
    <span className={`text-xs font-medium ${getStatusClass(status)}`}>
      {status}
    </span>
  );
}

function SortIcon() {
  return (
    <svg className="h-3 w-3 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M7 4v12" />
      <path d="m4.5 6.5 2.5-2.5 2.5 2.5" />
      <path d="M13 16V4" />
      <path d="m10.5 13.5 2.5 2.5 2.5-2.5" />
    </svg>
  );
}

function toggleFilterValue(
  key: keyof Pick<AttendanceFilters, "status" | "category" | "time">,
  value: string,
  setFilters: Dispatch<SetStateAction<AttendanceFilters>>
) {
  setFilters((current) => ({
    ...current,
    [key]: current[key].includes(value)
      ? current[key].filter((item) => item !== value)
      : [...current[key], value],
  }));
}

function buildAttendanceRows(dashboard: SantriDashboardResponse | null): AttendanceRow[] {
  return (
    dashboard?.attendance.recent.map((item) => ({
      id: item.id,
      dateKey: item.createdAtUtc.slice(0, 10),
      dateLabel: formatDateLabel(item.createdAtUtc),
      dayLabel: formatLongDate(item.createdAtUtc),
      category: normalizeDisplayValue(item.kegiatanKategori),
      time: normalizeDisplayValue(item.waktu),
      status: mapStatus(item.status),
      note: normalizeDisplayValue(item.catatan),
    })) ?? []
  );
}

function mapStatus(status: string): AttendanceRow["status"] {
  switch (status.toLowerCase()) {
    case "hadir":
      return "Hadir";
    case "izin":
      return "Izin";
    case "sakit":
      return "Sakit";
    case "alpha":
    case "alpa":
      return "Alpa";
    default:
      return normalizeDisplayValue(status);
  }
}

function getStatusClass(status: AttendanceRow["status"]) {
  switch (status.toLowerCase()) {
    case "Hadir":
    case "hadir":
      return "text-emerald-700";
    case "Izin":
    case "izin":
      return "text-orange-700";
    case "Sakit":
    case "sakit":
      return "text-slate-600";
    case "Alpa":
    case "alpa":
      return "text-red-700";
    default:
      return "text-gray-600";
  }
}

function normalizeDisplayValue(value: string | null | undefined) {
  if (!value || !value.trim()) {
    return "-";
  }

  const normalized = value.trim().replaceAll("_", " ").toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function formatLongDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}
