import { http } from "@/shared/lib/http";
import type {
  AttendanceCategoryCode,
  LogKeluarMasukListResponse,
  LogKeluarMasukItem,
  AttendanceStatusCode,
  AttendanceTimeCode,
  BulkMutationResponse,
  KafarahItem,
  KafarahListResponse,
  PresensiItem,
  PresensiListResponse,
  PresensiRecapResponse,
  ProgressCategoryCode,
  ProgressKeilmuanPageResponse,
  SantriListResponse,
} from "@/shared/types/santri-data";

export const attendanceCategoryOptions: AttendanceCategoryCode[] = ["sambung", "asrama", "keakraban"];
export const attendanceTimeOptions: AttendanceTimeCode[] = ["subuh", "pagi", "siang", "sore", "malam"];
export const attendanceStatusOptions: AttendanceStatusCode[] = ["hadir", "izin", "sakit", "alpa"];
export const progressCategoryOptions: ProgressCategoryCode[] = ["al-quran", "al-hadits"];

export const kafarahMapping = {
  tidak_sholat_subuh_di_masjid: {
    label: "Tidak sholat subuh di masjid",
    kafarah: "Istigfar 250",
    jumlah: 250,
  },
  tidak_sambung_pagi: {
    label: "Tidak sambung pagi",
    kafarah: "Istigfar 150",
    jumlah: 150,
  },
  tidak_sambung_malam: {
    label: "Tidak sambung malam",
    kafarah: "Istigfar 150",
    jumlah: 150,
  },
  tidak_apel_malam: {
    label: "Tidak apel malam",
    kafarah: "Istigfar 250",
    jumlah: 250,
  },
  tidak_sholat_malam: {
    label: "Tidak sholat malam",
    kafarah: "Istigfar 150",
    jumlah: 150,
  },
  terlambat_kembali_ke_ppm: {
    label: "Terlambat kembali ke PPM",
    kafarah: "Membayar 10K/15K/25K",
    jumlah: 10000,
  },
  tidak_asrama_sesi_pagi: {
    label: "Tidak Asrama sesi pagi",
    kafarah: "Istigfar 150",
    jumlah: 150,
  },
  tidak_asrama_sesi_siang: {
    label: "Tidak Asrama sesi siang",
    kafarah: "Istigfar 150",
    jumlah: 150,
  },
  tidak_asrama_sesi_sore: {
    label: "Tidak Asrama sesi sore",
    kafarah: "Istigfar 150",
    jumlah: 150,
  },
  tidak_asrama_sesi_malam: {
    label: "Tidak Asrama sesi malam",
    kafarah: "Istigfar 150",
    jumlah: 150,
  },
} as const;

export async function fetchSantriList(accessToken: string) {
  return http<SantriListResponse>("/api/v1/santri?page=1&perPage=200", { accessToken });
}

export async function fetchPublicSantriTotal(signal?: AbortSignal) {
  const response = await http<SantriListResponse>("/api/v1/santri?page=1&perPage=1", { signal });
  return response.totalCount;
}

export async function fetchPresensiList(accessToken: string) {
  return http<PresensiListResponse>("/api/v1/presensi?page=1&perPage=500", { accessToken });
}

export async function storeBulkPresensi(
  accessToken: string,
  payload: {
    tanggal: string;
    kegiatan: string;
    waktu: AttendanceTimeCode;
    keterangan: string;
    items: Array<{ santriId: string; status: AttendanceStatusCode }>;
  }
) {
  return http<BulkMutationResponse<PresensiItem>>("/api/v1/presensi/bulk", {
    method: "POST",
    accessToken,
    body: JSON.stringify(payload),
  });
}

export async function updatePresensi(
  accessToken: string,
  id: string,
  payload: {
    tanggal: string;
    kegiatan: string;
    waktu: AttendanceTimeCode;
    status: AttendanceStatusCode;
    keterangan: string;
  }
) {
  return http<PresensiItem>(`/api/v1/presensi/${id}`, {
    method: "PATCH",
    accessToken,
    body: JSON.stringify(payload),
  });
}

export async function deletePresensi(accessToken: string, id: string) {
  return http<void>(`/api/v1/presensi/${id}`, {
    method: "DELETE",
    accessToken,
  });
}

export async function fetchPresensiRecap(
  accessToken: string,
  query: {
    bulan: string;
    gender: string;
    kategori: string;
    waktu: string;
    page: number;
    perPage: number;
  }
) {
  const params = new URLSearchParams({
    bulan: query.bulan,
    gender: query.gender,
    page: `${query.page}`,
    perPage: `${query.perPage}`,
  });

  if (query.kategori !== "all") {
    params.set("kategori", query.kategori);
  }

  if (query.waktu !== "all") {
    params.set("waktu", query.waktu);
  }

  return http<PresensiRecapResponse>(`/api/v1/presensi/rekap?${params.toString()}`, {
    accessToken,
  });
}

export async function fetchKafarahList(accessToken: string) {
  return http<KafarahListResponse>("/api/v1/kafarah?page=1&perPage=200", { accessToken });
}

