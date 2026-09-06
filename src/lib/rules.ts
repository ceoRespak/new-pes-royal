/**
 * Shared, dependency-free phrase matcher used by brand + sub-category
 * auto-detection. Works on plain strings so it can run on the server (during
 * catalog normalisation) and, if ever needed, on the client.
 */

const esc = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Regex that matches `phrase` as a standalone word / phrase inside a name:
 * any run of letters/digits can be interleaved by punctuation/whitespace,
 * but the phrase must sit on word boundaries (so "Opal" never matches inside
 * e.g. "Metropolitan"). Returns null when the phrase is empty.
 */
export function phraseRegex(phrase: string): RegExp | null {
  const words = String(phrase)
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return null;
  const body = words.map((w) => esc(w)).join("[^a-z0-9]*");
  return new RegExp(`(^|[^a-z0-9])${body}($|[^a-z0-9])`, "i");
}

/** True when `name` contains at least one of `phrases` as a standalone phrase. */
export function matchesAny(name: string, phrases: string[]): boolean {
  const n = String(name ?? "");
  return phrases.some((p) => {
    const re = phraseRegex(p);
    return re ? re.test(n) : false;
  });
}

/**
 * Rank of the best-matching phrase for a name: the length (in characters) of
 * the longest phrase that matches, or 0 when nothing matches. Longer phrases
 * are treated as more specific, which lets sub-lines beat their parent brand.
 */
export function bestRank(name: string, phrases: string[]): number {
  const n = String(name ?? "");
  let best = 0;
  for (const p of phrases) {
    const re = phraseRegex(p);
    if (re && re.test(n)) best = Math.max(best, p.length);
  }
  return best;
}
