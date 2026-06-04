import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "app.db");

declare global {
  var __db: Database.Database | undefined;
}

export function getDb() {
  if (!global.__db) {
    global.__db = new Database(DB_PATH);
    global.__db.pragma("journal_mode = WAL");
    global.__db.pragma("foreign_keys = ON");
    global.__db.pragma("busy_timeout = 5000");
    initSchema(global.__db);
  }
  return global.__db;
}

export function countDays(start: string, end: string): number {
  const startDate = new Date(start + "T00:00:00");
  const endDate = new Date(end + "T00:00:00");
  let count = 0;
  const current = new Date(startDate);
  while (current <= endDate) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      name                TEXT    NOT NULL,
      email               TEXT    NOT NULL UNIQUE,
      password            TEXT    NOT NULL,
      role                TEXT    NOT NULL DEFAULT 'employee',
      color               TEXT    NOT NULL DEFAULT '#3B82F6',
      days_off_remaining  INTEGER NOT NULL DEFAULT 20,
      created_at          TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS leave_requests (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      start_date       TEXT    NOT NULL,
      end_date         TEXT    NOT NULL,
      start_time       TEXT,
      end_time         TEXT,
      status           TEXT    NOT NULL DEFAULT 'pending',
      rejection_reason TEXT,
      reviewed_by      INTEGER REFERENCES users(id),
      created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at       TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_leave_user   ON leave_requests(user_id);
    CREATE INDEX IF NOT EXISTS idx_leave_status ON leave_requests(status);
  `);
}