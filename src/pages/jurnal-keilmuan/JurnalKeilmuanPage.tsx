import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { ApiError } from "@/shared/lib/http";
import { createJurnalKeilmuan, deleteJurnalKeilmuan, fetchJurnalKeilmuan, fetchQuranSurahs, updateJurnalKeilmuan } from "@/shared/lib/jurnal-keilmuan";
import type { JurnalKeilmuanItem, JurnalKeilmuanPage as JurnalPage, QuranSurahOption, SaveJurnalKeilmuan } from "@/shared/types/jurnal-keilmuan";
import { SantriPageShell } from "@/widgets/app-shell/SantriPageShell";

const sessions = ["SUBUH", "MALAM", "PENGGANTI", "TEKS", "ASAD", "TURBA", "LATIHAN NASEHAT MENYAMPAIKAN", "KELAS KELAS AN", "ASRAMA MINGGUAN", "NOTULEN", "PENGAJIAN", "LAINNYA"];
const classes = ["LAMBATAN", "CEPATAN", "KOMUNAL", "PENGGANTI"];
const materialTypes = ["AL-QURAN", "AL-HADIST", "TEKS", "ASAD", "TURBA", "MATERI KELAS", "LATIHAN NASEHAT MENYAMPAIKAN", "PRAKTEK KEILMUAN", "LAINNYA"];
const detailFields = [
  ["haditsTargetMateri", "Materi target Al-Hadits"], ["haditsTargetHalaman", "Halaman target Al-Hadits"], ["haditsRealisasi", "Realisasi Al-Hadits"], ["haditsRealisasiHalaman", "Halaman realisasi Al-Hadits"], ["haditsKeterangan", "Keterangan Al-Hadits"], ["targetHaditsSelanjutnya", "Target Hadits selanjutnya"], ["targetQuranSelanjutnya", "Target Al-Qur'an selanjutnya + bacaan"], ["keteranganMateriKelas", "Keterangan materi kelas"], ["keteranganKelasKelasAn", "Keterangan kelas-kelasan"], ["keteranganTurba", "Keterangan turba"], ["latihanNasehat", "Siapa latihan nasehat"], ["latihanMenyampaikan", "Siapa latihan menyampaikan"], ["keteranganLatihan", "Keterangan latihan nasehat & menyampaikan"], ["keteranganTeks", "Keterangan teks"], ["keteranganAsad", "Keterangan ASAD"], ["materiPraktek", "Materi praktek keilmuan"], ["keteranganPraktek", "Keterangan praktek keilmuan"], ["pengajian", "Pengajian apa"], ["keteranganLain", "Keterangan lainnya"], ["pemateriTurba", "Pemateri/dewan guru turba"], ["turba", "Turba apa"], ["dewanGuruTeks", "Dewan guru teks"], ["asadPutraPutri", "ASAD putra/putri"], ["dewanGuruAsad", "Dewan guru ASAD"], ["dewanGuruLatihan", "Dewan guru latihan nasehat/menyampaikan"], ["dewanGuruPraktek", "Dewan guru praktek keilmuan"], ["dewanGuruPengajian", "Pemateri/dewan guru pengajian"], ["materiLatihanMenyampaikan", "Materi latihan menyampaikan"], ["materiLatihanNasehat", "Materi latihan nasehat"],
] as const;
type DetailKey = (typeof detailFields)[number][0];
type FormState = SaveJurnalKeilmuan & { details: Record<DetailKey, string> };

const monthToday = () => new Date().toISOString().slice(0, 7);
const dateToday = () => new Date().toISOString().slice(0, 10);
const emptyDetails = (): Record<DetailKey, string> => Object.fromEntries(detailFields.map(([key]) => [key, ""])) as Record<DetailKey, string>;
const createEmptyForm = (): FormState => ({ tanggal: dateToday(), sesiSambung: "SUBUH", kelas: "LAMBATAN", namaDewanGuru: "", jamMengajar: 1, adaMateri: true, jenisMateri: "AL-QURAN", quranTargetSurahId: null, quranAyatAwal: null, quranAyatTarget: null, quranRealisasiSurahId: null, quranAyatRealisasi: null, quranKeterangan: "", details: emptyDetails() });

