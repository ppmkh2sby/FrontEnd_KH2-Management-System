import { http } from "@/shared/lib/http";
import type { FaceProfileEnrollmentResponse, FaceRecognitionResponse, MyFaceEnrollmentStatus, SantriFaceVerificationResponse } from "@/shared/types/face-attendance";

const enrollmentPath = "/api/v1/face-profiles/me/enrollment";
const maximumPhotoBytes = 5 * 1024 * 1024;

export async function enrollCanonicalFaceProfile(accessToken: string, images: string[]) {
  if (images.length !== 5) {
    throw new Error("Ambil tepat lima foto wajah sebelum mendaftar.");
  }

  const photos = await Promise.all(images.map((image, index) => imageDataToFile(image, `wajah-${index + 1}.jpg`)));
  if (photos.some((photo) => photo.size > maximumPhotoBytes)) {
    throw new Error("Salah satu foto melebihi 5 MB. Ambil ulang lima foto wajah.");
  }

  const body = new FormData();
  photos.forEach((photo) => body.append("photos", photo));
  return http<FaceProfileEnrollmentResponse>(enrollmentPath, { method: "POST", accessToken, body });
}

export async function recognizeEnrolledFace(accessToken: string, imageData: string) {
  const photo = await imageDataToFile(imageData, "uji-wajah.jpg");
  if (photo.size === 0 || photo.size > maximumPhotoBytes) {
    throw new Error("Ukuran foto tidak valid atau melebihi 5 MB. Ambil foto baru.");
  }

  const body = new FormData();
  body.append("photo", photo);
  return http<FaceRecognitionResponse>("/api/v1/face-recognition", { method: "POST", accessToken, body });
}

export async function verifyMyFace(accessToken: string, imageData: string) {
  const photo = await imageDataToFile(imageData, "uji-wajah-saya.jpg");
  if (photo.size === 0 || photo.size > maximumPhotoBytes) {
    throw new Error("Ukuran foto tidak valid atau melebihi 5 MB. Ambil foto baru.");
  }

  const body = new FormData();
  body.append("photo", photo);
  return http<SantriFaceVerificationResponse>("/api/v1/face-profiles/me/verify", { method: "POST", accessToken, body });
}

export async function fetchMyFaceEnrollment(accessToken: string) {
  return http<MyFaceEnrollmentStatus>(enrollmentPath, { accessToken });
}

async function imageDataToFile(imageData: string, fileName: string): Promise<File> {
  const response = await fetch(imageData);
  const blob = await response.blob();
  return new File([blob], fileName, { type: blob.type || "image/jpeg" });
}
