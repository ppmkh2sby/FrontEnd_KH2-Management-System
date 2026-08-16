import { useEffect, useRef, useState, type ChangeEvent } from "react";

import { canUseLiveCamera, captureCameraFile, captureCameraFrame, getCameraErrorMessage, getLiveCameraUnavailableMessage, startUserCamera } from "@/shared/lib/camera";

type FaceCameraProps = {
  onCapture: (imageData: string) => void | Promise<void>;
  isBusy?: boolean;
  captureLabel?: string;
  guidance?: string;
};

export function FaceCamera({ onCapture, isBusy = false, captureLabel = "Ambil foto", guidance }: FaceCameraProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const liveCameraSupported = canUseLiveCamera();

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsCameraActive(false);
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const startCamera = async () => {
    if (!videoRef.current || streamRef.current) return;
    setError(null);
    setIsStarting(true);
    try {
      streamRef.current = await startUserCamera(videoRef.current);
      setIsCameraActive(true);
    } catch (cameraError) {
      setError(cameraError instanceof Error && !(cameraError instanceof DOMException) ? cameraError.message : getCameraErrorMessage(cameraError));
    } finally {
      setIsStarting(false);
    }
  };

  useEffect(() => () => stopCamera(), []);

  const capture = async () => {
    if (!videoRef.current) return;
    try {
      setError(null);
      await onCapture(captureCameraFrame(videoRef.current));
    } catch (captureError) {
      setError(captureError instanceof Error ? captureError.message : "Foto belum dapat diambil. Coba kembali.");
    }
  };

  const captureFromDeviceCamera = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      setError(null);
      await onCapture(await captureCameraFile(file));
    } catch (captureError) {
      setError(captureError instanceof Error ? captureError.message : "Foto belum dapat diproses. Coba kembali.");
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="text-base font-semibold text-gray-900">Kamera verifikasi</h2>
        <p className="mt-1 text-sm leading-6 text-gray-600">Kamera hanya digunakan untuk foto yang Anda kirim ke backend. Foto tidak disimpan di perangkat ini.</p>
      </div>
      <div className="p-5">
        <div className="relative overflow-hidden rounded-xl bg-slate-950 aspect-video">
          <video ref={videoRef} className={`h-full w-full object-cover ${isCameraActive ? "" : "hidden"}`} playsInline muted />
          {!isCameraActive ? (
            <div className="absolute inset-0 grid place-items-center p-6 text-center text-slate-200">
              <div>
                <p className="font-semibold">{liveCameraSupported ? "Aktifkan kamera untuk melanjutkan" : "Gunakan kamera perangkat untuk melanjutkan"}</p>
                <p className="mt-2 text-sm text-slate-300">{liveCameraSupported ? "Browser akan meminta izin kamera. Pastikan wajah terlihat jelas dan hanya satu orang di dalam frame." : getLiveCameraUnavailableMessage()}</p>
              </div>
            </div>
          ) : null}
          {isCameraActive ? <div className="pointer-events-none absolute inset-[12%_25%] rounded-[48%] border-2 border-white/80 shadow-[0_0_0_999px_rgba(0,0,0,0.14)]" /> : null}
        </div>
        {guidance ? <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">{guidance}</p> : null}
        {error ? <p role="alert" className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
        <div className="mt-4 flex flex-wrap gap-3">
          {!isCameraActive && liveCameraSupported ? <button type="button" onClick={() => void startCamera()} disabled={isStarting} className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-emerald-300">{isStarting ? "Menghubungkan kamera..." : "Izinkan & aktifkan kamera"}</button> : null}
          {isCameraActive ? <button type="button" onClick={() => void capture()} disabled={isBusy} className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-emerald-300">{isBusy ? "Mengirim foto..." : captureLabel}</button> : null}
          {isCameraActive ? <button type="button" onClick={stopCamera} disabled={isBusy} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Matikan kamera</button> : null}
          {!isCameraActive ? <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isBusy} className="rounded-lg border border-emerald-300 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-60">Ambil foto dengan kamera perangkat</button> : null}
          <input ref={fileInputRef} type="file" accept="image/*" capture="user" className="sr-only" onChange={(event) => void captureFromDeviceCamera(event)} />
        </div>
      </div>
    </section>
  );
}
