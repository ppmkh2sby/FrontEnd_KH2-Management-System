import { Navigate, Route, Routes } from "react-router-dom";
import { HomePage } from "@/pages/home/HomePage";
import { LoginPage } from "@/pages/login/LoginPage";
import { useAuth } from "@/app/providers/AuthProvider";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <div className="auth-loading">Memuat sesi...</div>;
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
    <main className="auth-page">
      <section className="auth-card">
        <p className="auth-card__eyebrow">Flow lanjutan</p>
        <h1 className="auth-card__title">{title}</h1>
        <p className="auth-card__description">{description}</p>
      </section>
    </main>
  );
}

export function AppRouter() {
  return (
    <Routes>
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
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}