import type { ScoreResponse } from "@/types/idea";

interface ScoreCardProps {
  scores: ScoreResponse;
}

const SCORE_BARS = [
  { key: "clarity", label: "Clarity", color: "bg-blue-500" },
  { key: "market", label: "Market fit", color: "bg-violet-500" },
  { key: "risk", label: "Risk", color: "bg-amber-500" },
] as const;

export default function ScoreCard({ scores }: ScoreCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        AI Scores
      </p>
      {SCORE_BARS.map(({ key, label, color }) => (
        <div key={key}>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{label}</span>
            <span className="font-medium text-foreground">
              {scores[key].toFixed(1)}
            </span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${color} transition-all duration-700`}
              style={{ width: `${scores[key] * 10}%` }}
            />
          </div>
        </div>
      ))}
      <div className="pt-2 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Total score</span>
        <span className="text-lg font-semibold text-foreground">
          {scores.total.toFixed(1)} / 10
        </span>
      </div>
    </div>
  );
}
