import { describe, it, expect, vi, afterEach } from "vitest";
import {
  relativeTime,
  relativeTimeAgo,
  formatTokens,
  fileLanguageColor,
  progressPercent,
} from "@/lib/domain/format";

/**
 * Unit tests for the pure domain formatting helpers.
 * These prove the functions are pure and deterministic (time is mocked).
 */
describe("format domain (src/lib/domain/format)", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe("relativeTime", () => {
    it("returns seconds for recent timestamps", () => {
      vi.setSystemTime(new Date("2026-01-01T00:01:00Z"));
      expect(relativeTime("2026-01-01T00:00:30Z")).toBe("30s");
    });

    it("returns minutes/hours/days at higher deltas", () => {
      vi.setSystemTime(new Date("2026-01-10T00:00:00Z"));
      expect(relativeTime("2026-01-09T23:30:00Z")).toBe("30m");
      expect(relativeTime("2026-01-09T22:00:00Z")).toBe("2h");
      expect(relativeTime("2026-01-07T00:00:00Z")).toBe("3d");
    });

    it("clamps future/negative deltas to 0s", () => {
      vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
      expect(relativeTime("2026-01-01T00:00:30Z")).toBe("0s");
    });
  });

  describe("relativeTimeAgo", () => {
    it("appends ' ago'", () => {
      vi.setSystemTime(new Date("2026-01-01T00:01:00Z"));
      expect(relativeTimeAgo("2026-01-01T00:00:30Z")).toBe("30s ago");
    });
  });

  describe("formatTokens", () => {
    it("formats sub-thousand counts plainly", () => {
      expect(formatTokens(0)).toBe("0");
      expect(formatTokens(999)).toBe("999");
    });

    it("compacts thousands with one decimal when needed", () => {
      expect(formatTokens(1500)).toBe("1.5K");
      expect(formatTokens(2000)).toBe("2K");
      expect(formatTokens(12345)).toBe("12.3K");
    });
  });

  describe("fileLanguageColor", () => {
    it("maps known languages (case-insensitive)", () => {
      expect(fileLanguageColor("TypeScript")).toBe("blue");
      expect(fileLanguageColor("css")).toBe("purple");
      expect(fileLanguageColor("HTML")).toBe("orange");
      expect(fileLanguageColor("javascript")).toBe("yellow");
    });

    it("defaults unknown languages to purple", () => {
      expect(fileLanguageColor("rust")).toBe("purple");
      expect(fileLanguageColor("")).toBe("purple");
    });
  });

  describe("progressPercent", () => {
    it("derives a clamped 0-100 percentage", () => {
      expect(progressPercent(0, 10)).toBe(0);
      expect(progressPercent(5, 10)).toBe(50);
      expect(progressPercent(10, 10)).toBe(100);
      expect(progressPercent(15, 10)).toBe(100); // over-complete clamped
    });

    it("handles zero/negative totals safely", () => {
      expect(progressPercent(5, 0)).toBe(0);
      expect(progressPercent(5, -3)).toBe(0);
    });
  });
});
