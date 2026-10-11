const teamAliases: Record<string, string> = {
  ketertiban: "ktb",
  timketertiban: "ktb",
  timktb: "ktb",
  timkbm: "kbm",
  keilmuan: "kbm",
  timkeilmuan: "kbm",
};

export function normalizeSantriTeam(team: string | null | undefined): string {
  const normalized = (team ?? "")
    .toLocaleLowerCase("id-ID")
    .replace(/[^a-z0-9]/g, "");

  return teamAliases[normalized] ?? normalized;
}

export function isSantriTeam(
  actualTeam: string | null | undefined,
  expectedTeam: string
): boolean {
  return normalizeSantriTeam(actualTeam) === normalizeSantriTeam(expectedTeam);
}

export function canAccessSantriTeam(
  actualTeam: string | null | undefined,
  allowedTeams: readonly string[]
): boolean {
  return allowedTeams.some((team) => isSantriTeam(actualTeam, team));
}
