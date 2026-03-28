import type { AppRole } from "@/shared/types/auth";
import type { DashboardNavItem } from "@/shared/types/dashboard";

const santriNavigation: DashboardNavItem[] = [
  { key: "dashboard", label: "Dashboard", caption: "Ringkasan utama", icon: "dashboard", href: "/dashboard" },
  {
    key: "data-santri",
    label: "Data Santri",
    caption: "Profil dan identitas",
    icon: "users",
    children: [
      { key: "kehadiran-saya", label: "Kehadiran Saya", caption: "", icon: "users", href: "/dashboard/kehadiran-saya" },
      { key: "kafarah-saya", label: "Kafarah Saya", caption: "", icon: "shield", href: "/dashboard/kafarah-saya" },
      { key: "kehadiran-santri", label: "Kehadiran Santri", caption: "", icon: "users", badge: "KTB", href: "/dashboard/kehadiran-santri" },
      { key: "rekap-presensi", label: "Rekap Presensi", caption: "", icon: "clock", badge: "KTB", href: "/dashboard/rekap-presensi" },
      { key: "kafarah-santri", label: "Kafarah Santri", caption: "", icon: "shield", badge: "KTB", href: "/dashboard/kafarah-santri" },
    ],
  },
  { key: "progress", label: "Progress Keilmuan", caption: "Capaian materi", icon: "book", href: "/dashboard/progress-keilmuan" },
  {
    key: "log-keluar-masuk",
    label: "Log Keluar/Masuk",
    caption: "Riwayat perizinan",
    icon: "clock",
    children: [
      { key: "input-keluar-masuk", label: "Input Keluar/Masuk", caption: "", icon: "clock", href: "/dashboard/log-keluar-masuk/input" },
      { key: "log-saya", label: "Log Saya", caption: "", icon: "clock", href: "/dashboard/log-keluar-masuk/saya" },
    ],
  },
  { key: "notifikasi", label: "Notifikasi", caption: "", icon: "clock", badge: "10" },
];

const adminNavigation: DashboardNavItem[] = [
  { key: "dashboard", label: "Dashboard", caption: "Monitoring utama", icon: "dashboard" },
  { key: "santri", label: "Data Santri", caption: "Master data santri", icon: "users" },
  { key: "presensi", label: "Presensi", caption: "Rekap kehadiran", icon: "activity" },
  { key: "kafarah", label: "Kafarah", caption: "Kontrol tanggungan", icon: "shield" },
  { key: "laporan", label: "Laporan", caption: "Ringkasan sistem", icon: "log" },
];

const dewanGuruNavigation: DashboardNavItem[] = [
  { key: "dashboard", label: "Dashboard", caption: "Monitoring pembinaan", icon: "dashboard", href: "/dashboard" },
  {
    key: "data-santri",
    label: "Data Santri",
    caption: "Data binaan",
    icon: "users",
    children: [
      {
        key: "kehadiran-santri",
        label: "Kehadiran Santri",
        caption: "",
        icon: "users",
        href: "/dashboard/staff/kehadiran-santri",
      },
    ],
  },
  { key: "progress", label: "Progress Keilmuan", caption: "Evaluasi capaian", icon: "book", href: "/dashboard/staff/progress-keilmuan" },
  { key: "log-keluar-masuk", label: "Log Keluar/Masuk", caption: "Aktivitas santri", icon: "clock", href: "/dashboard/staff/log-keluar-masuk" },
  { key: "notifikasi", label: "Notifikasi", caption: "", icon: "clock", badge: "10" },
];

const pengurusNavigation: DashboardNavItem[] = [
  { key: "dashboard", label: "Dashboard", caption: "Operasional harian", icon: "dashboard", href: "/dashboard" },
  {
    key: "data-santri",
    label: "Data Santri",
    caption: "Pantau kehadiran",
    icon: "users",
    children: [
      {
        key: "kehadiran-santri",
        label: "Kehadiran Santri",
        caption: "",
        icon: "users",
        href: "/dashboard/staff/kehadiran-santri",
      },
    ],
  },
  { key: "progress", label: "Progress Keilmuan", caption: "Evaluasi capaian", icon: "book", href: "/dashboard/staff/progress-keilmuan" },
  { key: "log-keluar-masuk", label: "Log Keluar/Masuk", caption: "Izin santri", icon: "clock", href: "/dashboard/staff/log-keluar-masuk" },
  { key: "notifikasi", label: "Notifikasi", caption: "", icon: "clock", badge: "10" },
];

const waliNavigation: DashboardNavItem[] = [
  { key: "dashboard", label: "Dashboard Anak", caption: "Ringkasan performa", icon: "dashboard", href: "/dashboard" },
  { key: "presensi", label: "Presensi", caption: "Kehadiran anak", icon: "activity", href: "/dashboard/wali/presensi" },
  { key: "progress", label: "Progress Keilmuan", caption: "Perkembangan materi", icon: "book", href: "/dashboard/wali/progress-keilmuan" },
  { key: "movement", label: "Log Keluar/Masuk", caption: "Riwayat izin", icon: "clock", href: "/dashboard/wali/log-keluar-masuk" },
  { key: "notifikasi", label: "Notifikasi", caption: "", icon: "clock", badge: "10" },
];

export function getDashboardNavigation(role: AppRole | string): DashboardNavItem[] {
  switch (role) {
    case "Admin":
      return adminNavigation;
    case "DewanGuru":
      return dewanGuruNavigation;
    case "Pengurus":
      return pengurusNavigation;
    case "WaliSantri":
      return waliNavigation;
    case "Santri":
    default:
      return santriNavigation;
  }
}
