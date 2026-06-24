"use client";

import { useMemo, useState } from "react";
import { Search, Plus, FileText, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { seedKeybindings } from "@/lib/keybindings";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function KeybindingsSection() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return seedKeybindings;
    return seedKeybindings.filter(
      (k) =>
        k.command.toLowerCase().includes(q) ||
        k.keys.toLowerCase().includes(q) ||
        k.when.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <h1 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Keybindings
          </h1>
          <span className="text-xs text-muted-foreground">
            {seedKeybindings.length} bindings
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-2 rounded-md bg-muted/40 px-2">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search keybindings"
              className="h-7 w-40 border-0 bg-transparent px-0 text-xs text-foreground shadow-none focus-visible:ring-0"
            />
          </div>
          <button
            onClick={() =>
              toast.info("Add keybinding", {
                description: "Record a new keyboard shortcut.",
              })
            }
            aria-label="Add keybinding"
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={() =>
              toast.info("Export keybindings", {
                description: "Saved keybindings to a JSON file.",
              })
            }
            aria-label="Export keybindings"
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <FileText className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-card/40 text-left">
              <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Command
              </th>
              <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Keybinding
              </th>
              <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                When
              </th>
              <th className="w-16 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-xs text-muted-foreground">
                  No matching keybindings
                </td>
              </tr>
            ) : (
              filtered.map((k, i) => (
                <tr
                  key={k.id}
                  className={cn(
                    "border-b border-border/60 last:border-b-0",
                    i % 2 === 1 && "bg-muted/20",
                  )}
                >
                  <td className="px-3 py-2 text-xs text-foreground/90">
                    {k.command}
                  </td>
                  <td className="px-3 py-2">
                    <kbd className="inline-flex items-center gap-0.5 rounded border border-border bg-muted/60 px-1.5 py-0.5 font-mono text-xs text-foreground/90">
                      {k.keys}
                    </kbd>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                    {k.when}
                  </td>
                  <td className="px-3 py-2">
                    {k.status === "warning" ? (
                      <TriangleAlert
                        className="h-3.5 w-3.5 text-[oklch(0.80_0.16_90)]"
                        aria-label="Warning"
                      />
                    ) : (
                      <span className="block h-3.5 w-3.5" />
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
