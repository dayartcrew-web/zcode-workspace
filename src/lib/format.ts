// Small formatting helpers used across the workspace UI.
//
// NOTE: The canonical home for these functions is now `@/lib/domain/format`.
// This module re-exports them for backward compatibility with existing
// `@/lib/format` import sites. Prefer importing from `@/lib/domain` in new code.
export {
  relativeTime,
  relativeTimeAgo,
  formatTokens,
  fileLanguageColor,
} from "@/lib/domain/format";
