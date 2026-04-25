"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import EvaluateButton from "@/components/EvaluateButton";
import ScoreCard from "@/components/ScoreCard";
import { useVersions } from "@/hooks/useIdeas";
import type { IdeaVersionResponse } from "@/types/idea";

interface VersionListProps {
  ideaId: string;
}

function VersionItem({
  version,
  ideaId,
}: {
  version: IdeaVersionResponse;
  ideaId: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="w-full flex items-center justify-between px-4 py-3 bg-card">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono bg-secondary px-2 py-0.5 rounded text-muted-foreground">
            v{version.versionNumber}
          </span>
          <span className="text-sm font-medium text-foreground truncate max-w-xs">
            {version.description?.slice(0, 60) ?? "No description"}
            {(version.description?.length ?? 0) > 60 ? "…" : ""}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {version.scores && (
            <span className="text-xs font-semibold text-primary">
              {version.scores.total.toFixed(1)} / 10
            </span>
          )}
          <EvaluateButton
            ideaId={ideaId}
            versionId={version.id}
            initialStatus={version.evaluationStatus}
          />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Collapse version" : "Expand version"}
            className="p-1 rounded hover:bg-accent"
          >
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="px-4 py-4 border-t border-border bg-background space-y-4">
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            {[
              { label: "Problem", value: version.problem },
              { label: "Target users", value: version.targetUsers },
              { label: "Monetization", value: version.monetization },
              { label: "Risks", value: version.risks },
            ].map(({ label, value }) =>
              value ? (
                <div key={label}>
                  <p className="text-xs text-muted-foreground mb-1">{label}</p>
                  <p className="text-foreground leading-relaxed">{value}</p>
                </div>
              ) : null,
            )}
          </div>

          {version.scores && <ScoreCard scores={version.scores} />}

          {version.aiFeedback && (
            <div className="bg-secondary/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1.5">
                AI Feedback
              </p>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {version.aiFeedback}
              </p>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Created {new Date(version.createdAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}

export default function VersionList({ ideaId }: VersionListProps) {
  const { data: versions, isLoading, isError } = useVersions(ideaId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-secondary animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="text-sm text-destructive">Failed to load versions.</p>;
  }

  if (!versions?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No versions yet. Create one to get started.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {versions.map((v) => (
        <VersionItem key={v.id} version={v} ideaId={ideaId} />
      ))}
    </div>
  );
}
