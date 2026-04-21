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

const METRIC_CARDS = [
  {
    label: "Total ideas",
    value: "—",
    icon: Lightbulb,
  },
  { label: "Avg score", value: "—", icon: BarChart3 },
  {
    label: "Total refinements",
    value: "—",
    icon: GitBranch,
  },
  {
    label: "Best score",
    value: "—",
    icon: TrendingUp,
  },
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const firstName = user?.fullName?.split(" ").pop() ?? "there";

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
          href="/dashboard/ideas/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                     bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
        >
          <Plus size={15} />
          New Idea
        </Link>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {METRIC_CARDS.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="bg-card border border-border rounded-xl p-4 space-y-3"
          >
            <div
              className={`w-8 h-8 rounded-lg bg-primary/10 border border-border flex items-center justify-center text-primary`}
            >
              <Icon size={16} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          </div>
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
              href="/dashboard/ideas"
              className="text-xs text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {/* Empty state */}
            <div className="px-5 py-12 text-center">
              <Lightbulb
                size={28}
                className="mx-auto text-muted-foreground/40 mb-3"
              />
              <p className="text-sm text-muted-foreground">No ideas yet.</p>
              <Link
                href="/dashboard/ideas/new"
                className="inline-flex items-center gap-1.5 mt-3 text-xs text-primary hover:underline"
              >
                <Plus size={12} /> Create your first idea
              </Link>
            </div>
          </div>
        </div>

        {/* Best idea */}
        <div className="bg-card border border-border rounded-xl">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Best idea</h2>
          </div>
          <div className="px-5 py-12 text-center">
            <TrendingUp
              size={28}
              className="mx-auto text-muted-foreground/40 mb-3"
            />
            <p className="text-sm text-muted-foreground">No data yet.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
