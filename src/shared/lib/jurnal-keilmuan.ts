import { http } from "@/shared/lib/http";
import type { JurnalKeilmuanItem, JurnalKeilmuanPage, QuranSurahOption, SaveJurnalKeilmuan } from "@/shared/types/jurnal-keilmuan";

const basePath = "/api/v1/jurnal-keilmuan";

export function fetchJurnalKeilmuan(accessToken: string, bulan: string) {
  return http<JurnalKeilmuanPage>(`${basePath}?bulan=${encodeURIComponent(bulan)}`, { accessToken });
}

export function fetchQuranSurahs(accessToken: string) {
  return http<QuranSurahOption[]>(`${basePath}/surah`, { accessToken });
}

export function createJurnalKeilmuan(accessToken: string, payload: SaveJurnalKeilmuan) {
  return http<JurnalKeilmuanItem>(basePath, { method: "POST", accessToken, body: JSON.stringify(payload) });
}

export function updateJurnalKeilmuan(accessToken: string, id: string, payload: SaveJurnalKeilmuan) {
  return http<JurnalKeilmuanItem>(`${basePath}/${id}`, { method: "PUT", accessToken, body: JSON.stringify(payload) });
}

export function deleteJurnalKeilmuan(accessToken: string, id: string) {
  return http<void>(`${basePath}/${id}`, { method: "DELETE", accessToken });
}
