import type { Page, Request } from "@playwright/test";

export const roles = ["Admin", "Pengurus", "DewanGuru", "Santri", "WaliSantri"] as const;
export type MockRole = typeof roles[number];
type MockState = { enrollmentCount: number; verifyCalls: number; attendanceWrites: number; lastVerifyBody: string | null; lastVerifyDimensions: { width: number; height: number } | null; lastEnrollmentBody: string | null; failPath?: string; failStatus?: number; delayPath?: string; emptyChildren?: boolean };

const childA = { santriId: "11111111-1111-4111-8111-111111111111", nis: "A-101", fullName: "Anak Alfa", tim: "Tim Alfa" };
const childB = { santriId: "22222222-2222-4222-8222-222222222222", nis: "B-202", fullName: "Anak Beta", tim: "Tim Beta" };
const childC = { santriId: "33333333-3333-4333-8333-333333333333", nis: "C-303", fullName: "Anak Wali Lain", tim: "Tim C" };

const user = (identity: string) => {
  const role = identity === "wali-b" ? "WaliSantri" : roles.find((item) => item.toLowerCase() === identity.toLowerCase()) ?? "Santri";
  return { userId: `user-${identity}`, username: identity, fullName: `Akun ${identity}`, email: null, role, emailConfirmed: false, mustChangePassword: identity === "forced", isActive: true };
};

const pageOf = (items: unknown[], url: URL) => {
  const page = Number(url.searchParams.get("page") || 1);
  const perPage = Number(url.searchParams.get("perPage") || 100);
  return { items: items.slice((page - 1) * perPage, page * perPage), page, perPage, totalCount: items.length };
};

const marker = (child: typeof childA) => child === childA ? "ALFA" : child === childB ? "BETA" : "LAIN";
const presensi = (child: typeof childA, index: number) => ({ id: `${child.santriId}-${index}`, santriId: child.santriId, santriNama: child.fullName, santriNis: child.nis, santriTim: child.tim, tanggal: `2026-10-${String(index + 1).padStart(2, "0")}`, status: "hadir", waktu: "pagi", kegiatan: `Kegiatan ${marker(child)} ${index}`, keterangan: null, createdAtUtc: "2026-10-12T00:00:00Z", updatedAtUtc: null });
const kafarah = (child: typeof childA, index: number) => ({ id: `${child.santriId}-k-${index}`, santriId: child.santriId, santriNama: child.fullName, santriNis: child.nis, santriTim: child.tim, santriGender: "putra", tanggal: "2026-10-12", jenisPelanggaran: "test", jenisPelanggaranLabel: `Kafarah ${marker(child)} ${index}`, kafarah: "1", jumlahSetor: 0, tanggungan: 1, sisaTanggungan: index + 1, tenggat: null, createdAtUtc: "2026-10-12T00:00:00Z", updatedAtUtc: null });
const log = (child: typeof childA, index: number) => ({ id: `${child.santriId}-l-${index}`, santriId: child.santriId, santriNama: child.fullName, santriNis: child.nis, santriTim: child.tim, santriGender: "putra", tanggal: "2026-10-12", tujuan: `Tujuan ${marker(child)} ${index}`, waktuKeluar: null, waktuMasuk: null, rentang: null, status: "tercatat", catatan: null, createdAtUtc: "2026-10-12T00:00:00Z", updatedAtUtc: null });
const section = (child: typeof childA, category: string) => ({ category, summary: { total: 2, completed: child === childA ? 1 : 2, inProgress: 0, average: child === childA ? 50 : 100 }, modules: [{ judul: `Modul ${marker(child)} ${category}`, target: 10, value: 5, persentase: 50, updatedAtUtc: null }], recentUpdates: [{ id: child.santriId, judul: `Update ${marker(child)}`, capaian: 5, target: 10, satuan: null, persentase: 50, terakhirSetorUtc: null, updatedAtUtc: null }] });
const santriDashboard = { generatedAtUtc: "2026-10-12T00:00:00Z", profile: { santriId: childA.santriId, fullName: "Santri Sendiri", nis: childA.nis, kampus: "KH2", jurusan: "", gender: "putra", tim: "Tim Alfa", kelas: "1", emailConfirmed: false }, highlight: { attendancePercentage: 80, remainingKafarah: 1, averageProgressPercentage: 50, recordedLogs: 1 }, overview: { totalPresensi: 5, hadirCount: 4, totalKafarah: 1, sisaKafarah: 1, totalProgressEntries: 1, completedProgressEntries: 1, totalLogs: 1, recordedLogCount: 1 }, attendance: { total: 5, hadir: 4, izin: 1, sakit: 0, alpha: 0, persentase: 80, recent: [] }, kafarah: { total: 1, totalKafarah: 1, jumlahSetor: 0, sisaTanggungan: 1, recent: [] }, progress: { total: 1, completed: 1, inProgress: 0, average: 50, quran: 1, hadits: 0, recent: [] }, logs: { total: 1, tercatat: 1, recent: [] } };

