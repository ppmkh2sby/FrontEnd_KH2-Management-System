import type { AppRole } from "@/shared/types/auth";

export type DashboardIconName =
  | "dashboard"
  | "users"
  | "book"
  | "clock"
  | "shield"
  | "calendar"
  | "team"
  | "verify"
  | "activity"
  | "log"
  | "progress"
  | "mail";

export type DashboardNavItem = {
  key: string;
  label: string;
  caption: string;
  icon: DashboardIconName;
  badge?: string;
  children?: DashboardNavItem[];
  href?: string;
};

export type DashboardHeroTag = {
  label: string;
  icon: DashboardIconName;
};

export type DashboardHeroAction = {
  label: string;
  icon: DashboardIconName;
};

export type DashboardHighlight = {
  label: string;
  value: string;
  hint: string;
};

export type DashboardMetricTone = "emerald" | "rose" | "blue" | "amber";

export type DashboardMetric = {
  label: string;
  value: string;
  hint: string;
  tone: DashboardMetricTone;
};

export type DashboardSummaryBlock = {
  label: string;
  value: string;
};

export type AttendanceStatus = "Hadir" | "Izin" | "Sakit" | "Alpa";

export type AttendanceItem = {
  title: string;
  date: string;
  status: AttendanceStatus;
};

export type KafarahItem = {
  title: string;
  value: string;
  settled: string;
  outstanding: string;
  date: string;
};

export type ProgressItem = {
  title: string;
  detail: string;
  value: number;
  category: string;
};

export type MovementLogItem = {
  title: string;
  detail: string;
  status: string;
};

export type SantriDashboardData = {
  tags: DashboardHeroTag[];
  actions: DashboardHeroAction[];
  highlights: DashboardHighlight[];
  metrics: DashboardMetric[];
  attendanceSummary: DashboardSummaryBlock[];
  attendanceItems: AttendanceItem[];
  kafarahSummary: DashboardSummaryBlock[];
  kafarahItems: KafarahItem[];
  progressSummary: DashboardSummaryBlock[];
  progressItems: ProgressItem[];
  movementItems: MovementLogItem[];
};

export type GenericRoleModule = {
  title: string;
  description: string;
  icon: DashboardIconName;
};

export type GenericRoleDashboardData = {
  eyebrow: string;
  title: string;
  description: string;
  tags: DashboardHeroTag[];
  metrics: DashboardMetric[];
  modules: GenericRoleModule[];
};

export type RoleDashboardPreset = Record<Exclude<AppRole, "Santri">, GenericRoleDashboardData>;

export type SantriDashboardResponse = {
  generatedAtUtc: string;
  profile: {
    santriId: string;
    fullName: string;
    nis: string;
    kampus: string;
    jurusan: string;
    gender: string;
    tim: string;
    kelas: string;
    emailConfirmed: boolean;
  };
  highlight: {
    attendancePercentage: number;
    remainingKafarah: number;
    averageProgressPercentage: number;
    recordedLogs: number;
  };
  overview: {
    totalPresensi: number;
    hadirCount: number;
    totalKafarah: number;
    sisaKafarah: number;
    totalProgressEntries: number;
    completedProgressEntries: number;
    totalLogs: number;
    recordedLogCount: number;
  };
  attendance: {
    total: number;
    hadir: number;
    izin: number;
    sakit: number;
    alpha: number;
    persentase: number;
    recent: Array<{
      id: string;
      nama: string;
      kegiatanKategori: string;
      waktu: string;
      status: string;
      catatan: string | null;
      createdAtUtc: string;
    }>;
  };
  kafarah: {
    total: number;
    totalKafarah: number;
    jumlahSetor: number;
    sisaTanggungan: number;
    recent: Array<{
      id: string;
      tanggal: string;
      jenisPelanggaran: string;
      jenisPelanggaranLabel: string;
      kafarah: string;
      jumlahSetor: number;
      tanggungan: number;
      sisaTanggungan: number;
      tenggat: string | null;
    }>;
  };
  progress: {
    total: number;
    completed: number;
    inProgress: number;
    average: number;
    quran: number;
    hadits: number;
    recent: Array<{
      id: string;
      judul: string;
      target: number;
      capaian: number;
      satuan: string | null;
      level: string | null;
      persentase: number;
      catatan: string | null;
      pembimbing: string | null;
      terakhirSetorUtc: string | null;
      updatedAtUtc: string;
    }>;
  };
  logs: {
    total: number;
    tercatat: number;
    recent: Array<{
      id: string;
      tanggalPengajuan: string;
      jenis: string;
      rentang: string | null;
      status: string;
      petugas: string | null;
      catatan: string | null;
      createdAtUtc: string;
    }>;
  };
};
