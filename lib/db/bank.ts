import { getDb, type PickleJuiceDB } from "./db";
import type { BankLedgerEntry } from "./types";
import { STARTER_GRANT_MINUTES } from "./types";
import {
  currentBalance,
  entryManualReset,
  entryStarterGrant,
} from "../domain/time-bank";

const STARTER_GRANT_FLAG = "starter-grant-given";

export class BankRepository {
  constructor(private readonly db: PickleJuiceDB = getDb()) {}

  async append(entries: BankLedgerEntry[]): Promise<void> {
    if (entries.length === 0) return;
    await this.db.bankLedger.bulkAdd(entries);
  }

  async listAll(): Promise<BankLedgerEntry[]> {
    return this.db.bankLedger.orderBy("ts").toArray();
  }

  async getBalance(): Promise<number> {
    const entries = await this.listAll();
    return currentBalance(entries);
  }

  async ensureStarterGrant(amount = STARTER_GRANT_MINUTES): Promise<void> {
    const flag = await this.db.meta.get(STARTER_GRANT_FLAG);
    if (flag) return;
    await this.db.bankLedger.add(entryStarterGrant(amount));
    await this.db.meta.put({ key: STARTER_GRANT_FLAG, value: "1" });
  }

  async resetToZero(): Promise<void> {
    const balance = await this.getBalance();
    if (balance === 0) return;
    await this.db.bankLedger.add(entryManualReset(balance));
  }
}

export const bankRepository = new BankRepository();
export { LeisureGatedError, canStartLeisure, liveBalance } from "../domain/time-bank";
