"use client";

import { ArrowLeft, Globe, Lock } from "lucide-react";
import Link from "next/link";
import { useIdea } from "@/hooks/useIdeas";
import VersionList from "@/components/VersionList";
import CreateVersionForm from "@/components/CreateVersionForm";
import ScoreCard from "@/components/ScoreCard";
import { useParams } from "next/navigation";

const STATUS_BADGE: Record<string, string> = {
  DRAFT: "bg-secondary text-muted-foreground",
  ACTIVE: "bg-green-100 text-green-700",
  ARCHIVED: "bg-orange-100 text-orange-700",
};

export default function IdeaDetailPage() {
  const params = useParams();
  const ideaId = params?.ideaId as string | undefined;

  console.log("ideaId:", ideaId);

  const { data: idea, isLoading, isError } = useIdea(ideaId ?? "");

  // guard cứng
  if (!ideaId) return null;

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <div className="h-8 w-48 rounded-lg bg-secondary animate-pulse" />
        <div className="h-32 rounded-xl bg-secondary animate-pulse" />
        <div className="h-64 rounded-xl bg-secondary animate-pulse" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <p className="text-sm text-destructive">Error loading idea.</p>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <p className="text-sm text-muted-foreground">No data.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Link
        href="/ideas"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={14} />
        All ideas
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={[
                "text-xs px-2 py-0.5 rounded-full font-medium",
                STATUS_BADGE[idea.status],
              ].join(" ")}
            >
              {idea.status}
            </span>

            {idea.isPublic ? (
              <span className="inline-flex items-center gap-1 text-xs text-green-600">
                <Globe size={11} /> Public
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Lock size={11} /> Private
              </span>
            )}
          </div>

          <h1 className="text-2xl font-semibold">{idea.title}</h1>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>
              {idea.versionCount} version{idea.versionCount !== 1 ? "s" : ""}
            </span>

            {!!idea.tagNames?.length && (
              <span className="flex items-center gap-1.5">
                {idea.tagNames.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-full bg-secondary border border-border"
                  >
                    {t}
                  </span>
                ))}
              </span>
            )}
          </div>
        </div>
      </div>

      {idea.latestVersion?.scores && (
        <div className="max-w-sm">
          <ScoreCard scores={idea.latestVersion.scores} />
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-semibold">Version history</h2>
        <VersionList ideaId={ideaId} />
        {idea.status !== "ARCHIVED" && <CreateVersionForm ideaId={ideaId} />}
      </div>
    </div>
  );
}
