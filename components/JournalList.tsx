"use client";

import { useState } from "react";
import type { JournalEntry } from "@/lib/journal";
import { deleteEntry, exportToMarkdown } from "@/lib/journal";

interface JournalListProps {
  entries: JournalEntry[];
  onDeleted: () => void;
}

export default function JournalList({ entries, onDeleted }: JournalListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function handleExport() {
    const md = await exportToMarkdown();
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hive-grimoire-journal-${new Date().toISOString().split("T")[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDelete(id: string) {
    await deleteEntry(id);
    onDeleted();
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-amber/10 bg-obsidian-light p-8 text-center">
        <p className="font-serif text-cream/40">
          No journal entries yet. Record your first working above.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-serif text-lg font-semibold text-amber">
          Entries ({entries.length})
        </h3>
        <button
          onClick={handleExport}
          className="rounded-lg border border-amber/20 px-3 py-1 font-mono text-xs text-cream/60 hover:text-cream"
        >
          Export to Markdown
        </button>
      </div>

      <div className="space-y-2">
        {entries.map((entry) => {
          const expanded = expandedId === entry.id;
          const date = new Date(entry.timestamp);
          return (
            <div
              key={entry.id}
              className="rounded-lg border border-amber/10 bg-obsidian-light"
            >
              <button
                onClick={() =>
                  setExpandedId(expanded ? null : entry.id)
                }
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
              >
                <span className="font-serif text-sm font-semibold text-amber">
                  {entry.spiritName}
                </span>
                <span className="flex-1 font-mono text-xs text-cream/40 truncate">
                  {entry.intent}
                </span>
                <span className="font-mono text-xs text-cream/30">
                  {date.toLocaleDateString()}
                </span>
                <span className="text-cream/30">{expanded ? "▾" : "▸"}</span>
              </button>

              {expanded && (
                <div className="border-t border-amber/10 px-4 py-3">
                  <div className="space-y-2 font-mono text-xs">
                    <p>
                      <span className="text-cream/40">Time: </span>
                      <span className="text-cream/70">
                        {date.toLocaleString()}
                      </span>
                    </p>
                    <p>
                      <span className="text-cream/40">Planetary Hour: </span>
                      <span className="text-cream/70">
                        {entry.planetaryHour}
                      </span>
                    </p>
                    <p>
                      <span className="text-cream/40">Intent: </span>
                      <span className="text-cream/70">{entry.intent}</span>
                    </p>
                    {entry.notes && (
                      <p>
                        <span className="text-cream/40">Notes: </span>
                        <span className="text-cream/70">{entry.notes}</span>
                      </p>
                    )}
                    {entry.observations && (
                      <p>
                        <span className="text-cream/40">Observations: </span>
                        <span className="text-cream/70">
                          {entry.observations}
                        </span>
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="mt-3 font-mono text-xs text-red-400/60 hover:text-red-400"
                  >
                    Delete entry
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
