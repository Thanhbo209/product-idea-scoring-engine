"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  SlidersHorizontal,
  Lightbulb,
  GitBranch,
  Loader2,
  AlertCircle,
} from "lucide-react";
import type { IdeaSummaryResponse, IdeaStatus } from "@/types/idea";
import { ideasApi } from "@/lib/api/ideaApi";

const STATUS_FILTERS: { label: string; value: IdeaStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Draft", value: "DRAFT" },
  { label: "Active", value: "ACTIVE" },
  { label: "Archived", value: "ARCHIVED" },
];

const SCORE_COLOR = (score: number | null) => {
  if (score === null) return "text-muted-foreground";
  if (score >= 7) return "text-green-500";
  if (score >= 5) return "text-amber-500";
  return "text-red-500";
};

function IdeaCard({ idea }: { idea: IdeaSummaryResponse }) {
  return (
    <Link
      href={`/ideas/${idea.id}`}
      className="group block bg-card border border-border rounded-xl p-4 hover:border-primary/40
                 hover:bg-primary/5 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
            {idea.title}
          </p>
          <div className="flex items-center gap-3">
            <span
              className={[
                "text-[10px] font-medium px-2 py-0.5 rounded-full border",
                idea.status === "ACTIVE"
                  ? "border-green-500/30 bg-green-500/10 text-green-500"
                  : idea.status === "ARCHIVED"
                    ? "border-border bg-secondary text-muted-foreground"
                    : "border-border bg-secondary text-muted-foreground",
              ].join(" ")}
            >
              {idea.status}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <GitBranch size={10} />
              {idea.versionCount} version{idea.versionCount !== 1 ? "s" : ""}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground/60">
            {new Date(idea.updatedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Score badge */}
        <div className="shrink-0 text-right">
          {idea.latestScore !== null ? (
            <div>
              <p
                className={`text-lg font-bold tabular-nums leading-none ${SCORE_COLOR(idea.latestScore)}`}
              >
                {idea.latestScore.toFixed(1)}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">/ 10</p>
            </div>
          ) : (
            <span className="text-[10px] text-muted-foreground/50">
              No score
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function IdeasPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<IdeaStatus | "ALL">("ALL");
  const [ideas, setIdeas] = useState<IdeaSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIdeas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await ideasApi.findAll({
        status: status === "ALL" ? undefined : status,
        size: 50,
      });
      setIdeas(page.content);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load ideas");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchIdeas();
  }, [fetchIdeas]);

  const filtered = ideas.filter((i) =>
    i.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-8 max-w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            My Ideas
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and refine all your product ideas.
          </p>
        </div>
        <Link
          href="/ideas/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                     bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
        >
          <Plus size={15} />
          New Idea
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search ideas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-8 pr-3 text-sm rounded-lg border border-border
                       bg-background placeholder:text-muted-foreground
                       focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="flex items-center gap-1 bg-card rounded-lg p-1 border border-border">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatus(s.value)}
              className={[
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                status === s.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {s.label}
            </button>
          ))}
        </div>

        <button
          className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-border
                     text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <SlidersHorizontal size={14} />
          Sort
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <AlertCircle size={24} className="text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
          <button
            onClick={fetchIdeas}
            className="text-xs text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-dashed border-border rounded-2xl py-20 text-center">
          <Lightbulb
            size={32}
            className="mx-auto text-muted-foreground/30 mb-4"
          />
          <p className="text-sm font-medium text-foreground">
            {search ? "No ideas match your search" : "No ideas yet"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground max-w-xs mx-auto">
            {search
              ? "Try a different keyword or clear the search."
              : "Create your first idea and let AI validate market fit, clarity and risk."}
          </p>
          {!search && (
            <Link
              href="/ideas/new"
              className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-lg text-sm
                         font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus size={14} />
              Create idea
            </Link>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      )}
    </div>
  );
}
