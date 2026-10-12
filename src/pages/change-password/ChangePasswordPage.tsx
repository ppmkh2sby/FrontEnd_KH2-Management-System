import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { http, ApiError } from "@/shared/lib/http";

export function ChangePasswordPage() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || busy) return;
    if (!currentPassword || !newPassword) { setError("Isi password saat ini dan password baru."); return; }
    if (newPassword !== confirmation) { setError("Konfirmasi password baru tidak sama."); return; }
    setBusy(true);
    setError(null);
    try {
      await http<void>("/api/v1/auth/change-password", {
        method: "POST",
        accessToken: token,
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      // The old JWT still carries must_change_password=true. Require a fresh login.
      await logout();
      navigate("/login", { replace: true });
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Password belum dapat diganti. Coba lagi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-emerald-50 p-4">
      <form onSubmit={(event) => void submit(event)} className="w-full max-w-md space-y-5 rounded-2xl bg-white p-6 shadow-lg">
        <div><h1 className="text-2xl font-semibold text-gray-900">Ganti Password</h1><p className="mt-2 text-sm text-gray-600">Akun ini wajib mengganti password sebelum membuka dashboard. Setelah berhasil, masuk kembali dengan password baru.</p></div>
        <label className="block text-sm font-medium">Password saat ini<input type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 p-3" required /></label>
        <label className="block text-sm font-medium">Password baru<input type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 p-3" required /></label>
        <label className="block text-sm font-medium">Konfirmasi password baru<input type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 p-3" required /></label>
        {error ? <p role="alert" className="text-sm text-rose-700">{error}</p> : null}
        <button type="submit" disabled={busy} className="w-full rounded-lg bg-emerald-700 p-3 font-semibold text-white disabled:opacity-50">{busy ? "Menyimpan..." : "Ganti password"}</button>
      </form>
    </main>
  );
}
