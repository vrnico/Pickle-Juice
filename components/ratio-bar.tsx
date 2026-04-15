"use client";

import type { RatioSummary } from "@/lib/domain/aggregate";
import { formatMinutes } from "./format";

export function RatioBar({
  title,
  summary,
}: {
  title: string;
  summary: RatioSummary;
}) {
  const total = summary.totalSeconds;
  const consumePct = total === 0 ? 0 : (summary.consume / total) * 100;
  const createPct = total === 0 ? 0 : (summary.create / total) * 100;

  return (
    <div className="rounded-2xl border border-[color:var(--color-border)] bg-background p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[color:var(--color-muted-foreground)]">
          {title}
        </h3>
        <p className="text-sm text-[color:var(--color-muted-foreground)]">
          {total === 0 ? "No tracked time" : `${formatMinutes(total)} total`}
        </p>
      </div>
      <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-[color:var(--color-muted)]">
        <div
          className="h-full bg-[color:var(--color-consume)] transition-[width]"
          style={{ width: `${consumePct}%` }}
          aria-label="Consume share"
        />
        <div
          className="h-full bg-[color:var(--color-create)] transition-[width]"
          style={{ width: `${createPct}%` }}
          aria-label="Create share"
        />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="flex items-center gap-2 text-[color:var(--color-muted-foreground)]">
            <span className="h-2 w-2 rounded-full bg-[color:var(--color-consume)]" />
            Consume
          </dt>
          <dd className="mt-1 text-lg font-semibold tabular-nums">
            {formatMinutes(summary.consume)}
            <span className="ml-2 text-sm font-normal text-[color:var(--color-muted-foreground)]">
              {total === 0 ? "0%" : `${Math.round(consumePct)}%`}
            </span>
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-2 text-[color:var(--color-muted-foreground)]">
            <span className="h-2 w-2 rounded-full bg-[color:var(--color-create)]" />
            Create
          </dt>
          <dd className="mt-1 text-lg font-semibold tabular-nums">
            {formatMinutes(summary.create)}
            <span className="ml-2 text-sm font-normal text-[color:var(--color-muted-foreground)]">
              {total === 0 ? "0%" : `${Math.round(createPct)}%`}
            </span>
          </dd>
        </div>
      </dl>
    </div>
  );
}
