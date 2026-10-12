const teamAliases: Record<string, string> = {
  KETERTIBAN: "KTB",
  TIMKETERTIBAN: "KTB",
  TIMKTB: "KTB",
};

export function normalizeSantriTeam(team: string | null | undefined): string {
  const normalized = (team ?? "")
    .replace(/[^\p{L}\p{N}]/gu, "")
    .toUpperCase();

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
