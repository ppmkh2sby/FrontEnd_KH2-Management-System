export type QuranSurahOption = {
  id: string;
  number: number;
  name: string;
  arabicName: string;
  verseCount: number;
};

export type JurnalKeilmuanItem = {
  id: string;
  tanggal: string;
  bulan: string;
  sesiSambung: string;
  kelas: string;
  namaDewanGuru: string;
  jamMengajar: number;
  adaMateri: boolean | null;
  jenisMateri: string;
  dibuatOleh: string;
  quranTargetSurahId: string | null;
  quranTargetSurah: string | null;
  quranAyatAwal: number | null;
  quranAyatTarget: number | null;
  quranRealisasiSurahId: string | null;
  quranRealisasiSurah: string | null;
  quranAyatRealisasi: number | null;
  targetAyat: number | null;
  capaianAyat: number | null;
  persentaseTarget: number | null;
  sesuaiTarget: boolean | null;
  quranKeterangan: string | null;
  details: Record<string, string | null>;
};

export type LaporanHarianJurnal = {
  tanggal: string;
  jumlahJurnal: number;
  jurnalBertarget: number;
  jurnalSesuaiTarget: number;
  rataRataPersentase: number;
  sesuaiTargetHarian: boolean;
};

export type JurnalKeilmuanPage = {
  bulan: string;
  items: JurnalKeilmuanItem[];
  laporan: {
    bulan: string;
    jumlahJurnal: number;
    jurnalBertarget: number;
    jurnalSesuaiTarget: number;
    jurnalBelumSesuai: number;
    rataRataPersentase: number;
    harian: LaporanHarianJurnal[];
  };
};

export type SaveJurnalKeilmuan = {
  tanggal: string;
  sesiSambung: string;
  kelas: string;
  namaDewanGuru: string;
  jamMengajar: number;
  adaMateri: boolean | null;
  jenisMateri: string;
  quranTargetSurahId: string | null;
  quranAyatAwal: number | null;
  quranAyatTarget: number | null;
  quranRealisasiSurahId: string | null;
  quranAyatRealisasi: number | null;
  quranKeterangan: string;
  details: Record<string, string>;
};
