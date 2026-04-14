import Dexie, { type Table } from "dexie";
import type { Session } from "./types";

export interface MetaRow {
  key: string;
  value: string;
}

export class PickleJuiceDB extends Dexie {
  sessions!: Table<Session, string>;
  meta!: Table<MetaRow, string>;

  constructor(name = "picklejuice") {
    super(name);
    this.version(1).stores({
      sessions: "id, category, startIso, createdAt",
      meta: "key",
    });
  }
}

let singleton: PickleJuiceDB | null = null;

export function getDb(): PickleJuiceDB {
  if (!singleton) singleton = new PickleJuiceDB();
  return singleton;
}

export function __resetDbForTests(name = "picklejuice"): PickleJuiceDB {
  singleton = new PickleJuiceDB(name);
  return singleton;
}
