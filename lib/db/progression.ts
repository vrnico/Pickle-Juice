import { getDb, type PickleJuiceDB } from "./db";
import type { ProgressionState } from "./types";
import { INITIAL_PROGRESSION } from "../domain/progression";

export class ProgressionRepository {
  constructor(private readonly db: PickleJuiceDB = getDb()) {}

  async get(): Promise<ProgressionState> {
    const row = await this.db.progression.get("state");
    if (row) return row;
    await this.db.progression.put(INITIAL_PROGRESSION);
    return INITIAL_PROGRESSION;
  }

  async put(state: ProgressionState): Promise<void> {
    await this.db.progression.put({ ...state, id: "state" });
  }
}

export const progressionRepository = new ProgressionRepository();
