export type Category = "consume" | "create";

export interface Session {
  id: string;
  category: Category;
  startIso: string;
  endIso: string;
  durationSeconds: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DraftSession {
  category: Category;
  startIso: string;
  endIso: string;
  notes?: string;
}

export type ActiveSession = { category: Category; startIso: string } | null;

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
