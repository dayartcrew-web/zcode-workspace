"use client";

import { Plus, Code2, Trash2, Wifi, WifiOff, Loader2 } from "lucide-react";
import { useWorkspace } from "@/lib/store";
import type { RemoteEnvironment } from "@/lib/store";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export function ConnectionsSection() {
  const connections = useWorkspace((s) => s.connections);
  const toggleConnection = useWorkspace((s) => s.toggleConnection);
  const remoteEnvironments = useWorkspace((s) => s.remoteEnvironments);
  const addRemoteEnvironment = useWorkspace((s) => s.addRemoteEnvironment);
  const removeRemoteEnvironment = useWorkspace((s) => s.removeRemoteEnvironment);

  return (
    <div>
      {/* This Environment */}
      <div className="mb-8">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          This Environment
        </h2>
        <div className="space-y-2.5">
          <ConnectionRow
            title="Network access"
            description="Limited to this machine."
            checked={connections.networkAccess}
            onToggle={() => toggleConnection("networkAccess")}
          />
          <ConnectionRow
            title="Tailscale HTTPS"
            description="Start Tailscale to set up HTTPS access through MagicDNS."
            checked={connections.tailscaleHttps}
            onToggle={() => toggleConnection("tailscaleHttps")}
          />
          <ConnectionRow
            title="T3 Connect"
            description="Make this environment available to your other devices through T3 Connect."
            checked={connections.t3Connect}
            onToggle={() => toggleConnection("t3Connect")}
          />
        </div>
      </div>

      {/* Remote Environments */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Remote Environments
          </h2>
          <button
            onClick={() => {
              addRemoteEnvironment();
              toast.info("Add environment", {
                description: "Pair a remote environment via SSH.",
              });
            }}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            Add environment
          </button>
        </div>

        {remoteEnvironments.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2.5">
            {remoteEnvironments.map((env) => (
              <RemoteEnvRow
                key={env.id}
                env={env}
                onRemove={() => removeRemoteEnvironment(env.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* --------------------------- Connection row --------------------------- */

function ConnectionRow({
  title,
  description,
  checked,
  onToggle,
}: {
  title: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-card/40 px-3.5 py-3">
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="shrink-0 pt-0.5">
        <Switch checked={checked} onCheckedChange={onToggle} aria-label={`Toggle ${title}`} />
      </div>
    </div>
  );
}

/* --------------------------- Empty state --------------------------- */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 py-12 text-center">
      <div className="mb-3 grid h-11 w-11 place-items-center rounded-full bg-accent text-muted-foreground">
        <Code2 className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-medium text-foreground">
        No saved remote environments
      </h3>
      <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-muted-foreground">
        Click &ldquo;Add environment&rdquo; to pair another environment, or
        connect one from{" "}
        <button
          onClick={() =>
            toast.info("T3 Connect", {
              description: "Sign-in flow is coming soon.",
            })
          }
          className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
        >
          T3 Connect
        </button>
      </p>
    </div>
  );
}

/* --------------------------- Remote env row --------------------------- */

function RemoteEnvRow({
  env,
  onRemove,
}: {
  env: RemoteEnvironment;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card/40 px-3.5 py-3">
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <StatusIcon status={env.status} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-foreground">
              {env.name}
            </span>
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              {env.status}
            </span>
          </div>
          <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
            {env.host}
          </p>
        </div>
      </div>
      <button
        onClick={onRemove}
        aria-label={`Remove ${env.name}`}
        className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function StatusIcon({
  status,
}: {
  status: RemoteEnvironment["status"];
}) {
  if (status === "online")
    return <Wifi className="h-4 w-4 shrink-0 text-diff-add" />;
  if (status === "connecting")
    return <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />;
  return <WifiOff className="h-4 w-4 shrink-0 text-muted-foreground" />;
}
