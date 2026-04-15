import { getDb, type PickleJuiceDB } from "./db";
import { DEFAULT_PREFS, type Prefs } from "./types";

export class PrefsRepository {
  constructor(private readonly db: PickleJuiceDB = getDb()) {}

  async get(): Promise<Prefs> {
    const row = await this.db.prefs.get("prefs");
    if (row) return { ...DEFAULT_PREFS, ...row, id: "prefs" };
    await this.db.prefs.put(DEFAULT_PREFS);
    return DEFAULT_PREFS;
  }

  async update(patch: Partial<Omit<Prefs, "id">>): Promise<Prefs> {
    const current = await this.get();
    const next: Prefs = { ...current, ...patch, id: "prefs" };
    await this.db.prefs.put(next);
    return next;
  }
}

export const prefsRepository = new PrefsRepository();
