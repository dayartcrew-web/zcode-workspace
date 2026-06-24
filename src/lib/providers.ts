// Provider model definitions and seed data for the Providers settings page

export type ProviderStatus = "connected" | "not-found" | "disabled";
export type IconShape = "circle" | "square";

export type AccentColor =
  | "blue"
  | "indigo"
  | "green"
  | "orange"
  | "red"
  | "purple"
  | "teal";

export interface ProviderModel {
  id: string;
  name: string;
  favorite: boolean;
}

export interface ProviderEnvVar {
  id: string;
  key: string;
  value: string;
}

export interface Provider {
  id: string;
  slug: string;
  name: string;
  version?: string;
  earlyAccess: boolean;
  status: ProviderStatus;
  statusDetail: string;
  enabled: boolean;
  expanded: boolean;
  // visual
  accent: AccentColor;
  iconShape: IconShape;
  iconBg: string; // tailwind class for the logo background
  iconText: string; // tailwind class for the logo glyph color
  iconLabel: string; // letter shown inside the logo
  // config
  displayName: string;
  binaryPath: string;
  homePath: string; // e.g. CODEX_HOME path
  homePathLabel: string; // e.g. "CODEX_HOME path"
  shadowHomePath: string;
  envVars: ProviderEnvVar[];
  models: ProviderModel[];
}

export const ACCENT_COLORS: { id: AccentColor; className: string }[] = [
  { id: "blue", className: "bg-[oklch(0.62_0.18_255)]" },
  { id: "indigo", className: "bg-[oklch(0.55_0.20_275)]" },
  { id: "green", className: "bg-[oklch(0.72_0.19_142)]" },
  { id: "orange", className: "bg-[oklch(0.72_0.18_55)]" },
  { id: "red", className: "bg-[oklch(0.65_0.22_25)]" },
  { id: "purple", className: "bg-[oklch(0.65_0.22_305)]" },
  { id: "teal", className: "bg-[oklch(0.70_0.15_180)]" },
];

export function accentClass(c: AccentColor): string {
  return ACCENT_COLORS.find((a) => a.id === c)?.className ?? "bg-primary";
}

export const seedProviders: Provider[] = [
  {
    id: "prov-codex",
    slug: "codex",
    name: "Codex",
    version: "v0.141.0",
    earlyAccess: false,
    status: "connected",
    statusDetail: "Authenticated as [redacted] — ChatGPT Go Subscription",
    enabled: true,
    expanded: true,
    accent: "green",
    iconShape: "circle",
    iconBg: "bg-[oklch(0.72_0.19_142)]",
    iconText: "text-white",
    iconLabel: "C",
    displayName: "Codex",
    binaryPath: "codex",
    homePath: "~/codex",
    homePathLabel: "CODEX_HOME path",
    shadowHomePath: "~/codex-t3/personal",
    envVars: [],
    models: [
      { id: "m-codex-1", name: "GPT-5.5", favorite: true },
      { id: "m-codex-2", name: "GPT-5.4", favorite: false },
      { id: "m-codex-3", name: "GPT-5.4-Mini", favorite: false },
      { id: "m-codex-4", name: "GPT-5.3-Codex", favorite: false },
      { id: "m-codex-5", name: "GPT-5.2", favorite: false },
    ],
  },
  {
    id: "prov-claude",
    slug: "claude",
    name: "Claude",
    version: undefined,
    earlyAccess: false,
    status: "not-found",
    statusDetail:
      "Not found — Claude Agent CLI ('claude') is not installed or not on PATH.",
    enabled: true,
    expanded: false,
    accent: "orange",
    iconShape: "circle",
    iconBg: "bg-[oklch(0.65_0.22_25)]",
    iconText: "text-white",
    iconLabel: "C",
    displayName: "Claude",
    binaryPath: "claude",
    homePath: "~/.claude",
    homePathLabel: "CLAUDE_HOME path",
    shadowHomePath: "~/.claude-zcode",
    envVars: [],
    models: [
      { id: "m-claude-1", name: "Claude Opus 4.6", favorite: true },
      { id: "m-claude-2", name: "Claude Sonnet 4.6", favorite: false },
      { id: "m-claude-3", name: "Claude Haiku 4.6", favorite: false },
    ],
  },
  {
    id: "prov-cursor",
    slug: "cursor",
    name: "Cursor",
    version: undefined,
    earlyAccess: true,
    status: "disabled",
    statusDetail: "Disabled — Cursor is disabled in ZCode settings.",
    enabled: false,
    expanded: false,
    accent: "blue",
    iconShape: "square",
    iconBg: "bg-[oklch(0.80_0.16_90)]",
    iconText: "text-black",
    iconLabel: "C",
    displayName: "Cursor",
    binaryPath: "cursor-agent",
    homePath: "~/.cursor",
    homePathLabel: "CURSOR_HOME path",
    shadowHomePath: "~/.cursor-zcode",
    envVars: [],
    models: [
      { id: "m-cursor-1", name: "cursor-default", favorite: true },
      { id: "m-cursor-2", name: "cursor-fast", favorite: false },
    ],
  },
  {
    id: "prov-grok",
    slug: "grok",
    name: "Grok",
    version: undefined,
    earlyAccess: true,
    status: "disabled",
    statusDetail: "Disabled — Grok is disabled in ZCode settings.",
    enabled: false,
    expanded: false,
    accent: "orange",
    iconShape: "circle",
    iconBg: "bg-[oklch(0.80_0.16_90)]",
    iconText: "text-black",
    iconLabel: "G",
    displayName: "Grok",
    binaryPath: "grok",
    homePath: "~/.grok",
    homePathLabel: "GROK_HOME path",
    shadowHomePath: "~/.grok-zcode",
    envVars: [],
    models: [
      { id: "m-grok-1", name: "Grok-4", favorite: true },
      { id: "m-grok-2", name: "Grok-4-Mini", favorite: false },
    ],
  },
  {
    id: "prov-opencode",
    slug: "opencode",
    name: "OpenCode",
    version: undefined,
    earlyAccess: false,
    status: "disabled",
    statusDetail: "Disabled — OpenCode is disabled in ZCode settings.",
    enabled: false,
    expanded: false,
    accent: "purple",
    iconShape: "square",
    iconBg: "bg-white",
    iconText: "text-black",
    iconLabel: "O",
    displayName: "OpenCode",
    binaryPath: "opencode",
    homePath: "~/.opencode",
    homePathLabel: "OPENCODE_HOME path",
    shadowHomePath: "~/.opencode-zcode",
    envVars: [],
    models: [
      { id: "m-opencode-1", name: "opencode-default", favorite: true },
    ],
  },
];
