import { useRef, useState } from "react";

import { useAuth } from "@/app/providers/AuthProvider";
import { recognizeEnrolledFace } from "@/shared/lib/face-attendance";
import { ApiError } from "@/shared/lib/http";
import type { FaceRecognitionResponse } from "@/shared/types/face-attendance";
import { AppIcon } from "@/shared/ui/AppIcon";
import { RolePageShell } from "@/widgets/app-shell/RolePageShell";
import { FaceCamera } from "@/widgets/face-camera/FaceCamera";

export function FaceRecognitionTestPage() {
  return (
    <RolePageShell allowedRoles={["Admin", "DewanGuru", "Pengurus"]}>
      <FaceRecognitionTestContent />
    </RolePageShell>
  );
}

function FaceRecognitionTestContent() {
  const { token } = useAuth();
  const [isBusy, setIsBusy] = useState(false);
  const [result, setResult] = useState<FaceRecognitionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestInFlight = useRef(false);

  const recognize = async (imageData: string) => {
    if (!token || requestInFlight.current) return;
    requestInFlight.current = true;
    setIsBusy(true);
    setResult(null);
    setError(null);

    try {
      setResult(await recognizeEnrolledFace(token, imageData));
    } catch (recognitionError) {
      setError(toUserMessage(recognitionError));
    } finally {
      requestInFlight.current = false;
      setIsBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl space-y-6 py-2 text-gray-900">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">Alat uji internal</p>
        <h1 className="mt-2 text-2xl font-bold">Uji deteksi wajah terdaftar</h1>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Ambil satu foto untuk mencocokkannya dengan profil wajah Santri yang sudah terdaftar.
          Uji ini tidak membuat catatan presensi dan tidak mendaftarkan wajah baru.
        </p>
      </header>

      <FaceCamera
        onCapture={recognize}
        isBusy={isBusy}
        captureLabel="Uji foto wajah"
        guidance="Pastikan hanya satu wajah terlihat jelas. Hasil ditampilkan setelah foto dikirim ke server."
      />

      {error ? (
        <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      {result ? (
        <section aria-live="polite" className={`rounded-2xl border p-5 ${result.isRecognized ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
          <div className="flex items-start gap-3">
            <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${result.isRecognized ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
              <AppIcon name={result.isRecognized ? "check" : "search"} className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{result.isRecognized ? "Wajah terdaftar terdeteksi" : "Wajah belum dapat dikenali"}</h2>
              <p className="mt-1 text-sm leading-6 text-gray-700">{getResultDescription(result)}</p>
              {result.isRecognized && result.santriId ? (
                <p className="mt-3 text-xs text-gray-600">ID Santri: <code className="break-all font-mono">{result.santriId}</code></p>
              ) : null}
              {result.isRecognized && typeof result.similarity === "number" ? (
                <p className="mt-1 text-xs text-gray-600">Nilai kemiripan: {result.similarity.toFixed(3)}</p>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}

function getResultDescription(result: FaceRecognitionResponse): string {
  if (result.isRecognized) return "Foto cocok dengan satu profil wajah Santri yang aktif.";
  if (result.reason === "AmbiguousMatch") return "Ada lebih dari satu kemungkinan kecocokan. Ambil foto ulang dengan wajah lebih jelas.";
  if (result.reason === "UnknownFace") return "Tidak ditemukan kecocokan yang cukup kuat dengan profil wajah terdaftar.";
  return "Foto belum menghasilkan kecocokan. Coba ambil foto ulang dengan pencahayaan yang baik.";
}

function toUserMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 400) return "Foto ditolak. Pastikan hanya satu wajah terlihat jelas, lalu ambil foto ulang.";
    if (error.status === 401 || error.status === 403) return "Akun ini tidak memiliki akses untuk menguji pengenalan wajah.";
    if (error.status === 429) return "Terlalu banyak percobaan. Tunggu sebentar lalu coba kembali.";
    if (error.status === 502) return "Layanan pengenalan wajah memberikan respons yang tidak valid. Silakan coba kembali.";
    if (error.status === 503 || error.status === 504) return "Layanan pengenalan wajah belum tersedia. Hubungi pengelola atau coba kembali nanti.";
    if (error.status === 0) return "Koneksi ke server terputus. Periksa jaringan dan coba kembali.";
    return "Pengujian wajah belum berhasil. Silakan coba kembali.";
  }
  return error instanceof Error ? error.message : "Pengujian wajah belum berhasil. Silakan coba kembali.";
}
