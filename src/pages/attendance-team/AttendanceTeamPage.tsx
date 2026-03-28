import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";
import { ApiError } from "@/shared/lib/http";
import {
  attendanceCategoryOptions,
  attendanceStatusOptions,
  attendanceTimeOptions,
  deletePresensi,
  extractAttendanceCategory,
  fetchPresensiList,
  fetchSantriList,
  formatShortDate,
  getAttendanceStatusClass,
  getAttendanceStatusDotClass,
  mapAttendanceStatus,
  updatePresensi,
} from "@/shared/lib/santri-data";
import type {
  AttendanceCategoryCode,
  AttendanceStatusCode,
  AttendanceTimeCode,
  PresensiItem,
  SantriItem,
} from "@/shared/types/santri-data";
import { AppIcon } from "@/shared/ui/AppIcon";
import { SantriPageShell } from "@/widgets/app-shell/SantriPageShell";

type GenderTab = "putra" | "putri";

type TeamAttendanceFilters = {
  tanggal: string;
  status: AttendanceStatusCode[];
  kategori: AttendanceCategoryCode[];
  waktu: AttendanceTimeCode[];
  tim: string[];
  gender: "all" | GenderTab;
};

type AttendanceRow = PresensiItem & {
  nama: string;
  tim: string;
  gender: GenderTab;
  kategori: AttendanceCategoryCode;
  catatan: string;
};

const pageSize = 8;

export function AttendanceTeamPage() {
  return (
    <SantriPageShell>
      {() => <AttendanceTeamContent />}
    </SantriPageShell>
  );
}

