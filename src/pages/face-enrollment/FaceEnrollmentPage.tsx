import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";
import { completeFaceEnrollment, fetchFaceEnrollmentStatus, resetFaceEnrollment, uploadFaceEnrollmentCapture } from "@/shared/lib/face-attendance";
import { ApiError } from "@/shared/lib/http";
import type { FaceEnrollmentStatus, FaceEnrollmentStatusResponse, FacePose } from "@/shared/types/face-attendance";
import { AppIcon } from "@/shared/ui/AppIcon";
import { SantriPageShell } from "@/widgets/app-shell/SantriPageShell";
import { RolePageShell } from "@/widgets/app-shell/RolePageShell";
import { FaceEnrollmentCamera, type EnrollmentPose } from "@/widgets/face-camera/FaceEnrollmentCamera";

const poses: EnrollmentPose[] = [
  { key: "front", shortLabel: "Depan", title: "Hadap depan", instruction: "Tahan posisi." },
  { key: "left", shortLabel: "Kiri", title: "Putar ke kiri", instruction: "Tahan posisi." },
  { key: "right", shortLabel: "Kanan", title: "Putar ke kanan", instruction: "Tahan posisi." },
  { key: "up", shortLabel: "Atas", title: "Angkat dagu", instruction: "Tahan posisi." },
  { key: "down", shortLabel: "Bawah", title: "Turunkan dagu", instruction: "Tahan posisi." },
];

export function FaceEnrollmentPage() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "Santri") {
    return <SantriPageShell contentPanelClassName="min-h-[calc(100vh-1.5rem)] lg:min-h-[calc(100vh-2.5rem)]">{() => <FaceEnrollmentContent />}</SantriPageShell>;
  }
  if (user.role === "DewanGuru") {
    return <RolePageShell allowedRoles={["DewanGuru"]} contentPanelClassName="min-h-[calc(100vh-1.5rem)] lg:min-h-[calc(100vh-2.5rem)]"><FaceEnrollmentContent /></RolePageShell>;
  }
  return <Navigate to="/dashboard" replace />;
}

function FaceEnrollmentContent() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<FaceEnrollmentStatus | string>("belum-terdaftar");
  const [capturedPoses, setCapturedPoses] = useState<FacePose[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [verifiedStep, setVerifiedStep] = useState<number | null>(null);
  const [scannerFeedback, setScannerFeedback] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const currentPose = poses.find((pose) => !capturedPoses.includes(pose.key));
  const isRegistered = status === "terdaftar";
  const progress = useMemo(() => Math.min(capturedPoses.length, poses.length), [capturedPoses]);

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
      setMessage(response.rejectionReason ?? null);
    } catch (error) {
      setMessage(toUserMessage(error, "Status pendaftaran wajah belum dapat dimuat."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void loadStatus(); }, [token]);

  const finishEnrollment = async () => {
    if (!token) return;
    setIsCompleting(true);
    try {
      const response = await completeFaceEnrollment(token);
      applyEnrollmentStatus(response);
      if (response.status === "terdaftar") {
        setIsScannerOpen(false);
        setMessage(null);
      } else {
        setScannerFeedback(response.rejectionReason || "Pendaftaran belum dapat diselesaikan. Coba kembali.");
      }
    } catch (error) {
      const errorMessage = toUserMessage(error, "Pendaftaran belum dapat diselesaikan. Coba kembali.");
      setScannerFeedback(errorMessage);
      setMessage(errorMessage);
      setIsScannerOpen(false);
    } finally {
      setIsCompleting(false);
    }
  };

  const takeCapture = async (imageData: string) => {
    if (!token || !currentPose) return;
    setScannerFeedback(null);
    setIsUploading(true);
    try {
      const captureOrder = poses.findIndex((pose) => pose.key === currentPose.key) + 1;
      const response = await uploadFaceEnrollmentCapture(token, captureOrder, imageData);
      setCapturedPoses((current) => current.includes(currentPose.key) ? current : [...current, currentPose.key]);
      setStatus(response.status);
      const acceptedCount = Math.min(response.captureCount, poses.length);
      setVerifiedStep(acceptedCount);
      await wait(900);
      setVerifiedStep(null);
      if (acceptedCount >= poses.length) await finishEnrollment();
    } catch {
      setScannerFeedback("Posisi belum sesuai.");
    } finally {
      setIsUploading(false);
    }
  };

  const reset = async () => {
    if (!token) return;
    setMessage(null);
    setIsCompleting(true);
    try {
      await resetFaceEnrollment(token);
      await loadStatus();
    } catch (error) {
      setMessage(toUserMessage(error, "Profil wajah belum dapat dihapus. Coba kembali."));
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) return <LoadingState />;
  if (isRegistered) return <EnrollmentSuccess isResetting={isCompleting} onReset={reset} onDone={() => navigate("/dashboard")} />;

  const canOpenScanner = Boolean(currentPose) && progress < poses.length;

  return (
    <>
      <div className="relative mx-auto grid min-h-[calc(100vh-8rem)] max-w-5xl place-items-center overflow-hidden rounded-[2rem] bg-[linear-gradient(145deg,#f7fbf8_0%,#edf7f1_48%,#e3f2e9_100%)] px-5 py-12 text-forest-950 sm:px-10">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-forest-700/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.045] [background-image:linear-gradient(rgba(8,30,20,.9)_1px,transparent_1px),linear-gradient(90deg,rgba(8,30,20,.9)_1px,transparent_1px)] [background-size:32px_32px]" />

        <section className="relative z-10 w-full max-w-xl text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-[1.75rem] border border-white bg-white/80 text-emerald-700 shadow-[0_22px_55px_-28px_rgba(6,78,59,0.45)] backdrop-blur"><FaceGlyph /></div>
          <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-700">Identitas biometrik</p>
          <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-[-0.04em] sm:text-5xl">{progress > 0 ? "Lanjutkan pendaftaran wajah?" : "Daftarkan wajah Anda?"}</h1>
          <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-forest-900/65 sm:text-base">Lima pose singkat membantu sistem mengenali Anda dengan lebih akurat saat melakukan presensi.</p>

          {progress > 0 ? (
            <div className="mx-auto mt-7 max-w-sm rounded-2xl border border-emerald-200/70 bg-white/70 px-5 py-4 backdrop-blur">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-800"><span>Progres tersimpan</span><span>{progress}/{poses.length}</span></div>
              <div className="mt-3 flex gap-1.5">{poses.map((pose, index) => <span key={pose.key} className={`h-2 flex-1 rounded-full ${index < progress ? "bg-emerald-500" : "bg-emerald-100"}`} />)}</div>
            </div>
          ) : null}

          {message ? <p role="alert" className="mx-auto mt-5 max-w-md rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">{message}</p> : null}

          <div className="mx-auto mt-8 grid max-w-sm gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => { setScannerFeedback(null); if (canOpenScanner) setIsScannerOpen(true); else void finishEnrollment(); }} disabled={isCompleting} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-forest-800 px-6 text-sm font-bold text-white shadow-[0_16px_32px_-18px_rgba(8,30,20,0.8)] transition hover:bg-forest-700 active:scale-[0.99] disabled:opacity-50">
              {isCompleting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <AppIcon name="check" className="h-5 w-5" />}
              {progress === 0 ? "Ya, mulai" : progress < poses.length ? "Ya, lanjutkan" : "Selesaikan"}
            </button>
            <button type="button" onClick={() => navigate("/dashboard")} className="min-h-14 rounded-2xl border border-forest-900/10 bg-white/70 px-6 text-sm font-bold text-forest-900 transition hover:bg-white">Nanti saja</button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-forest-900/45"><AppIcon name="shield" className="h-4 w-4" /><span>Foto diproses secara aman untuk akun yang sedang aktif</span></div>
        </section>
      </div>

      {isScannerOpen && currentPose ? (
        <FaceEnrollmentCamera pose={currentPose} step={progress + 1} totalSteps={poses.length} verifiedCount={progress} isAnalyzing={isUploading || isCompleting} verifiedStep={verifiedStep} feedback={scannerFeedback} onCapture={takeCapture} onClose={() => setIsScannerOpen(false)} />
      ) : null}
    </>
  );
}

