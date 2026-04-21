export const SPACE_COLOR_PRESETS = [
  "#60a5fa",
  "#f87171",
  "#fbbf24",
  "#a78bfa",
  "#34d399",
  "#94a3b8",
  "#6366f1",
  "#fb923c",
] as const;

export type SpaceColor = (typeof SPACE_COLOR_PRESETS)[number];

export const SpaceVisibility = {
  PrivateToTeam: "PRIVATE_TO_TEAM",
  Public: "PUBLIC",
} as const;

export type SpaceVisibility = (typeof SpaceVisibility)[keyof typeof SpaceVisibility];
