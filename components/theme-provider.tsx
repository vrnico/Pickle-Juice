"use client";

import { useEffect } from "react";
import { paletteToCssVars, themeById } from "@/lib/themes/themes";
import { usePrefs } from "@/lib/store/use-v2";

export function ThemeProvider() {
  const prefs = usePrefs();
  useEffect(() => {
    const theme = themeById(prefs.selectedThemeId);
    const vars = paletteToCssVars(theme.palette);
    const root = document.documentElement;
    for (const [k, v] of Object.entries(vars)) {
      root.style.setProperty(k, v);
    }
  }, [prefs.selectedThemeId]);
  return null;
}
