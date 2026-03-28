import type { AppRole } from "@/shared/types/auth";
import type {
  GenericRoleDashboardData,
  RoleDashboardPreset,
} from "@/shared/types/dashboard";

const roleDashboardPreset: RoleDashboardPreset = {
  Admin: {
    eyebrow: "Ringkasan Admin",
    title: "Kontrol sistem dalam satu workspace terstruktur.",
    description: "Pantau modul inti, stabilitas operasional, dan aktivitas utama pondok dari satu dashboard yang ringkas.",
    tags: [
      { icon: "calendar", label: "Monitoring harian" },
      { icon: "verify", label: "Kontrol akses aktif" },
      { icon: "users", label: "Akun dan peran" },
    ],
    metrics: [
      { label: "Akun aktif", value: "128", hint: "lintas role", tone: "emerald" },
      { label: "Presensi masuk", value: "94%", hint: "bulan berjalan", tone: "blue" },
      { label: "Kafarah terbuka", value: "37", hint: "butuh tindak lanjut", tone: "rose" },
      { label: "Notifikasi sistem", value: "6", hint: "perlu ditinjau", tone: "amber" },
    ],
    modules: [
      { icon: "users", title: "Master Santri", description: "Kelola data inti dan status akun santri." },
      { icon: "activity", title: "Presensi", description: "Ringkas kehadiran dan kedisiplinan harian." },
      { icon: "shield", title: "Kafarah", description: "Lacak tanggungan dan progres penyelesaian." },
      { icon: "log", title: "Laporan", description: "Susun rekap operasional dan insight bulanan." },
    ],
  },
  DewanGuru: {
    eyebrow: "Ringkasan Dewan Guru",
    title: "Fokus pada pembinaan, evaluasi, dan pengawasan santri.",
    description: "Dashboard ini dirancang untuk memudahkan pemantauan progres keilmuan, presensi, dan catatan pembinaan.",
    tags: [
      { icon: "book", label: "Evaluasi materi" },
      { icon: "activity", label: "Presensi binaan" },
      { icon: "mail", label: "Catatan tindak lanjut" },
    ],
    metrics: [
      { label: "Santri binaan", value: "42", hint: "aktif semester ini", tone: "emerald" },
      { label: "Avg progress", value: "73%", hint: "materi mingguan", tone: "blue" },
      { label: "Catatan pembinaan", value: "9", hint: "perlu review", tone: "amber" },
      { label: "Presensi tertib", value: "91%", hint: "bulan berjalan", tone: "rose" },
    ],
    modules: [
      { icon: "book", title: "Progress Keilmuan", description: "Tinjau capaian hafalan dan materi santri." },
      { icon: "activity", title: "Presensi", description: "Pantau konsistensi hadir pada kegiatan pondok." },
      { icon: "users", title: "Data Santri", description: "Akses data santri binaan secara ringkas." },
      { icon: "log", title: "Catatan", description: "Simpan catatan evaluasi dan tindak lanjut." },
    ],
  },
  Pengurus: {
    eyebrow: "Ringkasan Pengurus",
    title: "Operasional harian pondok dalam tampilan yang cepat dipantau.",
    description: "Gunakan dashboard ini untuk melihat kepatuhan presensi, izin keluar masuk, dan beban tindak lanjut operasional.",
    tags: [
      { icon: "clock", label: "Izin aktif" },
      { icon: "shield", label: "Tindak lanjut kafarah" },
      { icon: "activity", label: "Pantauan harian" },
    ],
    metrics: [
      { label: "Izin aktif", value: "8", hint: "menunggu monitoring", tone: "blue" },
      { label: "Kafarah baru", value: "12", hint: "minggu ini", tone: "rose" },
      { label: "Kehadiran pagi", value: "93%", hint: "hari ini", tone: "emerald" },
      { label: "Catatan lapangan", value: "5", hint: "butuh follow up", tone: "amber" },
    ],
    modules: [
      { icon: "activity", title: "Presensi Harian", description: "Ringkas kehadiran kegiatan secara cepat." },
      { icon: "clock", title: "Log Keluar/Masuk", description: "Monitor status izin keluar dan kembali." },
      { icon: "shield", title: "Kafarah", description: "Tinjau pelanggaran dan penyelesaian aktif." },
      { icon: "log", title: "Laporan", description: "Rekap kondisi harian untuk koordinasi tim." },
    ],
  },
  WaliSantri: {
    eyebrow: "Ringkasan Wali Santri",
    title: "Pantau perkembangan santri dengan tampilan yang mudah dipahami.",
    description: "Dashboard ini menonjolkan kehadiran, perkembangan materi, dan riwayat penting agar komunikasi dengan pondok lebih jelas.",
    tags: [
      { icon: "activity", label: "Kehadiran anak" },
      { icon: "book", label: "Perkembangan materi" },
      { icon: "clock", label: "Riwayat izin" },
    ],
    metrics: [
      { label: "Kehadiran", value: "96%", hint: "bulan berjalan", tone: "emerald" },
      { label: "Progress materi", value: "61%", hint: "update terakhir", tone: "blue" },
      { label: "Log izin", value: "2", hint: "bulan ini", tone: "amber" },
      { label: "Kafarah aktif", value: "1", hint: "perlu dipantau", tone: "rose" },
    ],
    modules: [
      { icon: "activity", title: "Presensi", description: "Lihat ringkasan hadir dan ketertiban." },
      { icon: "book", title: "Progress Keilmuan", description: "Pantau capaian materi terbaru." },
      { icon: "clock", title: "Log Keluar/Masuk", description: "Cek izin yang tercatat pada sistem." },
      { icon: "shield", title: "Kafarah", description: "Amati status tanggungan yang masih aktif." },
    ],
  },
};

export function getGenericRoleDashboard(role: AppRole | string): GenericRoleDashboardData {
  switch (role) {
    case "Admin":
      return roleDashboardPreset.Admin;
    case "DewanGuru":
      return roleDashboardPreset.DewanGuru;
    case "Pengurus":
      return roleDashboardPreset.Pengurus;
    case "WaliSantri":
      return roleDashboardPreset.WaliSantri;
    default:
      return roleDashboardPreset.Admin;
  }
}

export function getRoleDisplayName(role: AppRole | string): string {
  switch (role) {
    case "Admin":
      return "Admin";
    case "DewanGuru":
      return "Dewan Guru";
    case "Pengurus":
      return "Pengurus";
    case "Santri":
      return "Santri";
    case "WaliSantri":
      return "Wali Santri";
    default:
      return role;
  }
}