function LoadingState() {
  return <div className="grid min-h-[60vh] place-items-center"><div className="text-center"><span className="mx-auto block h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" /><p className="mt-4 text-sm font-medium text-gray-500">Memeriksa profil wajah...</p></div></div>;
}

function EnrollmentSuccess({ isResetting, onReset, onDone }: { isResetting: boolean; onReset: () => Promise<void>; onDone: () => void }) {
  return (
    <div className="relative mx-auto grid min-h-[calc(100vh-8rem)] max-w-5xl place-items-center overflow-hidden rounded-[2rem] bg-[linear-gradient(145deg,#ecfdf5_0%,#dff7e8_55%,#cdebd9_100%)] px-5 py-12 text-forest-950">
      <div className="absolute h-80 w-80 rounded-full border border-emerald-400/15" />
      <div className="absolute h-60 w-60 rounded-full border border-emerald-400/20" />
      <section className="relative z-10 max-w-lg text-center">
        <div className="face-verified-pop mx-auto grid h-24 w-24 place-items-center rounded-full bg-emerald-600 text-white shadow-[0_24px_60px_-24px_rgba(5,150,105,0.8)]"><AppIcon name="check" className="h-12 w-12" /></div>
        <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-700">Pendaftaran selesai</p>
        <h1 className="mt-3 font-display text-4xl leading-tight tracking-[-0.04em] sm:text-5xl">Berhasil! Wajah Anda sudah terdaftar.</h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-forest-900/65 sm:text-base">Profil wajah sudah aktif dan siap digunakan untuk presensi yang tersedia.</p>
        <button type="button" onClick={onDone} className="mt-8 min-h-14 w-full max-w-sm rounded-2xl bg-forest-800 px-6 text-sm font-bold text-white shadow-lg transition hover:bg-forest-700">Kembali ke dashboard</button>
        <button type="button" onClick={() => void onReset()} disabled={isResetting} className="mt-3 block w-full text-sm font-semibold text-forest-900/50 transition hover:text-rose-700 disabled:opacity-40">{isResetting ? "Menghapus profil..." : "Daftarkan ulang wajah"}</button>
      </section>
    </div>
  );
}

function FaceGlyph() {
  return <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-10 w-10"><path d="M10 4H7a3 3 0 0 0-3 3v3M22 4h3a3 3 0 0 1 3 3v3M10 28H7a3 3 0 0 1-3-3v-3M22 28h3a3 3 0 0 0 3-3v-3"/><path d="M10.5 14.5h.01M21.5 14.5h.01M12 21c2.4 1.8 5.6 1.8 8 0"/><path d="M9 12.5C9 8.91 11.91 6 15.5 6h1C20.09 6 23 8.91 23 12.5V18a7 7 0 0 1-14 0v-5.5Z"/></svg>;
}

function toUserMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) return error.status === 503 ? "Layanan verifikasi wajah sedang tidak tersedia. Foto tidak dicatat sebagai hadir atau pendaftaran." : error.message;
  return error instanceof Error ? error.message : fallback;
}

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));
}
