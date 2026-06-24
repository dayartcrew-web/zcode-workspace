// Small formatting helpers used across the workspace UI

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

export function relativeTimeAgo(iso: string): string {
  return `${relativeTime(iso)} ago`;
}

export function formatTokens(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
  }
  return `${n}`;
}

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