function AttendanceTeamContent() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [presensi, setPresensi] = useState<PresensiItem[]>([]);
  const [santri, setSantri] = useState<SantriItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<TeamAttendanceFilters>({
    tanggal: "",
    status: [],
    kategori: [],
    waktu: [],
    tim: [],
    gender: "all",
  });
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    tanggal: "",
    kategori: "sambung" as AttendanceCategoryCode,
    waktu: "pagi" as AttendanceTimeCode,
    status: "hadir" as AttendanceStatusCode,
    catatan: "",
  });

  const loadData = async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);

    try {
      const [santriResponse, presensiResponse] = await Promise.all([
        fetchSantriList(token),
        fetchPresensiList(token),
      ]);

      setSantri(santriResponse.items);
      setPresensi(presensiResponse.items);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Data presensi belum dapat dimuat.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [token]);

  const santriMap = useMemo(
    () => new Map(santri.map((item) => [item.id, item])),
    [santri]
  );

  const rows = useMemo<AttendanceRow[]>(
    () =>
      presensi
        .map((record) => {
          const santriRow = santriMap.get(record.santriId);
          const normalizedGender = santriRow?.gender.toLowerCase();

          if (!santriRow || (normalizedGender !== "putra" && normalizedGender !== "putri")) {
            return null;
          }

          return {
            ...record,
            nama: record.santriNama,
            tim: record.santriTim,
            gender: normalizedGender,
            kategori: extractAttendanceCategory(record.kegiatan),
            catatan: record.keterangan || "-",
          };
        })
        .filter((item): item is AttendanceRow => item !== null)
        .sort((left, right) => {
          if (left.tanggal !== right.tanggal) {
            return right.tanggal.localeCompare(left.tanggal);
          }

          return left.nama.localeCompare(right.nama);
        }),
    [presensi, santriMap]
  );

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesKeyword =
        keyword === "" ||
        row.nama.toLowerCase().includes(keyword) ||
        row.tim.toLowerCase().includes(keyword) ||
        row.catatan.toLowerCase().includes(keyword);

      const matchesTanggal = !filters.tanggal || row.tanggal === filters.tanggal;
      const matchesStatus = filters.status.length === 0 || filters.status.includes(row.status);
      const matchesKategori = filters.kategori.length === 0 || filters.kategori.includes(row.kategori);
      const matchesWaktu = filters.waktu.length === 0 || filters.waktu.includes(row.waktu);
      const matchesTim = filters.tim.length === 0 || filters.tim.includes(row.tim);
      const matchesGender = filters.gender === "all" || row.gender === filters.gender;

      return matchesKeyword && matchesTanggal && matchesStatus && matchesKategori && matchesWaktu && matchesTim && matchesGender;
    });
  }, [filters, rows, search]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const pagedRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const activeFilterCount =
    filters.status.length +
    filters.kategori.length +
    filters.waktu.length +
    filters.tim.length +
    (filters.tanggal ? 1 : 0) +
    (filters.gender !== "all" ? 1 : 0);
  const teamOptions = Array.from(new Set(santri.map((item) => item.tim)));
  const editingRow = editingRecordId ? rows.find((row) => row.id === editingRecordId) ?? null : null;

  const openEditModal = (row: AttendanceRow) => {
    setEditingRecordId(row.id);
    setEditForm({
      tanggal: row.tanggal,
      kategori: row.kategori,
      waktu: row.waktu,
      status: row.status,
      catatan: row.catatan,
    });
  };

  const closeEditModal = () => {
    setEditingRecordId(null);
    setEditForm({
      tanggal: "",
      kategori: "sambung",
      waktu: "pagi",
      status: "hadir",
      catatan: "",
    });
  };

  const saveEdit = async () => {
    if (!token || !editingRecordId) {
      return;
    }

    setIsSaving(true);

    try {
      await updatePresensi(token, editingRecordId, {
        tanggal: editForm.tanggal,
        kegiatan: editForm.kategori,
        waktu: editForm.waktu,
        status: editForm.status,
        keterangan: editForm.catatan,
      });

      await loadData();
      closeEditModal();
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Perubahan presensi belum dapat disimpan.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteRecord = async () => {
    if (!token || !editingRecordId) {
      return;
    }

    setIsSaving(true);

    try {
      await deletePresensi(token, editingRecordId);
      await loadData();
      closeEditModal();
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Presensi belum dapat dihapus.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="space-y-3.5">
        <div className="space-y-2">
          <div className="text-xs text-gray-500">
            <span>Dashboard</span>
            <span className="mx-2">{"›"}</span>
            <span className="text-gray-900">Kehadiran Santri</span>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-4">
            <div>
              <h1 className="text-[20px] font-semibold text-gray-900">Kehadiran Santri</h1>
              <p className="mt-0.5 text-[10px] text-gray-600">
                Data kehadiran santri yang tersimpan di backend.
              </p>
              <div className="mt-2 inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 p-1">
                {[
                  { key: "all", label: "Semua" },
                  { key: "putra", label: "Putra" },
                  { key: "putri", label: "Putri" },
                ].map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => {
                      setFilters((current) => ({ ...current, gender: option.key as TeamAttendanceFilters["gender"] }));
                      setCurrentPage(1);
                    }}
                    className={`inline-flex min-w-[66px] items-center justify-center rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                      filters.gender === option.key
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-gray-700 hover:bg-white"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto">
              <div className="relative w-full sm:w-auto">
                <AppIcon name="search" className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Cari santri"
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-8 pr-3 text-sm placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600/20 sm:w-72"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsFilterOpen(true)}
                className="relative inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <AppIcon name="filter" className="h-4 w-4" />
                Filter
                {activeFilterCount > 0 ? (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-semibold text-white">
                    {activeFilterCount}
                  </span>
                ) : null}
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard/kehadiran-santri/input")}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
              >
                <AppIcon name="plus" className="h-4 w-4" />
                Input Kehadiran
              </button>
            </div>
          </div>
        </div>

        {errorMessage ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {errorMessage}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-sm">
              <colgroup>
                <col className="w-[220px]" />
                <col className="w-[90px]" />
                <col className="w-[140px]" />
                <col className="w-[120px]" />
                <col className="w-[110px]" />
                <col className="w-[120px]" />
                <col className="w-[140px]" />
                <col className="w-[92px]" />
              </colgroup>
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {["Nama", "Tim", "Tanggal", "Kategori", "Waktu", "Status", "Catatan"].map((label) => (
                    <th key={label} className="px-4 py-2 text-left">
                      <div className="flex items-center gap-0.5 text-[9px] font-semibold uppercase text-gray-600">
                        <span>{label}</span>
                        <span className="text-gray-400">↕</span>
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-2 text-center text-[9px] font-semibold uppercase text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-8 text-center text-xs text-gray-500">
                      Memuat data kehadiran...
                    </td>
                  </tr>
                ) : pagedRows.length > 0 ? (
                  pagedRows.map((row) => (
                    <tr key={row.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="block truncate text-[11px] font-medium leading-5 text-gray-900">{row.nama}</span>
                      </td>
                      <td className="truncate px-4 py-3 text-[11px] leading-5 text-gray-600">{row.tim}</td>
                      <td className="px-4 py-3 text-[11px] leading-5 text-gray-600">{formatShortDate(row.tanggal)}</td>
                      <td className="truncate px-4 py-3 text-[11px] leading-5 text-gray-600">{capitalize(row.kategori)}</td>
                      <td className="px-4 py-3 text-[11px] leading-5 text-gray-600">{capitalize(row.waktu)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-medium ${getAttendanceStatusClass(row.status)}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${getAttendanceStatusDotClass(row.status)}`} />
                          {mapAttendanceStatus(row.status)}
                        </span>
                      </td>
                      <td className="truncate px-4 py-3 text-[11px] leading-5 text-gray-600">{row.catatan || "-"}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => openEditModal(row)}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <AppIcon name="pencil" className="h-3 w-3" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-3 py-8 text-center text-xs text-gray-500">
                      Belum ada data kehadiran.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredRows.length > pageSize ? (
            <div className="flex items-center justify-between border-t border-gray-200 px-3 py-2.5">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[10px] font-medium text-gray-700 shadow-sm disabled:cursor-not-allowed disabled:text-gray-400"
              >
                <AppIcon name="arrow-left" className="h-3 w-3" />
                Previous
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`rounded-lg px-2.5 py-1.5 text-[10px] font-medium ${
                      currentPage === page ? "bg-emerald-100 text-emerald-700" : "text-gray-600 hover:bg-gray-50"
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
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-gray-700 shadow-sm disabled:cursor-not-allowed disabled:text-gray-400"
              >
                Next
                <AppIcon name="arrow-right" className="h-3 w-3" />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {isFilterOpen ? (
        <div className="fixed inset-0 z-50">
          <button type="button" className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)} aria-label="Tutup filter" />
          <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <p className="mt-0.5 text-sm text-gray-500">Apply filters to table data.</p>
              </div>
              <button type="button" onClick={() => setIsFilterOpen(false)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500">
                <AppIcon name="x" className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              <FilterSection label="Tanggal">
                <input
                  type="date"
                  value={filters.tanggal}
                  onChange={(event) => setFilters((current) => ({ ...current, tanggal: event.target.value }))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                />
              </FilterSection>
              <FilterCheckboxSection
                label="Status Kehadiran"
                values={attendanceStatusOptions}
                selected={filters.status}
                onToggle={(value) => setFilters((current) => ({ ...current, status: toggleValue(current.status, value) }))}
                renderLabel={(value) => (
                  <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium ${getAttendanceStatusClass(value)}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${getAttendanceStatusDotClass(value)}`} />
                    {mapAttendanceStatus(value)}
                  </span>
                )}
              />
              <FilterCheckboxSection
                label="Kategori"
                values={attendanceCategoryOptions}
                selected={filters.kategori}
                onToggle={(value) => setFilters((current) => ({ ...current, kategori: toggleValue(current.kategori, value) }))}
                renderLabel={(value) => <span className="text-sm text-gray-700">{capitalize(value)}</span>}
              />
              <FilterCheckboxSection
                label="Waktu"
                values={attendanceTimeOptions}
                selected={filters.waktu}
                onToggle={(value) => setFilters((current) => ({ ...current, waktu: toggleValue(current.waktu, value) }))}
                renderLabel={(value) => <span className="text-sm text-gray-700">{capitalize(value)}</span>}
              />
              <FilterCheckboxSection
                label="Tim"
                values={teamOptions}
                selected={filters.tim}
                onToggle={(value) => setFilters((current) => ({ ...current, tim: toggleValue(current.tim, value) }))}
                renderLabel={(value) => <span className="text-sm text-gray-700">{value}</span>}
              />
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4">
              <button
                type="button"
                onClick={() =>
                  setFilters({
                    tanggal: "",
                    status: [],
                    kategori: [],
                    waktu: [],
                    tim: [],
                    gender: "all",
                  })
                }
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Clear all
              </button>
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsFilterOpen(false)} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm">
                  Cancel
                </button>
                <button type="button" onClick={() => setIsFilterOpen(false)} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 shadow-sm">
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {editingRow ? (
        <div className="fixed inset-0 z-50 bg-black/40">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Edit Kehadiran</h3>
                <button type="button" onClick={closeEditModal} className="text-gray-500 hover:text-gray-700">
                  <AppIcon name="x" className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                <Field label="Tanggal">
                  <input type="date" value={editForm.tanggal} onChange={(event) => setEditForm((current) => ({ ...current, tanggal: event.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                </Field>
                <Field label="Kategori">
                  <select value={editForm.kategori} onChange={(event) => setEditForm((current) => ({ ...current, kategori: event.target.value as AttendanceCategoryCode }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    {attendanceCategoryOptions.map((option) => (
                      <option key={option} value={option}>
                        {capitalize(option)}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Waktu">
                  <select value={editForm.waktu} onChange={(event) => setEditForm((current) => ({ ...current, waktu: event.target.value as AttendanceTimeCode }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    {attendanceTimeOptions.map((option) => (
                      <option key={option} value={option}>
                        {capitalize(option)}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Status">
                  <select value={editForm.status} onChange={(event) => setEditForm((current) => ({ ...current, status: event.target.value as AttendanceStatusCode }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    {attendanceStatusOptions.map((option) => (
                      <option key={option} value={option}>
                        {mapAttendanceStatus(option)}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Catatan">
                  <input value={editForm.catatan} onChange={(event) => setEditForm((current) => ({ ...current, catatan: event.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                </Field>
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={closeEditModal} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  Batal
                </button>
                <button type="button" disabled={isSaving} onClick={() => void saveEdit()} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300">
                  Simpan
                </button>
              </div>

              <div>
                <button type="button" disabled={isSaving} onClick={() => void deleteRecord()} className="text-sm text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:text-red-300">
                  Hapus Kehadiran
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function FilterSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-900">{label}</h3>
      {children}
    </div>
  );
}

function FilterCheckboxSection<T extends string>({
  label,
  values,
  selected,
  onToggle,
  renderLabel,
}: {
  label: string;
  values: readonly T[];
  selected: readonly T[];
  onToggle: (value: T) => void;
  renderLabel: (value: T) => ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-900">{label}</h3>
      <div className="space-y-2.5 pl-2">
        {values.map((value) => (
          <label key={value} className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" checked={selected.includes(value)} onChange={() => onToggle(value)} className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
            {renderLabel(value)}
          </label>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

function toggleValue<T extends string>(items: T[], value: T) {
  return items.includes(value) ? items.filter((item) => item !== value) : [...items, value];
}

function capitalize(value: string) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : value;
}
