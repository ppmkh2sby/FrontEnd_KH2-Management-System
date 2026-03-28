export type AttendanceStatusCode = "hadir" | "izin" | "sakit" | "alpa";
export type AttendanceCategoryCode = "sambung" | "asrama" | "keakraban";
export type AttendanceTimeCode = "subuh" | "pagi" | "siang" | "sore" | "malam";
export type ProgressCategoryCode = "al-quran" | "al-hadits";

export type SantriItem = {
  id: string;
  userId: string;
  nama: string;
  nis: string;
  kampus: string;
  jurusan: string;
  gender: string;
  tim: string;
  kelas: string;
  catatan: string | null;
};

export type SantriListResponse = {
  items: SantriItem[];
  page: number;
  perPage: number;
  totalCount: number;
};

export type PresensiItem = {
  id: string;
  santriId: string;
  santriNama: string;
  santriNis: string;
  santriTim: string;
  tanggal: string;
  status: AttendanceStatusCode;
  waktu: AttendanceTimeCode;
  kegiatan: string;
  keterangan: string | null;
  createdAtUtc: string;
  updatedAtUtc: string | null;
};

export type PresensiListResponse = {
  items: PresensiItem[];
  page: number;
  perPage: number;
  totalCount: number;
};

export type PresensiRecapSummary = {
  totalSantri: number;
  totalSesi: number;
  totalInput: number;
  hadir: number;
  izin: number;
  sakit: number;
  alpa: number;
  persentase: number;
};

export type PresensiRecapItem = {
  santriId: string;
  nama: string;
  nis: string;
  tim: string;
  gender: string;
  totalInput: number;
  hadir: number;
  izin: number;
  sakit: number;
  alpa: number;
  persentase: number;
};

export type PresensiRecapResponse = {
  bulan: string;
  gender: string | null;
  kategori: string | null;
  waktu: string | null;
  summary: PresensiRecapSummary;
  items: PresensiRecapItem[];
  page: number;
  perPage: number;
  totalCount: number;
};

export type KafarahItem = {
  id: string;
  santriId: string;
  santriNama: string;
  santriNis: string;
  santriTim: string;
  santriGender: string;
  tanggal: string;
  jenisPelanggaran: string;
  jenisPelanggaranLabel: string;
  kafarah: string;
  jumlahSetor: number;
  tanggungan: number;
  sisaTanggungan: number;
  tenggat: string | null;
  createdAtUtc: string;
  updatedAtUtc: string | null;
};

export type KafarahListResponse = {
  items: KafarahItem[];
  page: number;
  perPage: number;
  totalCount: number;
};

export type BulkMutationResponse<T> = {
  items: T[];
  createdCount: number;
  updatedCount: number;
};

export type ProgressKeilmuanSummary = {
  total: number;
  completed: number;
  inProgress: number;
  average: number;
};

export type ProgressKeilmuanModuleItem = {
  judul: string;
  target: number;
  value: number | null;
  persentase: number;
  updatedAtUtc: string | null;
};

export type ProgressKeilmuanRecentItem = {
  id: string;
  judul: string;
  capaian: number;
  target: number;
  satuan: string | null;
  persentase: number;
  terakhirSetorUtc: string | null;
  updatedAtUtc: string | null;
};

export type ProgressKeilmuanPageResponse = {
  category: ProgressCategoryCode;
  summary: ProgressKeilmuanSummary;
  modules: ProgressKeilmuanModuleItem[];
  recentUpdates: ProgressKeilmuanRecentItem[];
};

export type LogKeluarMasukItem = {
  id: string;
  santriId: string;
  santriNama: string;
  santriNis: string;
  santriTim: string;
  santriGender: string;
  tanggal: string;
  tujuan: string;
  waktuKeluar: string | null;
  waktuMasuk: string | null;
  rentang: string | null;
  status: string;
  catatan: string | null;
  createdAtUtc: string;
  updatedAtUtc: string | null;
};

export type LogKeluarMasukListResponse = {
  items: LogKeluarMasukItem[];
  page: number;
  perPage: number;
  totalCount: number;
};
