import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";
import { ApiError } from "@/shared/lib/http";
import {
  deleteKafarah,
  fetchKafarahList,
  formatShortDate,
  getKafarahDefinition,
  kafarahMapping,
  updateKafarah,
} from "@/shared/lib/santri-data";
import type { KafarahItem } from "@/shared/types/santri-data";
import { AppIcon } from "@/shared/ui/AppIcon";
import { SantriPageShell } from "@/widgets/app-shell/SantriPageShell";

type KafarahFilters = {
  tanggal: string;
  jenisPelanggaran: string[];
  tim: string[];
  gender: "all" | "putra" | "putri";
  statusSetor: "all" | "belum-selesai" | "selesai";
};

type KafarahEditForm = {
  tanggal: string;
  jenisPelanggaran: string;
  kafarah: string;
  jumlahSetor: number;
  tenggat: string;
};

const pageSize = 10;
const defaultPelanggaran = "tidak_sholat_subuh_di_masjid";

export function KafarahTeamPage() {
  return (
    <SantriPageShell contentPanelClassName="h-[calc(100vh-40px)] overflow-hidden">
      {() => <KafarahTeamContent />}
    </SantriPageShell>
  );
}

function KafarahTeamContent() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [rowsData, setRowsData] = useState<KafarahItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filters, setFilters] = useState<KafarahFilters>({
    tanggal: "",
    jenisPelanggaran: [],
    tim: [],
    gender: "all",
    statusSetor: "all",
  });
  const [editForm, setEditForm] = useState<KafarahEditForm>({
    tanggal: "",
    jenisPelanggaran: defaultPelanggaran,
    kafarah: kafarahMapping[defaultPelanggaran].kafarah,
    jumlahSetor: 0,
    tenggat: "",
  });

  const loadRows = async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetchKafarahList(token);
      setRowsData(response.items);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Data kafarah belum dapat dimuat.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadRows();
  }, [token]);

  useEffect(() => {
    setPage(1);
  }, [search, filters]);

  const teamOptions = useMemo(
    () => Array.from(new Set(rowsData.map((item) => item.santriTim).filter(Boolean))).sort(),
    [rowsData]
  );

  const rows = useMemo(
    () =>
      rowsData
        .filter((item) => {
          const keyword = search.trim().toLowerCase();
          const gender = normalizeGender(item.santriGender);
          const sisaTanggungan = item.sisaTanggungan ?? Math.max(0, item.tanggungan - item.jumlahSetor);

          const matchesKeyword =
            keyword === "" ||
            `${item.santriNama} ${item.santriTim} ${item.jenisPelanggaranLabel}`.toLowerCase().includes(keyword);

          const matchesTanggal = !filters.tanggal || item.tanggal === filters.tanggal;
          const matchesJenis =
            filters.jenisPelanggaran.length === 0 ||
            filters.jenisPelanggaran.includes(item.jenisPelanggaran);
          const matchesTim = filters.tim.length === 0 || filters.tim.includes(item.santriTim);
          const matchesGender = filters.gender === "all" || gender === filters.gender;
          const matchesStatus =
            filters.statusSetor === "all" ||
            (filters.statusSetor === "belum-selesai" ? sisaTanggungan > 0 : sisaTanggungan <= 0);

          return matchesKeyword && matchesTanggal && matchesJenis && matchesTim && matchesGender && matchesStatus;
        })
        .sort((left, right) => right.tanggal.localeCompare(left.tanggal)),
    [filters, rowsData, search]
  );

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const pagedRows = rows.slice((page - 1) * pageSize, page * pageSize);
  const activeFilterCount =
    filters.jenisPelanggaran.length +
    filters.tim.length +
    (filters.tanggal ? 1 : 0) +
    (filters.gender !== "all" ? 1 : 0) +
    (filters.statusSetor !== "all" ? 1 : 0);
  const editingRow = editingId ? rows.find((row) => row.id === editingId) ?? null : null;

  const openEdit = (id: string) => {
    const row = rows.find((item) => item.id === id);
    if (!row) {
      return;
    }

    setEditingId(id);
    setEditForm({
      tanggal: row.tanggal,
      jenisPelanggaran: row.jenisPelanggaran,
      kafarah: getKafarahText(row.jenisPelanggaran, row.kafarah),
      jumlahSetor: row.jumlahSetor,
      tenggat: row.tenggat || "",
    });
  };

  const closeEdit = () => {
    setEditingId(null);
    setEditForm({
      tanggal: "",
      jenisPelanggaran: defaultPelanggaran,
      kafarah: kafarahMapping[defaultPelanggaran].kafarah,
      jumlahSetor: 0,
      tenggat: "",
    });
  };

  const saveEdit = async () => {
    if (!token || !editingId) {
      return;
    }

    setIsSaving(true);

    try {
      await updateKafarah(token, editingId, {
        tanggal: editForm.tanggal,
        jenisPelanggaran: editForm.jenisPelanggaran,
        jumlahSetor: editForm.jumlahSetor,
        tenggat: editForm.tenggat,
      });

      await loadRows();
      closeEdit();
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Kafarah belum dapat diperbarui.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteRecord = async () => {
    if (!token || !editingId) {
      return;
    }

    setIsSaving(true);

    try {
      await deleteKafarah(token, editingId);
      await loadRows();
      closeEdit();
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Kafarah belum dapat dihapus.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="flex h-full min-h-0 flex-col gap-3">
        <div className="flex-none space-y-1.5">
          <div className="text-xs text-gray-500">
            <span>Dashboard</span>
            <span className="mx-2">{"›"}</span>
            <span className="text-gray-900">Kafarah Santri</span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[20px] font-semibold text-gray-900">Kafarah Santri</h1>
              <p className="mt-0.5 text-[10px] text-gray-600">Data kafarah seluruh santri</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <AppIcon name="search" className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari santri"
                  className="w-72 rounded-lg border border-gray-200 bg-white py-2 pl-8 pr-3 text-sm placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600/20"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsFilterOpen(true)}
                className="relative inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
              >
                <AppIcon name="filter" className="h-4 w-4" />
                Filter
                {activeFilterCount > 0 ? (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-semibold text-white">
                    {activeFilterCount}
                  </span>
                ) : null}
              </button>
              <button type="button" onClick={() => navigate("/dashboard/kafarah-santri/input")} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 shadow-sm">
                <AppIcon name="plus" className="h-4 w-4" />
                Input Kafarah
              </button>
            </div>
          </div>
        </div>

        {errorMessage ? (
          <div className="flex-none rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {errorMessage}
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="min-h-0 flex-1 overflow-hidden">
            <table className="w-full table-fixed text-sm">
              <colgroup>
                <col className="w-[220px]" />
                <col className="w-[90px]" />
                <col className="w-[140px]" />
                <col className="w-[220px]" />
                <col className="w-[220px]" />
                <col className="w-[130px]" />
                <col className="w-[92px]" />
              </colgroup>
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-gray-200 bg-gray-50">
                  {["Nama", "Tim", "Tanggal", "Jenis Pelanggaran", "Kafarah", "Tenggat"].map((label) => (
                    <th key={label} className="px-4 py-2 text-left text-[9px] font-semibold uppercase text-gray-600">
                      {label}
                    </th>
                  ))}
                  <th className="px-4 py-2 text-center text-[9px] font-semibold uppercase text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-xs text-gray-500">
                      Memuat data kafarah...
                    </td>
                  </tr>
                ) : pagedRows.length > 0 ? (
                  pagedRows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="truncate px-4 py-3 text-[11px] font-medium leading-5 text-gray-900">{row.santriNama}</td>
                      <td className="truncate px-4 py-3 text-[11px] leading-5 text-gray-600">{row.santriTim}</td>
                      <td className="px-4 py-3 text-[11px] leading-5 text-gray-600">{formatShortDate(row.tanggal)}</td>
                      <td className="truncate px-4 py-3 text-[11px] leading-5 text-gray-600">{row.jenisPelanggaranLabel}</td>
                      <td className="truncate px-4 py-3 text-[11px] font-medium leading-5 text-gray-900">{getKafarahText(row.jenisPelanggaran, row.kafarah)}</td>
                      <td className="px-4 py-3 text-[11px] leading-5 text-gray-600">{row.tenggat ? formatShortDate(row.tenggat) : "-"}</td>
                      <td className="px-4 py-3 text-center">
                        <button type="button" onClick={() => openEdit(row.id)} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50">
                          <AppIcon name="pencil" className="h-3 w-3" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <AppIcon name="inbox" className="h-10 w-10 text-gray-300" />
                        <p className="text-xs font-medium text-gray-500">Belum ada data kafarah.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {rows.length > pageSize ? (
            <div className="flex flex-none items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-2.5">
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
          ) : null}
        </div>
      </div>

      {isFilterOpen ? (
        <div className="fixed inset-0 z-50">
          <button type="button" className="absolute inset-0 bg-gray-900/50" onClick={() => setIsFilterOpen(false)} aria-label="Tutup filter" />
          <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <button type="button" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500" onClick={() => setIsFilterOpen(false)}>
                <AppIcon name="x" className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              <FilterField label="Tanggal">
                <input type="date" value={filters.tanggal} onChange={(event) => setFilters((current) => ({ ...current, tanggal: event.target.value }))} className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20" />
              </FilterField>

              <FilterCheckboxSection
                label="Jenis Pelanggaran"
                values={Object.keys(kafarahMapping)}
                selected={filters.jenisPelanggaran}
                onToggle={(value) => setFilters((current) => ({ ...current, jenisPelanggaran: toggleValue(current.jenisPelanggaran, value) }))}
                renderLabel={(value) => <span className="text-sm text-gray-700">{kafarahMapping[value as keyof typeof kafarahMapping]?.label || value}</span>}
              />

              <FilterCheckboxSection
                label="Tim"
                values={teamOptions}
                selected={filters.tim}
                onToggle={(value) => setFilters((current) => ({ ...current, tim: toggleValue(current.tim, value) }))}
                renderLabel={(value) => <span className="text-sm text-gray-700">{value}</span>}
              />

              <FilterField label="Gender">
                <div className="space-y-2.5 pl-2">
                  {[
                    { value: "all", label: "Semua" },
                    { value: "putra", label: "Putra" },
                    { value: "putri", label: "Putri" },
                  ].map((option) => (
                    <label key={option.value} className="flex cursor-pointer items-center gap-2.5">
                      <input type="radio" name="filter_gender_kafarah" value={option.value} checked={filters.gender === option.value} onChange={() => setFilters((current) => ({ ...current, gender: option.value as KafarahFilters["gender"] }))} className="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </FilterField>

              <FilterField label="Status Setor">
                <div className="space-y-2.5 pl-2">
                  {[
                    { value: "all", label: "Semua" },
                    { value: "belum-selesai", label: "Belum Selesai" },
                    { value: "selesai", label: "Selesai" },
                  ].map((option) => (
                    <label key={option.value} className="flex cursor-pointer items-center gap-2.5">
                      <input type="radio" name="filter_status_setor" value={option.value} checked={filters.statusSetor === option.value} onChange={() => setFilters((current) => ({ ...current, statusSetor: option.value as KafarahFilters["statusSetor"] }))} className="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </FilterField>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4">
              <button
                type="button"
                onClick={() =>
                  setFilters({
                    tanggal: "",
                    jenisPelanggaran: [],
                    tim: [],
                    gender: "all",
                    statusSetor: "all",
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
                <h3 className="text-lg font-semibold text-gray-900">Edit Kafarah</h3>
                <button type="button" onClick={closeEdit} className="text-gray-500 hover:text-gray-700">
                  <AppIcon name="x" className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                <Field label="Tanggal">
                  <input type="date" value={editForm.tanggal} onChange={(event) => setEditForm((current) => ({ ...current, tanggal: event.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                </Field>
                <Field label="Jenis Pelanggaran">
                  <select
                    value={editForm.jenisPelanggaran}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        jenisPelanggaran: event.target.value,
                        kafarah: getKafarahText(event.target.value, current.kafarah),
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  >
                    {Object.entries(kafarahMapping).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Kafarah">
                  <input value={editForm.kafarah} readOnly className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm" />
                </Field>
                <Field label="Jumlah Setor">
                  <input type="number" min={0} value={editForm.jumlahSetor} onChange={(event) => setEditForm((current) => ({ ...current, jumlahSetor: Number(event.target.value) }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                </Field>
                <Field label="Tenggat">
                  <input type="date" value={editForm.tenggat} onChange={(event) => setEditForm((current) => ({ ...current, tenggat: event.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                </Field>
                <p className="text-xs text-gray-500">
                  Tanggungan mengikuti mapping jenis pelanggaran dari backend.
                  {` Default: ${getKafarahDefaultAmount(editForm.jenisPelanggaran)}`}
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={closeEdit} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  Batal
                </button>
                <button type="button" disabled={isSaving} onClick={() => void saveEdit()} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300">
                  Simpan
                </button>
              </div>

              <div>
                <button type="button" disabled={isSaving} onClick={() => void deleteRecord()} className="text-sm text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:text-red-300">
                  Hapus Kafarah
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

function FilterCheckboxSection({
  label,
  values,
  selected,
  onToggle,
  renderLabel,
}: {
  label: string;
  values: readonly string[];
  selected: readonly string[];
  onToggle: (value: string) => void;
  renderLabel: (value: string) => ReactNode;
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

function toggleValue(items: string[], value: string) {
  return items.includes(value) ? items.filter((item) => item !== value) : [...items, value];
}

function normalizeGender(value: string) {
  const normalized = value.toLowerCase();

  if (normalized.includes("putri") || normalized.includes("perempuan")) {
    return "putri";
  }

  return "putra";
}

function getKafarahText(jenisPelanggaran: string, fallback: string) {
  return getKafarahDefinition(jenisPelanggaran)?.kafarah || fallback;
}

function getKafarahDefaultAmount(jenisPelanggaran: string) {
  return getKafarahDefinition(jenisPelanggaran)?.jumlah ?? 0;
}