export async function fetchProgressKeilmuan(accessToken: string, category: ProgressCategoryCode) {
  return http<ProgressKeilmuanPageResponse>(`/api/v1/progress-keilmuan?category=${encodeURIComponent(category)}`, {
    accessToken,
  });
}

export async function syncProgressKeilmuan(
  accessToken: string,
  payload: {
    category: ProgressCategoryCode;
    modules: Array<{ judul: string; value: number | null }>;
  }
) {
  return http<ProgressKeilmuanPageResponse>("/api/v1/progress-keilmuan/sync", {
    method: "POST",
    accessToken,
    body: JSON.stringify(payload),
  });
}

export async function fetchLogKeluarMasuk(
  accessToken: string,
  query: {
    page: number;
    perPage: number;
    scope?: "mine" | "team";
    search?: string;
    gender?: string;
  }
) {
  const params = new URLSearchParams({
    page: `${query.page}`,
    perPage: `${query.perPage}`,
  });

  if (query.scope) {
    params.set("scope", query.scope);
  }

  if (query.search?.trim()) {
    params.set("search", query.search.trim());
  }

  if (query.gender?.trim()) {
    params.set("gender", query.gender.trim());
  }

  return http<LogKeluarMasukListResponse>(`/api/v1/log-keluar-masuk?${params.toString()}`, {
    accessToken,
  });
}

export async function storeLogKeluarMasuk(
  accessToken: string,
  payload: {
    tanggal: string;
    tujuan: string;
    waktuKeluar: string;
    waktuMasuk: string;
    catatan: string;
  }
) {
  return http<LogKeluarMasukItem>(`/api/v1/log-keluar-masuk`, {
    method: "POST",
    accessToken,
    body: JSON.stringify(payload),
  });
}

export async function updateLogKeluarMasuk(
  accessToken: string,
  id: string,
  payload: {
    tanggal: string;
    tujuan: string;
    waktuKeluar: string;
    waktuMasuk: string;
    catatan: string;
  }
) {
  return http<LogKeluarMasukItem>(`/api/v1/log-keluar-masuk/${id}`, {
    method: "PATCH",
    accessToken,
    body: JSON.stringify(payload),
  });
}

export async function deleteLogKeluarMasuk(accessToken: string, id: string) {
  return http<void>(`/api/v1/log-keluar-masuk/${id}`, {
    method: "DELETE",
    accessToken,
  });
}

export async function storeBulkKafarah(
  accessToken: string,
  payload: {
    tanggal: string;
    jenisPelanggaran: keyof typeof kafarahMapping;
    santriIds: string[];
  }
) {
  return http<BulkMutationResponse<KafarahItem>>("/api/v1/kafarah/bulk", {
    method: "POST",
    accessToken,
    body: JSON.stringify(payload),
  });
}

export async function updateKafarah(
  accessToken: string,
  id: string,
  payload: {
    tanggal: string;
    jenisPelanggaran: string;
    jumlahSetor: number;
    tanggungan?: number;
    tenggat: string;
  }
) {
  return http<KafarahItem>(`/api/v1/kafarah/${id}`, {
    method: "PATCH",
    accessToken,
    body: JSON.stringify(payload),
  });
}

export async function deleteKafarah(accessToken: string, id: string) {
  return http<void>(`/api/v1/kafarah/${id}`, {
    method: "DELETE",
    accessToken,
  });
}

export function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

export function formatLongDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}

export function formatMonthInput(date = new Date()) {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}`;
}

export function formatDetailedTimeInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

export function mapAttendanceStatus(status: AttendanceStatusCode | string) {
  switch (status) {
    case "hadir":
      return "Hadir";
    case "izin":
      return "Izin";
    case "sakit":
      return "Sakit";
    case "alpa":
      return "Alpa";
    default:
      return status;
  }
}

export function getAttendanceStatusClass(status: AttendanceStatusCode | string) {
  switch (status) {
    case "hadir":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "izin":
      return "border-orange-200 bg-orange-50 text-orange-700";
    case "sakit":
      return "border-gray-200 bg-gray-50 text-gray-700";
    case "alpa":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-gray-200 bg-gray-50 text-gray-700";
  }
}

export function getAttendanceStatusDotClass(status: AttendanceStatusCode | string) {
  switch (status) {
    case "hadir":
      return "bg-emerald-600";
    case "izin":
      return "bg-orange-600";
    case "sakit":
      return "bg-gray-600";
    case "alpa":
      return "bg-red-600";
    default:
      return "bg-gray-600";
  }
}

export function getKafarahDefinition(jenisPelanggaran: string) {
  return kafarahMapping[jenisPelanggaran as keyof typeof kafarahMapping] ?? null;
}

export function extractAttendanceCategory(value: string): AttendanceCategoryCode {
  const normalized = value.toLowerCase();

  if (normalized.includes("asrama")) {
    return "asrama";
  }

  if (normalized.includes("keakraban")) {
    return "keakraban";
  }

  return "sambung";
}
