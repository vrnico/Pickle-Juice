"use client";

import { useEffect, useState } from "react";
import type { Category, ConsumeSubtype, Todo } from "@/lib/db/types";
import {
  useActiveSession,
  useElapsedSeconds,
  usePomodoroSecondsRemaining,
  useTimerActions,
} from "@/lib/store/use-sessions";
import {
  todoRepository,
  useLiveBankBalance,
  usePrefs,
  usePrefsActions,
  useTodoActions,
} from "@/lib/store/use-v2";
import { ConsumePicker, type ConsumePickerSelection } from "./consume-picker";
import { CreatePicker, type CreatePickerSelection } from "./create-picker";
import { formatDuration, formatMinutes } from "./format";

const CATEGORY_COPY = {
  consume: { swatch: "bg-[color:var(--color-consume)]" },
  create: { swatch: "bg-[color:var(--color-create)]" },
} as const;

export function HomeScreen() {
  const active = useActiveSession();
  const elapsed = useElapsedSeconds(active);
  const pomodoroRemaining = usePomodoroSecondsRemaining(active);
  const { start, stop } = useTimerActions();
  const liveBalance = useLiveBankBalance(active);
  const prefs = usePrefs();
  const prefsActions = usePrefsActions();
  const todoActions = useTodoActions();

  const [openPicker, setOpenPicker] = useState<Category | null>(null);
  const [pendingCategory, setPendingCategory] = useState<Category | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [bankEmptyOpen, setBankEmptyOpen] = useState(false);
  const [endOfCreatePrompt, setEndOfCreatePrompt] = useState<Todo | null>(null);
  const [pomodoroComplete, setPomodoroComplete] = useState<{ breakMinutes: number } | null>(null);

  // Auto-stop Pomodoro when focus elapses, and auto-stop leisure if bank hits zero.
  useEffect(() => {
    if (!active) return;
    const isLeisure = active.category === "consume" && active.subtype === "leisure";
    const id = setInterval(async () => {
      if (active.pomodoro && pomodoroRemaining !== null && pomodoroRemaining <= 0) {
        await stop();
      } else if (isLeisure && liveBalance <= 0) {
        await stop();
        setSavedMessage("Bank ran out — session stopped.");
      }
    }, 1000);
    return () => clearInterval(id);
  }, [active, pomodoroRemaining, liveBalance, stop]);

  async function startSession(args: {
    category: Category;
    subtype?: ConsumeSubtype;
    linkedItemId?: string;
  }) {
    setOpenPicker(null);
    const result = await start(
      {
        ...args,
        pomodoro: prefs.pomodoroEnabled
          ? { focusMinutes: prefs.focusMinutes, breakMinutes: prefs.breakMinutes }
          : undefined,
      },
      { bankBalance: liveBalance },
    );
    if (!result.ok && result.alreadyActive) {
      setPendingCategory(args.category);
    }
    if (result.blocked === "leisure-empty") {
      setBankEmptyOpen(true);
    }
  }

  async function handleStop() {
    const wasActive = active;
    const saved = await stop();
    if (saved === null) {
      setSavedMessage("Discarded — session was under a second.");
    } else {
      const msg =
        saved.category === "create"
          ? `Saved ${formatDuration(saved.durationSeconds)} of create. +${Math.round(
              (saved.durationSeconds / 60) * prefs.earnRatio,
            )} min to bank.`
          : saved.category === "consume" && saved.subtype === "research"
            ? `Saved ${formatDuration(saved.durationSeconds)} of research — pending until applied.`
            : `Saved ${formatDuration(saved.durationSeconds)} of leisure consume.`;
      setSavedMessage(msg);

      if (wasActive?.pomodoro) {
        setPomodoroComplete({ breakMinutes: wasActive.pomodoro.breakMinutes });
      }
      if (saved.category === "create" && saved.linkedItemId) {
        const todo = await todoRepository.get(saved.linkedItemId);
        if (todo && todo.status !== "done") setEndOfCreatePrompt(todo);
      }
    }
    setTimeout(() => setSavedMessage(null), 4000);
  }

  async function confirmSwitch() {
    if (!pendingCategory) return;
    const cat = pendingCategory;
    setPendingCategory(null);
    await stop();
    setOpenPicker(cat);
  }

  function handlePickConsume(sel: ConsumePickerSelection) {
    void startSession({ category: "consume", subtype: sel.subtype, linkedItemId: sel.linkedItemId });
  }
  function handlePickCreate(sel: CreatePickerSelection) {
    void startSession({ category: "create", linkedItemId: sel.linkedItemId });
  }

  if (active) {
    const swatch = CATEGORY_COPY[active.category].swatch;
    const subtypeLabel =
      active.category === "consume"
        ? active.subtype === "research"
          ? "Research"
          : "Leisure"
        : "Create";

    return (
      <section className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
        <BankPill balance={liveBalance} />
        <div className="flex flex-col items-center gap-3">
          <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1 text-sm font-medium text-white ${swatch}`}>
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
            {subtypeLabel}
          </span>
          <p className="text-sm text-[color:var(--color-muted-foreground)]">
            Started {new Date(active.startIso).toLocaleTimeString()}
          </p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-6xl font-semibold tabular-nums tracking-tight sm:text-7xl">
            {formatDuration(elapsed)}
          </p>
          {active.pomodoro && pomodoroRemaining !== null && (
            <p className="text-sm text-[color:var(--color-muted-foreground)]">
              Pomodoro · {Math.floor(pomodoroRemaining / 60)}:
              {String(pomodoroRemaining % 60).padStart(2, "0")} remaining
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleStop}
          className="w-full max-w-xs rounded-full bg-foreground px-6 py-4 text-lg font-medium text-background shadow-sm transition hover:opacity-90"
        >
          Stop
        </button>
        {savedMessage && (
          <p className="text-sm text-[color:var(--color-muted-foreground)]">{savedMessage}</p>
        )}
        {pomodoroComplete && (
          <PomodoroBreakModal
            breakMinutes={pomodoroComplete.breakMinutes}
            onClose={() => setPomodoroComplete(null)}
          />
        )}
        {endOfCreatePrompt && (
          <EndOfCreatePrompt
            todo={endOfCreatePrompt}
            onClose={() => setEndOfCreatePrompt(null)}
            onMarkDone={async () => {
              await todoActions.setStatus(endOfCreatePrompt.id, "done");
              setEndOfCreatePrompt(null);
            }}
          />
        )}
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      <BankPill balance={liveBalance} />
      <div>
        <h1 className="text-3xl font-semibold">What are you doing right now?</h1>
        <p className="mt-2 text-[color:var(--color-muted-foreground)]">
          Tap a category to start tracking.
        </p>
      </div>
      <div className="grid w-full max-w-md gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setOpenPicker("consume")}
          className="flex flex-col items-start gap-2 rounded-2xl bg-[color:var(--color-consume)] p-6 text-left text-white shadow-sm transition hover:brightness-110"
        >
          <span className="text-2xl">🍿</span>
          <span className="text-xl font-semibold">Consume</span>
          <span className="text-sm opacity-80">Research or leisure.</span>
        </button>
        <button
          type="button"
          onClick={() => setOpenPicker("create")}
          className="flex flex-col items-start gap-2 rounded-2xl bg-[color:var(--color-create)] p-6 text-left text-white shadow-sm transition hover:brightness-110"
        >
          <span className="text-2xl">✍️</span>
          <span className="text-xl font-semibold">Create</span>
          <span className="text-sm opacity-80">Earn bank time.</span>
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm text-[color:var(--color-muted-foreground)]">
        <input
          type="checkbox"
          checked={prefs.pomodoroEnabled}
          onChange={(e) => prefsActions.update({ pomodoroEnabled: e.target.checked })}
          className="h-4 w-4 accent-[color:var(--color-primary)]"
        />
        Pomodoro mode ({prefs.focusMinutes}/{prefs.breakMinutes})
      </label>

      {savedMessage && (
        <p className="text-sm text-[color:var(--color-muted-foreground)]">{savedMessage}</p>
      )}

      {openPicker === "consume" && (
        <ConsumePicker bankBalance={liveBalance} onCancel={() => setOpenPicker(null)} onPick={handlePickConsume} />
      )}
      {openPicker === "create" && (
        <CreatePicker onCancel={() => setOpenPicker(null)} onPick={handlePickCreate} />
      )}
      {pendingCategory && (
        <ConfirmSwitchDialog
          targetCategory={pendingCategory}
          onCancel={() => setPendingCategory(null)}
          onConfirm={confirmSwitch}
        />
      )}
      {bankEmptyOpen && (
        <BankEmptyDialog onClose={() => setBankEmptyOpen(false)} ratio={prefs.earnRatio} />
      )}
    </section>
  );
}

function BankPill({ balance }: { balance: number }) {
  const display = Math.max(0, Math.round(balance));
  const negative = balance < 0;
  return (
    <div className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-muted)] px-4 py-1 text-sm">
      <span className="font-medium">Bank:</span>{" "}
      <span className={negative ? "text-red-500 tabular-nums" : "tabular-nums"}>
        {negative ? `-${Math.abs(Math.round(balance))}` : display} min
      </span>
    </div>
  );
}

function ConfirmSwitchDialog({
  targetCategory,
  onCancel,
  onConfirm,
}: {
  targetCategory: Category;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-background p-6 shadow-xl">
        <h2 className="text-lg font-semibold">Stop current session first?</h2>
        <p className="mt-2 text-sm text-[color:var(--color-muted-foreground)]">
          Only one session can run at a time. Stop the active session and start a new {targetCategory} session?
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-full border border-[color:var(--color-border)] px-4 py-2 text-sm">Cancel</button>
          <button type="button" onClick={onConfirm} className="rounded-full bg-foreground px-4 py-2 text-sm text-background">Stop & start new</button>
        </div>
      </div>
    </div>
  );
}

function BankEmptyDialog({ onClose, ratio }: { onClose: () => void; ratio: number }) {
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-background p-6 shadow-xl">
        <h2 className="text-lg font-semibold">Bank is empty</h2>
        <p className="mt-2 text-sm text-[color:var(--color-muted-foreground)]">
          Earn leisure time by logging Create work — every minute you create is worth {ratio}{" "}
          {ratio === 1 ? "minute" : "minutes"} of leisure consume.
        </p>
        <div className="mt-4 flex justify-end">
          <button type="button" onClick={onClose} className="rounded-full bg-foreground px-4 py-2 text-sm text-background">OK</button>
        </div>
      </div>
    </div>
  );
}

function PomodoroBreakModal({
  breakMinutes,
  onClose,
}: {
  breakMinutes: number;
  onClose: () => void;
}) {
  const [taking, setTaking] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(breakMinutes * 60);
  useEffect(() => {
    if (!taking) return;
    if (secondsLeft <= 0) {
      onClose();
      return;
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [taking, secondsLeft, onClose]);

  if (taking) {
    return (
      <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-sm rounded-2xl bg-background p-6 shadow-xl text-center">
          <h2 className="text-lg font-semibold">Break</h2>
          <p className="mt-4 text-5xl font-semibold tabular-nums">
            {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}
          </p>
          <button type="button" onClick={onClose} className="mt-6 w-full rounded-full border border-[color:var(--color-border)] px-4 py-2 text-sm">
            Skip break
          </button>
        </div>
      </div>
    );
  }

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-background p-6 shadow-xl">
        <h2 className="text-lg font-semibold">Pomodoro complete</h2>
        <p className="mt-2 text-sm text-[color:var(--color-muted-foreground)]">
          Take {formatMinutes(breakMinutes * 60)} to step away?
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full border border-[color:var(--color-border)] px-4 py-2 text-sm">Stop</button>
          <button type="button" onClick={() => setTaking(true)} className="rounded-full bg-foreground px-4 py-2 text-sm text-background">Take break</button>
        </div>
      </div>
    </div>
  );
}

function EndOfCreatePrompt({
  todo,
  onClose,
  onMarkDone,
}: {
  todo: Todo;
  onClose: () => void;
  onMarkDone: () => void;
}) {
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-background p-6 shadow-xl">
        <h2 className="text-lg font-semibold">Mark this todo done?</h2>
        <p className="mt-2 text-sm">
          <strong>{todo.title}</strong>
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full border border-[color:var(--color-border)] px-4 py-2 text-sm">
            Keep in progress
          </button>
          <button type="button" onClick={onMarkDone} className="rounded-full bg-foreground px-4 py-2 text-sm text-background">
            Mark done
          </button>
        </div>
      </div>
    </div>
  );
}
