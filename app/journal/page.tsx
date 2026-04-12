"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import spirits from "@/data/spirits.json";
import type { Spirit } from "@/lib/types";
import type { JournalEntry } from "@/lib/journal";
import { getAllEntries } from "@/lib/journal";
import JournalEditor from "@/components/JournalEditor";
import JournalList from "@/components/JournalList";

const allSpirits = spirits as Spirit[];

function JournalContent() {
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get("spirit")
    ? Number(searchParams.get("spirit"))
    : undefined;

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEntries = useCallback(async () => {
    try {
      const all = await getAllEntries();
      setEntries(all);
    } catch {
      // IndexedDB may not be available (SSR, private browsing)
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-center font-serif text-3xl font-bold text-amber">
        Working Journal
      </h1>
      <p className="mb-8 text-center font-mono text-sm text-cream/50">
        Local only — your data never leaves this device
      </p>

      <div className="space-y-8">
        <JournalEditor
          spirits={allSpirits}
          preselectedSpiritId={preselectedId}
          onSaved={loadEntries}
        />

        {loading ? (
          <div className="py-8 text-center font-mono text-sm text-cream/40">
            Loading journal...
          </div>
        ) : (
          <JournalList entries={entries} onDeleted={loadEntries} />
        )}
      </div>
    </div>
  );
}

export default function JournalPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center font-mono text-sm text-cream/40">
          Loading journal...
        </div>
      }
    >
      <JournalContent />
    </Suspense>
  );
}
