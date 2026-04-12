import type { Metadata } from "next";
import spirits from "@/data/spirits.json";
import IntentMatcher from "@/components/IntentMatcher";
import type { Spirit } from "@/lib/types";

export const metadata: Metadata = {
  title: "Intent Matcher — Hive Grimoire",
  description: "Match your intent to the appropriate Goetic spirit",
};

export default function MatchPage() {
  return <IntentMatcher spirits={spirits as Spirit[]} />;
}
