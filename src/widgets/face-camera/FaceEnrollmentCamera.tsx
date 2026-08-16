import { useEffect, useRef, useState, type ChangeEvent } from "react";

import {
  canUseLiveCamera,
  captureCameraFile,
  captureCameraFrame,
  getCameraErrorMessage,
  getLiveCameraUnavailableMessage,
  startUserCamera,
} from "@/shared/lib/camera";
import type { FacePose } from "@/shared/types/face-attendance";
import { AppIcon } from "@/shared/ui/AppIcon";

export type EnrollmentPose = {
  key: FacePose;
  title: string;
  instruction: string;
  shortLabel: string;
};

type FaceEnrollmentCameraProps = {
  pose: EnrollmentPose;
  step: number;
  totalSteps: number;
  verifiedCount: number;
  isAnalyzing: boolean;
  verifiedStep: number | null;
  feedback: string | null;
  onCapture: (imageData: string) => void | Promise<void>;
  onClose: () => void;
};

export function FaceEnrollmentCamera({
  pose,
  step,
  totalSteps,
  verifiedCount,
  isAnalyzing,
  verifiedStep,
  feedback,
  onCapture,
  onClose,
}: FaceEnrollmentCameraProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isStarting, setIsStarting] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const liveCameraSupported = canUseLiveCamera();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const start = async () => {
      if (!videoRef.current || !liveCameraSupported) {
        setIsStarting(false);
        if (!liveCameraSupported) setCameraError(getLiveCameraUnavailableMessage());
        return;
      }

      try {
        streamRef.current = await startUserCamera(videoRef.current);
        setIsCameraActive(true);
      } catch (error) {
        setCameraError(error instanceof Error && !(error instanceof DOMException) ? error.message : getCameraErrorMessage(error));
      } finally {
        setIsStarting(false);
      }
    };

    void start();

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      document.body.style.overflow = previousOverflow;
    };
  }, [liveCameraSupported]);

  const capture = async () => {
    if (!videoRef.current || !isCameraActive || isAnalyzing) return;
    setCameraError(null);
    try {
      await onCapture(captureCameraFrame(videoRef.current));
    } catch (error) {
      setCameraError(error instanceof Error ? error.message : "Foto belum dapat dianalisis. Coba kembali.");
    }
  };

  useEffect(() => {
    if (!isCameraActive || isAnalyzing || verifiedStep !== null || cameraError) return;

    // Give the user enough time to follow the new direction. Failed poses retry
    // more slowly so the face service remains comfortably below its rate limit.
    const timer = window.setTimeout(() => {
      void capture();
    }, feedback ? 3_800 : 2_200);

    return () => window.clearTimeout(timer);
  }, [cameraError, feedback, isAnalyzing, isCameraActive, pose.key, verifiedStep]);

  const captureFromDevice = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || isAnalyzing) return;

    setCameraError(null);
    try {
      await onCapture(await captureCameraFile(file));
    } catch (error) {
      setCameraError(error instanceof Error ? error.message : "Foto belum dapat dianalisis. Coba kembali.");
    }
  };

  const guideTone = verifiedStep !== null
    ? "border-emerald-300 shadow-[0_0_38px_rgba(52,211,153,0.42),0_0_0_9999px_rgba(0,0,0,0.2)]"
    : feedback
      ? "border-amber-300 shadow-[0_0_34px_rgba(252,211,77,0.32),0_0_0_9999px_rgba(0,0,0,0.32)]"
      : "border-white/90 shadow-[0_0_28px_rgba(255,255,255,0.18),0_0_0_9999px_rgba(0,0,0,0.3)]";

  return (
    <div className="face-camera-enter fixed inset-0 z-[100] min-h-[100dvh] overflow-hidden bg-[#06140e] text-white">
      <video ref={videoRef} className={`absolute inset-0 h-full w-full scale-x-[-1] object-cover transition-opacity duration-500 ${isCameraActive ? "opacity-100" : "opacity-0"}`} playsInline muted />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_15%,rgba(3,12,8,0.08)_50%,rgba(3,12,8,0.56)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/65 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/70 to-transparent" />

      <header className="absolute inset-x-0 top-0 z-20 px-5 pb-3 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <button type="button" onClick={onClose} disabled={isAnalyzing} className="inline-flex h-9 w-9 items-center justify-center text-white/75 transition hover:text-white disabled:opacity-40" aria-label="Tutup kamera">
            <AppIcon name="x" className="h-5 w-5" />
          </button>
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">Verifikasi wajah</p>
            <p className="mt-1 text-sm font-semibold text-white">{step} / {totalSteps}</p>
          </div>
          <span className="w-9" aria-hidden="true" />
        </div>
        <div className="mx-auto mt-3 flex max-w-xs gap-1" aria-label={`${verifiedCount} dari ${totalSteps} pose terverifikasi`}>
          {Array.from({ length: totalSteps }, (_, index) => <span key={index} className={`h-1 flex-1 rounded-full transition-all duration-500 ${index < verifiedCount ? "bg-emerald-400" : index === step - 1 ? "bg-white" : "bg-white/25"}`} />)}
        </div>
      </header>

      <main className="absolute inset-0 flex items-center justify-center px-5 pb-28 pt-20 sm:pb-32">
        {!isCameraActive ? (
          <div className="z-10 max-w-sm rounded-3xl border border-white/10 bg-black/40 p-6 text-center backdrop-blur-xl">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-400/15 text-emerald-200"><CameraGlyph /></div>
            <h2 className="mt-4 text-lg font-semibold">{isStarting ? "Menyiapkan kamera..." : "Kamera belum aktif"}</h2>
            <p className="mt-2 text-sm leading-6 text-white/65">{cameraError ?? "Izinkan akses kamera agar proses verifikasi dapat dimulai."}</p>
            {!isStarting ? <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-5 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-forest-900">Gunakan kamera perangkat</button> : null}
          </div>
        ) : (
          <div className="relative h-[min(54vh,520px)] w-[min(74vw,370px)]">
            <div className={`absolute inset-0 rounded-[46%_46%_42%_42%/38%_38%_56%_56%] border-[3px] transition-all duration-500 ${guideTone}`} />
            <div className="face-scan-line absolute left-[8%] right-[8%] top-[16%] h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent shadow-[0_0_12px_rgba(167,243,208,0.9)]" />
            <PoseDirection pose={pose.key} />
            <span className="absolute -left-1 -top-1 h-8 w-8 rounded-tl-[1.75rem] border-l-4 border-t-4 border-emerald-300" />
            <span className="absolute -right-1 -top-1 h-8 w-8 rounded-tr-[1.75rem] border-r-4 border-t-4 border-emerald-300" />
            <span className="absolute -bottom-1 -left-1 h-8 w-8 rounded-bl-[1.75rem] border-b-4 border-l-4 border-emerald-300" />
            <span className="absolute -bottom-1 -right-1 h-8 w-8 rounded-br-[1.75rem] border-b-4 border-r-4 border-emerald-300" />
          </div>
        )}
      </main>

      {verifiedStep !== null ? (
        <div className="pointer-events-none absolute inset-x-0 top-[max(5.5rem,calc(env(safe-area-inset-top)+4.5rem))] z-30 flex justify-center px-5">
          <span className="face-verified-pop inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-white shadow-lg"><AppIcon name="check" className="h-4 w-4" /> {verifiedStep}/{totalSteps}</span>
        </div>
      ) : null}

      <footer className="absolute inset-x-0 bottom-0 z-20 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
        <div className="mx-auto max-w-md text-center">
          <p className="text-lg font-semibold text-white">{pose.title}</p>
          <p className="mt-1 text-xs text-white/70">{isAnalyzing ? "Memeriksa wajah..." : feedback ?? pose.instruction}</p>
          <button type="button" onClick={() => void capture()} disabled={!isCameraActive || isAnalyzing || verifiedStep !== null} className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-200 transition hover:text-white disabled:opacity-50">
            {isAnalyzing ? <Spinner /> : <ScanGlyph />}{isAnalyzing ? "Memeriksa" : "Ambil sekarang"}
          </button>
        </div>
      </footer>

      <input ref={fileInputRef} type="file" accept="image/*" capture="user" className="sr-only" onChange={(event) => void captureFromDevice(event)} />
    </div>
  );
}

