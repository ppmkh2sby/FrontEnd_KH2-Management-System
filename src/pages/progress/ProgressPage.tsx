import { useEffect, useState } from "react";

import { useAuth } from "@/app/providers/AuthProvider";
import { ApiError } from "@/shared/lib/http";
import {
  fetchProgressKeilmuan,
  progressCategoryOptions,
  syncProgressKeilmuan,
} from "@/shared/lib/santri-data";
import type { ProgressCategoryCode, ProgressKeilmuanPageResponse } from "@/shared/types/santri-data";
import { AppIcon } from "@/shared/ui/AppIcon";
import { SantriPageShell } from "@/widgets/app-shell/SantriPageShell";

const modulesPerPage = 6;

export function ProgressPage() {
  return (
    <SantriPageShell contentPanelClassName="h-[calc(100vh-40px)] overflow-y-auto">
      {() => <ProgressContent />}
    </SantriPageShell>
  );
}

function ProgressContent() {
  const { token, user } = useAuth();
  const [category, setCategory] = useState<ProgressCategoryCode>("al-quran");
  const [data, setData] = useState<ProgressKeilmuanPageResponse | null>(null);
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setSuccessMessage(null);

    void fetchProgressKeilmuan(token, category)
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setData(response);
        setDraftValues(
          Object.fromEntries(
            response.modules.map((item) => [item.judul, item.value === null ? "" : `${item.value}`])
          )
        );
        setErrorMessage(null);
      })
      .catch((error) => {
        if (isMounted) {
          setErrorMessage(error instanceof ApiError ? error.message : "Progress keilmuan belum dapat dimuat.");
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
  }, [category, token]);

  useEffect(() => {
    setPage(1);
  }, [category, searchQuery]);

  const filteredModules = (data?.modules ?? []).filter((item) => matchesSearch(item.judul, searchQuery));
  const totalPages = Math.max(1, Math.ceil(filteredModules.length / modulesPerPage));
  const safePage = Math.min(page, totalPages);
  const visibleModules = filteredModules.slice((safePage - 1) * modulesPerPage, safePage * modulesPerPage);

  async function handleSave() {
    if (!token || !data) {
      return;
    }

    setIsSaving(true);
    setSuccessMessage(null);

    try {
      const response = await syncProgressKeilmuan(token, {
        category,
        modules: data.modules.map((item) => ({
          judul: item.judul,
          value: parseDraftValue(draftValues[item.judul]),
        })),
      });

      setData(response);
      setDraftValues(
        Object.fromEntries(
          response.modules.map((item) => [item.judul, item.value === null ? "" : `${item.value}`])
        )
      );
      setErrorMessage(null);
      setSuccessMessage("Progres keilmuan berhasil diperbarui.");
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Progres keilmuan belum dapat disimpan.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Dashboard</span>
            <AppIcon name="chevron-right" className="h-3.5 w-3.5 text-gray-400" />
            <span className="font-medium text-emerald-700">Progress Keilmuan</span>
          </div>
          <div className="space-y-0.5">
            <h1 className="text-[20px] font-semibold text-gray-900">Progress Keilmuan</h1>
            <p className="text-xs text-gray-600">
              Catat progres materi dan pantau perkembangan setoran Anda seperti alur web sebelumnya.
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm">
          <div className="grid h-6 w-6 place-items-center rounded-full bg-gray-200 text-[11px] font-semibold text-gray-700">
            {user?.fullName?.slice(0, 1).toUpperCase() ?? "U"}
          </div>
          <span className="text-sm font-medium text-gray-800">{user?.fullName ?? "User"}</span>
          <AppIcon name="chevron-down" className="h-4 w-4 text-gray-500" />
        </div>
      </div>

      <div className="flex items-center gap-6 border-b border-gray-200">
        {progressCategoryOptions.map((item) => {
          const active = category === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`pb-2.5 text-sm font-medium ${
                active ? "border-b-2 border-emerald-600 text-emerald-700" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {item === "al-hadits" ? "Al Hadits" : "Al-Quran"}
            </button>
          );
        })}
      </div>

      {successMessage ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {errorMessage}
        </div>
      ) : null}

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-20 rounded-xl border border-gray-200 bg-white" />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-[1fr_270px]">
            <div className="h-[420px] rounded-xl border border-gray-200 bg-white" />
            <div className="h-[420px] rounded-xl border border-gray-200 bg-white" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_270px]">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Total Materi", data?.summary.total ?? 0],
                ["Materi Selesai", data?.summary.completed ?? 0],
                ["Materi Dalam Pengerjaan", data?.summary.inProgress ?? 0],
                ["Rata-rata Pencapaian", `${data?.summary.average ?? 0}%`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
                  <p className="text-[10px] font-medium text-gray-600">{label}</p>
                  <p className="mt-1 text-xl font-semibold leading-7 text-gray-900">{value}</p>
                </div>
              ))}
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-col gap-2.5 px-3 pb-1.5 pt-2.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-shrink-0">
                  <h3 className="text-sm font-semibold leading-5 text-gray-900">
                    {category === "al-hadits" ? "Materi Al-Hadits" : "Materi Al-Quran"}
                  </h3>
                </div>

                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-2.5">
                  <div className="relative w-full sm:w-44">
                    <AppIcon name="search" className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Cari materi"
                      className="h-8 w-full rounded-lg border border-gray-300 bg-white pl-8 pr-2.5 text-xs text-gray-900 placeholder:text-gray-500 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600/20"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleSave()}
                    disabled={isSaving}
                    className="inline-flex h-8 w-full items-center justify-center gap-1 rounded-lg border-2 border-white/[0.12] bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    <AppIcon name="check" className="h-3.5 w-3.5" />
                    {isSaving ? "Menyimpan..." : "Simpan Progress"}
                  </button>
                </div>
              </div>

              <div className="mt-2.5 h-px bg-gray-200" />
              <div className="grid grid-cols-[95px_minmax(0,1fr)_58px] items-center border-b border-gray-200 bg-gray-50 px-3 py-1.5 text-[10px] font-semibold uppercase text-gray-600 sm:grid-cols-[145px_170px_1fr] lg:grid-cols-[165px_145px_1fr]">
                <div>{category === "al-quran" ? "Juz" : "Hadits"}</div>
                <div>Progress Halaman</div>
                <div className="text-right">Persentase</div>
              </div>

              <div className="divide-y divide-gray-200">
                {visibleModules.length > 0 ? (
                  visibleModules.map((module) => {
                    const draftValue = draftValues[module.judul] ?? "";
                    const numericValue = parseDraftValue(draftValue);
                    const percent =
                      numericValue === null ? 0 : Math.min(100, Math.round((numericValue * 100) / module.target));
                    const exceeds = numericValue !== null && numericValue > module.target;

                    return (
                      <div
                        key={module.judul}
                        className="grid grid-cols-[95px_minmax(0,1fr)_58px] items-center border-b border-gray-200 px-3 py-2 hover:bg-gray-50 sm:grid-cols-[145px_170px_1fr] sm:px-3.5 lg:grid-cols-[165px_145px_1fr]"
                      >
                        <div className="pr-2 text-[11px] font-medium leading-4 text-gray-900 sm:pr-0">{module.judul}</div>
                        <div className="pr-1 sm:pr-2.5">
                          <input
                            type="number"
                            min="0"
                            max={module.target}
                            value={draftValue}
                            onChange={(event) =>
                              setDraftValues((current) => ({
                                ...current,
                                [module.judul]: event.target.value,
                              }))
                            }
                            placeholder={`Maks: ${module.target}`}
                            className={`h-7 w-full rounded-lg border px-2 text-xs text-gray-900 placeholder:text-gray-500 shadow-sm ${
                              exceeds
                                ? "border-red-300 text-red-700 focus:border-red-400 focus:ring-1 focus:ring-red-400/20"
                                : "border-gray-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20"
                            }`}
                          />
                        </div>
                        <div className="flex items-center justify-end gap-2 pr-0.5 sm:pr-3">
                          <div className="hidden h-1 flex-1 rounded-full bg-gray-200 sm:block">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${percent > 0 ? "bg-emerald-600" : "bg-gray-300"}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <div className="min-w-[30px] text-right text-[11px] font-medium leading-4 text-gray-700">
                            {percent}%
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-4 py-10 text-center text-sm text-gray-500">Materi yang dicari tidak ditemukan.</div>
                )}
              </div>

              {totalPages > 1 ? (
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 bg-white px-2.5 py-1.5">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={safePage === 1}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] font-semibold text-gray-500 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <AppIcon name="arrow-left" className="h-3.5 w-3.5" />
                    Previous
                  </button>

                  <div className="flex items-center gap-0.5 overflow-x-auto">
                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setPage(value)}
                        className={`h-7 w-7 rounded-lg text-[11px] font-medium transition-colors ${
                          safePage === value ? "bg-gray-50 text-gray-900" : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    disabled={safePage === totalPages}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                    <AppIcon name="arrow-right" className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-2.5 border-b border-gray-200 px-2.5 py-2">
              <h3 className="flex-1 text-xs font-semibold leading-4 text-gray-900">Update Terbaru</h3>
              <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-700">
                {data?.recentUpdates.length ?? 0} Catatan
              </span>
            </div>

            <div className="flex-1 overflow-y-auto px-2.5 py-0">
              {data?.recentUpdates.length ? (
                <ul className="divide-y divide-gray-100">
                  {data.recentUpdates.map((entry) => {
                    const timestamp = entry.terakhirSetorUtc || entry.updatedAtUtc;
                    return (
                      <li key={entry.id} className="py-2 first:pt-2.5">
                        <div className="mb-0.5 flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold leading-4 text-gray-900">{entry.judul}</p>
                          <p className="whitespace-nowrap text-[10px] text-gray-600">
                            {timestamp ? formatRecentTimestamp(timestamp) : "-"}
                          </p>
                        </div>
                        <p className="text-[11px] font-medium leading-4 text-gray-600">
                          {entry.capaian}/{entry.target} {entry.satuan ?? "halaman"} · {entry.persentase}%
                        </p>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="py-2.5 text-[11px] text-gray-500">Belum ada catatan progres di kategori ini.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function parseDraftValue(value: string | undefined) {
  if (!value?.trim()) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : Math.max(0, parsed);
}

function matchesSearch(value: string, query: string) {
  if (!query.trim()) {
    return true;
  }

  const normalize = (text: string) => ({
    spaced: text.toLowerCase().replace(/\s+/g, " ").trim(),
    tight: text.toLowerCase().replace(/[^a-z0-9]/g, ""),
  });

  const text = normalize(value);
  const q = normalize(query);
  return text.spaced.includes(q.spaced) || text.tight.includes(q.tight);
}

function formatRecentTimestamp(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
