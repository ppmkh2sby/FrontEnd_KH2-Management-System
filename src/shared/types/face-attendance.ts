export type FacePose = "front" | "left" | "right" | "up" | "down";

export type FaceProfileEnrollmentResponse = {
  id: string;
  status: string;
  sampleCount: number;
  modelName: string;
  modelVersion: string;
  enrolledAtUtc: string;
};

export type FaceRecognitionResponse = {
  isRecognized: boolean;
  santriId: string | null;
  similarity: number | null;
  reason: string | null;
};

export type SantriFaceVerificationResponse = {
  verified: boolean;
  similarity: number | null;
  reason: string | null;
};

export type MyFaceEnrollmentStatus = {
  isEnrolled: boolean;
  status: string | null;
  sampleCount: number;
  modelName: string | null;
  modelVersion: string | null;
  enrolledAtUtc: string | null;
};
