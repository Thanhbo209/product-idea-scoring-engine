"use client";

import {
  GitBranch,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import type { IdeaVersionResponse } from "@/types/idea";
import { ScoreCard } from "@/components/ScoreCard";

interface VersionTimelineProps {
  versions: IdeaVersionResponse[];
  activeVersionId?: string;
  onSelectVersion?: (version: IdeaVersionResponse) => void;
}

function StatusBadge({
  status,
}: {
  status: IdeaVersionResponse["evaluationStatus"];
}) {
  const map = {
    PENDING: {
      icon: Clock,
      label: "Pending",
      className: "text-muted-foreground bg-secondary",
    },
    PROCESSING: {
      icon: Loader2,
      label: "Evaluating…",
      className: "text-amber-500 bg-amber-500/10",
      spin: true,
    },
    DONE: {
      icon: CheckCircle2,
      label: "Evaluated",
      className: "text-green-500 bg-green-500/10",
    },
    FAILED: {
      icon: XCircle,
      label: "Failed",
      className: "text-destructive bg-destructive/10",
    },
  } as const;

  const { icon: Icon, label, className, spin } = map[status] ?? map.PENDING;

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${className}`}
    >
      <Icon size={10} className={spin ? "animate-spin" : ""} />
      {label}
    </span>
  );
}

function VersionItem({
  version,
  isLatest,
  isActive,
  isLast,
  onSelect,
}: {
  version: IdeaVersionResponse;
  isLatest: boolean;
  isActive: boolean;
  isLast: boolean;
  onSelect?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasDone =
    version.evaluationStatus === "DONE" && version.totalScore !== null;

  return (
    <div className="relative flex gap-3">
      {/* Timeline spine */}
      {!isLast && (
        <div className="absolute left-3.25 top-7 bottom-0 w-px bg-border" />
      )}

      {/* Node dot */}
      <div className="shrink-0 mt-1">
        <div
          className={[
            "w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors",
            isActive
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground",
          ].join(" ")}
        >
          {version.versionNumber}
        </div>
      </div>

      {/* Card */}
      <div
        className={[
          "flex-1 mb-5 rounded-xl border transition-colors",
          isActive ? "border-primary/40 bg-primary/5" : "border-border bg-card",
        ].join(" ")}
      >
        <button
          onClick={onSelect}
          className="w-full text-left px-4 py-3 flex items-start justify-between gap-3"
        >
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={version.evaluationStatus} />
              {isLatest && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  Latest
                </span>
              )}
              {hasDone && (
                <span className="text-[10px] font-semibold tabular-nums text-foreground">
                  {version.totalScore!.toFixed(1)} / 10
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
              {version.description}
            </p>
            <p className="text-[10px] text-muted-foreground/60">
              {new Date(version.createdAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          {hasDone && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((v) => !v);
              }}
              className="shrink-0 p-1 rounded-md hover:bg-accent transition-colors text-muted-foreground"
            >
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          )}
        </button>

        {/* Expandable score breakdown */}
        {hasDone && expanded && (
          <div className="px-4 pb-4">
            <ScoreCard
              clarityScore={version.clarityScore!}
              marketScore={version.marketScore!}
              riskScore={version.riskScore!}
              totalScore={version.totalScore!}
              feedback={version.feedback}
              compact
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function VersionTimeline({
  versions,
  activeVersionId,
  onSelectVersion,
}: VersionTimelineProps) {
  if (versions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <GitBranch size={24} className="text-muted-foreground/30" />
        <p className="text-xs text-muted-foreground">No versions yet</p>
      </div>
    );
  }

  // Show newest first
  const sorted = [...versions].sort(
    (a, b) => b.versionNumber - a.versionNumber,
  );

  return (
    <div className="px-1">
      {sorted.map((v, i) => (
        <VersionItem
          key={v.id}
          version={v}
          isLatest={i === 0}
          isActive={v.id === activeVersionId}
          isLast={i === sorted.length - 1}
          onSelect={() => onSelectVersion?.(v)}
        />
      ))}
    </div>
  );
}
