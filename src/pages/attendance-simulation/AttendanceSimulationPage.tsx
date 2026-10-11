import { useRef, useState } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";
import { verifyMyFace } from "@/shared/lib/face-attendance";
import { ApiError } from "@/shared/lib/http";
import type { SantriFaceVerificationResponse } from "@/shared/types/face-attendance";
import { AppIcon } from "@/shared/ui/AppIcon";
import { SantriPageShell } from "@/widgets/app-shell/SantriPageShell";
import { FaceCamera } from "@/widgets/face-camera/FaceCamera";

export function AttendanceSimulationPage() {
  const { user, token } = useAuth();
  const [isBusy, setIsBusy] = useState(false);
  const [result, setResult] = useState<SantriFaceVerificationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestInFlight = useRef(false);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "Santri") return <Navigate to="/dashboard" replace />;

  const verify = async (imageData: string) => {
    if (!token || requestInFlight.current) return;
    requestInFlight.current = true;
    setIsBusy(true);
    setResult(null);
    setError(null);
    try {
      setResult(await verifyMyFace(token, imageData));
    } catch (verificationError) {
      setError(toUserMessage(verificationError));
    } finally {
      requestInFlight.current = false;
      setIsBusy(false);
    }
  };

  return (
    <SantriPageShell>
      {() => (
        <main className="mx-auto max-w-3xl space-y-6 py-2 text-gray-900">
          <header>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">Fitur Umum</p>
            <h1 className="mt-2 text-2xl font-bold">Uji Wajah Saya</h1>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Ambil satu foto baru untuk mencocokkan wajah dengan data yang terdaftar pada akun Anda.
              Foto dikirim ke backend untuk verifikasi; uji ini belum mencatat presensi.
            </p>
          </header>

          <FaceCamera
            onCapture={verify}
            isBusy={isBusy}
            title="Kamera verifikasi wajah"
            captureLabel="Uji wajah saya"
            busyLabel="Mencocokkan wajah..."
            privacyNotice="Foto dikirim ke backend untuk verifikasi sekali ini. Foto tidak ditampilkan atau disimpan di halaman."
            guidance="Posisikan wajah menghadap kamera. Pastikan hanya satu wajah terlihat dan pencahayaan cukup."
            wideFraming
          />

          {error ? <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">{error}</div> : null}

          {result ? (
            <section aria-live="polite" className={`rounded-2xl border p-5 ${result.verified ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
              <div className="flex items-start gap-3">
                <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${result.verified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                  <AppIcon name={result.verified ? "check" : "search"} className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{result.verified ? "Wajah Anda berhasil dikenali" : "Wajah belum berhasil diverifikasi"}</h2>
                  <p className="mt-1 text-sm leading-6 text-gray-700">{result.verified
                    ? "Foto berhasil dicocokkan dengan data wajah yang tersimpan pada akun Anda."
                    : getFailureDescription(result.reason)}</p>
                  {result.verified && typeof result.similarity === "number" ? (
                    <p className="mt-2 text-sm text-gray-700">Kemiripan: {(result.similarity * 100).toFixed(1)}%</p>
                  ) : null}
                  <p className="mt-2 text-xs text-gray-600">Uji ini tidak membuat catatan presensi.</p>
                </div>
              </div>
              <button type="button" onClick={() => setResult(null)} className="mt-4 rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100">
                Uji Lagi
              </button>
            </section>
          ) : null}
        </main>
      )}
    </SantriPageShell>
  );
}

function getFailureDescription(reason: string | null): string {
  if (reason === "UnknownFace") return "Wajah tidak memiliki kecocokan yang cukup kuat dengan data terdaftar.";
  if (reason === "AmbiguousMatch") return "Wajah belum dapat diverifikasi secara pasti. Coba ambil foto ulang.";
  if (reason === "FaceDoesNotBelongToAccount") return "Wajah yang terdeteksi tidak cocok dengan data wajah akun ini.";
  return "Foto belum dapat diverifikasi. Coba ambil foto ulang dengan pencahayaan yang baik.";
}

function toUserMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 400) return "Foto ditolak. Pastikan hanya satu wajah terlihat jelas dan pencahayaan cukup, lalu coba kembali.";
    if (error.status === 401 || error.status === 403) return "Akun ini tidak memiliki akses untuk verifikasi wajah Santri.";
    if (error.status === 429) return "Terlalu banyak percobaan. Tunggu sebentar lalu coba kembali.";
    if (error.status === 502) return "Layanan pengenalan wajah memberikan respons yang tidak valid.";
    if (error.status === 503 && error.details?.title === "RecognitionNotConfigured") return "Sistem pengenalan wajah belum dikonfigurasi.";
    if (error.status === 503) return "Layanan pengenalan wajah sedang tidak tersedia.";
    if (error.status === 504) return "Proses pengenalan wajah melewati batas waktu.";
    if (error.status === 0) return "Koneksi ke server terputus. Periksa jaringan dan coba kembali.";
    return "Verifikasi wajah belum berhasil. Silakan coba kembali.";
  }
  return error instanceof Error ? error.message : "Verifikasi wajah belum berhasil. Silakan coba kembali.";
}
