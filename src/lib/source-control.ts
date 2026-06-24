// Source control tooling and provider definitions + seed data

export type SCMStatus =
  | "available" // installed & ready
  | "coming-soon" // not yet supported
  | "authenticated" // provider logged in
  | "not-authenticated" // provider needs credentials
  | "not-available"; // cli missing on server

export type SCMKind = "version-control" | "provider";

export interface SourceControlTool {
  id: string;
  kind: SCMKind;
  name: string;
  /** Brand/marketing color used for the logo badge background */
  logoBg: string;
  logoText: string;
  /** Letter(s) shown inside the logo badge */
  logoLabel: string;
  logoShape: "circle" | "square";
  status: SCMStatus;
  /** Small status label rendered as a pill, e.g. "Available", "Coming Soon", "Not authenticated" */
  statusLabel?: string;
  /** Long description / install hint shown beneath the name */
  description?: string;
  /** Version string shown next to the name, e.g. "git version 2.52.0" */
  version?: string;
  enabled: boolean;
  /** When false, the toggle is rendered disabled (tool cannot be turned on yet) */
  toggleable: boolean;
  /** Optional fetch-interval stepper (only Git) */
  fetchIntervalSeconds?: number;
}

export const seedSourceControl: SourceControlTool[] = [
  // ---- Version control ----
  {
    id: "scm-git",
    kind: "version-control",
    name: "Git",
    logoBg: "bg-[oklch(0.65_0.24_25)]",
    logoText: "text-white",
    logoLabel: "git",
    logoShape: "square",
    status: "available",
    statusLabel: "Available",
    version: "git version 2.52.0.windows.1",
    enabled: true,
    toggleable: true,
    fetchIntervalSeconds: 30,
  },
  {
    id: "scm-jujutsu",
    kind: "version-control",
    name: "Jujutsu",
    logoBg: "bg-[oklch(0.62_0.18_255)]",
    logoText: "text-white",
    logoLabel: "jj",
    logoShape: "square",
    status: "coming-soon",
    statusLabel: "Coming Soon",
    description: "Support for Jujutsu is coming soon.",
    enabled: false,
    toggleable: false,
  },
  // ---- Providers ----
  {
    id: "scm-github",
    kind: "provider",
    name: "GitHub",
    logoBg: "bg-white",
    logoText: "text-black",
    logoLabel: "GH",
    logoShape: "circle",
    status: "authenticated",
    version: "gh version 2.86.0 (2026-01-21)",
    description: "Authenticated as [redacted]",
    enabled: true,
    toggleable: true,
  },
  {
    id: "scm-gitlab",
    kind: "provider",
    name: "GitLab",
    logoBg: "bg-[oklch(0.63_0.20_35)]",
    logoText: "text-white",
    logoLabel: "GL",
    logoShape: "circle",
    status: "not-available",
    description:
      "Not available on this server. Install the GitLab command-line tool (glab) from https://gitlab.com/gitlab-org/cli or your package manager (for example brew install glab).",
    enabled: false,
    toggleable: false,
  },
  {
    id: "scm-azure",
    kind: "provider",
    name: "Azure DevOps",
    logoBg: "bg-[oklch(0.62_0.18_255)]",
    logoText: "text-white",
    logoLabel: "A",
    logoShape: "circle",
    status: "not-available",
    description:
      "Not available on this server. Install the Azure command-line tools (az), then enable Azure DevOps support with 'az extension add --name azure-devops'.",
    enabled: false,
    toggleable: false,
  },
  {
    id: "scm-bitbucket",
    kind: "provider",
    name: "Bitbucket",
    logoBg: "bg-[oklch(0.62_0.18_255)]",
    logoText: "text-white",
    logoLabel: "B",
    logoShape: "circle",
    status: "not-authenticated",
    statusLabel: "Not authenticated",
    description:
      "Set T3CODE_BITBUCKET_EMAIL and T3CODE_BITBUCKET_API_TOKEN on the server (use a Bitbucket API token with pull request and repository scopes).",
    enabled: true,
    toggleable: true,
  },
];
