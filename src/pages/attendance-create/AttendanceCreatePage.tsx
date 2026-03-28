import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";
import { ApiError } from "@/shared/lib/http";
import {
  attendanceCategoryOptions,
  attendanceStatusOptions,
  attendanceTimeOptions,
  fetchSantriList,
  mapAttendanceStatus,
  storeBulkPresensi,
} from "@/shared/lib/santri-data";
import type { AttendanceCategoryCode, AttendanceStatusCode, AttendanceTimeCode, SantriItem } from "@/shared/types/santri-data";
import { AppIcon } from "@/shared/ui/AppIcon";
import { SantriPageShell } from "@/widgets/app-shell/SantriPageShell";

type GenderTab = "putra" | "putri";

export function AttendanceCreatePage() {
  return (
    <SantriPageShell contentPanelClassName="xl:h-[calc(100vh-40px)] xl:overflow-hidden">
      {() => <AttendanceCreateContent />}
    </SantriPageShell>
  );
}

function AttendanceCreateContent() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [allSantri, setAllSantri] = useState<SantriItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gender, setGender] = useState<GenderTab>("putra");
  const [search, setSearch] = useState("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [kategori, setKategori] = useState<AttendanceCategoryCode>("sambung");
  const [waktu, setWaktu] = useState<AttendanceTimeCode>("pagi");
  const [catatan, setCatatan] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<Record<string, AttendanceStatusCode | undefined>>({});
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    void fetchSantriList(token)
      .then((response) => {
        if (isMounted) {
          setAllSantri(response.items);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setWarning(error instanceof ApiError ? error.message : "Data santri belum dapat dimuat.");
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
  }, [token]);

  const santriList = useMemo(
    () =>
      allSantri.filter((item) => {
        const keyword = search.trim().toLowerCase();
        return item.gender.toLowerCase() === gender && (keyword === "" || `${item.nama} ${item.tim} ${item.kelas}`.toLowerCase().includes(keyword));
      }),
    [allSantri, gender, search]
  );

  const selectedCount = santriList.filter((item) => selectedStatuses[item.id]).length;
  const stats = attendanceStatusOptions.reduce<Record<AttendanceStatusCode, number>>(
    (current, status) => ({
      ...current,
      [status]: santriList.filter((item) => selectedStatuses[item.id] === status).length,
    }),
    { hadir: 0, izin: 0, sakit: 0, alpa: 0 }
  );

  const applyStatusToAll = (status: AttendanceStatusCode, checked: boolean) => {
    setSelectedStatuses((current) => {
      const next = { ...current };
      santriList.forEach((santri) => {
        next[santri.id] = checked ? status : undefined;
      });
      return next;
    });
  };

  const submit = async () => {
    if (!token) {
      return;
    }

    if (santriList.length === 0) {
      setWarning("Tidak ada data santri untuk disubmit.");
      return;
    }

    const missing = santriList.filter((item) => !selectedStatuses[item.id]);
    if (missing.length > 0) {
      setWarning(`Masih ada ${missing.length} santri yang belum dipilih status kehadirannya.`);
      return;
    }

    setWarning(null);
    setIsSubmitting(true);

    try {
      await storeBulkPresensi(token, {
        tanggal,
        kegiatan: kategori,
        waktu,
        keterangan: catatan,
        items: santriList.map((santri) => ({
          santriId: santri.id,
          status: selectedStatuses[santri.id]!,
        })),
      });

      navigate("/dashboard/kehadiran-santri");
    } catch (error) {
      setWarning(error instanceof ApiError ? error.message : "Presensi belum dapat disimpan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full min-h-0 space-y-3.5 xl:flex xl:flex-col" data-presensi-create-root>
      {warning ? (
        <div className="fixed inset-x-0 top-4 z-50 px-4">
          <div className="mx-auto w-full max-w-4xl rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-md shadow-amber-100/70">
            {warning}
          </div>
        </div>
      ) : null}

      <div className="grid h-full min-h-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-h-0 space-y-5 xl:flex xl:flex-col">
          <div className="space-y-2">
            <nav className="flex items-center gap-2 text-sm text-gray-500">
              <button type="button" onClick={() => navigate("/dashboard")} className="hover:text-gray-800">
                Dashboard
              </button>
              <AppIcon name="chevron-right" className="h-3.5 w-3.5 text-gray-400" />
              <span>Kehadiran Santri</span>
              <AppIcon name="chevron-right" className="h-3.5 w-3.5 text-gray-400" />
              <span className="font-medium text-emerald-700">Input Kehadiran Santri</span>
            </nav>

            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-[22px] font-semibold text-gray-900">Input Kehadiran Santri</h1>
                <p className="mt-1 max-w-3xl text-sm text-gray-600">
                  Input presensi santri secara massal untuk tim Ketertiban.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {[
                  { key: "putra", label: "Putra" },
                  { key: "putri", label: "Putri" },
                ].map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setGender(option.key as GenderTab)}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${
                      gender === option.key
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-gray-200 text-gray-700 hover:border-emerald-300"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm xl:flex xl:min-h-0 xl:flex-1 xl:flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-base font-semibold text-gray-900">Santri</h2>
              <div className="relative w-72">
                <AppIcon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari santri"
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-3.5 text-sm text-gray-900 placeholder:text-gray-500 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600/20"
                />
              </div>
            </div>

            <div className="overflow-auto xl:flex-1 xl:min-h-0">
              <table className="w-full">
                <thead>
                  <tr className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50">
                    <th className="min-w-[360px] px-5 py-3 text-left">
                      <span className="text-sm font-semibold text-gray-700">Nama</span>
                    </th>
                    {attendanceStatusOptions.map((status) => (
                      <th key={status} className="w-24 px-3 py-3 text-center">
                        <label className="inline-flex cursor-pointer items-center justify-center gap-1.5">
                          <input
                            type="checkbox"
                            checked={santriList.length > 0 && santriList.every((item) => selectedStatuses[item.id] === status)}
                            onChange={(event) => applyStatusToAll(status, event.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                          />
                          <span className="text-[11px] font-semibold text-gray-700">{mapAttendanceStatus(status)}</span>
                        </label>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                        Memuat data santri...
                      </td>
                    </tr>
                  ) : santriList.length > 0 ? (
                    santriList.map((santri) => (
                      <tr key={santri.id} className="transition-colors hover:bg-gray-50">
                        <td className="px-5 py-3">
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold leading-5 text-gray-900">{santri.nama}</span>
                            <span className="mt-0.5 text-[11px] text-gray-500">Tim: {santri.tim}</span>
                            {!selectedStatuses[santri.id] ? (
                              <span className="mt-1 text-[11px] font-medium text-rose-600">Pilih status kehadiran</span>
                            ) : null}
                          </div>
                        </td>
                        {attendanceStatusOptions.map((status) => (
                          <td key={status} className="px-3 py-3 text-center">
                            <input
                              type="radio"
                              name={`presensi-${santri.id}`}
                              checked={selectedStatuses[santri.id] === status}
                              onChange={() => setSelectedStatuses((current) => ({ ...current, [santri.id]: status }))}
                              className="h-4 w-4 cursor-pointer rounded-full border-2 border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                        Santri tidak ditemukan untuk kata kunci tersebut.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-6 xl:mt-0 xl:h-full xl:min-h-0 xl:self-stretch">
          <div className="flex flex-col space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm xl:h-full xl:overflow-hidden">
            <div className="grid grid-cols-4 gap-2.5">
              {[
                ["Hadir", stats.hadir],
                ["Izin", stats.izin],
                ["Sakit", stats.sakit],
                ["Alpa", stats.alpa],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-center">
                  <p className="mb-1.5 text-xs font-medium text-gray-600">{label}</p>
                  <p className="text-2xl font-semibold leading-[30px] text-gray-900">{value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">Santri Terpilih</p>
              <p className="mt-0.5 text-sm text-emerald-900">
                <span>{selectedCount}</span> dari <span>{santriList.length}</span> santri
              </p>
            </div>

            <FormField label="Tanggal">
              <div className="relative">
                <input type="date" value={tanggal} onChange={(event) => setTanggal(event.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20" />
                <AppIcon name="calendar" className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
              </div>
            </FormField>

            <FormField label="Kategori Kegiatan">
              <div className="relative">
                <select value={kategori} onChange={(event) => setKategori(event.target.value as AttendanceCategoryCode)} className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20">
                  {attendanceCategoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {capitalize(option)}
                    </option>
                  ))}
                </select>
                <AppIcon name="chevron-down" className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
              </div>
            </FormField>

            <FormField label="Waktu">
              <div className="relative">
                <select value={waktu} onChange={(event) => setWaktu(event.target.value as AttendanceTimeCode)} className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20">
                  {attendanceTimeOptions.map((option) => (
                    <option key={option} value={option}>
                      {capitalize(option)}
                    </option>
                  ))}
                </select>
                <AppIcon name="chevron-down" className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
              </div>
            </FormField>

            <FormField label="Catatan (Opsional)">
              <textarea value={catatan} onChange={(event) => setCatatan(event.target.value)} rows={6} placeholder="Masukkan catatan" className="h-[120px] w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20" />
            </FormField>

            <button type="button" disabled={isSubmitting || isLoading} onClick={() => void submit()} className="w-full rounded-lg border-2 border-white/10 bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300">
              {isSubmitting ? "Menyimpan..." : "Submit Kehadiran"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

function capitalize(value: string) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : value;
}
