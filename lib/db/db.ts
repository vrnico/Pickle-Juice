import Dexie, { type Table } from "dexie";
import type {
  BankLedgerEntry,
  PendingResearchEntry,
  Prefs,
  ProgressionState,
  QueueItem,
  Session,
  Todo,
} from "./types";

export interface MetaRow {
  key: string;
  value: string;
}

export class PickleJuiceDB extends Dexie {
  sessions!: Table<Session, string>;
  meta!: Table<MetaRow, string>;
  queueItems!: Table<QueueItem, string>;
  todos!: Table<Todo, string>;
  bankLedger!: Table<BankLedgerEntry, string>;
  pendingResearch!: Table<PendingResearchEntry, string>;
  progression!: Table<ProgressionState, string>;
  prefs!: Table<Prefs, string>;

  constructor(name = "picklejuice") {
    super(name);

    this.version(1).stores({
      sessions: "id, category, startIso, createdAt",
      meta: "key",
    });

    this.version(2)
      .stores({
        sessions: "id, category, subtype, startIso, createdAt, linkedItemId",
        meta: "key",
        queueItems: "id, tag, status, createdAt",
        todos: "id, status, createdAt",
        bankLedger: "id, ts, source, refId",
        pendingResearch: "id, todoId, sessionId, deadline, status",
        progression: "id",
        prefs: "id",
      })
      .upgrade(async (tx) => {
        const sessionsTable = tx.table<Session>("sessions");
        await sessionsTable.toCollection().modify((s) => {
          if (s.category === "consume" && !s.subtype) {
            s.subtype = "leisure";
          }
        });
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
