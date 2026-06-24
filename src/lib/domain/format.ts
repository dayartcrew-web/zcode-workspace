/**
 * Pure domain formatting helpers.
 *
 * This module is the canonical home for framework-agnostic, side-effect-free
 * formatting logic. It has NO imports from React, Prisma, or any store — so it
 * is trivially unit-testable (see format.test.ts) and reusable from both client
 * and server code.
 *
 * Convention: anything that formats, derives, or transforms domain values into
 * display strings lives under `src/lib/domain/`. Keep these functions pure
 * (same input → same output, no I/O).
 */

/**
 * Compact relative-time label: "12s", "5m", "3h", "2d", "1w".
 * Clamps negative/future deltas to "0s".
 */
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d`;
  const wk = Math.floor(day / 7);
  return `${wk}w`;
}

/** "<relativeTime> ago" — e.g. "5m ago". */
export function relativeTimeAgo(iso: string): string {
  return `${relativeTime(iso)} ago`;
}

/** Compact token count: 999 -> "999", 1500 -> "1.5K", 2000 -> "2K". */
export function formatTokens(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
  }
  return `${n}`;
}

/**
 * Map a source language name to a UI accent color token.
 * Returns a default ("purple") for unrecognized languages.
 */
export function fileLanguageColor(
  language: string,
): "purple" | "orange" | "yellow" | "blue" | "green" | "red" {
  switch (language.toLowerCase()) {
    case "css":
      return "purple";
    case "html":
      return "orange";
    case "javascript":
    case "js":
      return "yellow";
    case "typescript":
    case "ts":
      return "blue";
    case "markdown":
    case "md":
      return "blue";
    default:
      return "purple";
  }
}

/**
 * Progress percentage as a 0–100 integer (clamped). Pure derivation from a
 * (done, total) pair — useful for progress bars and "X%" labels alike.
 */
export function progressPercent(done: number, total: number): number {
  if (total <= 0) return 0;
  const pct = Math.round((done / total) * 100);
  if (pct < 0) return 0;
  if (pct > 100) return 100;
  return pct;
}
