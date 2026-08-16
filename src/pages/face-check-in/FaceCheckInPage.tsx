import { useEffect, useState } from "react";

import { useAuth } from "@/app/providers/AuthProvider";
import { checkInByFace, fetchActiveFaceSession } from "@/shared/lib/face-attendance";
import { ApiError } from "@/shared/lib/http";
import type { FaceCheckInResponse, FaceSession } from "@/shared/types/face-attendance";
import { SantriPageShell } from "@/widgets/app-shell/SantriPageShell";
import { FaceCamera } from "@/widgets/face-camera/FaceCamera";

export function FaceCheckInPage() { return <SantriPageShell>{() => <FaceCheckInContent />}</SantriPageShell>; }

function FaceCheckInContent() {
  const { token } = useAuth();
  const [session, setSession] = useState<FaceSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [result, setResult] = useState<FaceCheckInResponse | null>(null);

  const load = async () => { if (!token) return; setIsLoading(true); try { setSession(await fetchActiveFaceSession(token)); } catch (error) { setResult({ outcome: "session_unavailable", message: error instanceof ApiError && error.status === 503 ? "Layanan presensi wajah sedang tidak tersedia." : "Sesi presensi belum dapat diperiksa." }); } finally { setIsLoading(false); } };
  useEffect(() => { void load(); }, [token]);
  const checkIn = async (imageData: string) => { if (!token || !session) return; setIsBusy(true); setResult(null); try { const response = await checkInByFace(token, session.id, imageData); setResult(response); if (response.attendanceRecorded) void load(); } catch (error) { const apiError = error instanceof ApiError ? error : null; setResult({ outcome: apiError?.status === 503 ? "review_required" : "session_unavailable", message: apiError?.status === 503 ? "Layanan AI tidak tersedia. Hasil dikirim untuk review manual dan tidak dicatat otomatis." : apiError?.message || "Presensi belum dapat diproses." }); } finally { setIsBusy(false); } };

  return <div className="mx-auto max-w-4xl space-y-5"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Face recognition</p><h1 className="mt-1 text-2xl font-semibold text-gray-900">Presensi Wajah</h1><p className="mt-2 text-sm text-gray-600">Presensi hanya disimpan backend jika identitas dan confidence valid.</p></div>{isLoading ? <div className="rounded-2xl border border-gray-200 p-6 text-sm text-gray-600">Memeriksa sesi presensi aktif...</div> : session?.status === "Open" ? <><section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">Sesi Open</span><h2 className="mt-3 font-semibold text-emerald-950">{session.className}</h2><p className="mt-1 text-sm text-emerald-900">{session.activityName} · {session.timeLabel}</p></section><FaceCamera onCapture={checkIn} isBusy={isBusy} captureLabel="Presensi Sekarang" guidance="Pastikan hanya wajah Anda yang terlihat, pencahayaan cukup, dan lihat ke kamera." /></> : <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6"><h2 className="font-semibold text-gray-900">Sesi belum dibuka atau sudah ditutup</h2><p className="mt-2 text-sm text-gray-600">Tunggu petugas membuka sesi presensi wajah untuk kelas Anda.</p></section>}{result ? <CheckInResult result={result} /> : null}</div>;
}

function CheckInResult({ result }: { result: FaceCheckInResponse }) {
  const copy: Record<string, { title: string; tone: string }> = { success: { title: "Presensi berhasil", tone: "border-emerald-200 bg-emerald-50 text-emerald-900" }, not_enrolled: { title: "Wajah belum terdaftar", tone: "border-amber-200 bg-amber-50 text-amber-900" }, unrecognized: { title: "Wajah tidak dikenali", tone: "border-rose-200 bg-rose-50 text-rose-900" }, low_confidence: { title: "Confidence terlalu rendah, silakan ulangi", tone: "border-amber-200 bg-amber-50 text-amber-900" }, multiple_faces: { title: "Terdeteksi lebih dari satu wajah", tone: "border-rose-200 bg-rose-50 text-rose-900" }, session_unavailable: { title: "Sesi belum dibuka atau sudah ditutup", tone: "border-amber-200 bg-amber-50 text-amber-900" }, already_checked_in: { title: "Presensi sudah tercatat", tone: "border-blue-200 bg-blue-50 text-blue-900" }, review_required: { title: "Perlu review manual", tone: "border-amber-200 bg-amber-50 text-amber-900" } };
  const view = copy[result.outcome] ?? copy.review_required;
  return <section role="status" className={`rounded-2xl border p-5 ${view.tone}`}><h2 className="font-semibold">{view.title}</h2><p className="mt-2 text-sm">{result.message || (result.outcome === "success" ? "Kehadiran Anda berhasil disimpan dan dashboard diperbarui dari backend." : "Tidak ada presensi hadir yang dicatat otomatis.")}</p></section>;
}
