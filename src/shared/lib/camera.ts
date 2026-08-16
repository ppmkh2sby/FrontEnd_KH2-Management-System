export function getCameraErrorMessage(error: unknown): string {
  if (!(error instanceof DOMException)) {
    return "Kamera belum dapat digunakan. Periksa koneksi perangkat lalu coba kembali.";
  }

  switch (error.name) {
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
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("Browser ini belum mendukung akses kamera. Gunakan browser versi terbaru.");
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

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Browser tidak dapat menyiapkan foto dari kamera.");
  }

  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.88);
}
