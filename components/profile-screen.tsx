"use client";

import {
  levelForXp,
  progressToNextLevel,
} from "@/lib/domain/progression";
import { THEMES, themeById } from "@/lib/themes/themes";
import {
  usePrefs,
  usePrefsActions,
  useProgression,
} from "@/lib/store/use-v2";

export function ProfileScreen() {
  const state = useProgression();
  const prefs = usePrefs();
  const prefsActions = usePrefsActions();
  const progress = progressToNextLevel(state.xp);

  return (
    <section className="flex flex-col gap-4 p-4">
      <h2 className="px-1 text-2xl font-semibold">Profile</h2>

      <article className="rounded-2xl border border-[color:var(--color-border)] bg-background p-5">
        <h3 className="text-base font-semibold">Level {progress.level}</h3>
        <p className="mt-1 text-sm text-[color:var(--color-muted-foreground)]">
          {state.xp} XP total
          {progress.needed > 0
            ? ` · ${progress.current}/${progress.needed} toward level ${progress.level + 1}`
            : ""}
        </p>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-[color:var(--color-muted)]">
          <div
            className="h-full bg-[color:var(--color-primary)] transition-[width]"
            style={{ width: `${Math.round(progress.pct * 100)}%` }}
            aria-label="Progress to next level"
          />
        </div>
      </article>

      <article className="rounded-2xl border border-[color:var(--color-border)] bg-background p-5">
        <h3 className="text-base font-semibold">Streak</h3>
        <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
          <Stat label="Current" value={`${state.currentStreak} day${state.currentStreak === 1 ? "" : "s"}`} />
          <Stat label="Longest" value={`${state.longestStreak} day${state.longestStreak === 1 ? "" : "s"}`} />
        </div>
        <p className="mt-2 text-xs text-[color:var(--color-muted-foreground)]">
          Earn a streak day with at least {prefs.streakThresholdMinutes} minutes of Create work.
        </p>
      </article>

      <article className="rounded-2xl border border-[color:var(--color-border)] bg-background p-5">
        <h3 className="text-base font-semibold">Themes</h3>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {THEMES.map((t) => {
            const unlocked = levelForXp(state.xp) >= t.unlockedAtLevel;
            const selected = prefs.selectedThemeId === t.id;
            return (
              <button
                key={t.id}
                type="button"
                disabled={!unlocked}
                onClick={() => prefsActions.update({ selectedThemeId: t.id })}
                className={`rounded-xl border p-3 text-left text-xs transition ${
                  selected
                    ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/10"
                    : unlocked
                      ? "border-[color:var(--color-border)] hover:bg-[color:var(--color-muted)]"
                      : "border-dashed border-[color:var(--color-border)] opacity-50"
                }`}
              >
                <div className="flex h-8 overflow-hidden rounded-md">
                  <div className="flex-1" style={{ background: t.palette.consume }} />
                  <div className="flex-1" style={{ background: t.palette.create }} />
                  <div className="flex-1" style={{ background: t.palette.primary }} />
                </div>
                <p className="mt-2 font-medium">{t.name}</p>
                <p className="text-[color:var(--color-muted-foreground)]">
                  {unlocked ? "Unlocked" : `Reach level ${t.unlockedAtLevel}`}
                </p>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-[color:var(--color-muted-foreground)]">
          Selected: {themeById(prefs.selectedThemeId).name}
        </p>
      </article>

      <article className="rounded-2xl border border-[color:var(--color-border)] bg-background p-5">
        <details>
          <summary className="cursor-pointer text-base font-semibold">How XP, streaks, and themes work</summary>
          <div className="mt-3 space-y-2 text-sm text-[color:var(--color-muted-foreground)]">
            <p>
              You earn XP for every saved session — Create earns the most, then Research, then Leisure.
              Hitting an XP threshold raises your level and unlocks a new cosmetic theme.
            </p>
            <p>
              Streaks count consecutive days you logged at least the configured threshold (default
              10 minutes) of Create work.
            </p>
            <p className="font-medium text-foreground">
              XP, levels, streaks, and themes are purely cosmetic. They never grant additional consume
              time. The only thing that unlocks Leisure consume is Create work, which credits your Time
              Bank.
            </p>
          </div>
        </details>
      </article>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-[color:var(--color-muted-foreground)]">{label}</dt>
      <dd className="text-2xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
