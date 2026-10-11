import { useState } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";
import { AppIcon } from "@/shared/ui/AppIcon";
import { SantriPageShell } from "@/widgets/app-shell/SantriPageShell";
import { FaceCamera } from "@/widgets/face-camera/FaceCamera";

export function AttendanceSimulationPage() {
  const { user } = useAuth();
  const [photo, setPhoto] = useState<string | null>(null);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "Santri") return <Navigate to="/dashboard" replace />;

  return (
    <SantriPageShell>
      {() => (
        <main className="mx-auto max-w-3xl space-y-6 py-2 text-gray-900">
          <header>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">Fitur Umum · Simulasi</p>
            <h1 className="mt-2 text-2xl font-bold">Uji coba presensi wajah</h1>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Coba tampilan pengambilan foto sebelum presensi wajah tersedia untuk Santri.
              Foto hanya ditampilkan sementara di halaman ini.
            </p>
          </header>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            Ini hanya simulasi antarmuka. Foto tidak dikirim ke server, wajah tidak dicocokkan,
            dan kehadiran tidak dicatat.
          </div>

          <FaceCamera
            onCapture={(imageData) => setPhoto(imageData)}
            title="Kamera simulasi"
            captureLabel="Ambil foto simulasi"
            privacyNotice="Foto tetap sementara di halaman ini dan tidak dikirim ke server. Tutup halaman atau ambil ulang untuk menghapusnya."
            guidance="Jaga jarak sekitar satu lengan dari kamera agar wajah dan bahu terlihat."
            wideFraming
          />

          {photo ? (
            <section aria-live="polite" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                  <AppIcon name="check" className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold">Foto simulasi berhasil diambil</h2>
                  <p className="mt-1 text-sm leading-6 text-gray-700">Belum ada hasil deteksi atau catatan presensi.</p>
                </div>
              </div>
              <img src={photo} alt="Foto simulasi presensi yang baru diambil" className="mx-auto mt-4 max-h-72 rounded-xl object-contain" />
              <button type="button" onClick={() => setPhoto(null)} className="mt-4 rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100">
                Hapus foto simulasi
              </button>
            </section>
          ) : null}
        </main>
      )}
    </SantriPageShell>
  );
}
