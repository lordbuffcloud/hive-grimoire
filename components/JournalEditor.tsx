"use client";

import { useState } from "react";
import type { Spirit, Planet } from "@/lib/types";
import { useGeolocation } from "@/hooks/useGeolocation";
import { usePlanetaryHour } from "@/hooks/usePlanetaryHour";
import { addEntry } from "@/lib/journal";

interface JournalEditorProps {
  spirits: Spirit[];
  preselectedSpiritId?: number;
  onSaved: () => void;
}

export default function JournalEditor({
  spirits,
  preselectedSpiritId,
  onSaved,
}: JournalEditorProps) {
  const [spiritId, setSpiritId] = useState(preselectedSpiritId ?? 1);
  const [intent, setIntent] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const { lat, lng } = useGeolocation();
  const { currentHour } = usePlanetaryHour(lat, lng);

  const selectedSpirit = spirits.find((s) => s.id === spiritId);

  async function handleSave() {
    if (!selectedSpirit || !intent.trim()) return;
    setSaving(true);
    try {
      await addEntry({
        spiritId: selectedSpirit.id,
        spiritName: selectedSpirit.name,
        timestamp: Date.now(),
        planetaryHour: currentHour
          ? `Hour of ${currentHour.planet} (${currentHour.isDay ? "Day" : "Night"} ${currentHour.hourNumber})`
          : "Unknown",
        intent: intent.trim(),
        notes: notes.trim(),
        observations: "",
      });
      setIntent("");
      setNotes("");
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-lg border border-amber/20 bg-obsidian-light p-4">
      <h3 className="mb-4 font-serif text-lg font-semibold text-amber">
        New Entry
      </h3>

      {/* Spirit selector */}
      <div className="mb-3">
        <label className="mb-1 block font-mono text-xs text-cream/50">
          Spirit
        </label>
        <select
          value={spiritId}
          onChange={(e) => setSpiritId(Number(e.target.value))}
          className="w-full rounded border border-amber/20 bg-obsidian px-3 py-2 font-serif text-sm text-cream"
        >
          {spirits.map((s) => (
            <option key={s.id} value={s.id}>
              {s.id}. {s.name} ({s.rank})
            </option>
          ))}
        </select>
      </div>

      {/* Current hour info */}
      {currentHour && (
        <p className="mb-3 font-mono text-xs text-amber/60">
          Current: Hour of {currentHour.planet} ({currentHour.isDay ? "Day" : "Night"}{" "}
          {currentHour.hourNumber})
        </p>
      )}

      {/* Intent */}
      <div className="mb-3">
        <label className="mb-1 block font-mono text-xs text-cream/50">
          Intent
        </label>
        <input
          type="text"
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          placeholder="What is your working intent?"
          className="w-full rounded border border-amber/20 bg-obsidian px-3 py-2 font-serif text-sm text-cream placeholder:text-cream/30"
        />
      </div>

      {/* Notes */}
      <div className="mb-4">
        <label className="mb-1 block font-mono text-xs text-cream/50">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observations, conditions, notes..."
          rows={3}
          className="w-full rounded border border-amber/20 bg-obsidian px-3 py-2 font-serif text-sm text-cream placeholder:text-cream/30"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !intent.trim()}
        className="w-full rounded-lg bg-amber/20 px-4 py-2 font-serif text-sm font-semibold text-amber transition-colors hover:bg-amber/30 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Record Entry"}
      </button>
    </div>
  );
}
