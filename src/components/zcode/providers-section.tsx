"use client";

import {
  Plus,
  RefreshCw,
  ChevronDown,
  Star,
  ChevronUp,
  Settings2,
  Info,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/lib/store";
import {
  ACCENT_COLORS,
  type Provider,
} from "@/lib/providers";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function ProvidersSection() {
  const providers = useWorkspace((s) => s.providers);
  const lastChecked = useWorkspace((s) => s.providersLastChecked);
  const refresh = useWorkspace((s) => s.refreshProviders);
  const addProvider = useWorkspace((s) => s.addProvider);

  return (
    <div>
      {/* Header row: title + checked-just-now + add + refresh */}
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Providers
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            Checked {relativeFromNow(lastChecked)}
          </span>
          <button
            onClick={() => {
              addProvider();
              toast.success("Provider added", {
                description: "A new provider instance was created.",
              });
            }}
            aria-label="Add provider"
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              refresh();
              toast.success("Providers re-checked");
            }}
            aria-label="Refresh providers"
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Provider cards */}
      <div className="space-y-2.5">
        {providers.map((p) => (
          <ProviderCard key={p.id} provider={p} />
        ))}
      </div>
    </div>
  );
}

/* ----------------------------- Provider card ----------------------------- */

function ProviderCard({ provider }: { provider: Provider }) {
  const toggleEnabled = useWorkspace((s) => s.toggleProviderEnabled);
  const toggleExpanded = useWorkspace((s) => s.toggleProviderExpanded);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card/40">
      {/* Header row */}
      <div className="flex items-center gap-3 px-3.5 py-3">
        <button
          onClick={() => toggleExpanded(provider.id)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <ProviderIcon provider={provider} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-semibold text-foreground">
                {provider.name}
              </span>
              {provider.version && (
                <span className="text-xs text-muted-foreground">
                  {provider.version}
                </span>
              )}
              {provider.earlyAccess && <EarlyAccessBadge />}
            </div>
            <p
              className={cn(
                "mt-0.5 truncate text-xs",
                provider.status === "connected"
                  ? "text-muted-foreground"
                  : provider.status === "not-found"
                    ? "text-[oklch(0.78_0.16_70)]"
                    : "text-muted-foreground",
              )}
            >
              {provider.statusDetail}
            </p>
          </div>
        </button>

        <div
          onClick={(e) => e.stopPropagation()}
          className="flex shrink-0 items-center"
        >
          <Switch
            checked={provider.enabled}
            onCheckedChange={() => toggleEnabled(provider.id)}
            aria-label={`Toggle ${provider.name}`}
          />
        </div>

        <button
          onClick={() => toggleExpanded(provider.id)}
          aria-label={provider.expanded ? "Collapse" : "Expand"}
          className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              provider.expanded && "rotate-180",
            )}
          />
        </button>
      </div>

      {/* Expanded config form */}
      {provider.expanded && <ProviderConfigForm provider={provider} />}
    </div>
  );
}

function ProviderIcon({ provider }: { provider: Provider }) {
  return (
    <div
      className={cn(
        "grid h-7 w-7 shrink-0 place-items-center text-xs font-semibold",
        provider.iconShape === "circle" ? "rounded-full" : "rounded-md",
        provider.iconBg,
        provider.iconText,
      )}
    >
      {provider.iconLabel}
    </div>
  );
}

function EarlyAccessBadge() {
  return (
    <span className="inline-flex items-center rounded border border-[oklch(0.72_0.18_55/0.4)] bg-[oklch(0.72_0.18_55/0.12)] px-1.5 py-0.5 text-xs font-medium text-[oklch(0.78_0.16_70)]">
      Early Access
    </span>
  );
}

/* --------------------------- Config form --------------------------- */

function ProviderConfigForm({ provider }: { provider: Provider }) {
  const updateProvider = useWorkspace((s) => s.updateProvider);
  const setAccent = useWorkspace((s) => s.setProviderAccent);

  return (
    <div className="border-t border-border bg-background/30 px-3.5 py-4">
      <div className="space-y-5">
        {/* Display name */}
        <ConfigField
          label="Display name"
          help="Optional label shown in the provider list"
        >
          <Input
            value={provider.displayName}
            onChange={(e) =>
              updateProvider(provider.id, { displayName: e.target.value })
            }
            className="h-8 w-full max-w-xs text-sm"
          />
        </ConfigField>

        {/* Accent color */}
        <ConfigField
          label="Accent color"
          help="Used to distinguish this instance in picker rails and model lists."
        >
          <div className="flex items-center gap-2">
            {ACCENT_COLORS.map((c) => (
              <button
                key={c.id}
                onClick={() => setAccent(provider.id, c.id)}
                aria-label={`Accent ${c.id}`}
                className={cn(
                  "h-5 w-5 rounded-full transition-transform hover:scale-110",
                  c.className,
                  provider.accent === c.id &&
                    "ring-2 ring-foreground ring-offset-2 ring-offset-background",
                )}
              />
            ))}
          </div>
        </ConfigField>

        {/* Environment variables */}
        <ConfigField
          label="Environment variables"
          help="Add variables to pass API keys, base URLs, or other per-instance CLI settings. Sensitive values are stored separately and are not returned to the app after saving."
        >
          <EnvVarsBlock provider={provider} />
        </ConfigField>

        {/* Binary path */}
        <ConfigField
          label="Binary path"
          help={`Path to the ${provider.name} binary used by this instance.`}
        >
          <Input
            value={provider.binaryPath}
            onChange={(e) =>
              updateProvider(provider.id, { binaryPath: e.target.value })
            }
            className="h-8 w-full max-w-xs font-mono text-sm"
            placeholder={provider.slug}
          />
        </ConfigField>

        {/* HOME path */}
        <ConfigField
          label={provider.homePathLabel}
          help={`Custom ${provider.name} home and config directory.`}
        >
          <Input
            value={provider.homePath}
            onChange={(e) =>
              updateProvider(provider.id, { homePath: e.target.value })
            }
            className="h-8 w-full max-w-xs font-mono text-sm"
            placeholder={`~/.${provider.slug}`}
          />
        </ConfigField>

        {/* Shadow home path */}
        <ConfigField
          label="Shadow home path"
          help={`Account-specific ${provider.name} home. Keeps auth.json separate while sharing state from ${provider.homePathLabel.replace(" path", "")}.`}
        >
          <Input
            value={provider.shadowHomePath}
            onChange={(e) =>
              updateProvider(provider.id, { shadowHomePath: e.target.value })
            }
            className="h-8 w-full max-w-xs font-mono text-sm"
            placeholder={`~/.${provider.slug}-zcode`}
          />
        </ConfigField>

        {/* Models */}
        <ConfigField
          label="Models"
          help={`${provider.models.length} model${provider.models.length === 1 ? "" : "s"} available.`}
          align="start"
        >
          <ModelsBlock provider={provider} />
        </ConfigField>
      </div>
    </div>
  );
}