export async function mockApi(page: Page) {
  const state: MockState = { enrollmentCount: 0, verifyCalls: 0, attendanceWrites: 0, lastVerifyBody: null, lastVerifyDimensions: null, lastEnrollmentBody: null };
  const calls: Array<{ path: string; method: string; token: string | null }> = [];
  await page.route("**/api/v1/**", async (route) => {
    const request: Request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();
    const bearer = request.headers().authorization?.replace(/^Bearer /i, "") ?? null;
    calls.push({ path: `${path}${url.search}`, method, token: bearer });
    const identity = bearer?.replace(/^mock-token-/, "") ?? "";
    const account = user(identity);
    const linked = state.emptyChildren ? [] : identity === "wali-b" ? [childC] : [childA, childB];
    const selected = [childA, childB, childC].find((item) => item.santriId === url.searchParams.get("santriId") || item.nis === url.searchParams.get("santriCode"));
    const fulfill = (json: unknown, status = 200) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(json) });
    if (state.delayPath && path === state.delayPath) await new Promise((resolve) => setTimeout(resolve, 500));
    if (state.failPath && path === state.failPath) return fulfill({ title: `Mock ${state.failStatus}` }, state.failStatus ?? 500);
    if (path === "/api/v1/auth/login" && method === "POST") {
      const body = request.postDataJSON() as { identity: string };
      const target = user(body.identity);
      return fulfill({ ...target, accessToken: `mock-token-${body.identity}`, tokenType: "Bearer", expiresInSeconds: 3600 });
    }
    if (!bearer || !bearer.startsWith("mock-token-")) return fulfill({ title: "Unauthorized" }, 401);
    if (path === "/api/v1/auth/me") return fulfill(account);
    if (path === "/api/v1/auth/logout") return route.fulfill({ status: 204 });
    if (path === "/api/v1/auth/change-password" && method === "POST") return route.fulfill({ status: 204 });
    if (path === "/api/v1/wali/me/children") return account.role === "WaliSantri" ? fulfill({ items: linked }) : fulfill({ title: "Forbidden" }, 403);
    if (path === "/api/v1/dashboard/santri/me") return account.role === "Santri" ? fulfill(santriDashboard) : fulfill({ title: "Forbidden" }, 403);
    if (path === "/api/v1/santri") return fulfill({ items: [childA, childB].map((item) => ({ id: item.santriId, nama: item.fullName, nis: item.nis })), page: 1, perPage: 100, totalCount: 12 });
    if (path === "/api/v1/progress-keilmuan/staff") return fulfill({ category: url.searchParams.get("category"), summary: { totalSantri: 12, activeSantri: 9, average: 64, completedModules: 30, moduleCount: 40 }, rows: [{ santriId: childA.santriId, code: childA.nis, nama: childA.fullName, gender: "putra", kelas: "1", tim: childA.tim, completed: 2, inProgress: 1, average: 65, updatedAtUtc: null }], page: Number(url.searchParams.get("page") || 1), perPage: Number(url.searchParams.get("perPage") || 5), totalCount: 1 });
    if (path === "/api/v1/progress-keilmuan") {
      if (account.role === "WaliSantri" && (!selected || !linked.some((item) => item.santriId === selected.santriId))) return fulfill({ title: "Forbidden" }, 403);
      const child = selected ?? childA;
      return account.role === "WaliSantri" ? fulfill({ santri: { id: child.santriId, nama: child.fullName, nis: child.nis, gender: "putra", tim: child.tim, kelas: "1" }, quran: section(child, "al-quran"), hadits: section(child, "al-hadits") }) : fulfill(section(child, url.searchParams.get("category") || "al-quran"));
    }
    if (["/api/v1/presensi", "/api/v1/kafarah", "/api/v1/log-keluar-masuk"].includes(path)) {
      if (method !== "GET") { state.attendanceWrites++; return fulfill({ title: "Unexpected write" }, 500); }
      if (account.role === "WaliSantri" && (!selected || !linked.some((item) => item.santriId === selected.santriId))) return fulfill({ title: "Forbidden" }, 403);
      if (account.role !== "WaliSantri" && account.role !== "Santri" && path.endsWith("log-keluar-masuk") && url.searchParams.get("scope") !== "team") return fulfill({ title: "Forbidden" }, 403);
      const child = selected ?? childA;
      if (path.endsWith("presensi")) return fulfill(pageOf(Array.from({ length: account.role === "WaliSantri" ? 23 : 3 }, (_, index) => presensi(child, index)), url));
      if (path.endsWith("kafarah")) return fulfill(pageOf(Array.from({ length: account.role === "WaliSantri" ? 22 : 1 }, (_, index) => kafarah(child, index)), url));
      return fulfill(pageOf(Array.from({ length: account.role === "WaliSantri" ? 21 : 2 }, (_, index) => log(child, index)), url));
    }
    if (path === "/api/v1/face-profiles/me/enrollment") {
      if (account.role !== "Santri") return fulfill({ title: "Forbidden" }, 403);
      if (method === "POST") { state.lastEnrollmentBody = request.postData() ?? ""; state.enrollmentCount = 5; return fulfill({ id: "mock-enrollment", status: "Active", sampleCount: 5, modelName: "mock", modelVersion: "1", enrolledAtUtc: "2026-10-12T00:00:00Z" }, 201); }
      return fulfill({ isEnrolled: state.enrollmentCount === 5, status: state.enrollmentCount === 5 ? "Active" : null, sampleCount: state.enrollmentCount, modelName: null, modelVersion: null, enrolledAtUtc: null });
    }
    if (path === "/api/v1/face-profiles/me/verify") {
      state.verifyCalls++;
      state.lastVerifyBody = request.postData() ?? "";
      state.lastVerifyDimensions = jpegDimensions(request.postDataBuffer());
      return fulfill({ verified: true, similarity: 0.87, reason: null });
    }
    return fulfill({ title: `Unmocked: ${path}` }, 404);
  });
  return { state, calls, childA, childB, childC };
}

function jpegDimensions(body: Buffer | null): { width: number; height: number } | null {
  if (!body) return null;
  let offset = body.indexOf(Buffer.from([0xff, 0xd8]));
  if (offset < 0) return null;
  offset += 2;
  while (offset + 9 < body.length && body[offset] === 0xff) {
    const marker = body[offset + 1];
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) return { height: body.readUInt16BE(offset + 5), width: body.readUInt16BE(offset + 7) };
    const segmentLength = body.readUInt16BE(offset + 2);
    if (segmentLength < 2) return null;
    offset += 2 + segmentLength;
  }
  return null;
}
