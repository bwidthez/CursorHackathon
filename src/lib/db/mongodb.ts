/**
 * MongoDB Atlas connection (CursorEvent cluster).
 * Database name: rentshield.
 */

import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = "rentshield";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getDb(): Promise<Db> {
  if (!uri) throw new Error("MONGODB_URI is not set");
  if (db) return db;
  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  return db;
}

export async function closeDb(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

// Collection names from plan
export const COLLECTIONS = {
  cases: "cases",
  notices: "notices",
  reports: "reports",
  sessions: "sessions",
} as const;