function ConfigField({
  label,
  help,
  children,
  align = "center",
}: {
  label: string;
  help: string;
  children: React.ReactNode;
  align?: "center" | "start";
}) {
  return (
    <div
      className={cn(
        "flex gap-6",
        align === "start" ? "items-start" : "items-center",
      )}
    >
      <div className="w-44 shrink-0">
        <h4 className="text-sm font-medium text-foreground">{label}</h4>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          {help}
        </p>
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/* --------------------------- Env vars block --------------------------- */

function EnvVarsBlock({ provider }: { provider: Provider }) {
  const addEnvVar = useWorkspace((s) => s.addEnvVar);
  const updateEnvVar = useWorkspace((s) => s.updateEnvVar);
  const removeEnvVar = useWorkspace((s) => s.removeEnvVar);

  return (
    <div>
      <button
        onClick={() => addEnvVar(provider.id)}
        className="mb-2 inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted/70"
      >
        <Plus className="h-3 w-3" />
        Add
      </button>

      {provider.envVars.length === 0 ? (
        <p className="text-xs italic text-muted-foreground/70">
          No environment variables set.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {provider.envVars.map((env) => (
            <li key={env.id} className="flex items-center gap-2">
              <Input
                value={env.key}
                onChange={(e) =>
                  updateEnvVar(provider.id, env.id, { key: e.target.value })
                }
                placeholder="KEY"
                className="h-8 w-44 font-mono text-xs"
              />
              <span className="text-muted-foreground">=</span>
              <Input
                value={env.value}
                onChange={(e) =>
                  updateEnvVar(provider.id, env.id, { value: e.target.value })
                }
                placeholder="value"
                type="password"
                className="h-8 flex-1 font-mono text-xs"
              />
              <button
                onClick={() => removeEnvVar(provider.id, env.id)}
                aria-label="Remove variable"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* --------------------------- Models block --------------------------- */

function ModelsBlock({ provider }: { provider: Provider }) {
  const toggleFav = useWorkspace((s) => s.toggleFavoriteModel);
  const moveModel = useWorkspace((s) => s.moveModel);

  if (provider.models.length === 0) {
    return (
      <p className="text-xs italic text-muted-foreground/70">
        No models discovered yet.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-md border border-border">
      {provider.models.map((m, i) => (
        <li
          key={m.id}
          className="flex items-center gap-2 bg-card/30 px-2.5 py-2"
        >
          <button
            onClick={() => toggleFav(provider.id, m.id)}
            aria-label="Toggle favorite"
            className="rounded p-0.5 hover:bg-accent"
          >
            <Star
              className={cn(
                "h-3.5 w-3.5",
                m.favorite
                  ? "fill-[oklch(0.80_0.16_90)] text-[oklch(0.80_0.16_90)]"
                  : "text-muted-foreground",
              )}
            />
          </button>
          <span className="flex-1 text-sm text-foreground/90">{m.name}</span>
          <span className="hidden text-muted-foreground/50 sm:inline">
            <Info className="h-3.5 w-3.5" />
          </span>
          <button
            onClick={() => moveModel(provider.id, m.id, -1)}
            disabled={i === 0}
            aria-label="Move up"
            className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => moveModel(provider.id, m.id, 1)}
            disabled={i === provider.models.length - 1}
            aria-label="Move down"
            className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <button
            aria-label="Model settings"
            className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Settings2 className="h-3.5 w-3.5" />
          </button>
        </li>
      ))}
    </ul>
  );
}

/* --------------------------- helpers --------------------------- */

function relativeFromNow(epoch: number): string {
  const diff = Math.max(0, Date.now() - epoch);
  const sec = Math.floor(diff / 1000);
  if (sec < 5) return "just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  return `${hr}h ago`;
}
