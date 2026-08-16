export type FaceEnrollmentStatus = "BelumTerdaftar" | "DalamProses" | "Terdaftar" | "PerluDaftarUlang";

export type FacePose = "front" | "left" | "right" | "up" | "down";

export type FaceEnrollmentStatusResponse = {
  status: FaceEnrollmentStatus | string;
  completedCaptures: FacePose[];
  requiredCaptures: number;
};

export type FaceCaptureResponse = {
  accepted: boolean;
  message?: string;
  status?: FaceEnrollmentStatus | string;
};

export type FaceAttendanceClass = { id: string; name: string };
export type FaceAttendanceActivity = { id: string; name: string };
export type FaceAttendanceTime = { id: string; label: string };

export type FaceSessionOptionsResponse = {
  classes: FaceAttendanceClass[];
};

export type FaceOfficerVerificationResponse = {
  verified: boolean;
  message?: string;
};

export type FaceSession = {
  id: string;
  classId: string;
  className: string;
  activityId: string;
  activityName: string;
  timeId: string;
  timeLabel: string;
  status: "Open" | "Closed" | string;
  hadirCount: number;
  belumHadirCount: number;
  reviewCount: number;
  sessionCode?: string | null;
  qrCodeUrl?: string | null;
};

export type FaceCheckInResponse = {
  outcome: "success" | "not_enrolled" | "unrecognized" | "low_confidence" | "multiple_faces" | "session_unavailable" | "already_checked_in" | "review_required" | string;
  message?: string;
  attendanceRecorded?: boolean;
};
