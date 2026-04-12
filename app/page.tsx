import spirits from "@/data/spirits.json";
import HoneycombGrid from "@/components/HoneycombGrid";
import type { Spirit } from "@/lib/types";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 text-center">
        <h1 className="font-serif text-3xl font-bold text-amber">
          The Seventy-Two
        </h1>
        <p className="mt-1 font-mono text-sm text-cream/50">
          Each cell of the hive holds a spirit. Tap to explore.
        </p>
      </div>
      <HoneycombGrid spirits={spirits as Spirit[]} />
    </div>
  );
}
