import { openDB, type IDBPDatabase } from "idb";

export interface JournalEntry {
  id: string;
  spiritId: number;
  spiritName: string;
  timestamp: number;
  planetaryHour: string;
  intent: string;
  notes: string;
  observations: string;
}

const DB_NAME = "hive-grimoire";
const DB_VERSION = 1;
const STORE_NAME = "journal";

async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("spiritId", "spiritId");
        store.createIndex("timestamp", "timestamp");
      }
    },
  });
}

export async function addEntry(
  entry: Omit<JournalEntry, "id">
): Promise<JournalEntry> {
  const db = await getDB();
  const id = crypto.randomUUID();
  const fullEntry: JournalEntry = { ...entry, id };
  await db.put(STORE_NAME, fullEntry);
  return fullEntry;
}

export async function getAllEntries(): Promise<JournalEntry[]> {
  const db = await getDB();
  const entries = await db.getAll(STORE_NAME);
  return entries.sort(
    (a: JournalEntry, b: JournalEntry) => b.timestamp - a.timestamp
  );
}

export async function getEntry(id: string): Promise<JournalEntry | undefined> {
  const db = await getDB();
  return db.get(STORE_NAME, id);
}

export async function updateEntry(entry: JournalEntry): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, entry);
}

export async function deleteEntry(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

export async function getEntriesBySpirit(
  spiritId: number
): Promise<JournalEntry[]> {
  const db = await getDB();
  return db.getAllFromIndex(STORE_NAME, "spiritId", spiritId);
}

/**
 * Exports all journal entries as a Markdown string for Obsidian vault integration.
 */
export async function exportToMarkdown(): Promise<string> {
  const entries = await getAllEntries();
  if (entries.length === 0) return "# Hive Grimoire Journal\n\nNo entries yet.";

  const lines = ["# Hive Grimoire Journal\n"];

  for (const entry of entries) {
    const date = new Date(entry.timestamp);
    lines.push(`## ${entry.spiritName} — ${date.toLocaleDateString()}`);
    lines.push(`- **Time**: ${date.toLocaleTimeString()}`);
    lines.push(`- **Planetary Hour**: ${entry.planetaryHour}`);
    lines.push(`- **Intent**: ${entry.intent}`);
    if (entry.notes) lines.push(`- **Notes**: ${entry.notes}`);
    if (entry.observations)
      lines.push(`- **Observations**: ${entry.observations}`);
    lines.push("");
  }

  return lines.join("\n");
}
