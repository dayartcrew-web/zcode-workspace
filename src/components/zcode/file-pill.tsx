"use client";

import { FileCode, FileType2, Hash, FileText, Braces } from "lucide-react";
import { cn } from "@/lib/utils";

type FileColor = "purple" | "orange" | "yellow" | "blue" | "green" | "red";

const colorMap: Record<FileColor, string> = {
  purple: "text-[oklch(0.65_0.22_305)] bg-[oklch(0.65_0.22_305/0.12)] border-[oklch(0.65_0.22_305/0.25)]",
  orange: "text-[oklch(0.72_0.18_55)] bg-[oklch(0.72_0.18_55/0.12)] border-[oklch(0.72_0.18_55/0.25)]",
  yellow: "text-[oklch(0.80_0.16_90)] bg-[oklch(0.80_0.16_90/0.12)] border-[oklch(0.80_0.16_90/0.25)]",
  blue: "text-[oklch(0.62_0.18_255)] bg-[oklch(0.62_0.18_255/0.12)] border-[oklch(0.62_0.18_255/0.25)]",
  green: "text-[oklch(0.72_0.19_142)] bg-[oklch(0.72_0.19_142/0.12)] border-[oklch(0.72_0.19_142/0.25)]",
  red: "text-[oklch(0.65_0.22_25)] bg-[oklch(0.65_0.22_25/0.12)] border-[oklch(0.65_0.22_25/0.25)]",
};

const iconMap: Record<FileColor, React.ComponentType<{ className?: string }>> = {
  purple: Braces,
  orange: FileType2,
  yellow: FileCode,
  blue: FileText,
  green: Hash,
  red: FileCode,
};

export function FilePill({
  name,
  color = "blue",
  className,
  onClick,
  title,
  active = false,
}: {
  name: string;
  color?: FileColor;
  className?: string;
  onClick?: () => void;
  title?: string;
  active?: boolean;
}) {
  const Icon = iconMap[color];
  const cls = cn(
    "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-medium",
    colorMap[color],
    onClick &&
      "cursor-pointer transition-colors hover:brightness-125 focus:outline-none focus-visible:ring-1 focus-visible:ring-foreground/40",
    active && "ring-1 ring-foreground/60",
    className,
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={title}
        aria-pressed={active}
        className={cls}
      >
        <Icon className="h-3 w-3" />
        {name}
      </button>
    );
  }

  return (
    <span className={cls} title={title}>
      <Icon className="h-3 w-3" />
      {name}
    </span>
  );
}

export function DiffBadge({
  add,
  del,
  className,
}: {
  add: number;
  del: number;
  className?: string;
}) {
  return (
    <span className={cn("font-mono text-xs tabular-nums", className)}>
      <span className="text-diff-add">+{add}</span>{" "}
      <span className="text-diff-del">-{del}</span>
    </span>
  );
}
