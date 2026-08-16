import { http } from "@/shared/lib/http";
import type {
  FaceCaptureResponse,
  FaceCheckInResponse,
  FaceEnrollmentStatusResponse,
  FaceSession,
} from "@/shared/types/face-attendance";

const enrollmentBasePath = "/api/v1/face-enrollment/me";
const basePath = "/api/v1/face-attendance";

export function fetchFaceEnrollmentStatus(accessToken: string) {
  return http<FaceEnrollmentStatusResponse>(enrollmentBasePath, { accessToken });
}

export async function uploadFaceEnrollmentCapture(accessToken: string, captureOrder: number, imageData: string) {
  const photo = await imageDataToFile(imageData, `capture-${captureOrder}.jpg`);
  const body = new FormData();
  body.append("photo", photo);
  body.append("captureOrder", String(captureOrder));

  return http<FaceCaptureResponse>(`${enrollmentBasePath}/captures`, {
    method: "POST",
    accessToken,
    body,
  });
}

export function removeFaceEnrollmentCapture(accessToken: string, captureOrder: number) {
  return http<FaceEnrollmentStatusResponse>(`${enrollmentBasePath}/captures/${captureOrder}`, { method: "DELETE", accessToken });
}

export function completeFaceEnrollment(accessToken: string) {
  return http<FaceEnrollmentStatusResponse>(`${enrollmentBasePath}/complete`, { method: "POST", accessToken });
}

export function resetFaceEnrollment(accessToken: string) {
  return http<void>(enrollmentBasePath, { method: "DELETE", accessToken });
}

export function createFaceSession(accessToken: string, payload: { kelas: string; kegiatan: string; waktu: string; tanggal: string }) {
  return http<FaceSession>(`${basePath}/sessions`, {
    method: "POST",
    accessToken,
    body: JSON.stringify(payload),
  });
}

export async function verifyFaceOfficer(accessToken: string, sessionId: string, imageData: string) {
  const body = new FormData();
  body.append("photo", await imageDataToFile(imageData, "verifikasi-petugas.jpg"));
  return http<FaceSession>(`${basePath}/sessions/${encodeURIComponent(sessionId)}/verify-opener`, {
    method: "POST",
    accessToken,
    body,
  });
}

export function fetchActiveFaceSession(accessToken: string) {
  return http<FaceSession | null>(`${basePath}/sessions/active`, { accessToken });
}

export function closeFaceSession(accessToken: string, sessionId: string) {
  return http<FaceSession>(`${basePath}/sessions/${encodeURIComponent(sessionId)}/close`, { method: "POST", accessToken });
}

export async function checkInByFace(accessToken: string, sessionId: string, imageData: string) {
  const body = new FormData();
  body.append("photo", await imageDataToFile(imageData, "presensi-wajah.jpg"));
  return http<FaceCheckInResponse>(`${basePath}/sessions/${encodeURIComponent(sessionId)}/check-in`, {
    method: "POST",
    accessToken,
    body,
  });
}

export function isKtbTeam(team: string | null | undefined): boolean {
  const normalized = (team ?? "").toLocaleLowerCase("id-ID").replace(/[^a-z]/g, "");
  return normalized === "ktb" || normalized === "ketertiban" || normalized.includes("ketertiban");
}

export function isFaceSessionOfficer(role: string, team?: string | null): boolean {
  return ["Admin", "DewanGuru", "Pengurus"].includes(role) || (role === "Santri" && isKtbTeam(team));
}

async function imageDataToFile(imageData: string, fileName: string): Promise<File> {
  const response = await fetch(imageData);
  const blob = await response.blob();
  return new File([blob], fileName, { type: blob.type || "image/jpeg" });
}
