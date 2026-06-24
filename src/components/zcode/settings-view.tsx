"use client";

import {
  Settings2,
  Package,
  GitBranch,
  Globe,
  Archive,
  ArrowLeft,
  Link2,
  ChevronRight,
  Palette,
  Keyboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/lib/store";
import type { SettingsState } from "@/lib/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ProvidersSection } from "./providers-section";
import { SourceControlSection } from "./source-control-section";
import { ConnectionsSection } from "./connections-section";
import { KeybindingsSection } from "./keybindings-section";

export function SettingsView() {
  const section = useWorkspace((s) => s.settingsSection);
  const setSection = useWorkspace((s) => s.setSettingsSection);
  const setView = useWorkspace((s) => s.setView);

  return (
    <div className="flex h-full w-full bg-background">
      {/* Settings nav sidebar */}
      <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-sidebar">
        <div className="flex items-center gap-2 px-4 pt-5 pb-4">
          <Settings2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            Settings
          </span>
        </div>

        <nav className="scrollbar-thin flex-1 overflow-y-auto px-2.5">
          <ul className="space-y-0.5">
            <NavItem
              active={section === "appearance"}
              onClick={() => setSection("appearance")}
              icon={<Palette className="h-4 w-4" />}
              label="Appearance"
            />
            <NavItem
              active={section === "keybindings"}
              onClick={() => setSection("keybindings")}
              icon={<Keyboard className="h-4 w-4" />}
              label="Keybindings"
            />
            <NavItem
              active={section === "providers"}
              onClick={() => setSection("providers")}
              icon={<Package className="h-4 w-4" />}
              label="Providers"
            />
            <NavItem
              active={section === "source-control"}
              onClick={() => setSection("source-control")}
              icon={<GitBranch className="h-4 w-4" />}
              label="Source Control"
            />
            <NavItem
              active={section === "connections"}
              onClick={() => setSection("connections")}
              icon={<Globe className="h-4 w-4" />}
              label="Connections"
            />
            <NavItem
              active={section === "archive"}
              onClick={() => setSection("archive")}
              icon={<Archive className="h-4 w-4" />}
              label="Archive"
            />
          </ul>
        </nav>

        <div className="border-t border-border p-2.5">
          <button
            onClick={() =>
              toast.info("ZCode Connect", {
                description: "Sign-in flow is coming soon.",
              })
            }
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Link2 className="h-3.5 w-3.5" />
            Sign in to ZCode Connect
          </button>
          <button
            onClick={() => setView("workspace")}
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="scrollbar-thin flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-8 py-8">
          {section === "appearance" && <AppearanceSection />}
          {section === "keybindings" && <KeybindingsSection />}
          {section === "providers" && <ProvidersSection />}
          {section === "source-control" && <SourceControlSection />}
          {section === "connections" && <ConnectionsSection />}
          {section === "archive" && <ArchiveSection />}
        </div>
      </main>
    </div>
  );
}

/* ------------------------------ Nav item ------------------------------ */

function NavItem({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <li>
      <button
        onClick={onClick}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm font-medium transition-colors",
          active
            ? "bg-accent text-foreground"
            : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
        )}
      >
        <span className={cn(active ? "text-primary" : "text-muted-foreground")}>
          {icon}
        </span>
        <span className="flex-1 truncate">{label}</span>
        {active && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
      </button>
    </li>
  );
}

/* ------------------------------ Field shells ------------------------------ */

function SectionHeader({ title }: { title: string }) {
  return (
    <h1 className="mb-6 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
      {title}
    </h1>
  );
}

function FieldRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-border py-4 last:border-b-0">
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="shrink-0 pt-0.5">{children}</div>
    </div>
  );
}

/* ------------------------------ Appearance section ------------------------------ */

