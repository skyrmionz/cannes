export interface TeamLivery {
  primary: string;
  secondary: string;
  accent: string;
}

export const TEAM_LIVERIES: Record<string, TeamLivery> = {
  "racing-bulls": { primary: "#1C1F4A", secondary: "#E1002A", accent: "#FFFFFF" },
  "red-bull": { primary: "#1E41FF", secondary: "#E1002A", accent: "#FFD700" },
  mclaren: { primary: "#FF8000", secondary: "#1E1E1E", accent: "#47C7FC" },
  ferrari: { primary: "#DC0000", secondary: "#FFF200", accent: "#1E1E1E" },
  mercedes: { primary: "#27F4D2", secondary: "#1E1E1E", accent: "#FFFFFF" },
  "aston-martin": { primary: "#006F62", secondary: "#CEDC00", accent: "#FFFFFF" },
  williams: { primary: "#00A0DE", secondary: "#FFFFFF", accent: "#1E1E1E" },
  alpine: { primary: "#0090D0", secondary: "#FF87BC", accent: "#FFFFFF" },
  audi: { primary: "#C4122E", secondary: "#1E1E1E", accent: "#BFBFBF" },
  haas: { primary: "#B6BABD", secondary: "#E0002A", accent: "#1E1E1E" },
  cadillac: { primary: "#0A1F33", secondary: "#9B1B30", accent: "#FFD700" },
};

export function liveryFor(teamId: string): TeamLivery {
  return TEAM_LIVERIES[teamId] ?? TEAM_LIVERIES.ferrari;
}
