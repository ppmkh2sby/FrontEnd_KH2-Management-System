import { useMemo } from "react";

import { formatLongDate, formatShortDate } from "@/shared/lib/santri-data";
import { AppIcon } from "@/shared/ui/AppIcon";
import { SantriPageShell } from "@/widgets/app-shell/SantriPageShell";

export function KafarahMinePage() {
  return (
    <SantriPageShell>
      {({ santriDashboard, santriDashboardError, isSantriDashboardLoading }) => (
        <KafarahMineContent
          santriDashboard={santriDashboard}
          santriDashboardError={santriDashboardError}
          isSantriDashboardLoading={isSantriDashboardLoading}
        />
      )}
    </SantriPageShell>
  );
}

function KafarahMineContent({
  santriDashboard,
  santriDashboardError,
  isSantriDashboardLoading,
}: {
  santriDashboard: import("@/shared/types/dashboard").SantriDashboardResponse | null;
  santriDashboardError: string | null;
  isSantriDashboardLoading: boolean;
}) {
  const rows = useMemo(
    () =>
      santriDashboard?.kafarah.recent.map((item) => ({
        id: item.id,
        tanggal: item.tanggal,
        jenisPelanggaranLabel: item.jenisPelanggaranLabel,
        kafarah: item.kafarah,
        tenggat: item.tenggat || "-",
      })) ?? [],
    [santriDashboard]
  );

  const stats = santriDashboard
    ? {
        total: santriDashboard.kafarah.total,
        totalKafarah: santriDashboard.kafarah.totalKafarah,
        jumlahSetor: santriDashboard.kafarah.jumlahSetor,
        tanggungan: santriDashboard.kafarah.sisaTanggungan,
      }
    : {
        total: 0,
        totalKafarah: 0,
        jumlahSetor: 0,
        tanggungan: 0,
      };

  if (isSantriDashboardLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-5 w-40 rounded-lg bg-gray-200" />
        <div className="h-16 rounded-2xl bg-gray-100" />
        <div className="grid grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-24 rounded-xl border border-gray-200 bg-white" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-500">
        <span>Dashboard</span>
        <span className="mx-2">{"›"}</span>
        <span className="text-gray-900">Kafarah Saya</span>
      </div>

      <div>
        <h1 className="text-2xl font-semibold leading-8 text-gray-900">Kafarah Saya</h1>
        <p className="mt-1 text-xs leading-relaxed text-gray-600">Data kafarah Anda dari backend.</p>
        {santriDashboardError ? (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {santriDashboardError}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          ["Total Pelanggaran", stats.total],
          ["Total Kafarah", stats.totalKafarah],
          ["Jumlah Setor", stats.jumlahSetor],
          ["Tanggungan Kafarah", stats.tanggungan],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white px-4 py-3.5 shadow-sm">
            <p className="text-xs font-medium leading-tight text-gray-600">{label}</p>
            <p className="mt-1.5 text-2xl font-semibold leading-8 text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_375px]">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-4 py-3.5">
            <h2 className="text-base font-semibold leading-6 text-gray-900">Riwayat Keseluruhan Kafarah</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  {["Tanggal", "Jenis Pelanggaran", "Kafarah", "Tenggat"].map((label) => (
                    <th key={label} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-gray-600">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {rows.length > 0 ? (
                  rows.map((row) => (
                    <tr key={row.id} className="transition-colors hover:bg-gray-50">
                      <td className="px-4 py-3 text-xs font-medium text-gray-900">{formatShortDate(row.tanggal)}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{row.jenisPelanggaranLabel}</td>
                      <td className="px-4 py-3 text-xs font-medium text-gray-900">{row.kafarah}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{row.tenggat === "-" ? "-" : formatShortDate(row.tenggat)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <AppIcon name="inbox" className="h-10 w-10 text-gray-300" />
                        <p className="text-xs font-medium text-gray-500">Belum ada data kafarah.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="h-fit overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-3.5 py-3">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Update Terbaru</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {rows.length > 0 ? (
              rows.slice(0, 5).map((row) => (
                <div key={row.id} className="px-3.5 py-3">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <p className="flex-1 text-sm font-semibold leading-5 text-gray-900">{row.jenisPelanggaranLabel}</p>
                    <span className="text-xs font-medium text-gray-600">{row.kafarah}</span>
                  </div>
                  <p className="text-xs font-medium leading-tight text-gray-500">{formatLongDate(row.tanggal)}</p>
                </div>
              ))
            ) : (
              <div className="px-3.5 py-10 text-center">
                <div className="flex flex-col items-center gap-1.5">
                  <AppIcon name="clock" className="h-8 w-8 text-gray-300" />
                  <p className="text-xs font-medium text-gray-500">Belum ada update terbaru.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
