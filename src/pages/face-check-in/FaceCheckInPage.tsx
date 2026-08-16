import { useEffect, useState } from "react";

import { useAuth } from "@/app/providers/AuthProvider";
import { checkInByFace, fetchActiveFaceSession } from "@/shared/lib/face-attendance";
import { ApiError } from "@/shared/lib/http";
import type { FaceCheckInResponse, FaceSession } from "@/shared/types/face-attendance";
import { SantriPageShell } from "@/widgets/app-shell/SantriPageShell";
import { FaceCamera } from "@/widgets/face-camera/FaceCamera";

export function FaceCheckInPage() {
  return <SantriPageShell>{() => <FaceCheckInContent />}</SantriPageShell>;
}

function FaceCheckInContent() {
  const { token } = useAuth();
  const [session, setSession] = useState<FaceSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [result, setResult] = useState<FaceCheckInResponse | null>(null);

  const load = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      setSession(await fetchActiveFaceSession(token));
    } catch (error) {
      setResult({ status: "review", reason: error instanceof ApiError && error.status === 503 ? "Layanan presensi wajah sedang tidak tersedia." : "Sesi presensi belum dapat diperiksa." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void load(); }, [token]);

  const checkIn = async (imageData: string) => {
    if (!token || !session) return;
    setIsBusy(true);
    setResult(null);
    try {
      const response = await checkInByFace(token, session.id, imageData);
      setResult(response);
      if (response.status === "accepted") void load();
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      setResult({ status: "review", reason: apiError?.status === 503 ? "Layanan AI tidak tersedia. Tidak ada presensi yang dicatat otomatis." : apiError?.message || "Presensi belum dapat diproses." });
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Face recognition</p>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900">Presensi Wajah</h1>
        <p className="mt-2 text-sm text-gray-600">Kehadiran hanya disimpan jika wajah sesuai dengan akun yang sedang login.</p>
      </div>
      {isLoading ? <div className="rounded-2xl border border-gray-200 p-6 text-sm text-gray-600">Memeriksa sesi presensi aktif...</div> : session?.status === "open" ? <><section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">Sesi terbuka</span><h2 className="mt-3 font-semibold text-emerald-950">{session.kelas}</h2><p className="mt-1 text-sm text-emerald-900">{session.kegiatan} · {session.waktu} · {session.tanggal}</p></section><FaceCamera onCapture={checkIn} isBusy={isBusy} captureLabel="Presensi Sekarang" guidance="Pastikan hanya wajah Anda terlihat dan pencahayaan cukup." /></> : <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6"><h2 className="font-semibold text-gray-900">Sesi belum dibuka atau sudah ditutup</h2><p className="mt-2 text-sm text-gray-600">Tunggu petugas membuka sesi presensi wajah untuk kelas Anda.</p></section>}
      {result ? <CheckInResult result={result} /> : null}
    </div>
  );
}

function CheckInResult({ result }: { result: FaceCheckInResponse }) {
  const accepted = result.status === "accepted";
  const tone = accepted ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-amber-200 bg-amber-50 text-amber-900";
  return <section role="status" className={`rounded-2xl border p-5 ${tone}`}><h2 className="font-semibold">{accepted ? "Presensi berhasil" : "Perlu review manual"}</h2><p className="mt-2 text-sm">{result.reason || (accepted ? "Kehadiran Anda berhasil disimpan ke database." : "Tidak ada presensi hadir yang dicatat otomatis.")}</p>{accepted && result.confidence != null ? <p className="mt-1 text-xs">Confidence: {(result.confidence * 100).toFixed(1)}%</p> : null}</section>;
}