export function JurnalKeilmuanPage() {
  return <SantriPageShell allowedTeams={["KBM"]}>{() => <JurnalKeilmuanContent />}</SantriPageShell>;
}

function JurnalKeilmuanContent() {
  const { token } = useAuth();
  const [month, setMonth] = useState(monthToday);
  const [page, setPage] = useState<JurnalPage | null>(null);
  const [surahs, setSurahs] = useState<QuranSurahOption[]>([]);
  const [form, setForm] = useState<FormState>(createEmptyForm);
  const [editing, setEditing] = useState<JurnalKeilmuanItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!token) return;
    setIsLoading(true); setError(null);
    try {
      const [nextPage, nextSurahs] = await Promise.all([fetchJurnalKeilmuan(token, month), fetchQuranSurahs(token)]);
      setPage(nextPage); setSurahs(nextSurahs);
    } catch (cause) { setError(message(cause)); } finally { setIsLoading(false); }
  };
  useEffect(() => { void load(); }, [token, month]);

  const selectedTarget = useMemo(() => surahs.find((x) => x.id === form.quranTargetSurahId) ?? null, [form.quranTargetSurahId, surahs]);
  const selectedActual = useMemo(() => surahs.find((x) => x.id === form.quranRealisasiSurahId) ?? null, [form.quranRealisasiSurahId, surahs]);
  const reset = () => { setEditing(null); setForm(createEmptyForm()); setError(null); };
  const edit = (item: JurnalKeilmuanItem) => {
    setEditing(item);
    setForm({ tanggal: item.tanggal, sesiSambung: item.sesiSambung, kelas: item.kelas, namaDewanGuru: item.namaDewanGuru, jamMengajar: item.jamMengajar, adaMateri: item.adaMateri, jenisMateri: item.jenisMateri, quranTargetSurahId: item.quranTargetSurahId, quranAyatAwal: item.quranAyatAwal, quranAyatTarget: item.quranAyatTarget, quranRealisasiSurahId: item.quranRealisasiSurahId, quranAyatRealisasi: item.quranAyatRealisasi, quranKeterangan: item.quranKeterangan ?? "", details: { ...emptyDetails(), ...Object.fromEntries(Object.entries(item.details).map(([key, value]) => [key, value ?? ""])) } });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); if (!token) return;
    setIsSaving(true); setError(null);
    try { editing ? await updateJurnalKeilmuan(token, editing.id, form) : await createJurnalKeilmuan(token, form); reset(); await load(); }
    catch (cause) { setError(message(cause)); } finally { setIsSaving(false); }
  };
  const remove = async (item: JurnalKeilmuanItem) => {
    if (!token || !window.confirm(`Hapus jurnal ${item.tanggal} (${item.jenisMateri})?`)) return;
    try { await deleteJurnalKeilmuan(token, item.id); if (editing?.id === item.id) reset(); await load(); } catch (cause) { setError(message(cause)); }
  };
  const numberValue = (value: string) => value === "" ? null : Math.max(0, Number.parseInt(value, 10) || 0);

  return <main className="space-y-6">
    <section className="rounded-2xl border border-emerald-100 bg-[linear-gradient(120deg,#edfff7,#fff)] p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Tim KBM</p><h1 className="mt-1 text-3xl font-bold text-slate-900">Jurnal Keilmuan</h1>
      <p className="mt-2 max-w-3xl text-sm text-slate-600">Rekap kegiatan keilmuan sesuai jurnal KBM. Capaian Al-Qur’an dihitung otomatis dari ayat awal, target, dan realisasi.</p>
    </section>
    {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
    <section className="grid gap-4 md:grid-cols-4">{[
      ["Total jurnal", page?.laporan.jumlahJurnal ?? 0, "bg-white"], ["Jurnal bertarget", page?.laporan.jurnalBertarget ?? 0, "bg-sky-50"], ["Target terpenuhi", page?.laporan.jurnalSesuaiTarget ?? 0, "bg-emerald-50"], ["Rata-rata capaian", `${page?.laporan.rataRataPersentase ?? 0}%`, "bg-amber-50"],
    ].map(([label, value, color]) => <div key={String(label)} className={`rounded-xl border border-slate-200 p-4 ${color}`}><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-slate-900">{value}</p></div>)}</section>
    <form onSubmit={save} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold text-slate-900">{editing ? "Ubah jurnal" : "Input jurnal baru"}</h2><p className="text-xs text-slate-500">Kolom mengikuti Google Sheet KBM.</p></div>{editing && <button type="button" onClick={reset} className="rounded-lg border px-3 py-2 text-sm">Batal ubah</button>}</div>
      <div className="grid gap-4 md:grid-cols-3"><Field label="Tanggal"><input required type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} /></Field><SelectField label="Sesi sambung" value={form.sesiSambung} options={sessions} onChange={(value) => setForm({ ...form, sesiSambung: value })} /><SelectField label="Kelas" value={form.kelas} options={classes} onChange={(value) => setForm({ ...form, kelas: value })} /><Field label="Nama dewan guru"><input required value={form.namaDewanGuru} onChange={(e) => setForm({ ...form, namaDewanGuru: e.target.value })} placeholder="Contoh: Ust. Amir" /></Field><Field label="Jam mengajar"><input required type="number" min="0" max="24" step="0.5" value={form.jamMengajar} onChange={(e) => setForm({ ...form, jamMengajar: Number(e.target.value) })} /></Field><SelectField label="Ada materi" value={form.adaMateri === null ? "" : form.adaMateri ? "ya" : "tidak"} options={["", "ya", "tidak"]} labels={["Pilih", "Ya", "Tidak"]} onChange={(value) => setForm({ ...form, adaMateri: value === "" ? null : value === "ya" })} /><SelectField label="Jenis materi" value={form.jenisMateri} options={materialTypes} onChange={(value) => setForm({ ...form, jenisMateri: value })} /></div>
      <section className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4"><h3 className="font-bold text-emerald-950">Materi Al-Qur’an</h3><p className="mb-4 text-xs text-emerald-800">Surat berasal dari tabel master Al-Qur’an. Ayat hanya angka dan divalidasi sesuai jumlah ayat surat.</p>
        <div className="grid gap-4 md:grid-cols-3"><SurahSelect label="Surat target" value={form.quranTargetSurahId} options={surahs} onChange={(id) => setForm({ ...form, quranTargetSurahId: id, quranAyatAwal: null, quranAyatTarget: null })} /><NumberField label="Ayat awal" value={form.quranAyatAwal} max={selectedTarget?.verseCount} onChange={(value) => setForm({ ...form, quranAyatAwal: value })} /><NumberField label="Ayat target" value={form.quranAyatTarget} max={selectedTarget?.verseCount} onChange={(value) => setForm({ ...form, quranAyatTarget: value })} /><SurahSelect label="Surat realisasi" value={form.quranRealisasiSurahId} options={surahs} onChange={(id) => setForm({ ...form, quranRealisasiSurahId: id, quranAyatRealisasi: null })} /><NumberField label="Ayat realisasi" value={form.quranAyatRealisasi} max={selectedActual?.verseCount} onChange={(value) => setForm({ ...form, quranAyatRealisasi: value })} /><Field label="Keterangan Al-Qur'an"><input value={form.quranKeterangan} onChange={(e) => setForm({ ...form, quranKeterangan: e.target.value })} placeholder="Otomatis penuh/kurang tersedia di laporan" /></Field></div>
      </section>
      <details className="mt-5 rounded-xl border border-slate-200 p-4"><summary className="cursor-pointer font-bold text-slate-800">Kolom detail jurnal lainnya (Al-Hadits, teks, ASAD, turba, latihan, pengajian)</summary><div className="mt-4 grid gap-4 md:grid-cols-2">{detailFields.map(([key, label]) => <Field key={key} label={label}><input value={form.details[key]} onChange={(e) => setForm({ ...form, details: { ...form.details, [key]: e.target.value } })} /></Field>)}</div></details>
      <div className="mt-5 flex justify-end gap-3"><button type="submit" disabled={isSaving} className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">{isSaving ? "Menyimpan..." : editing ? "Simpan perubahan" : "Simpan jurnal"}</button></div>
    </form>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold">Laporan bulanan otomatis</h2><p className="text-xs text-slate-500">Kesesuaian harian dihitung dari seluruh jurnal Al-Qur’an bertarget pada hari tersebut.</p></div><input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" /></div>{isLoading ? <p className="py-10 text-center text-sm text-slate-500">Memuat jurnal...</p> : <><div className="mb-5 grid gap-3 md:grid-cols-3">{page?.laporan.harian.map((day) => <div key={day.tanggal} className="rounded-lg border p-3"><p className="text-xs text-slate-500">{day.tanggal}</p><p className="mt-1 font-bold">{day.rataRataPersentase}% · {day.sesuaiTargetHarian ? "Sesuai target" : "Belum sesuai"}</p><p className="text-xs text-slate-500">{day.jurnalSesuaiTarget}/{day.jurnalBertarget} target terpenuhi</p></div>)}</div><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="border-b text-xs text-slate-500"><tr><th className="p-2">Tanggal</th><th className="p-2">Sesi</th><th className="p-2">Materi</th><th className="p-2">Target / realisasi</th><th className="p-2">Capaian</th><th className="p-2"></th></tr></thead><tbody>{page?.items.map((item) => <tr key={item.id} className="border-b"><td className="p-2">{item.tanggal}<br/><span className="text-xs text-slate-500">{item.kelas}</span></td><td className="p-2">{item.sesiSambung}<br/><span className="text-xs text-slate-500">{item.namaDewanGuru}</span></td><td className="p-2">{item.jenisMateri}</td><td className="p-2 text-xs">{item.quranTargetSurah ? `${item.quranTargetSurah}: ${item.quranAyatAwal}–${item.quranAyatTarget}` : "—"}<br/>{item.quranRealisasiSurah ? `${item.quranRealisasiSurah}: ${item.quranAyatRealisasi}` : ""}</td><td className="p-2">{item.persentaseTarget === null ? "—" : <span className={item.sesuaiTarget ? "font-bold text-emerald-700" : "font-bold text-amber-700"}>{item.persentaseTarget}%</span>}</td><td className="p-2 whitespace-nowrap"><button type="button" onClick={() => edit(item)} className="mr-3 text-emerald-700">Ubah</button><button type="button" onClick={() => void remove(item)} className="text-red-600">Hapus</button></td></tr>)}{!page?.items.length && <tr><td colSpan={6} className="p-8 text-center text-slate-500">Belum ada jurnal pada bulan ini.</td></tr>}</tbody></table></div></>}</section>
  </main>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid gap-1.5 text-sm font-semibold text-slate-700"><span>{label}</span><span className="[&>input]:w-full [&>input]:rounded-lg [&>input]:border [&>input]:border-slate-300 [&>input]:bg-white [&>input]:px-3 [&>input]:py-2 [&>input]:font-normal">{children}</span></label>; }
function SelectField({ label, value, options, labels, onChange }: { label: string; value: string; options: readonly string[]; labels?: readonly string[]; onChange: (value: string) => void }) { return <Field label={label}><select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal">{options.map((option, index) => <option key={option} value={option}>{labels?.[index] ?? option}</option>)}</select></Field>; }
function SurahSelect({ label, value, options, onChange }: { label: string; value: string | null; options: QuranSurahOption[]; onChange: (value: string | null) => void }) { return <Field label={label}><select value={value ?? ""} onChange={(e) => onChange(e.target.value || null)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal"><option value="">Tidak diisi</option>{options.map((option) => <option key={option.id} value={option.id}>{option.number}. {option.name} — {option.verseCount} ayat</option>)}</select></Field>; }
function NumberField({ label, value, max, onChange }: { label: string; value: number | null; max?: number; onChange: (value: number | null) => void }) { return <Field label={label}><input type="number" min="1" max={max} value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))} /></Field>; }
function message(cause: unknown) { return cause instanceof ApiError ? cause.message : "Jurnal tidak dapat diproses. Silakan coba lagi."; }
