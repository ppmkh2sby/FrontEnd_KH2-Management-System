import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/app/providers/AuthProvider";
import { completeFaceEnrollment, fetchFaceEnrollmentStatus, removeFaceEnrollmentCapture, uploadFaceEnrollmentCapture } from "@/shared/lib/face-attendance";
import { ApiError } from "@/shared/lib/http";
import type { FaceEnrollmentStatus, FacePose } from "@/shared/types/face-attendance";
import { SantriPageShell } from "@/widgets/app-shell/SantriPageShell";
import { FaceCamera } from "@/widgets/face-camera/FaceCamera";

const poses: Array<{ key: FacePose; title: string; instruction: string }> = [
  { key: "front", title: "Hadap lurus", instruction: "Posisikan wajah lurus ke kamera." },
  { key: "left", title: "Sedikit menoleh kiri", instruction: "Arahkan wajah sedikit ke kiri Anda." },
  { key: "right", title: "Sedikit menoleh kanan", instruction: "Arahkan wajah sedikit ke kanan Anda." },
  { key: "up", title: "Sedikit menengadah", instruction: "Angkat dagu sedikit, tetap lihat ke arah kamera." },
  { key: "down", title: "Sedikit menunduk", instruction: "Turunkan dagu sedikit, wajah tetap terlihat jelas." },
];

export function FaceEnrollmentPage() {
  return <SantriPageShell>{() => <FaceEnrollmentContent />}</SantriPageShell>;
}

function FaceEnrollmentContent() {
  const { token } = useAuth();
  const [status, setStatus] = useState<FaceEnrollmentStatus | string>("BelumTerdaftar");
  const [capturedPoses, setCapturedPoses] = useState<FacePose[]>([]);
  const [previews, setPreviews] = useState<Partial<Record<FacePose, string>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const currentPose = poses.find((pose) => !capturedPoses.includes(pose.key));
  const isRegistered = status === "Terdaftar";

  const loadStatus = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetchFaceEnrollmentStatus(token);
      setStatus(response.status);
      setCapturedPoses(response.completedCaptures ?? []);
    } catch (error) {
      setMessage(toUserMessage(error, "Status pendaftaran wajah belum dapat dimuat."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void loadStatus(); }, [token]);

  const progress = useMemo(() => Math.min(capturedPoses.length, poses.length), [capturedPoses]);

  const takeCapture = async (imageData: string) => {
    if (!token || !currentPose) return;
    setMessage(null);
    setIsUploading(true);
    try {
      const response = await uploadFaceEnrollmentCapture(token, currentPose.key, imageData);
      if (!response.accepted) throw new Error(response.message || "Foto belum lolos verifikasi. Pastikan hanya satu wajah terlihat dan pencahayaan cukup.");
      setPreviews((current) => ({ ...current, [currentPose.key]: imageData }));
      setCapturedPoses((current) => current.includes(currentPose.key) ? current : [...current, currentPose.key]);
      setStatus(response.status ?? "DalamProses");
      setMessage("Foto berhasil diverifikasi. Lanjutkan ke pose berikutnya.");
    } catch (error) {
      setMessage(toUserMessage(error, "Foto belum lolos verifikasi. Ambil ulang sesuai panduan."));
    } finally {
      setIsUploading(false);
    }
  };

  const retake = async (pose: FacePose) => {
    if (!token) return;
    setMessage(null);
    setIsUploading(true);
    try {
      await removeFaceEnrollmentCapture(token, pose);
      setCapturedPoses((current) => current.filter((item) => item !== pose));
      setPreviews((current) => { const next = { ...current }; delete next[pose]; return next; });
      setStatus("DalamProses");
      setMessage("Foto dihapus. Ambil ulang pose tersebut untuk melanjutkan.");
    } catch (error) {
      setMessage(toUserMessage(error, "Foto belum dapat dihapus. Coba kembali."));
    } finally {
      setIsUploading(false);
    }
  };

  const complete = async () => {
    if (!token) return;
    setMessage(null);
    setIsCompleting(true);
    try {
      const response = await completeFaceEnrollment(token);
      setStatus(response.status);
      setCapturedPoses(response.completedCaptures ?? poses.map((pose) => pose.key));
      setMessage(response.status === "Terdaftar" ? "Pendaftaran wajah selesai dan status Anda sudah Terdaftar." : "Pendaftaran masih perlu ditinjau backend.");
    } catch (error) {
      setMessage(toUserMessage(error, "Pendaftaran belum dapat diselesaikan. Pastikan semua foto sudah valid."));
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Face recognition</p>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900">Daftarkan Wajah</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">Daftarkan wajah Anda sendiri dengan lima pose. Identitas diproses backend menggunakan SantriId, bukan nama.</p>
      </div>
      {message ? <div role="status" className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</div> : null}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold text-gray-900">Status profil wajah</h2><p className="mt-1 text-sm text-gray-600">Status diperbarui dari backend.</p></div><StatusBadge status={status} /></div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${(progress / 5) * 100}%` }} /></div>
        <p className="mt-2 text-sm font-medium text-gray-700">{isLoading ? "Memuat status..." : `${progress}/5 foto terverifikasi`}</p>
      </section>
      {!isRegistered && !isLoading ? <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]"><FaceCamera onCapture={takeCapture} isBusy={isUploading} captureLabel={`Ambil foto ${progress + 1}/5`} guidance={currentPose ? `Langkah ${progress + 1}/5 — ${currentPose.title}: ${currentPose.instruction}` : undefined} /><section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><h2 className="font-semibold text-gray-900">Lima pose wajib</h2><div className="mt-4 space-y-3">{poses.map((pose, index) => { const captured = capturedPoses.includes(pose.key); return <div key={pose.key} className="rounded-xl border border-gray-100 bg-gray-50 p-3"><div className="flex items-start justify-between gap-2"><div><p className="text-sm font-semibold text-gray-900">{index + 1}. {pose.title}</p><p className="mt-1 text-xs leading-5 text-gray-600">{pose.instruction}</p></div>{captured ? <button type="button" disabled={isUploading} onClick={() => void retake(pose.key)} className="text-xs font-semibold text-emerald-700 hover:text-emerald-900">Ambil ulang</button> : <span className="text-xs font-medium text-gray-400">Menunggu</span>}</div>{previews[pose.key] ? <img src={previews[pose.key]} alt={`Preview ${pose.title}`} className="mt-3 h-16 w-24 rounded-lg object-cover" /> : null}</div>; })}</div>{progress === 5 ? <button type="button" onClick={() => void complete()} disabled={isCompleting || isUploading} className="mt-5 w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-emerald-300">{isCompleting ? "Menyelesaikan pendaftaran..." : "Selesaikan Pendaftaran Wajah"}</button> : null}</section></div> : null}
      {isRegistered ? <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900"><h2 className="text-lg font-semibold">Wajah Anda sudah terdaftar</h2><p className="mt-2 text-sm">Profil wajah siap digunakan untuk presensi sesuai sesi yang dibuka petugas.</p></section> : null}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = { BelumTerdaftar: "Belum Terdaftar", DalamProses: "Dalam Proses", Terdaftar: "Terdaftar", PerluDaftarUlang: "Perlu Daftar Ulang" };
  const tone = status === "Terdaftar" ? "bg-emerald-100 text-emerald-800" : status === "PerluDaftarUlang" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800";
  return <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${tone}`}>{labels[status] ?? status}</span>;
}

function toUserMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) return error.status === 503 ? "Layanan verifikasi wajah sedang tidak tersedia. Foto tidak dicatat sebagai hadir atau pendaftaran." : error.message;
  return error instanceof Error ? error.message : fallback;
}
