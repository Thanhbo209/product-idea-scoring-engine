"use client";

import { useState } from "react";
import { Plus, Tag } from "lucide-react";

const COLOR_OPTIONS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#64748b",
];

export default function TagsPage() {
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(COLOR_OPTIONS[0]);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          Tags
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Organize your ideas with tags to filter and group them easily.
        </p>
      </div>

      {/* Create tag form */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">
          Create new tag
        </h2>

        <div className="flex gap-3 items-end">
          {/* Name input */}
          <div className="flex-1 space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">
              Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. SaaS, B2C, EdTech..."
              className="w-full h-9 px-3 text-sm rounded-lg border border-border
                         bg-background placeholder:text-muted-foreground
                         focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Color picker */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">
              Color
            </label>
            <div className="flex gap-1.5 flex-wrap max-w-45">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className="w-6 h-6 rounded-full transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    outline: newColor === c ? `2px solid ${c}` : "none",
                    outlineOffset: "2px",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Preview + submit */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Preview:</span>
            {newName ? (
              <span
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ backgroundColor: newColor + "22", color: newColor }}
              >
                <Tag size={11} />
                {newName}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground italic">
                enter a name
              </span>
            )}
          </div>
          <button
            disabled={!newName.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                       bg-primary text-primary-foreground hover:bg-primary/90
                       transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={14} />
            Create tag
          </button>
        </div>
      </div>

      {/* Tag list */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Your tags</h2>
        {/* Empty state */}
        <div className="border border-dashed border-border rounded-xl py-14 text-center">
          <Tag size={28} className="mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No tags yet.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Create your first tag above.
          </p>
        </div>
        {/* Populated state — uncomment khi có data
        <div className="grid gap-2">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center justify-between bg-card border border-border
                         rounded-lg px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1
                             rounded-full font-medium"
                  style={{
                    backgroundColor: tag.color + "22",
                    color: tag.color,
                  }}
                >
                  <Tag size={11} />
                  {tag.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {tag.ideaCount} ideas
                </span>
              </div>
              <button className="text-muted-foreground hover:text-destructive transition-colors p-1">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div> */}
      </div>
    </div>
  );
}
