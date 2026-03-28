import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";
import { ApiError } from "@/shared/lib/http";
import {
  fetchLogKeluarMasuk,
  formatDetailedTimeInput,
  formatLongDate,
  storeLogKeluarMasuk,
} from "@/shared/lib/santri-data";
import type { LogKeluarMasukItem } from "@/shared/types/santri-data";
import { AppIcon } from "@/shared/ui/AppIcon";
import { SantriPageShell } from "@/widgets/app-shell/SantriPageShell";

export function LogInputPage() {
  return (
    <SantriPageShell contentPanelClassName="h-[calc(100vh-40px)] overflow-y-auto">
      {() => <LogInputContent />}
    </SantriPageShell>
  );
}

function LogInputContent() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    tanggal: new Date().toISOString().slice(0, 10),
    tujuan: "",
    waktuKeluar: "",
    waktuMasuk: "",
    catatan: "",
  });
  const [recentLogs, setRecentLogs] = useState<LogKeluarMasukItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    void fetchLogKeluarMasuk(token, { page: 1, perPage: 5, scope: "mine" })
      .then((response) => {
        if (isMounted) {
          setRecentLogs(response.items);
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
  }, [token]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      return;
    }

    setIsSubmitting(true);

    try {
      await storeLogKeluarMasuk(token, form);
      navigate("/dashboard/log-keluar-masuk/saya", {
        state: { successMessage: "Log keluar/masuk berhasil dicatat." },
      });
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Log keluar/masuk belum dapat disimpan.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500">Log Keluar/Masuk</p>
            <h2 className="text-2xl font-semibold text-gray-900">Input Keluar/Masuk</h2>
            <p className="mt-1 text-sm text-gray-500">Tanggal, tujuan, waktu keluar, waktu masuk, dan catatan.</p>
          </div>
          <div className="inline-flex items-center rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            Subfitur: Input Keluar/Masuk
          </div>
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Form Log Keluar/Masuk</h3>
            <p className="text-sm text-gray-500">Isi data keluar/masuk, lalu catatan langsung masuk ke log Anda.</p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm text-gray-600">Tanggal</label>
                <input
                  type="date"
                  value={form.tanggal}
                  onChange={(event) => setForm((current) => ({ ...current, tanggal: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Tujuan</label>
                <input
                  type="text"
                  value={form.tujuan}
                  onChange={(event) => setForm((current) => ({ ...current, tujuan: event.target.value }))}
                  placeholder="Misal: Kontrol kesehatan"
                  maxLength={150}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Waktu keluar</label>
                <input
                  type="text"
                  value={form.waktuKeluar}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      waktuKeluar: formatDetailedTimeInput(event.target.value),
                    }))
                  }
                  inputMode="numeric"
                  placeholder="HH:mm"
                  pattern="^([01]\\d|2[0-3]):([0-5]\\d)$"
                  title="Gunakan format 24 jam, misalnya 07:35"
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Format 24 jam WIB, misalnya 07:35.</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Waktu masuk</label>
                <input
                  type="text"
                  value={form.waktuMasuk}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      waktuMasuk: formatDetailedTimeInput(event.target.value),
                    }))
                  }
                  inputMode="numeric"
                  placeholder="HH:mm"
                  pattern="^([01]\\d|2[0-3]):([0-5]\\d)$"
                  title="Gunakan format 24 jam, misalnya 13:10"
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Format 24 jam WIB, misalnya 13:10.</p>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600">Catatan</label>
              <textarea
                value={form.catatan}
                onChange={(event) => setForm((current) => ({ ...current, catatan: event.target.value }))}
                rows={3}
                placeholder="Opsional"
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <AppIcon name="check" className="h-4 w-4" />
                {isSubmitting ? "Menyimpan..." : "Simpan Log"}
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Log terbaru</h3>
            <span className="text-xs text-gray-500">{recentLogs.length} data</span>
          </div>
          {isLoading ? (
            <div className="mt-4 space-y-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-20 animate-pulse rounded-2xl border border-gray-100 bg-gray-50" />
              ))}
            </div>
          ) : recentLogs.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">Belum ada data log.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {recentLogs.map((log) => (
                <li key={log.id} className="rounded-2xl border border-gray-100 p-3">
                  <p className="text-sm font-semibold text-gray-900">{log.tujuan}</p>
                  <p className="text-xs text-gray-500">{formatLongDate(log.tanggal)}</p>
                  <p className="mt-2 text-xs text-gray-600">
                    Keluar {log.waktuKeluar || "-"} | Masuk {log.waktuMasuk || "-"}
                  </p>
                  {log.catatan ? <p className="mt-1 text-xs text-gray-500">{log.catatan}</p> : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
