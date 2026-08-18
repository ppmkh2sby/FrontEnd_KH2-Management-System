const maximumImageDimension = 1280;
const maximumCameraFileBytes = 15 * 1024 * 1024;

export function canUseLiveCamera(): boolean {
  const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  return (window.isSecureContext || isLocalhost) && Boolean(navigator.mediaDevices?.getUserMedia);
}

export function getLiveCameraUnavailableMessage(): string {
  const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  if (!window.isSecureContext && !isLocalhost) {
    return "Preview kamera langsung memerlukan HTTPS. Anda tetap dapat mengambil foto dengan kamera perangkat di bawah.";
  }

  return "Browser ini tidak mendukung preview kamera langsung. Gunakan tombol ambil foto dengan kamera perangkat di bawah.";
}

export function getCameraErrorMessage(error: unknown): string {
  const errorName = error instanceof DOMException
    ? error.name
    : typeof error === "object" && error !== null && "name" in error && typeof error.name === "string"
      ? error.name
      : null;

  if (!errorName) {
    return "Kamera belum dapat digunakan. Periksa koneksi perangkat lalu coba kembali.";
  }

  switch (errorName) {
    case "NotAllowedError":
    case "SecurityError":
      return "Izin kamera ditolak. Izinkan kamera pada browser untuk melanjutkan.";
    case "NotFoundError":
      return "Kamera tidak ditemukan pada perangkat ini.";
    case "NotReadableError":
      return "Kamera sedang digunakan aplikasi lain. Tutup aplikasi tersebut lalu coba lagi.";
    case "OverconstrainedError":
      return "Kamera perangkat tidak mendukung pengaturan yang diperlukan.";
    default:
      return "Kamera belum dapat diakses. Silakan coba kembali.";
  }
}

export async function startUserCamera(video: HTMLVideoElement): Promise<MediaStream> {
  if (!canUseLiveCamera()) {
    throw new Error(getLiveCameraUnavailableMessage());
  }

  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
  video.srcObject = stream;
  await video.play();
  return stream;
}

export function captureCameraFrame(video: HTMLVideoElement): string {
  if (!video.videoWidth || !video.videoHeight) {
    throw new Error("Kamera belum siap. Tunggu sebentar lalu ambil foto kembali.");
  }

  return renderCameraImage(video, video.videoWidth, video.videoHeight);
}

export async function captureCameraFile(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Pilih foto dengan format gambar yang didukung.");
  }
  if (file.size > maximumCameraFileBytes) {
    throw new Error("Ukuran foto terlalu besar. Ambil ulang foto dengan kamera perangkat.");
  }

  const sourceUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("Foto tidak dapat dibaca. Ambil ulang foto dengan kamera perangkat."));
      element.src = sourceUrl;
    });

    if (!image.naturalWidth || !image.naturalHeight) {
      throw new Error("Foto tidak memiliki ukuran yang valid. Ambil ulang foto.");
    }
    return renderCameraImage(image, image.naturalWidth, image.naturalHeight);
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

function renderCameraImage(source: CanvasImageSource, sourceWidth: number, sourceHeight: number): string {
  const scale = Math.min(1, maximumImageDimension / Math.max(sourceWidth, sourceHeight));
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Browser tidak dapat menyiapkan foto dari kamera.");
  }

  context.drawImage(source, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.88);
}
