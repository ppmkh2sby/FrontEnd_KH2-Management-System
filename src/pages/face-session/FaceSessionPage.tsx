import { useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";
import { closeFaceSession, createFaceSession, isFaceSessionOfficer, verifyFaceOfficer } from "@/shared/lib/face-attendance";
import { ApiError } from "@/shared/lib/http";
import type { FaceSession } from "@/shared/types/face-attendance";
import { RolePageShell } from "@/widgets/app-shell/RolePageShell";
import { SantriPageShell } from "@/widgets/app-shell/SantriPageShell";
import { FaceCamera } from "@/widgets/face-camera/FaceCamera";

const times = ["subuh", "pagi", "siang", "sore", "malam"];

export function FaceSessionPage() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === "Santri") {
    return (
      <SantriPageShell>
        {({ santriDashboard, isSantriDashboardLoading }) =>
          isSantriDashboardLoading ? <Loading /> : isFaceSessionOfficer(user.role, santriDashboard?.profile.tim) ? <FaceSessionContent /> : <Navigate to="/dashboard" replace />
        }
      </SantriPageShell>
    );
  }

  return <RolePageShell allowedRoles={["DewanGuru", "Admin", "Pengurus"]}><FaceSessionContent /></RolePageShell>;
}

function FaceSessionContent() {
  const { token } = useAuth();
  const [kelas, setKelas] = useState("");
  const [kegiatan, setKegiatan] = useState("");
  const [waktu, setWaktu] = useState("");
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().slice(0, 10));
  const [session, setSession] = useState<FaceSession | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const create = async () => {
    if (!token || !kelas.trim() || !kegiatan.trim() || !waktu || !tanggal) return;
    setBusy(true);
    setMessage(null);
    try {
      setSession(await createFaceSession(token, { kelas: kelas.trim(), kegiatan: kegiatan.trim(), waktu, tanggal }));
      setMessage("Sesi dibuat. Verifikasi wajah Anda untuk membuka presensi.");
    } catch (error) {
      setMessage(toUserMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const verify = async (imageData: string) => {
    if (!token || !session) return;
    setBusy(true);
    setMessage(null);
    try {
      const verified = await verifyFaceOfficer(token, session.id, imageData);
      setSession(verified);
      setMessage("Wajah berhasil diverifikasi. Presensi wajah sudah dibuka.");
    } catch (error) {
      setMessage(toUserMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const close = async () => {
    if (!token || !session) return;
    setBusy(true);
    try {
      setSession(await closeFaceSession(token, session.id));
      setMessage("Presensi wajah ditutup.");
    } catch (error) {
      setMessage(toUserMessage(error));
    } finally {
      setBusy(false);
    }
  };

  if (session) return <SessionMonitor session={session} onVerify={verify} onClose={close} busy={busy} message={message} />;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Face recognition</p>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900">Buka Presensi Wajah</h1>
        <p className="mt-2 text-sm text-gray-600">Buat sesi, lalu verifikasi wajah akun Anda sebelum santri dapat melakukan presensi.</p>
      </div>
      {message ? <Alert message={message} /> : null}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Kelas"><input value={kelas} onChange={(event) => setKelas(event.target.value)} placeholder="Contoh: Kelas A" className="input" /></Field>
          <Field label="Kegiatan"><input value={kegiatan} onChange={(event) => setKegiatan(event.target.value)} placeholder="Contoh: Kajian malam" className="input" /></Field>
          <Field label="Waktu"><select value={waktu} onChange={(event) => setWaktu(event.target.value)} className="input"><option value="">Pilih waktu</option>{times.map((item) => <option key={item} value={item}>{item[0].toUpperCase() + item.slice(1)}</option>)}</select></Field>
          <Field label="Tanggal"><input type="date" value={tanggal} onChange={(event) => setTanggal(event.target.value)} className="input" /></Field>
        </div>
        <button type="button" onClick={() => void create()} disabled={busy || !kelas.trim() || !kegiatan.trim() || !waktu || !tanggal} className="mt-5 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-emerald-300">
          {busy ? "Membuat sesi..." : "Lanjutkan ke verifikasi wajah"}
        </button>
      </section>
    </div>
  );
}

function SessionMonitor({ session, onVerify, onClose, busy, message }: { session: FaceSession; onVerify: (imageData: string) => Promise<void>; onClose: () => Promise<void>; busy: boolean; message: string | null }) {
  const isOpen = session.status === "open";
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Face recognition</p>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900">{isOpen ? "Monitoring Presensi Wajah" : "Verifikasi Pembuka Sesi"}</h1>
      </div>
      {message ? <Alert message={message} /> : null}
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
        <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">{isOpen ? "Sesi terbuka" : "Menunggu verifikasi"}</span>
        <h2 className="mt-3 text-xl font-semibold">{session.kelas}</h2>
        <p className="mt-1 text-sm">{session.kegiatan} · {session.waktu} · {session.tanggal}</p>
      </section>
      {!isOpen ? <FaceCamera onCapture={onVerify} isBusy={busy} captureLabel="Verifikasi & buka presensi" guidance="Pastikan hanya wajah Anda terlihat jelas di dalam frame." /> : <button type="button" onClick={() => void onClose()} disabled={busy} className="rounded-lg border border-rose-300 bg-white px-5 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60">{busy ? "Menutup..." : "Tutup presensi"}</button>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block text-sm font-medium text-gray-700">{label}<span className="mt-2 block [&_.input]:w-full [&_.input]:rounded-lg [&_.input]:border [&_.input]:border-gray-300 [&_.input]:bg-white [&_.input]:px-3 [&_.input]:py-2.5 [&_.input]:text-sm">{children}</span></label>;
}

function Alert({ message }: { message: string }) { return <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{message}</div>; }
function Loading() { return <div className="p-8 text-sm text-gray-600">Memeriksa akses tim...</div>; }
function toUserMessage(error: unknown) { if (error instanceof ApiError) { if (error.status === 401) return "Sesi login berakhir. Silakan masuk kembali."; if (error.status === 403) return "Anda tidak memiliki izin untuk membuka presensi wajah."; if (error.status === 503) return "Layanan AI sedang tidak tersedia. Sesi tidak dibuka."; return error.message; } return error instanceof Error ? error.message : "Permintaan belum dapat diproses."; }
