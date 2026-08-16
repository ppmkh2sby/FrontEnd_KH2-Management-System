import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";
import { closeFaceSession, fetchFaceActivities, fetchFaceSessionOptions, fetchFaceTimes, openFaceSession, verifyFaceOfficer, isFaceSessionOfficer } from "@/shared/lib/face-attendance";
import { ApiError } from "@/shared/lib/http";
import type { FaceAttendanceActivity, FaceAttendanceClass, FaceAttendanceTime, FaceSession } from "@/shared/types/face-attendance";
import { RolePageShell } from "@/widgets/app-shell/RolePageShell";
import { SantriPageShell } from "@/widgets/app-shell/SantriPageShell";
import { FaceCamera } from "@/widgets/face-camera/FaceCamera";

const steps = ["Buka Kelas", "Pilih kegiatan", "Pilih waktu kegiatan", "Verifikasi wajah petugas", "Presensi telah dibuka"];

export function FaceSessionPage() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "Santri") return <SantriPageShell>{({ santriDashboard, isSantriDashboardLoading }) => isSantriDashboardLoading ? <Loading /> : isFaceSessionOfficer(user.role, santriDashboard?.profile.tim) ? <FaceSessionContent /> : <Navigate to="/dashboard" replace />}</SantriPageShell>;
  return <RolePageShell allowedRoles={["Admin", "DewanGuru", "Pengurus"]}><FaceSessionContent /></RolePageShell>;
}

function FaceSessionContent() {
  const { token } = useAuth();
  const [classes, setClasses] = useState<FaceAttendanceClass[]>([]);
  const [activities, setActivities] = useState<FaceAttendanceActivity[]>([]);
  const [times, setTimes] = useState<FaceAttendanceTime[]>([]);
  const [classId, setClassId] = useState("");
  const [activityId, setActivityId] = useState("");
  const [timeId, setTimeId] = useState("");
  const [officerVerified, setOfficerVerified] = useState(false);
  const [session, setSession] = useState<FaceSession | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => { if (!token) return; void fetchFaceSessionOptions(token).then((r) => setClasses(r.classes)).catch((e) => setMessage(toUserMessage(e))); }, [token]);
  useEffect(() => { if (!token || !classId) { setActivities([]); return; } setActivityId(""); setTimeId(""); setOfficerVerified(false); void fetchFaceActivities(token, classId).then((r) => setActivities(r.activities)).catch((e) => setMessage(toUserMessage(e))); }, [token, classId]);
  useEffect(() => { if (!token || !classId || !activityId) { setTimes([]); return; } setTimeId(""); setOfficerVerified(false); void fetchFaceTimes(token, classId, activityId).then((r) => setTimes(r.times)).catch((e) => setMessage(toUserMessage(e))); }, [token, classId, activityId]);

  const verifyOfficer = async (imageData: string) => {
    if (!token || !classId || !activityId || !timeId) return;
    setBusy(true); setMessage(null);
    try { const result = await verifyFaceOfficer(token, { classId, activityId, timeId, imageData }); if (!result.verified) throw new Error(result.message || "Wajah petugas belum terverifikasi."); setOfficerVerified(true); setMessage("Wajah petugas berhasil diverifikasi. Sesi siap dibuka."); } catch (e) { setMessage(toUserMessage(e)); } finally { setBusy(false); }
  };
  const open = async () => { if (!token || !officerVerified) return; setBusy(true); setMessage(null); try { setSession(await openFaceSession(token, { classId, activityId, timeId })); } catch (e) { setMessage(toUserMessage(e)); } finally { setBusy(false); } };
  const close = async () => { if (!token || !session) return; setBusy(true); try { setSession(await closeFaceSession(token, session.id)); setMessage("Presensi wajah ditutup."); } catch (e) { setMessage(toUserMessage(e)); } finally { setBusy(false); } };
  const activeStep = session ? 5 : officerVerified ? 4 : timeId ? 4 : activityId ? 3 : classId ? 2 : 1;

  if (session) return <SessionMonitor session={session} onClose={close} busy={busy} message={message} />;
  return <div className="mx-auto max-w-5xl space-y-5"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Face recognition</p><h1 className="mt-1 text-2xl font-semibold text-gray-900">Buka Presensi Wajah</h1><p className="mt-2 text-sm text-gray-600">Sesi hanya dibuka setelah wajah petugas diverifikasi oleh backend.</p></div>{message ? <Alert message={message} /> : null}<ol className="grid gap-2 sm:grid-cols-5">{steps.map((step, index) => <li key={step} className={`rounded-xl border px-3 py-3 text-xs font-semibold ${index + 1 <= activeStep ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-gray-200 bg-gray-50 text-gray-500"}`}>{index + 1}. {step}</li>)}</ol><section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><div className="grid gap-4 md:grid-cols-3"><Select label="1. Buka Kelas" value={classId} onChange={setClassId} options={classes} placeholder="Pilih kelas dari backend" /><Select label="2. Pilih kegiatan" value={activityId} onChange={setActivityId} options={activities} placeholder="Pilih kegiatan" disabled={!classId} /><Select label="3. Pilih waktu kegiatan" value={timeId} onChange={setTimeId} options={times.map((time) => ({ id: time.id, name: time.label }))} placeholder="Pilih waktu" disabled={!activityId} /></div></section>{timeId ? <FaceCamera onCapture={verifyOfficer} isBusy={busy} captureLabel="Verifikasi wajah petugas" guidance="Langkah 4/5 — Pastikan hanya wajah petugas yang terlihat jelas." /> : null}{officerVerified ? <button type="button" onClick={() => void open()} disabled={busy} className="rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-emerald-300">{busy ? "Membuka sesi..." : "Buka Presensi Wajah"}</button> : null}</div>;
}

