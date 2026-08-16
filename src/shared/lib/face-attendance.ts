import { http } from "@/shared/lib/http";
import type {
  FaceAttendanceActivity,
  FaceAttendanceClass,
  FaceAttendanceTime,
  FaceCaptureResponse,
  FaceCheckInResponse,
  FaceEnrollmentStatusResponse,
  FaceOfficerVerificationResponse,
  FacePose,
  FaceSession,
  FaceSessionOptionsResponse,
} from "@/shared/types/face-attendance";

const basePath = "/api/v1/face-attendance";

export function fetchFaceEnrollmentStatus(accessToken: string) {
  return http<FaceEnrollmentStatusResponse>(`${basePath}/enrollment/status`, { accessToken });
}

export function uploadFaceEnrollmentCapture(accessToken: string, pose: FacePose, imageData: string) {
  return http<FaceCaptureResponse>(`${basePath}/enrollment/captures`, {
    method: "POST",
    accessToken,
    body: JSON.stringify({ pose, imageData }),
  });
}

export function removeFaceEnrollmentCapture(accessToken: string, pose: FacePose) {
  return http<void>(`${basePath}/enrollment/captures/${pose}`, { method: "DELETE", accessToken });
}

export function completeFaceEnrollment(accessToken: string) {
  return http<FaceEnrollmentStatusResponse>(`${basePath}/enrollment/complete`, { method: "POST", accessToken });
}

export function fetchFaceSessionOptions(accessToken: string) {
  return http<FaceSessionOptionsResponse>(`${basePath}/session-options`, { accessToken });
}

export function fetchFaceActivities(accessToken: string, classId: string) {
  return http<{ activities: FaceAttendanceActivity[] }>(`${basePath}/session-options/classes/${encodeURIComponent(classId)}/activities`, { accessToken });
}

export function fetchFaceTimes(accessToken: string, classId: string, activityId: string) {
  const query = new URLSearchParams({ classId, activityId });
  return http<{ times: FaceAttendanceTime[] }>(`${basePath}/session-options/times?${query.toString()}`, { accessToken });
}

export function verifyFaceOfficer(accessToken: string, payload: { classId: string; activityId: string; timeId: string; imageData: string }) {
  return http<FaceOfficerVerificationResponse>(`${basePath}/sessions/verify-officer`, {
    method: "POST",
    accessToken,
    body: JSON.stringify(payload),
  });
}

export function openFaceSession(accessToken: string, payload: { classId: string; activityId: string; timeId: string }) {
  return http<FaceSession>(`${basePath}/sessions`, { method: "POST", accessToken, body: JSON.stringify(payload) });
}

export function fetchActiveFaceSession(accessToken: string) {
  return http<FaceSession | null>(`${basePath}/sessions/active`, { accessToken });
}

export function closeFaceSession(accessToken: string, sessionId: string) {
  return http<FaceSession>(`${basePath}/sessions/${encodeURIComponent(sessionId)}/close`, { method: "POST", accessToken });
}

export function checkInByFace(accessToken: string, sessionId: string, imageData: string) {
  return http<FaceCheckInResponse>(`${basePath}/sessions/${encodeURIComponent(sessionId)}/check-in`, {
    method: "POST",
    accessToken,
    body: JSON.stringify({ imageData }),
  });
}

export function isKtbTeam(team: string | null | undefined): boolean {
  const normalized = (team ?? "").toLocaleLowerCase("id-ID").replace(/[^a-z]/g, "");
  return normalized === "ktb" || normalized === "ketertiban" || normalized.includes("ketertiban");
}

export function isFaceSessionOfficer(role: string, team?: string | null): boolean {
  return ["Admin", "DewanGuru", "Pengurus"].includes(role) || (role === "Santri" && isKtbTeam(team));
}