function AppearanceSection() {
  const settings = useWorkspace((s) => s.settings);
  const update = useWorkspace((s) => s.updateSettings);

  return (
    <div>
      <SectionHeader title="Appearance" />

      <FieldRow
        title="Theme"
        description="Choose how ZCode looks across the app."
      >
        <Select
          value={settings.theme}
          onValueChange={(v) =>
            update({ theme: v as SettingsState["theme"] })
          }
        >
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </FieldRow>

      <FieldRow
        title="Time format"
        description="System default follows your browser or OS clock preference."
      >
        <Select
          value={settings.timeFormat}
          onValueChange={(v) =>
            update({ timeFormat: v as SettingsState["timeFormat"] })
          }
        >
          <SelectTrigger className="h-8 w-40 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="system">System default</SelectItem>
            <SelectItem value="12h">12-hour</SelectItem>
            <SelectItem value="24h">24-hour</SelectItem>
          </SelectContent>
        </Select>
      </FieldRow>

      <FieldRow
        title="Diff line wrapping"
        description="Set the default wrap state when the diff panel opens."
      >
        <Switch
          checked={settings.diffLineWrapping}
          onCheckedChange={(v) => update({ diffLineWrapping: v })}
        />
      </FieldRow>

      <FieldRow
        title="Hide whitespace changes"
        description="Set whether the diff panel ignores whitespace-only edits by default."
      >
        <Switch
          checked={settings.hideWhitespaceChanges}
          onCheckedChange={(v) => update({ hideWhitespaceChanges: v })}
        />
      </FieldRow>

      <FieldRow
        title="Assistant output"
        description="Show token-by-token output while a response is in progress."
      >
        <Switch
          checked={settings.assistantOutput}
          onCheckedChange={(v) => update({ assistantOutput: v })}
        />
      </FieldRow>

      <FieldRow
        title="Auto-open task panel"
        description="Open the right-side plan and task panel automatically when steps appear."
      >
        <Switch
          checked={settings.autoOpenTaskPanel}
          onCheckedChange={(v) => update({ autoOpenTaskPanel: v })}
        />
      </FieldRow>

      <FieldRow
        title="New threads"
        description="Pick the default workspace mode for newly created draft threads."
      >
        <Select
          value={settings.newThreads}
          onValueChange={(v) =>
            update({ newThreads: v as SettingsState["newThreads"] })
          }
        >
          <SelectTrigger className="h-8 w-36 text-xs capitalize">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="local">Local</SelectItem>
            <SelectItem value="cloud">Cloud</SelectItem>
            <SelectItem value="shared">Shared</SelectItem>
          </SelectContent>
        </Select>
      </FieldRow>

      <FieldRow
        title="Add project starts in"
        description={`Leave empty to use "~/" when the Add Project browser opens.`}
      >
        <Input
          value={settings.addProjectStartsIn}
          onChange={(e) => update({ addProjectStartsIn: e.target.value })}
          placeholder="~/"
          className="h-8 w-44 font-mono text-xs"
        />
      </FieldRow>

      <FieldRow
        title="Archive confirmation"
        description="Require a second click on the inline archive action before a thread is archived."
      >
        <Switch
          checked={settings.archiveConfirmation}
          onCheckedChange={(v) => update({ archiveConfirmation: v })}
        />
      </FieldRow>

      <FieldRow
        title="Delete confirmation"
        description="Ask before deleting a thread and its chat history."
      >
        <Switch
          checked={settings.deleteConfirmation}
          onCheckedChange={(v) => update({ deleteConfirmation: v })}
        />
      </FieldRow>
    </div>
  );
}

/* --------------------------- Placeholder sections --------------------------- */

function PlaceholderSection({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div>
      <SectionHeader title={title} />
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 py-16 text-center">
        <div className="mb-3 grid h-11 w-11 place-items-center rounded-full bg-accent text-primary">
          {icon}
        </div>
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

function ArchiveSection() {
  return (
    <PlaceholderSection
      icon={<Archive className="h-5 w-5" />}
      title="Archive"
      description="Browse and restore archived threads. Archived items are excluded from the active task list but keep their full history."
    />
  );
}