function Select({ label, value, onChange, options, placeholder, disabled = false }: { label: string; value: string; onChange: (value: string) => void; options: Array<{ id: string; name: string }>; placeholder: string; disabled?: boolean }) { return <label className="block text-sm font-medium text-gray-700">{label}<select value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm disabled:bg-gray-100"><option value="">{placeholder}</option>{options.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></label>; }
function SessionMonitor({ session, onClose, busy, message }: { session: FaceSession; onClose: () => void; busy: boolean; message: string | null }) { return <div className="mx-auto max-w-5xl space-y-5"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Face recognition</p><h1 className="mt-1 text-2xl font-semibold text-gray-900">Monitoring Presensi Wajah</h1></div>{message ? <Alert message={message} /> : null}<section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">{session.status}</span><h2 className="mt-3 text-xl font-semibold text-emerald-950">{session.className}</h2><p className="mt-1 text-sm text-emerald-900">{session.activityName} · {session.timeLabel}</p></div><button type="button" onClick={onClose} disabled={busy || session.status !== "Open"} className="rounded-lg border border-rose-300 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:text-gray-400">{busy ? "Menutup..." : "Tutup presensi"}</button></div><div className="mt-6 grid gap-3 sm:grid-cols-3">{[["Hadir", session.hadirCount], ["Belum hadir", session.belumHadirCount], ["Perlu review", session.reviewCount]].map(([label, value]) => <div key={String(label)} className="rounded-xl bg-white p-4"><p className="text-xs text-gray-500">{label}</p><p className="mt-1 text-2xl font-bold text-gray-900">{value}</p></div>)}</div>{session.sessionCode ? <p className="mt-5 text-sm text-emerald-900">Kode sesi dari backend: <strong>{session.sessionCode}</strong></p> : null}{session.qrCodeUrl ? <img className="mt-4 h-32 w-32 rounded-lg border bg-white p-2" src={session.qrCodeUrl} alt="QR sesi presensi dari backend" /> : null}</section></div>; }
function Alert({ message }: { message: string }) { return <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{message}</div>; }
function Loading() { return <div className="p-8 text-sm text-gray-600">Memeriksa akses tim...</div>; }
function toUserMessage(error: unknown) { if (error instanceof ApiError) { if (error.status === 401) return "Sesi login berakhir. Silakan masuk kembali."; if (error.status === 403) return "Anda tidak memiliki izin untuk membuka presensi wajah."; if (error.status === 503) return "Layanan AI sedang tidak tersedia. Sesi tidak dibuka."; return error.message; } return error instanceof Error ? error.message : "Permintaan belum dapat diproses."; }
