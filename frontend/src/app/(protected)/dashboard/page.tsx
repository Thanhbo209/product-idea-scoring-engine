"use client";

import { useAuthStore } from "@/store/authStore";
import {
  Plus,
  TrendingUp,
  Lightbulb,
  GitBranch,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { useIdeas } from "@/hooks/useIdeas";
import type { IdeaSummaryResponse, IdeaStatus } from "@/types/idea";

const STATUS_BADGE: Record<IdeaStatus, string> = {
  DRAFT: "bg-secondary text-muted-foreground",
  ACTIVE:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  ARCHIVED:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

function IdeaRow({ idea }: { idea: IdeaSummaryResponse }) {
  return (
    <Link
      href={`/ideas/${idea.id}`}
      className="flex items-center justify-between px-5 py-3 hover:bg-accent
                 transition-colors group"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_BADGE[idea.status]}`}
        >
          {idea.status}
        </span>
        <span className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {idea.title}
        </span>
      </div>
      <div className="flex items-center gap-4 shrink-0 text-muted-foreground">
        {idea.latestTotalScore != null && (
          <span className="text-xs font-semibold text-primary">
            {idea.latestTotalScore.toFixed(1)}/10
          </span>
        )}
        <span className="text-xs">{idea.versionCount}v</span>
      </div>
    </Link>
  );
}

function MetricSkeleton() {
  return <div className="h-24 rounded-xl bg-secondary animate-pulse" />;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const firstName = user?.fullName?.split(" ")[0] ?? "there";

  const { data, isLoading } = useIdeas({ size: 5 });

  const ideas = data?.content ?? [];
  const totalIdeas = data?.totalElements ?? 0;

  // Compute metrics from paginated data (best effort from first page)
  const scoredIdeas = ideas.filter((i) => i.latestTotalScore != null);
  const avgScore =
    scoredIdeas.length > 0
      ? scoredIdeas.reduce((sum, i) => sum + (i.latestTotalScore ?? 0), 0) /
        scoredIdeas.length
      : null;
  const bestScore =
    scoredIdeas.length > 0
      ? Math.max(...scoredIdeas.map((i) => i.latestTotalScore ?? 0))
      : null;
  const totalRefinements = ideas.reduce((sum, i) => sum + i.versionCount, 0);

  const METRIC_CARDS = [
    {
      label: "Total ideas",
      value: isLoading ? "—" : String(totalIdeas),
      icon: Lightbulb,
    },
    {
      label: "Avg score",
      value: isLoading ? "—" : avgScore != null ? avgScore.toFixed(1) : "—",
      icon: BarChart3,
    },
    {
      label: "Total refinements",
      value: isLoading ? "—" : String(totalRefinements),
      icon: GitBranch,
    },
    {
      label: "Best score",
      value: isLoading ? "—" : bestScore != null ? bestScore.toFixed(1) : "—",
      icon: TrendingUp,
    },
  ];

  const bestIdea =
    scoredIdeas.length > 0
      ? scoredIdeas.reduce((best, i) =>
          (i.latestTotalScore ?? 0) > (best.latestTotalScore ?? 0) ? i : best,
        )
      : null;

  return (
    <div className="p-8 max-w-full mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Good morning, {firstName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s an overview of your ideas.
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

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {isLoading
          ? [...Array(4)].map((_, i) => <MetricSkeleton key={i} />)
          : METRIC_CARDS.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="bg-card border border-border rounded-xl p-4 space-y-3"
              >
                <div
                  className="w-8 h-8 rounded-lg bg-primary/10 border border-border
                                flex items-center justify-center text-primary"
                >
                  <Icon size={16} />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">
                    {value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {label}
                  </p>
                </div>
              </div>
            ))}
      </div>

      {/* Two-col layout */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Recent ideas */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">
              Recent ideas
            </h2>
            <Link
              href="/ideas"
              className="text-xs text-primary hover:underline"
            >
              View all
            </Link>
          </div>

          {isLoading ? (
            <div className="divide-y divide-border">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="px-5 py-4 flex items-center gap-3">
                  <div className="h-5 w-16 rounded-full bg-secondary animate-pulse" />
                  <div className="h-4 flex-1 rounded bg-secondary animate-pulse" />
                </div>
              ))}
            </div>
          ) : ideas.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <Lightbulb
                size={28}
                className="mx-auto text-muted-foreground/40 mb-3"
              />
              <p className="text-sm text-muted-foreground">No ideas yet.</p>
              <Link
                href="/ideas/new"
                className="inline-flex items-center gap-1.5 mt-3 text-xs text-primary hover:underline"
              >
                <Plus size={12} /> Create your first idea
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {ideas.map((idea) => (
                <IdeaRow key={idea.id} idea={idea} />
              ))}
            </div>
          )}
        </div>

        {/* Best idea */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Best idea</h2>
          </div>

          {isLoading ? (
            <div className="p-5 space-y-3">
              <div className="h-4 rounded bg-secondary animate-pulse" />
              <div className="h-3 w-24 rounded bg-secondary animate-pulse" />
              <div className="h-8 rounded-lg bg-secondary animate-pulse" />
            </div>
          ) : bestIdea ? (
            <Link
              href={`/ideas/${bestIdea.id}`}
              className="block p-5 hover:bg-accent transition-colors"
            >
              <p className="text-sm font-medium text-foreground leading-snug mb-2">
                {bestIdea.title}
              </p>
              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[bestIdea.status]}`}
                >
                  {bestIdea.status}
                </span>
                <span className="text-xs text-muted-foreground">
                  {bestIdea.versionCount} version
                  {bestIdea.versionCount !== 1 ? "s" : ""}
                </span>
              </div>
              <div
                className="flex items-center justify-between p-3 bg-primary/5
                              border border-primary/20 rounded-lg"
              >
                <span className="text-xs text-muted-foreground">
                  Total score
                </span>
                <span className="text-lg font-semibold text-primary">
                  {bestIdea.latestTotalScore?.toFixed(1)} / 10
                </span>
              </div>
            </Link>
          ) : (
            <div className="px-5 py-12 text-center">
              <TrendingUp
                size={28}
                className="mx-auto text-muted-foreground/40 mb-3"
              />
              <p className="text-sm text-muted-foreground">
                No scored ideas yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
