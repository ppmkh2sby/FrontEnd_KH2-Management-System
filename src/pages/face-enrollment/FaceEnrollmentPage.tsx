import { useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";
import { enrollCanonicalFaceProfile } from "@/shared/lib/face-attendance";
import { ApiError } from "@/shared/lib/http";
import { AppIcon } from "@/shared/ui/AppIcon";
import { SantriPageShell } from "@/widgets/app-shell/SantriPageShell";
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
  if (user.role !== "Santri") return <Navigate to="/dashboard" replace />;

  return (
    <SantriPageShell contentPanelClassName="min-h-[calc(100vh-1.5rem)] lg:min-h-[calc(100vh-2.5rem)]">
      {() => <FaceEnrollmentContent />}
    </SantriPageShell>
  );
}

function FaceEnrollmentContent() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [images, setImages] = useState<string[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [capturedStep, setCapturedStep] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [completion, setCompletion] = useState<"success" | "already-enrolled" | null>(null);
  const captureLocked = useRef(false);
  const currentPose = poses[images.length];

  const takeCapture = async (imageData: string) => {
    if (captureLocked.current || images.length >= poses.length) return;
    captureLocked.current = true;
    const nextStep = images.length + 1;
    setImages((current) => [...current, imageData]);
    setCapturedStep(nextStep);
    setMessage(null);
    await new Promise<void>((resolve) => window.setTimeout(resolve, 700));
    setCapturedStep(null);
    captureLocked.current = false;
    if (nextStep === poses.length) setIsScannerOpen(false);
  };

  const resetCaptures = () => {
    captureLocked.current = false;
    setImages([]);
    setCapturedStep(null);
    setIsScannerOpen(false);
    setMessage(null);
  };

  const submit = async () => {
    if (!token || images.length !== poses.length || isSubmitting) return;
    setIsSubmitting(true);
    setMessage(null);
    try {
      await enrollCanonicalFaceProfile(token, images);
      setCompletion("success");
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setCompletion("already-enrolled");
      } else {
        setMessage(toUserMessage(error));
        if (error instanceof ApiError && error.status === 400) setImages([]);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (completion) {
    return (
      <div className="relative mx-auto grid min-h-[calc(100vh-8rem)] max-w-5xl place-items-center overflow-hidden rounded-[2rem] bg-[linear-gradient(145deg,#ecfdf5_0%,#dff7e8_55%,#cdebd9_100%)] px-5 py-12 text-forest-950">
        <section className="relative z-10 max-w-lg text-center">
          <div className="face-verified-pop mx-auto grid h-24 w-24 place-items-center rounded-full bg-emerald-600 text-white shadow-[0_24px_60px_-24px_rgba(5,150,105,0.8)]"><AppIcon name="check" className="h-12 w-12" /></div>
          <h1 className="mt-8 font-display text-4xl leading-tight tracking-[-0.04em] sm:text-5xl">
            {completion === "success" ? "Wajah berhasil terdaftar." : "Wajah untuk akun ini sudah terdaftar."}
          </h1>
          <button type="button" onClick={() => navigate("/dashboard")} className="mt-8 min-h-14 w-full max-w-sm rounded-2xl bg-forest-800 px-6 text-sm font-bold text-white shadow-lg transition hover:bg-forest-700">Kembali ke dashboard</button>
        </section>
      </div>
    );
  }

  return (
    <>
      <div className="relative mx-auto grid min-h-[calc(100vh-8rem)] max-w-5xl place-items-center overflow-hidden rounded-[2rem] bg-[linear-gradient(145deg,#f7fbf8_0%,#edf7f1_48%,#e3f2e9_100%)] px-5 py-12 text-forest-950 sm:px-10">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-forest-700/10 blur-3xl" />
        <section className="relative z-10 w-full max-w-xl text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-[1.75rem] border border-white bg-white/80 text-emerald-700 shadow-[0_22px_55px_-28px_rgba(6,78,59,0.45)]"><AppIcon name="verify" className="h-10 w-10" /></div>
          <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-700">Pendaftaran wajah</p>
          <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-[-0.04em] sm:text-5xl">{images.length === poses.length ? "5 foto siap" : "Daftarkan wajah Anda"}</h1>
          <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-forest-900/65 sm:text-base">Ambil lima foto sesuai panduan: depan, kiri, kanan, atas, dan bawah. Foto akan dikirim bersama setelah semuanya siap.</p>
          <div className="mx-auto mt-7 max-w-sm rounded-2xl border border-emerald-200/70 bg-white/70 px-5 py-4">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-800"><span>Foto diambil</span><span>{images.length}/{poses.length}</span></div>
            <div className="mt-3 flex gap-1.5">{poses.map((pose, index) => <span key={pose.key} className={`h-2 flex-1 rounded-full ${index < images.length ? "bg-emerald-500" : "bg-emerald-100"}`} />)}</div>
          </div>
          {message ? <p role="alert" className="mx-auto mt-5 max-w-md rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">{message}</p> : null}
          <div className="mx-auto mt-8 grid max-w-sm gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => images.length === poses.length ? void submit() : setIsScannerOpen(true)} disabled={isSubmitting} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-forest-800 px-6 text-sm font-bold text-white transition hover:bg-forest-700 disabled:opacity-50">
              {isSubmitting ? "Memproses pendaftaran wajah..." : images.length === poses.length ? "Daftarkan wajah" : images.length ? "Lanjutkan foto" : "Mulai ambil foto"}
            </button>
            <button type="button" onClick={() => navigate("/dashboard")} disabled={isSubmitting} className="min-h-14 rounded-2xl border border-forest-900/10 bg-white/70 px-6 text-sm font-bold text-forest-900 transition hover:bg-white disabled:opacity-50">Nanti saja</button>
          </div>
          {images.length > 0 && !isSubmitting ? <button type="button" onClick={resetCaptures} className="mt-5 text-sm font-semibold text-forest-800 underline">Ambil ulang semua foto</button> : null}
        </section>
      </div>
      {isScannerOpen && currentPose ? (
        <FaceEnrollmentCamera pose={currentPose} step={images.length + 1} totalSteps={poses.length} capturedCount={images.length} isCapturing={capturedStep !== null} capturedStep={capturedStep} onCapture={takeCapture} onClose={() => setIsScannerOpen(false)} onReset={resetCaptures} />
      ) : null}
    </>
  );
}

function toUserMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 400) return "Foto belum dapat diproses. Pastikan hanya satu wajah terlihat jelas, pencahayaan cukup, lalu ambil ulang kelima foto.";
    if (error.status === 403) return "Akun ini tidak memiliki akses untuk mendaftarkan wajah.";
    if (error.status === 502) return "Layanan pengenalan wajah memberikan respons yang tidak valid. Silakan coba kembali.";
    if (error.status === 503 || error.status === 504) return "Layanan pengenalan wajah sedang tidak tersedia. Silakan coba kembali.";
    if (error.status === 0) return "Koneksi ke server terputus. Periksa jaringan dan coba kembali.";
    return "Pendaftaran wajah belum berhasil. Silakan coba kembali.";
  }
  return error instanceof Error ? error.message : "Pendaftaran wajah belum berhasil. Silakan coba kembali.";
}
