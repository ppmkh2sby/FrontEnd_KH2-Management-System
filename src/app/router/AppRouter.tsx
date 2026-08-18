import { lazy, Suspense, type ComponentType } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { LandingPage } from "@/pages/landing/LandingPage";
import { useAuth } from "@/app/providers/AuthProvider";

const AttendancePage = lazyPage(() => import("@/pages/attendance/AttendancePage"), "AttendancePage");
const AttendanceCreatePage = lazyPage(() => import("@/pages/attendance-create/AttendanceCreatePage"), "AttendanceCreatePage");
const AttendanceRecapPage = lazyPage(() => import("@/pages/attendance-recap/AttendanceRecapPage"), "AttendanceRecapPage");
const AttendanceTeamPage = lazyPage(() => import("@/pages/attendance-team/AttendanceTeamPage"), "AttendanceTeamPage");
const FaceCheckInPage = lazyPage(() => import("@/pages/face-check-in/FaceCheckInPage"), "FaceCheckInPage");
const FaceEnrollmentPage = lazyPage(() => import("@/pages/face-enrollment/FaceEnrollmentPage"), "FaceEnrollmentPage");
const FaceSessionPage = lazyPage(() => import("@/pages/face-session/FaceSessionPage"), "FaceSessionPage");
const HomePage = lazyPage(() => import("@/pages/home/HomePage"), "HomePage");
const KafarahCreatePage = lazyPage(() => import("@/pages/kafarah-create/KafarahCreatePage"), "KafarahCreatePage");
const KafarahMinePage = lazyPage(() => import("@/pages/kafarah-mine/KafarahMinePage"), "KafarahMinePage");
const KafarahTeamPage = lazyPage(() => import("@/pages/kafarah-team/KafarahTeamPage"), "KafarahTeamPage");
const LogInputPage = lazyPage(() => import("@/pages/log-input/LogInputPage"), "LogInputPage");
const LogMinePage = lazyPage(() => import("@/pages/log-mine/LogMinePage"), "LogMinePage");
const LoginPage = lazyPage(() => import("@/pages/login/LoginPage"), "LoginPage");
const ProgressPage = lazyPage(() => import("@/pages/progress/ProgressPage"), "ProgressPage");
const StaffAttendancePage = lazyPage(() => import("@/pages/staff-attendance/StaffAttendancePage"), "StaffAttendancePage");
const StaffLogPage = lazyPage(() => import("@/pages/staff-log/StaffLogPage"), "StaffLogPage");
const StaffProgressPage = lazyPage(() => import("@/pages/staff-progress/StaffProgressPage"), "StaffProgressPage");
const WaliLogPage = lazyPage(() => import("@/pages/wali-log/WaliLogPage"), "WaliLogPage");
const WaliPresensiPage = lazyPage(() => import("@/pages/wali-presensi/WaliPresensiPage"), "WaliPresensiPage");
const WaliProgressPage = lazyPage(() => import("@/pages/wali-progress/WaliProgressPage"), "WaliProgressPage");

function lazyPage<T extends Record<string, ComponentType>>(loader: () => Promise<T>, exportName: string) {
  return lazy(async () => {
    const module = await loader();
    return { default: module[exportName] as ComponentType };
  });
}

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
    <Suspense fallback={<RouteLoader />}>
      <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/frontend-static-demo" element={<LandingPage />} />
      <Route path="/frontend-static-demo/login" element={<LoginPage />} />

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
        path="/dashboard/daftarkan-wajah"
        element={
          <ProtectedRoute>
            <FaceEnrollmentPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/presensi-wajah"
        element={
          <ProtectedRoute>
            <FaceSessionPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/presensi-wajah/saya"
        element={
          <ProtectedRoute>
            <FaceCheckInPage />
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
    </Suspense>
  );
}

function RouteLoader() {
  return <div className="grid min-h-screen place-items-center bg-[#fbfcfa] text-sm font-medium text-forest-900/60">Memuat halaman...</div>;
}
