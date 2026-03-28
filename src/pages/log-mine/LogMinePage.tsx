import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";
import { ApiError } from "@/shared/lib/http";
import {
  deleteLogKeluarMasuk,
  fetchLogKeluarMasuk,
  formatDetailedTimeInput,
  formatShortDate,
  updateLogKeluarMasuk,
} from "@/shared/lib/santri-data";
import type { LogKeluarMasukItem, LogKeluarMasukListResponse } from "@/shared/types/santri-data";
import { AppIcon } from "@/shared/ui/AppIcon";
import { SantriPageShell } from "@/widgets/app-shell/SantriPageShell";

const pageSize = 12;

export function LogMinePage() {
  return (
    <SantriPageShell contentPanelClassName="h-[calc(100vh-40px)] overflow-y-auto">
      {() => <LogMineContent />}
    </SantriPageShell>
  );
}

function LogMineContent() {
  const { token } = useAuth();
  const location = useLocation();
  const [page, setPage] = useState(1);
  const [data, setData] = useState<LogKeluarMasukListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    (location.state as { successMessage?: string } | null)?.successMessage ?? null
  );
  const [editingLog, setEditingLog] = useState<LogKeluarMasukItem | null>(null);
  const [editForm, setEditForm] = useState({
    tanggal: "",
    tujuan: "",
    waktuKeluar: "",
    waktuMasuk: "",
    catatan: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    void fetchLogKeluarMasuk(token, { page, perPage: pageSize, scope: "mine" })
      .then((response) => {
        if (isMounted) {
          setData(response);
          setErrorMessage(null);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setErrorMessage(error instanceof ApiError ? error.message : "Log keluar/masuk belum dapat dimuat.");
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
  }, [page, token]);

  function openEdit(log: LogKeluarMasukItem) {
    setEditingLog(log);
    setEditForm({
      tanggal: log.tanggal,
      tujuan: log.tujuan,
      waktuKeluar: log.waktuKeluar || "",
      waktuMasuk: log.waktuMasuk || "",
      catatan: log.catatan || "",
    });
  }

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !editingLog) {
      return;
    }

    setIsSubmitting(true);

    try {
      await updateLogKeluarMasuk(token, editingLog.id, editForm);
      setEditingLog(null);
      setSuccessMessage("Log keluar/masuk berhasil diperbarui.");
      const response = await fetchLogKeluarMasuk(token, { page, perPage: pageSize, scope: "mine" });
      setData(response);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Log keluar/masuk belum dapat diperbarui.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(log: LogKeluarMasukItem) {
    if (!token || !window.confirm(`Hapus log "${log.tujuan}"?`)) {
      return;
    }

    try {
      await deleteLogKeluarMasuk(token, log.id);
      setSuccessMessage("Log keluar/masuk dihapus.");
      const nextPage = data && data.items.length === 1 && page > 1 ? page - 1 : page;
      setPage(nextPage);
      const response = await fetchLogKeluarMasuk(token, { page: nextPage, perPage: pageSize, scope: "mine" });
      setData(response);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Log keluar/masuk belum dapat dihapus.");
    }
  }

  const totalPages = Math.max(1, Math.ceil((data?.totalCount ?? 0) / pageSize));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500">Log Keluar/Masuk</p>
            <h2 className="text-2xl font-semibold text-gray-900">Log Saya</h2>
            <p className="mt-1 text-sm text-gray-500">Riwayat keluar/masuk Anda yang sudah tercatat di backend.</p>
          </div>
          <div className="inline-flex items-center rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            Subfitur: Log Saya
          </div>
        </div>
      </div>

      {successMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {errorMessage}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Tujuan</th>
                <th className="px-4 py-3">Waktu Keluar</th>
                <th className="px-4 py-3">Waktu Masuk</th>
                <th className="px-4 py-3">Catatan</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">
                    Memuat log keluar/masuk...
                  </td>
                </tr>
              ) : data?.items.length ? (
                data.items.map((log) => (
                  <tr key={log.id} className="border-b border-gray-50">
                    <td className="px-4 py-3">{formatShortDate(log.tanggal)}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{log.tujuan}</td>
                    <td className="px-4 py-3">{log.waktuKeluar || "-"}</td>
                    <td className="px-4 py-3">{log.waktuMasuk || "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{log.catatan || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(log)}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <AppIcon name="pencil" className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(log)}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
                        >
                          <AppIcon name="trash" className="h-3.5 w-3.5" />
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">
                    Belum ada data log keluar/masuk.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 ? (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPage(value)}
                  className={`rounded-lg px-2.5 py-1.5 text-[10px] font-medium ${
                    page === value ? "bg-emerald-100 text-emerald-700" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              Next
            </button>
          </div>
        ) : null}
      </div>

      {editingLog ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-900/40 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Log Keluar/Masuk</h3>
              <button type="button" onClick={() => setEditingLog(null)} className="text-gray-500 hover:text-gray-700">
                <AppIcon name="x" className="h-5 w-5" />
              </button>
            </div>

            <form className="space-y-4 px-5 py-5" onSubmit={handleUpdate}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm text-gray-600">Tanggal</label>
                  <input
                    type="date"
                    value={editForm.tanggal}
                    onChange={(event) => setEditForm((current) => ({ ...current, tanggal: event.target.value }))}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Tujuan</label>
                  <input
                    type="text"
                    value={editForm.tujuan}
                    onChange={(event) => setEditForm((current) => ({ ...current, tujuan: event.target.value }))}
                    maxLength={150}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Waktu keluar</label>
                  <input
                    type="text"
                    value={editForm.waktuKeluar}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        waktuKeluar: formatDetailedTimeInput(event.target.value),
                      }))
                    }
                    inputMode="numeric"
                    placeholder="HH:mm"
                    pattern="^([01]\\d|2[0-3]):([0-5]\\d)$"
                    title="Gunakan format 24 jam, misalnya 08:20"
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">Format 24 jam WIB, misalnya 08:20.</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Waktu masuk</label>
                  <input
                    type="text"
                    value={editForm.waktuMasuk}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        waktuMasuk: formatDetailedTimeInput(event.target.value),
                      }))
                    }
                    inputMode="numeric"
                    placeholder="HH:mm"
                    pattern="^([01]\\d|2[0-3]):([0-5]\\d)$"
                    title="Gunakan format 24 jam, misalnya 14:45"
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">Format 24 jam WIB, misalnya 14:45.</p>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600">Catatan</label>
                <textarea
                  value={editForm.catatan}
                  onChange={(event) => setEditForm((current) => ({ ...current, catatan: event.target.value }))}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingLog(null)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
