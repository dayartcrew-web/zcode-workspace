"use client";

import { useState } from "react";
import {
  Terminal,
  Box,
  Server,
  ArrowRight,
  ArrowLeft,
  X,
  Check,
  Loader2,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Method = "ssh" | "wsl" | "docker";
type Step = 0 | 1 | 2 | 3;

const STEPS = [
  "Choose method",
  "Fill settings",
  "Connecting",
  "Choose directory",
];

const METHODS: {
  id: Method;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "ssh", title: "SSH", subtitle: "Remote host", icon: Server },
  { id: "wsl", title: "WSL", subtitle: "Windows Subsystem for Linux", icon: Terminal },
  { id: "docker", title: "Docker", subtitle: "Local container", icon: Box },
];

export function RemoteConnectDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [step, setStep] = useState<Step>(0);
  const [method, setMethod] = useState<Method | null>(null);
  const [host, setHost] = useState("");
  const [user, setUser] = useState("");
  const [port, setPort] = useState("22");
  const [dir, setDir] = useState("~/project");

  function reset() {
    setStep(0);
    setMethod(null);
    setHost("");
    setUser("");
    setPort("22");
    setDir("~/project");
  }

  function handleNext() {
    if (step === 0 && !method) {
      toast.error("Choose a method to continue");
      return;
    }
    if (step === 1 && !host.trim()) {
      toast.error("Host is required");
      return;
    }
    if (step < 3) {
      setStep((s) => (s + 1) as Step);
      // Auto-advance past "Connecting" after a short delay
      if (step === 1) {
        setStep(2);
        setTimeout(() => {
          setStep(3);
        }, 1800);
      }
    } else {
      // Finished
      toast.success("Connected", {
        description: `Opened ${dir} on ${host || "remote"}.`,
      });
      onOpenChange(false);
      reset();
    }
  }

  function handleBack() {
    if (step === 2) return; // can't go back during connecting
    if (step > 0) setStep((s) => (s - 1) as Step);
  }

  function handleClose(open: boolean) {
    if (!open) reset();
    onOpenChange(open);
  }

  const canNext = step !== 0 || method !== null;
  const isConnecting = step === 2;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl gap-0 p-0" showCloseButton={false}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <div className="flex flex-col">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Remote connect
            </span>
            <DialogTitle className="text-sm font-semibold text-foreground">
              {STEPS[step]}
            </DialogTitle>
          </div>
          <button
            onClick={() => handleClose(false)}
            aria-label="Close"
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body: steps sidebar + content */}
        <div className="flex min-h-[340px]">
          {/* Steps sidebar */}
          <div className="w-44 shrink-0 border-r border-border px-3 py-4">
            <ol className="space-y-3">
              {STEPS.map((label, i) => {
                const active = i === step;
                const done = i < step;
                return (
                  <li key={label} className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        "grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-semibold",
                        active
                          ? "bg-primary text-primary-foreground"
                          : done
                            ? "bg-diff-add/20 text-diff-add"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {done ? <Check className="h-3 w-3" /> : i + 1}
                    </span>
                    <span
                      className={cn(
                        "text-xs",
                        active
                          ? "font-medium text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {label}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Content */}
          <div className="flex min-w-0 flex-1 flex-col px-5 py-5">
            <div className="flex-1">
              {step === 0 && (
                <StepChooseMethod method={method} onSelect={setMethod} />
              )}
              {step === 1 && (
                <StepFillSettings
                  method={method}
                  host={host}
                  setHost={setHost}
                  user={user}
                  setUser={setUser}
                  port={port}
                  setPort={setPort}
                />
              )}
              {step === 2 && <StepConnecting method={method} host={host} />}
              {step === 3 && <StepChooseDirectory dir={dir} setDir={setDir} />}
            </div>

            {/* Footer buttons */}
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleClose(false)}
                className="h-8 text-xs"
                disabled={isConnecting}
              >
                Cancel
              </Button>
              {step > 0 && step !== 2 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBack}
                  className="h-8 gap-1.5 text-xs"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleNext}
                disabled={!canNext || isConnecting}
                className="h-8 gap-1.5 text-xs"
              >
                {isConnecting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : step === 3 ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <ArrowRight className="h-3.5 w-3.5" />
                )}
                {step === 3 ? "Connect" : "Next"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------- Step 1: Choose method --------------------------- */

function StepChooseMethod({
  method,
  onSelect,
}: {
  method: Method | null;
  onSelect: (m: Method) => void;
}) {
  return (
    <div>
      <h3 className="text-sm font-medium text-foreground">Choose method</h3>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        Choose how you want to access this workspace, then continue with the
        matching connection settings.
      </p>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {METHODS.map((m) => {
          const Icon = m.icon;
          const active = method === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onSelect(m.id)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors",
                active
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card/40 hover:bg-accent/50",
              )}
            >
              <span
                className={cn(
                  "grid h-10 w-10 place-items-center rounded-lg",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-semibold text-foreground">
                {m.title}
              </span>
              <span className="text-center text-[11px] text-muted-foreground">
                {m.subtitle}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* --------------------------- Step 2: Fill settings --------------------------- */

function StepFillSettings({
  method,
  host,
  setHost,
  user,
  setUser,
  port,
  setPort,
}: {
  method: Method | null;
  host: string;
  setHost: (v: string) => void;
  user: string;
  setUser: (v: string) => void;
  port: string;
  setPort: (v: string) => void;
}) {
  if (method === "docker") {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Docker settings</h3>
        <div className="space-y-1.5">
          <Label htmlFor="container" className="text-xs text-muted-foreground">
            Container name / ID
          </Label>
          <Input
            id="container"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            placeholder="my-container"
            className="h-8 text-sm"
          />
        </div>
      </div>
    );
  }

  if (method === "wsl") {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">WSL settings</h3>
        <div className="space-y-1.5">
          <Label htmlFor="distro" className="text-xs text-muted-foreground">
            Distribution
          </Label>
          <Input
            id="distro"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            placeholder="Ubuntu-22.04"
            className="h-8 text-sm"
          />
        </div>
      </div>
    );
  }

  // SSH
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-foreground">SSH settings</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="ssh-host" className="text-xs text-muted-foreground">
            Host
          </Label>
          <Input
            id="ssh-host"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            placeholder="192.168.1.10"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ssh-port" className="text-xs text-muted-foreground">
            Port
          </Label>
          <Input
            id="ssh-port"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            placeholder="22"
            className="h-8 text-sm"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ssh-user" className="text-xs text-muted-foreground">
          Username
        </Label>
        <Input
          id="ssh-user"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          placeholder="root"
          className="h-8 text-sm"
        />
      </div>
    </div>
  );
}

/* --------------------------- Step 3: Connecting --------------------------- */

function StepConnecting({
  method,
  host,
}: {
  method: Method | null;
  host: string;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center py-8">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="mt-4 text-sm font-medium text-foreground">
        Connecting…
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {method === "ssh"
          ? `SSH to ${host || "remote host"}`
          : method === "wsl"
            ? `Starting WSL: ${host || "default"}`
            : `Attaching to container ${host || "…"}`}
      </p>
    </div>
  );
}

/* --------------------------- Step 4: Choose directory --------------------------- */

function StepChooseDirectory({
  dir,
  setDir,
}: {
  dir: string;
  setDir: (v: string) => void;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-foreground">Choose directory</h3>
      <p className="text-xs leading-relaxed text-muted-foreground">
        Pick the project directory to open on the remote host.
      </p>
      <div className="space-y-1.5">
        <Label htmlFor="dir" className="text-xs text-muted-foreground">
          Directory path
        </Label>
        <div className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            id="dir"
            value={dir}
            onChange={(e) => setDir(e.target.value)}
            placeholder="~/project"
            className="h-8 font-mono text-sm"
          />
        </div>
      </div>
    </div>
  );
}
