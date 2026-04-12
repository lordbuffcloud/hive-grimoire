import type { Spirit } from "./types";

/**
 * Keyword synonyms for broader matching.
 * Maps common intent words to the power keywords used in spirits.json.
 */
const SYNONYMS: Record<string, string[]> = {
  money: ["wealth", "treasure", "money", "riches", "gold"],
  wealth: ["wealth", "treasure", "money", "riches", "gold"],
  riches: ["wealth", "treasure", "money", "riches", "gold"],
  rich: ["wealth", "treasure", "money", "riches", "gold"],
  love: ["love", "desire", "passion", "romance", "attraction", "fidelity"],
  romance: ["love", "desire", "passion", "romance", "attraction"],
  desire: ["love", "desire", "passion", "lust"],
  knowledge: ["knowledge", "teaching", "wisdom", "sciences", "liberal sciences", "learning"],
  wisdom: ["knowledge", "wisdom", "teaching", "philosophy", "truth"],
  learn: ["knowledge", "teaching", "liberal sciences", "arts", "sciences"],
  teach: ["teaching", "knowledge", "liberal sciences", "arts", "sciences"],
  protect: ["protection", "concealment", "invisibility", "stealth"],
  protection: ["protection", "concealment", "invisibility", "stealth"],
  hide: ["invisibility", "concealment", "stealth"],
  invisible: ["invisibility", "concealment", "stealth"],
  war: ["warfare", "combat", "battles", "strength", "courage"],
  fight: ["warfare", "combat", "battles", "strength", "courage"],
  battle: ["warfare", "combat", "battles", "strength", "courage"],
  heal: ["healing", "medicine", "herbs", "cure"],
  health: ["healing", "medicine", "herbs", "cure"],
  find: ["finding lost things", "treasure", "discovery", "hidden things", "divination"],
  discover: ["discovery", "hidden things", "treasure", "finding lost things"],
  future: ["future knowledge", "divination", "prophecy", "past knowledge"],
  predict: ["future knowledge", "divination", "prophecy"],
  speak: ["languages", "rhetoric", "eloquence"],
  language: ["languages", "rhetoric", "eloquence"],
  eloquence: ["rhetoric", "eloquence", "languages"],
  art: ["arts", "sciences", "liberal sciences", "crafts", "creativity"],
  craft: ["crafts", "handwork", "mechanical arts", "skill"],
  music: ["music", "instruments", "sound", "poetry"],
  justice: ["justice", "punishment of thieves", "theft recovery", "truth"],
  truth: ["truth", "divination", "hidden things", "secrets"],
  secret: ["secrets", "hidden things", "truth"],
  transform: ["transmutation", "alchemy", "shape-shifting", "transformation"],
  alchemy: ["alchemy", "transmutation", "gold"],
  friend: ["friendship", "reconciliation", "love", "favor"],
  favor: ["favor", "dignity", "friendship", "honor"],
  dignity: ["dignity", "honor", "favor", "reputation"],
  power: ["authority", "command", "political power", "influence"],
  nature: ["herbs", "precious stones", "nature", "animals", "animal speech"],
  storm: ["storms", "thunder", "lightning", "wind"],
  travel: ["transportation", "astral travel", "speed"],
  death: ["necromancy", "dead souls", "communication with the dead"],
  fire: ["fire", "destruction", "arson"],
  sea: ["sea", "water", "ships", "storms"],
  build: ["construction", "building", "fortification", "towers"],
  star: ["astronomy", "astrology", "planets", "knowledge of planets"],
};

/**
 * Expands a keyword into related terms using the synonym map.
 */
function expandKeyword(word: string): string[] {
  const lower = word.toLowerCase();
  const synonyms = SYNONYMS[lower];
  return synonyms ? synonyms : [lower];
}

/**
 * Scores a spirit against a set of search terms.
 * Higher score = better match.
 */
function scoreSpirit(spirit: Spirit, terms: string[]): number {
  let score = 0;
  const expandedTerms = terms.flatMap(expandKeyword);

  for (const term of expandedTerms) {
    const termLower = term.toLowerCase();

    // Check powers (primary match)
    for (const power of spirit.powers) {
      if (power.toLowerCase().includes(termLower)) {
        score += 3;
      }
    }

    // Check description (secondary match)
    if (spirit.description.toLowerCase().includes(termLower)) {
      score += 1;
    }

    // Check name (exact match bonus)
    if (spirit.name.toLowerCase() === termLower) {
      score += 10;
    }
  }

  return score;
}

/**
 * Matches user intent to spirits. Returns spirits ranked by relevance.
 * @param query - Natural language intent string
 * @param spirits - Array of all spirits
 * @param maxResults - Maximum number of results (default 5)
 */
export function matchSpirits(
  query: string,
  spirits: Spirit[],
  maxResults: number = 5
): { spirit: Spirit; score: number }[] {
  // Tokenize query into words, removing common stop words
  const stopWords = new Set([
    "i", "want", "to", "the", "a", "an", "of", "for", "and", "or",
    "in", "with", "my", "me", "how", "can", "do", "need", "help",
    "find", "get", "make", "be", "is", "it", "that", "this",
  ]);

  const terms = query
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 1 && !stopWords.has(word));

  if (terms.length === 0) return [];

  const scored = spirits
    .map((spirit) => ({
      spirit,
      score: scoreSpirit(spirit, terms),
    }))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);

  return scored;
}
