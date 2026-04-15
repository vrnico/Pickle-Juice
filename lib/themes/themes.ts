export interface ThemePalette {
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  primary: string;
  primaryForeground: string;
  consume: string;
  create: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  unlockedAtLevel: number;
  palette: ThemePalette;
}

export const THEMES: Theme[] = [
  {
    id: "default",
    name: "Pickle Default",
    description: "Brine green and a clean canvas.",
    unlockedAtLevel: 1,
    palette: {
      background: "oklch(0.99 0 0)",
      foreground: "oklch(0.15 0 0)",
      muted: "oklch(0.96 0 0)",
      mutedForeground: "oklch(0.45 0 0)",
      border: "oklch(0.92 0 0)",
      primary: "oklch(0.55 0.18 145)",
      primaryForeground: "oklch(0.99 0 0)",
      consume: "oklch(0.58 0.19 260)",
      create: "oklch(0.68 0.17 140)",
    },
  },
  {
    id: "dill",
    name: "Dill Patch",
    description: "Earthy greens for the patient gardener.",
    unlockedAtLevel: 2,
    palette: {
      background: "oklch(0.97 0.01 130)",
      foreground: "oklch(0.20 0.04 145)",
      muted: "oklch(0.92 0.02 130)",
      mutedForeground: "oklch(0.45 0.04 145)",
      border: "oklch(0.85 0.04 135)",
      primary: "oklch(0.50 0.13 135)",
      primaryForeground: "oklch(0.99 0 0)",
      consume: "oklch(0.55 0.16 250)",
      create: "oklch(0.55 0.15 145)",
    },
  },
  {
    id: "brine",
    name: "Salt Brine",
    description: "Cool saltwater hues.",
    unlockedAtLevel: 3,
    palette: {
      background: "oklch(0.97 0.01 220)",
      foreground: "oklch(0.20 0.04 230)",
      muted: "oklch(0.92 0.02 220)",
      mutedForeground: "oklch(0.45 0.04 230)",
      border: "oklch(0.85 0.04 220)",
      primary: "oklch(0.55 0.13 220)",
      primaryForeground: "oklch(0.99 0 0)",
      consume: "oklch(0.55 0.16 250)",
      create: "oklch(0.60 0.16 175)",
    },
  },
  {
    id: "kosher",
    name: "Kosher Deli",
    description: "Warm parchment and mustard.",
    unlockedAtLevel: 4,
    palette: {
      background: "oklch(0.98 0.02 80)",
      foreground: "oklch(0.20 0.04 60)",
      muted: "oklch(0.93 0.03 80)",
      mutedForeground: "oklch(0.50 0.05 60)",
      border: "oklch(0.85 0.05 75)",
      primary: "oklch(0.65 0.16 80)",
      primaryForeground: "oklch(0.15 0 0)",
      consume: "oklch(0.55 0.16 280)",
      create: "oklch(0.62 0.17 80)",
    },
  },
  {
    id: "midnight-jar",
    name: "Midnight Jar",
    description: "A dark theme for late-night creators.",
    unlockedAtLevel: 5,
    palette: {
      background: "oklch(0.14 0.02 240)",
      foreground: "oklch(0.96 0 0)",
      muted: "oklch(0.22 0.02 240)",
      mutedForeground: "oklch(0.70 0.02 240)",
      border: "oklch(0.30 0.02 240)",
      primary: "oklch(0.65 0.18 145)",
      primaryForeground: "oklch(0.10 0 0)",
      consume: "oklch(0.65 0.20 260)",
      create: "oklch(0.72 0.18 140)",
    },
  },
];

export function themeById(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export function unlockedThemes(level: number): Theme[] {
  return THEMES.filter((t) => t.unlockedAtLevel <= level);
}

export function paletteToCssVars(palette: ThemePalette): Record<string, string> {
  return {
    "--color-background": palette.background,
    "--color-foreground": palette.foreground,
    "--color-muted": palette.muted,
    "--color-muted-foreground": palette.mutedForeground,
    "--color-border": palette.border,
    "--color-primary": palette.primary,
    "--color-primary-foreground": palette.primaryForeground,
    "--color-consume": palette.consume,
    "--color-create": palette.create,
  };
}
