export type Category = "consume" | "create";
export type ConsumeSubtype = "research" | "leisure";

export interface Session {
  id: string;
  category: Category;
  subtype?: ConsumeSubtype;
  linkedItemId?: string;
  startIso: string;
  endIso: string;
  durationSeconds: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DraftSession {
  category: Category;
  subtype?: ConsumeSubtype;
  linkedItemId?: string;
  startIso: string;
  endIso: string;
  notes?: string;
}

export interface PomodoroState {
  focusMinutes: number;
  breakMinutes: number;
  phase: "focus" | "break";
  phaseStartIso: string;
}

export type ActiveSession =
  | {
      category: Category;
      subtype?: ConsumeSubtype;
      linkedItemId?: string;
      startIso: string;
      pomodoro?: PomodoroState;
    }
  | null;

export interface SessionRepository {
  createFromDraft(draft: DraftSession): Promise<Session>;
  update(id: string, patch: Partial<DraftSession>): Promise<Session>;
  delete(id: string): Promise<void>;
  listAll(): Promise<Session[]>;
  listByRange(startIso: string, endIso: string): Promise<Session[]>;
  getActive(): Promise<ActiveSession>;
  setActive(active: ActiveSession): Promise<void>;
  sumByCategory(startIso: string, endIso: string): Promise<Record<Category, number>>;
  exportCsvBlob(): Promise<Blob>;
}

export interface QueueItem {
  id: string;
  url: string;
  title: string;
  description?: string;
  tag: ConsumeSubtype;
  linkedTodoId?: string;
  status: "saved" | "consumed";
  createdAt: string;
  updatedAt: string;
  consumedAt?: string;
}

export type TodoStatus = "pending" | "in-progress" | "done";

export interface Todo {
  id: string;
  title: string;
  description?: string;
  status: TodoStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export type BankLedgerSource =
  | "create-session"
  | "leisure-session"
  | "edit-compensate"
  | "delete-compensate"
  | "research-expiry"
  | "starter-grant"
  | "manual-reset";

export interface BankLedgerEntry {
  id: string;
  ts: string;
  amount: number;
  source: BankLedgerSource;
  refId?: string;
  note?: string;
}

export type PendingResearchStatus = "pending" | "applied" | "expired" | "cancelled";

export interface PendingResearchEntry {
  id: string;
  todoId: string;
  sessionId: string;
  minutes: number;
  startedAt: string;
  deadline: string;
  status: PendingResearchStatus;
  resolvedAt?: string;
}

export interface ProgressionState {
  id: "state";
  xp: number;
  currentStreak: number;
  longestStreak: number;
  lastStreakDay?: string;
  lastCelebratedLevel: number;
}

export interface Prefs {
  id: "prefs";
  earnRatio: number;
  applyWindowDays: number;
  focusMinutes: number;
  breakMinutes: number;
  streakThresholdMinutes: number;
  leisureXp: number;
  researchXp: number;
  createXp: number;
  pomodoroEnabled: boolean;
  selectedThemeId: string;
}

export const DEFAULT_PREFS: Prefs = {
  id: "prefs",
  earnRatio: 2.0,
  applyWindowDays: 7,
  focusMinutes: 25,
  breakMinutes: 5,
  streakThresholdMinutes: 10,
  leisureXp: 1,
  researchXp: 2,
  createXp: 3,
  pomodoroEnabled: false,
  selectedThemeId: "default",
};

export const STARTER_GRANT_MINUTES = 60;
