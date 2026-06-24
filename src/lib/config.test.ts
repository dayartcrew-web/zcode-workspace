import { describe, it, expect } from "vitest";
import { parseConfig } from "@/lib/config";

describe("typed config (src/lib/config)", () => {
  describe("parseConfig — accepts valid env", () => {
    it("fills defaults for an empty env", () => {
      const cfg = parseConfig({});
      expect(cfg.nodeEnv).toBe("development");
      expect(cfg.port).toBe(3000);
      expect(cfg.databaseUrl).toBe("file:./dev.db");
      expect(cfg.simPort).toBe(4001);
      expect(cfg.nextPublicSimUrl).toBe("");
      expect(cfg.nextPublicSimProxy).toBe(false);
    });

    it("reads + coerces provided values", () => {
      const cfg = parseConfig({
        NODE_ENV: "production",
        PORT: "8080",
        DATABASE_URL: "file:./prod.db",
        SIM_PORT: "5001",
        NEXT_PUBLIC_SIM_URL: "http://box:4001",
        NEXT_PUBLIC_SIM_PROXY: "1",
      });
      expect(cfg.nodeEnv).toBe("production");
      expect(cfg.port).toBe(8080);
      expect(cfg.simPort).toBe(5001);
      expect(cfg.nextPublicSimProxy).toBe(true);
    });

    it("prefers NEXT_PUBLIC_SIM_PORT when SIM_PORT unset", () => {
      const cfg = parseConfig({ NEXT_PUBLIC_SIM_PORT: "4444" });
      expect(cfg.simPort).toBe(4444);
    });
  });

  describe("parseConfig — rejects invalid env", () => {
    it("throws on an unknown NODE_ENV", () => {
      expect(() => parseConfig({ NODE_ENV: "staging" })).toThrow(
        /Invalid environment configuration/,
      );
    });

    it("throws on a non-numeric port", () => {
      expect(() => parseConfig({ PORT: "not-a-port" })).toThrow(
        /Invalid environment configuration/,
      );
    });

    it("throws on an invalid NEXT_PUBLIC_SIM_URL", () => {
      expect(() => parseConfig({ NEXT_PUBLIC_SIM_URL: "not-a-url" })).toThrow(
        /Invalid environment configuration/,
      );
    });

    it("includes the offending path in the error", () => {
      try {
        parseConfig({ NODE_ENV: "staging" });
        expect.unreachable("should have thrown");
      } catch (e) {
        expect((e as Error).message).toContain("nodeEnv");
      }
    });
  });
});
