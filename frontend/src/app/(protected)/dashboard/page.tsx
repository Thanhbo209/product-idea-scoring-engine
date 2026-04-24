"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  TrendingUp,
  Lightbulb,
  GitBranch,
  BarChart3,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import type { IdeaSummaryResponse } from "@/types/idea";
import { ideasApi } from "@/lib/api/ideaApi";

// ─── Compute dashboard metrics from the ideas list ───────────────────────────

function computeMetrics(ideas: IdeaSummaryResponse[]) {
  const scored = ideas.filter((i) => i.latestScore !== null);
  const totalRefinements = ideas.reduce(
    (sum, i) => sum + i.versionCount - 1,
    0,
  );
  const avgScore =
    scored.length > 0
      ? scored.reduce((sum, i) => sum + i.latestScore!, 0) / scored.length
      : null;
  const bestScore =
    scored.length > 0 ? Math.max(...scored.map((i) => i.latestScore!)) : null;
  const bestIdea =
    bestScore !== null
      ? (scored.find((i) => i.latestScore === bestScore) ?? null)
      : null;

  return { avgScore, totalRefinements, bestScore, bestIdea };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-border flex items-center justify-center text-primary">
        <Icon size={16} />
      </div>
      <div>
        <p className="text-2xl font-semibold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function RecentIdeaRow({ idea }: { idea: IdeaSummaryResponse }) {
  const scoreColor =
    idea.latestScore === null
      ? "text-muted-foreground"
      : idea.latestScore >= 7
        ? "text-green-500"
        : idea.latestScore >= 5
          ? "text-amber-500"
          : "text-red-500";

  return (
    <Link
      href={`/ideas/${idea.id}`}
      className="flex items-center justify-between px-5 py-3 hover:bg-accent/50 transition-colors"
    >
      <div className="min-w-0 space-y-0.5">
        <p className="text-sm font-medium text-foreground truncate">
          {idea.title}
        </p>
        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
          <GitBranch size={9} />
          {idea.versionCount} version{idea.versionCount !== 1 ? "s" : ""} ·{" "}
          {new Date(idea.updatedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>
      <span
        className={`text-sm font-semibold tabular-nums shrink-0 ${scoreColor}`}
      >
        {idea.latestScore !== null ? `${idea.latestScore.toFixed(1)}` : "—"}
      </span>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuthStore();
  const firstName = user?.fullName?.split(" ")[0] ?? "there";

  const [ideas, setIdeas] = useState<IdeaSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ideasApi
      .findAll({ size: 50 })
      .then((page) => setIdeas(page.content))
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Failed to load data"),
      )
      .finally(() => setLoading(false));
  }, []);

  const { avgScore, totalRefinements, bestScore, bestIdea } =
    computeMetrics(ideas);

  const recentIdeas = [...ideas]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 5);

  const metricCards = [
    {
      label: "Total ideas",
      value: loading ? "—" : String(ideas.length),
      icon: Lightbulb,
    },
    {
      label: "Avg score",
      value: loading || avgScore === null ? "—" : avgScore.toFixed(1),
      icon: BarChart3,
    },
    {
      label: "Total refinements",
      value: loading ? "—" : String(totalRefinements),
      icon: GitBranch,
    },
    {
      label: "Best score",
      value: loading || bestScore === null ? "—" : bestScore.toFixed(1),
      icon: TrendingUp,
    },
  ];

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

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metricCards.map(({ label, value, icon }) => (
          <MetricCard key={label} label={label} value={value} icon={icon} />
        ))}
      </div>

      {/* Two-col layout */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Recent ideas */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl">
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

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2
                size={18}
                className="animate-spin text-muted-foreground"
              />
            </div>
          ) : recentIdeas.length === 0 ? (
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
              {recentIdeas.map((idea) => (
                <RecentIdeaRow key={idea.id} idea={idea} />
              ))}
            </div>
          )}
        </div>

        {/* Best idea */}
        <div className="bg-card border border-border rounded-xl">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Best idea</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2
                size={18}
                className="animate-spin text-muted-foreground"
              />
            </div>
          ) : bestIdea ? (
            <Link
              href={`/ideas/${bestIdea.id}`}
              className="block px-5 py-5 hover:bg-accent/40 transition-colors"
            >
              <p className="text-sm font-medium text-foreground leading-snug">
                {bestIdea.title}
              </p>
              <div className="mt-3 flex items-end gap-1">
                <span className="text-3xl font-bold text-green-500 tabular-nums leading-none">
                  {bestIdea.latestScore!.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground mb-0.5">
                  / 10
                </span>
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground flex items-center gap-1">
                <GitBranch size={9} />
                {bestIdea.versionCount} version
                {bestIdea.versionCount !== 1 ? "s" : ""}
              </p>
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
