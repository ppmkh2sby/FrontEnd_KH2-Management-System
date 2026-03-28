import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";
import { ApiError } from "@/shared/lib/http";
import { fetchSantriList, kafarahMapping, storeBulkKafarah } from "@/shared/lib/santri-data";
import type { SantriItem } from "@/shared/types/santri-data";
import { AppIcon } from "@/shared/ui/AppIcon";
import { SantriPageShell } from "@/widgets/app-shell/SantriPageShell";

type GenderTab = "putra" | "putri";

export function KafarahCreatePage() {
  return (
    <SantriPageShell>
      {() => <KafarahCreateContent />}
    </SantriPageShell>
  );
}

function KafarahCreateContent() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [allSantri, setAllSantri] = useState<SantriItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [gender, setGender] = useState<GenderTab>("putra");
  const [search, setSearch] = useState("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [jenisPelanggaran, setJenisPelanggaran] = useState<keyof typeof kafarahMapping>("tidak_sholat_subuh_di_masjid");
  const [selectedSantriIds, setSelectedSantriIds] = useState<string[]>([]);

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
          setErrorMessage(error instanceof ApiError ? error.message : "Data santri belum dapat dimuat.");
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
        return item.gender.toLowerCase() === gender && (keyword === "" || item.nama.toLowerCase().includes(keyword));
      }),
    [allSantri, gender, search]
  );

  const submit = async () => {
    if (!token || selectedSantriIds.length === 0) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await storeBulkKafarah(token, {
        tanggal,
        jenisPelanggaran,
        santriIds: selectedSantriIds,
      });

      navigate("/dashboard/kafarah-santri");
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Kafarah belum dapat disimpan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3.5">
      {errorMessage ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <div className="space-y-2">
            <nav className="flex items-center gap-2 text-sm text-gray-500">
              <span>Dashboard</span>
              <AppIcon name="chevron-right" className="h-3.5 w-3.5 text-gray-400" />
              <span>Kafarah Santri</span>
              <AppIcon name="chevron-right" className="h-3.5 w-3.5 text-gray-400" />
              <span className="font-medium text-emerald-700">Input Kafarah Santri</span>
            </nav>

            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-[22px] font-semibold text-gray-900">Input Kafarah Santri</h1>
                <p className="mt-1 max-w-3xl text-sm text-gray-600">Input data kafarah untuk santri</p>
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

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
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

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-5 py-3 text-left">
                      <div className="flex items-center gap-3 text-sm font-semibold text-gray-700">
                        <input
                          type="checkbox"
                          checked={santriList.length > 0 && santriList.every((item) => selectedSantriIds.includes(item.id))}
                          onChange={(event) =>
                            setSelectedSantriIds(event.target.checked ? santriList.map((item) => item.id) : [])
                          }
                          className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                        />
                        <span>Nama</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td className="px-6 py-12 text-center text-sm text-gray-500">Memuat data santri...</td>
                    </tr>
                  ) : santriList.length > 0 ? (
                    santriList.map((santri) => (
                      <tr key={santri.id} className="santri-row transition-colors hover:bg-gray-50">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedSantriIds.includes(santri.id)}
                              onChange={() =>
                                setSelectedSantriIds((current) =>
                                  current.includes(santri.id)
                                    ? current.filter((item) => item !== santri.id)
                                    : [...current, santri.id]
                                )
                              }
                              className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                            />
                            <span className="text-xs font-semibold leading-5 text-gray-900">{santri.nama}</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-6 py-12 text-center text-sm text-gray-500">Tidak ada data santri.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-6 xl:mt-0 xl:self-start">
          <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto">
            <div className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-center">
              <p className="mb-1.5 text-xs font-medium text-gray-600">Santri Dipilih</p>
              <p className="text-2xl font-semibold leading-[30px] text-gray-900">{selectedSantriIds.length}</p>
            </div>

            <div className="space-y-3.5">
              <Field label="Tanggal">
                <div className="relative">
                  <AppIcon name="calendar" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input type="date" value={tanggal} onChange={(event) => setTanggal(event.target.value)} className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3.5 text-sm text-gray-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20" />
                </div>
              </Field>

              <Field label="Jenis Pelanggaran">
                <select value={jenisPelanggaran} onChange={(event) => setJenisPelanggaran(event.target.value as keyof typeof kafarahMapping)} className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20">
                  {Object.entries(kafarahMapping).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-gray-500">Tenggat otomatis H+7 dari tanggal kafarah.</p>
              </Field>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <button type="button" disabled={isSubmitting || selectedSantriIds.length === 0} onClick={() => void submit()} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300">
                <AppIcon name="check" className="h-4 w-4" />
                {isSubmitting ? "Menyimpan..." : "Submit Kafarah"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold leading-tight text-gray-700">{label}</label>
      {children}
    </div>
  );
}
