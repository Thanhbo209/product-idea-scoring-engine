"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useCreateVersion } from "@/hooks/useIdeas";
import type { CreateVersionRequest } from "@/types/idea";

interface CreateVersionFormProps {
  ideaId: string;
}

const FIELDS: {
  key: keyof CreateVersionRequest;
  label: string;
  required?: boolean;
  rows?: number;
}[] = [
  { key: "description", label: "Description", required: true, rows: 3 },
  { key: "problem", label: "Problem being solved", required: true, rows: 2 },
  { key: "targetUsers", label: "Target users", required: true, rows: 2 },
  { key: "monetization", label: "Monetization plan", rows: 2 },
  { key: "risks", label: "Risks", rows: 2 },
];

const EMPTY: CreateVersionRequest = {
  description: "",
  problem: "",
  targetUsers: "",
  monetization: "",
  risks: "",
};

export default function CreateVersionForm({ ideaId }: CreateVersionFormProps) {
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateVersionRequest>(EMPTY);

  const { mutate: createVersion, isPending } = useCreateVersion(ideaId);

  const handleChange = (key: keyof CreateVersionRequest, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setFormError(null);

    createVersion(form, {
      onSuccess: () => {
        setForm(EMPTY);
        setOpen(false);
      },
      onError: (err: unknown) => {
        const error = err as {
          response?: { data?: { message?: string } };
          message?: string;
        };

        setFormError(
          error.response?.data?.message ||
            error.message ||
            "Failed to create version",
        );
      },
    });
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm
                   font-medium border border-dashed border-border text-muted-foreground
                   hover:border-primary hover:text-primary transition-colors w-full justify-center"
      >
        <Plus size={15} />
        New version
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-border rounded-xl p-4 space-y-4 bg-card"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">New version</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {FIELDS.map(({ key, label, required, rows }) => (
        <div key={key}>
          <label className="block text-xs text-muted-foreground mb-1 font-medium">
            {label}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </label>
          <textarea
            rows={rows ?? 2}
            value={form[key] ?? ""}
            onChange={(e) => handleChange(key, e.target.value)}
            required={required}
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background
                       text-foreground placeholder:text-muted-foreground resize-none
                       focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      ))}

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground
                     border border-border rounded-lg transition-colors"
        >
          Cancel
        </button>
        {formError && (
          <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
            {formError}
          </div>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-1.5 text-sm font-medium bg-primary text-primary-foreground
                     rounded-lg hover:bg-primary/90 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Creating..." : "Create version"}
        </button>
      </div>
    </form>
  );
}
