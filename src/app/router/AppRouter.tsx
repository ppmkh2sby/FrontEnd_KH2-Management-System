import { Navigate, Route, Routes } from "react-router-dom";
import { AttendancePage } from "@/pages/attendance/AttendancePage";
import { AttendanceCreatePage } from "@/pages/attendance-create/AttendanceCreatePage";
import { AttendanceRecapPage } from "@/pages/attendance-recap/AttendanceRecapPage";
import { AttendanceTeamPage } from "@/pages/attendance-team/AttendanceTeamPage";
import { HomePage } from "@/pages/home/HomePage";
import { KafarahCreatePage } from "@/pages/kafarah-create/KafarahCreatePage";
import { KafarahMinePage } from "@/pages/kafarah-mine/KafarahMinePage";
import { KafarahTeamPage } from "@/pages/kafarah-team/KafarahTeamPage";
import { LogInputPage } from "@/pages/log-input/LogInputPage";
import { LogMinePage } from "@/pages/log-mine/LogMinePage";
import { LoginPage } from "@/pages/login/LoginPage";
import { LandingPage } from "@/pages/landing/LandingPage";
import { ProgressPage } from "@/pages/progress/ProgressPage";
import { StaffAttendancePage } from "@/pages/staff-attendance/StaffAttendancePage";
import { StaffLogPage } from "@/pages/staff-log/StaffLogPage";
import { StaffProgressPage } from "@/pages/staff-progress/StaffProgressPage";
import { WaliLogPage } from "@/pages/wali-log/WaliLogPage";
import { WaliPresensiPage } from "@/pages/wali-presensi/WaliPresensiPage";
import { WaliProgressPage } from "@/pages/wali-progress/WaliProgressPage";
import { useAuth } from "@/app/providers/AuthProvider";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <div className="grid min-h-screen place-items-center bg-forest-900 text-mist-100/80">
        Memuat sesi...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-[linear-gradient(135deg,#081e14_0%,#123626_46%,#dbe6df_100%)] p-4">
      <section className="w-full max-w-xl rounded-[1.75rem] border border-white/12 bg-white/95 p-8 text-forest-900 shadow-[0_24px_60px_rgba(13,36,24,0.2)]">
        <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-forest-700">
          Flow lanjutan
        </p>
        <h1 className="mt-3 font-display text-4xl leading-none tracking-[-0.04em]">
          {title}
        </h1>
        <p className="mt-4 text-sm leading-7 text-forest-900/72">{description}</p>
      </section>
    </main>
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <PlaceholderPage
              title="Ganti Password"
              description="Halaman ini disiapkan sebagai tujuan setelah login pertama jika backend mengembalikan mustChangePassword = true."
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/set-email"
        element={
          <ProtectedRoute>
            <PlaceholderPage
              title="Isi Email"
              description="Halaman ini disiapkan sebagai langkah lanjutan ketika akun belum memiliki email."
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/verify-email"
        element={
          <ProtectedRoute>
            <PlaceholderPage
              title="Verifikasi Email"
              description="Halaman ini disiapkan sebagai langkah lanjutan ketika email sudah ada tetapi belum terverifikasi."
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/staff/kehadiran-santri"
        element={
          <ProtectedRoute>
            <StaffAttendancePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/staff/progress-keilmuan"
        element={
          <ProtectedRoute>
            <StaffProgressPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/staff/log-keluar-masuk"
        element={
          <ProtectedRoute>
            <StaffLogPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/wali/presensi"
        element={
          <ProtectedRoute>
            <WaliPresensiPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/wali/progress-keilmuan"
        element={
          <ProtectedRoute>
            <WaliProgressPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/wali/log-keluar-masuk"
        element={
          <ProtectedRoute>
            <WaliLogPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/kehadiran-saya"
        element={
          <ProtectedRoute>
            <AttendancePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/kafarah-saya"
        element={
          <ProtectedRoute>
            <KafarahMinePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/kehadiran-santri"
        element={
          <ProtectedRoute>
            <AttendanceTeamPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/kehadiran-santri/input"
        element={
          <ProtectedRoute>
            <AttendanceCreatePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/rekap-presensi"
        element={
          <ProtectedRoute>
            <AttendanceRecapPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/kafarah-santri"
        element={
          <ProtectedRoute>
            <KafarahTeamPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/kafarah-santri/input"
        element={
          <ProtectedRoute>
            <KafarahCreatePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/progress-keilmuan"
        element={
          <ProtectedRoute>
            <ProgressPage />
          </ProtectedRoute>
        }
      />

      <Route path="/dashboard/log-keluar-masuk" element={<Navigate to="/dashboard/log-keluar-masuk/input" replace />} />

      <Route
        path="/dashboard/log-keluar-masuk/input"
        element={
          <ProtectedRoute>
            <LogInputPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/log-keluar-masuk/saya"
        element={
          <ProtectedRoute>
            <LogMinePage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
