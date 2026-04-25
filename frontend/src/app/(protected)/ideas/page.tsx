"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Lightbulb, BarChart3, Tag } from "lucide-react";
import { useIdeas, useCreateIdea } from "@/hooks/useIdeas";
import type { IdeaStatus } from "@/types/idea";

const STATUS_FILTERS: { label: string; value?: IdeaStatus }[] = [
  { label: "All" },
  { label: "Draft", value: "DRAFT" },
  { label: "Active", value: "ACTIVE" },
  { label: "Archived", value: "ARCHIVED" },
];

const STATUS_BADGE: Record<IdeaStatus, string> = {
  DRAFT: "bg-secondary text-muted-foreground",
  ACTIVE: "bg-green-100 text-green-700",
  ARCHIVED: "bg-orange-100 text-orange-700",
};

export default function IdeaListPage() {
  const [status, setStatus] = useState<IdeaStatus | undefined>();
  const [newTitle, setNewTitle] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading, isError } = useIdeas({ status });
  const { mutate: createIdea, isPending: isCreating } = useCreateIdea();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createIdea(
      { title: newTitle.trim() },
      {
        onSuccess: () => {
          setNewTitle("");
          setShowForm(false);
        },
      },
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            My Ideas
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data?.totalElements ?? 0} ideas total
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm
                     font-medium bg-primary text-primary-foreground
                     hover:bg-primary/90 transition-colors"
        >
          <Plus size={15} />
          New Idea
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="flex gap-2 p-3 border border-border rounded-xl bg-card"
        >
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Idea title..."
            className="flex-1 px-3 py-1.5 text-sm border border-border rounded-lg bg-background
                       text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            type="submit"
            disabled={isCreating || !newTitle.trim()}
            className="px-4 py-1.5 text-sm font-medium bg-primary text-primary-foreground
                       rounded-lg hover:bg-primary/90 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? "Creating..." : "Create"}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="px-3 py-1.5 text-sm border border-border rounded-lg
                       text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Status filter */}
      <div className="flex items-center gap-1 bg-secondary rounded-lg p-1 w-fit">
        {STATUS_FILTERS.map(({ label, value }) => (
          <button
            key={label}
            onClick={() => setStatus(value)}
            className={[
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              status === value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-xl bg-secondary animate-pulse"
            />
          ))}
        </div>
      ) : isError ? (
        <p className="text-sm text-destructive">Failed to load ideas.</p>
      ) : !data?.content.length ? (
        <div className="border border-dashed border-border rounded-2xl py-16 text-center">
          <Lightbulb
            size={28}
            className="mx-auto text-muted-foreground/30 mb-3"
          />
          <p className="text-sm text-muted-foreground">No ideas yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.content.map((idea) => (
            <Link
              key={idea.id}
              href={`/ideas/${idea.id}`}
              className="block bg-card border border-border rounded-xl px-4 py-3
                         hover:border-primary/40 hover:bg-accent transition-colors group"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={[
                      "text-xs px-2 py-0.5 rounded-full font-medium shrink-0",
                      STATUS_BADGE[idea.status],
                    ].join(" ")}
                  >
                    {idea.status}
                  </span>
                  <span
                    className="text-sm font-medium text-foreground truncate
                                   group-hover:text-primary transition-colors"
                  >
                    {idea.title}
                  </span>
                </div>

                <div className="flex items-center gap-4 shrink-0 text-muted-foreground">
                  {idea.latestTotalScore != null && (
                    <span className="flex items-center gap-1 text-xs">
                      <BarChart3 size={12} />
                      {idea.latestTotalScore.toFixed(1)}
                    </span>
                  )}
                  <span className="text-xs">
                    {idea.versionCount} version
                    {idea.versionCount !== 1 ? "s" : ""}
                  </span>
                  {!!idea.tagNames.length && (
                    <span className="flex items-center gap-1 text-xs">
                      <Tag size={12} />
                      {idea.tagNames.slice(0, 2).join(", ")}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
