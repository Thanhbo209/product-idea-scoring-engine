"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, SlidersHorizontal, Lightbulb } from "lucide-react";

const STATUS_FILTERS = ["All", "Draft", "Active", "Archived"];

export default function IdeasPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

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
        {/* Search */}
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

        {/* Status tabs */}
        <div className="flex items-center gap-1 bg-card rounded-lg p-1">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={[
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                status === s
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Sort */}
        <button
          className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-border
                           text-sm text-muted-foreground hover:text-foreground hover:bg-accent
                           transition-colors"
        >
          <SlidersHorizontal size={14} />
          Sort
        </button>
      </div>

      {/* Ideas grid — empty state */}
      <div className="border border-dashed border-border rounded-2xl py-20 text-center">
        <Lightbulb
          size={32}
          className="mx-auto text-muted-foreground/30 mb-4"
        />
        <p className="text-sm font-medium text-foreground">No ideas yet</p>
        <p className="mt-1 text-xs text-muted-foreground max-w-xs mx-auto">
          Create your first idea and let AI validate market fit, clarity and
          risk.
        </p>
        <Link
          href="/ideas/new"
          className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-lg text-sm
                     font-medium bg-primary text-primary-foreground
                     hover:bg-primary/90 transition-colors"
        >
          <Plus size={14} />
          Create idea
        </Link>
      </div>
    </div>
  );
}
