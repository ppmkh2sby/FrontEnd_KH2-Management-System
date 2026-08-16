import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";
import { completeFaceEnrollment, fetchFaceEnrollmentStatus, removeFaceEnrollmentCapture, resetFaceEnrollment, uploadFaceEnrollmentCapture } from "@/shared/lib/face-attendance";
import { ApiError } from "@/shared/lib/http";
import type { FaceEnrollmentStatus, FaceEnrollmentStatusResponse, FacePose } from "@/shared/types/face-attendance";
import { SantriPageShell } from "@/widgets/app-shell/SantriPageShell";
import { RolePageShell } from "@/widgets/app-shell/RolePageShell";
import { FaceCamera } from "@/widgets/face-camera/FaceCamera";

const poses: Array<{ key: FacePose; title: string; instruction: string }> = [
  { key: "front", title: "Hadap lurus", instruction: "Posisikan wajah lurus ke kamera." },
  { key: "left", title: "Sedikit menoleh kiri", instruction: "Arahkan wajah sedikit ke kiri Anda." },
  { key: "right", title: "Sedikit menoleh kanan", instruction: "Arahkan wajah sedikit ke kanan Anda." },
  { key: "up", title: "Sedikit menengadah", instruction: "Angkat dagu sedikit, tetap lihat ke arah kamera." },
  { key: "down", title: "Sedikit menunduk", instruction: "Turunkan dagu sedikit, wajah tetap terlihat jelas." },
];

export function FaceEnrollmentPage() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "Santri") return <SantriPageShell>{() => <FaceEnrollmentContent />}</SantriPageShell>;
  if (user.role === "DewanGuru") return <RolePageShell allowedRoles={["DewanGuru"]}><FaceEnrollmentContent /></RolePageShell>;
  return <Navigate to="/dashboard" replace />;
}

function FaceEnrollmentContent() {
  const { token } = useAuth();
  const [status, setStatus] = useState<FaceEnrollmentStatus | string>("belum-terdaftar");
  const [capturedPoses, setCapturedPoses] = useState<FacePose[]>([]);
  const [previews, setPreviews] = useState<Partial<Record<FacePose, string>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const currentPose = poses.find((pose) => !capturedPoses.includes(pose.key));
  const isRegistered = status === "terdaftar";

  const applyEnrollmentStatus = (response: FaceEnrollmentStatusResponse) => {
    setStatus(response.status);
    setCapturedPoses(
      (response.guides ?? [])
        .filter((guide) => guide.captured)
        .map((guide) => poses[guide.sequence - 1]?.key)
        .filter((pose): pose is FacePose => Boolean(pose))
    );
  };

  const loadStatus = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetchFaceEnrollmentStatus(token);
      applyEnrollmentStatus(response);
      if (response.rejectionReason) setMessage(response.rejectionReason);
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
      const captureOrder = poses.findIndex((pose) => pose.key === currentPose.key) + 1;
      const response = await uploadFaceEnrollmentCapture(token, captureOrder, imageData);
      setPreviews((current) => ({ ...current, [currentPose.key]: imageData }));
      setCapturedPoses((current) => current.includes(currentPose.key) ? current : [...current, currentPose.key]);
      setStatus(response.status);
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
      const captureOrder = poses.findIndex((item) => item.key === pose) + 1;
      const response = await removeFaceEnrollmentCapture(token, captureOrder);
      applyEnrollmentStatus(response);
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
      applyEnrollmentStatus(response);
      setMessage(response.status === "terdaftar" ? "Pendaftaran wajah selesai dan profil Anda siap dipakai." : response.rejectionReason || "Pendaftaran masih perlu diperbaiki.");
    } catch (error) {
      setMessage(toUserMessage(error, "Pendaftaran belum dapat diselesaikan. Pastikan semua foto sudah valid."));
    } finally {
      setIsCompleting(false);
    }
  };

  const reset = async () => {
    if (!token) return;
    setMessage(null);
    setIsCompleting(true);
    try {
      await resetFaceEnrollment(token);
      setPreviews({});
      await loadStatus();
      setMessage("Profil wajah dihapus. Anda dapat mengambil lima foto baru.");
    } catch (error) {
      setMessage(toUserMessage(error, "Profil wajah belum dapat dihapus. Coba kembali."));
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Face recognition</p>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900">Daftarkan Wajah</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">Daftarkan wajah Anda sendiri dengan lima pose. Identitas diproses aman menggunakan akun yang sedang login, bukan nama.</p>
      </div>
      {message ? <div role="status" className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</div> : null}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold text-gray-900">Status profil wajah</h2><p className="mt-1 text-sm text-gray-600">Status diperbarui dari backend.</p></div><StatusBadge status={status} /></div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${(progress / 5) * 100}%` }} /></div>
        <p className="mt-2 text-sm font-medium text-gray-700">{isLoading ? "Memuat status..." : `${progress}/5 foto terverifikasi`}</p>
      </section>
      {!isRegistered && !isLoading ? <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]"><FaceCamera onCapture={takeCapture} isBusy={isUploading} captureLabel={`Ambil foto ${progress + 1}/5`} guidance={currentPose ? `Langkah ${progress + 1}/5 — ${currentPose.title}: ${currentPose.instruction}` : undefined} /><section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><h2 className="font-semibold text-gray-900">Lima pose wajib</h2><div className="mt-4 space-y-3">{poses.map((pose, index) => { const captured = capturedPoses.includes(pose.key); return <div key={pose.key} className="rounded-xl border border-gray-100 bg-gray-50 p-3"><div className="flex items-start justify-between gap-2"><div><p className="text-sm font-semibold text-gray-900">{index + 1}. {pose.title}</p><p className="mt-1 text-xs leading-5 text-gray-600">{pose.instruction}</p></div>{captured ? <button type="button" disabled={isUploading} onClick={() => void retake(pose.key)} className="text-xs font-semibold text-emerald-700 hover:text-emerald-900">Ambil ulang</button> : <span className="text-xs font-medium text-gray-400">Menunggu</span>}</div>{previews[pose.key] ? <img src={previews[pose.key]} alt={`Preview ${pose.title}`} className="mt-3 h-16 w-24 rounded-lg object-cover" /> : null}</div>; })}</div>{progress === 5 ? <button type="button" onClick={() => void complete()} disabled={isCompleting || isUploading} className="mt-5 w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-emerald-300">{isCompleting ? "Menyelesaikan pendaftaran..." : "Selesaikan Pendaftaran Wajah"}</button> : null}</section></div> : null}
      {isRegistered ? <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900"><h2 className="text-lg font-semibold">Wajah Anda sudah terdaftar</h2><p className="mt-2 text-sm">Profil wajah siap digunakan untuk presensi sesuai sesi yang dibuka petugas.</p><button type="button" onClick={() => void reset()} disabled={isCompleting} className="mt-4 rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-60">Daftarkan ulang wajah</button></section> : null}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = { "belum-terdaftar": "Belum Terdaftar", proses: "Dalam Proses", terdaftar: "Terdaftar", ditolak: "Perlu Perbaikan" };
  const tone = status === "terdaftar" ? "bg-emerald-100 text-emerald-800" : status === "ditolak" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800";
  return <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${tone}`}>{labels[status] ?? status}</span>;
}

function toUserMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) return error.status === 503 ? "Layanan verifikasi wajah sedang tidak tersedia. Foto tidak dicatat sebagai hadir atau pendaftaran." : error.message;
  return error instanceof Error ? error.message : fallback;
}
