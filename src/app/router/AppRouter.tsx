import { Navigate, Route, Routes } from "react-router-dom";
import { HomePage } from "@/pages/home/HomePage";
import { LoginPage } from "@/pages/login/LoginPage";
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
