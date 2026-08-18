export type FaceEnrollmentStatus = "belum-terdaftar" | "proses" | "terdaftar" | "ditolak";

export type FacePose = "front" | "left" | "right" | "up" | "down";

export type FaceEnrollmentStatusResponse = {
  status: FaceEnrollmentStatus | string;
  captureCount: number;
  requiredCaptureCount: number;
  guides: Array<{
    sequence: number;
    pose: string;
    captured: boolean;
  }>;
  rejectionReason?: string | null;
};

export type FaceCaptureResponse = {
  sequence: number;
  pose: string;
  captureCount: number;
  status: FaceEnrollmentStatus | string;
};

export type FaceSession = {
  id: string;
  kelas: string;
  kegiatan: string;
  waktu: string;
  tanggal: string;
  openerUserId: string;
  status: "menunggu-verifikasi" | "open" | "closed" | string;
  verifiedAtUtc?: string | null;
  closedAtUtc?: string | null;
  createdAtUtc: string;
};

export type FaceCheckInResponse = {
  status: "accepted" | "review" | string;
  santriId?: string | null;
  confidence?: number | null;
  reason?: string | null;
  presensiId?: string | null;
};