function PoseDirection({ pose }: { pose: FacePose }) {
  if (pose === "front") return <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/90 bg-emerald-400/70 shadow-[0_0_14px_rgba(52,211,153,0.9)]" />;

  const rotation = pose === "left" ? "rotate-180" : pose === "up" ? "-rotate-90" : pose === "down" ? "rotate-90" : "";
  const position = pose === "left" ? "left-[14%] top-1/2 -translate-y-1/2" : pose === "right" ? "right-[14%] top-1/2 -translate-y-1/2" : pose === "up" ? "left-1/2 top-[13%] -translate-x-1/2" : "bottom-[13%] left-1/2 -translate-x-1/2";
  return <div className={`absolute ${position} grid h-10 w-10 place-items-center rounded-full border border-white/25 bg-black/25 text-white backdrop-blur ${rotation}`}><AppIcon name="arrow-right" className="h-5 w-5" /></div>;
}

function CameraGlyph() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-7 w-7"><path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h2l1.2-2h4.6l1.2 2h2A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Z"/><circle cx="12" cy="12.5" r="3.5"/></svg>;
}

function ScanGlyph() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3"/><path d="M7 12h10"/></svg>;
}

function Spinner() {
  return <span className="h-5 w-5 animate-spin rounded-full border-2 border-forest-950/25 border-t-forest-950" />;
}
