"use client";

import { useState } from "react";
import { Loader2, Sparkles, CheckCircle, XCircle } from "lucide-react";
import { useEvaluateVersion, useEvaluationStatus } from "@/hooks/useIdeas";
import type { EvaluationStatus } from "@/types/idea";

interface EvaluateButtonProps {
  ideaId: string;
  versionId: string;
  initialStatus: EvaluationStatus;
}

const STATUS_CONFIG: Record<
  EvaluationStatus,
  { label: string; icon: React.ReactNode; className: string }
> = {
  NOT_EVALUATED: {
    label: "Evaluate",
    icon: <Sparkles size={14} />,
    className: "bg-primary text-primary-foreground hover:bg-primary/90",
  },
  PENDING: {
    label: "Evaluating...",
    icon: <Loader2 size={14} className="animate-spin" />,
    className: "bg-secondary text-secondary-foreground cursor-not-allowed",
  },
  COMPLETED: {
    label: "Evaluated",
    icon: <CheckCircle size={14} />,
    className: "bg-green-100 text-green-700 cursor-default",
  },
  FAILED: {
    label: "Retry Evaluate",
    icon: <XCircle size={14} />,
    className: "bg-destructive/10 text-destructive hover:bg-destructive/20",
  },
};

export default function EvaluateButton({
  ideaId,
  versionId,
  initialStatus,
}: EvaluateButtonProps) {
  const [polling, setPolling] = useState(initialStatus === "PENDING");

  const { mutate: evaluate, isPending: isTriggering } =
    useEvaluateVersion(ideaId);

  const { data: statusData } = useEvaluationStatus(ideaId, versionId, polling);

  const currentStatus: EvaluationStatus = statusData?.status ?? initialStatus;

  // Stop polling once terminal
  if (
    polling &&
    (currentStatus === "COMPLETED" || currentStatus === "FAILED")
  ) {
    setPolling(false);
  }

  const handleClick = () => {
    if (
      currentStatus === "PENDING" ||
      currentStatus === "COMPLETED" ||
      isTriggering
    )
      return;

    evaluate(versionId, {
      onSuccess: () => setPolling(true),
    });
  };

  const config = STATUS_CONFIG[currentStatus];
  const isDisabled =
    currentStatus === "PENDING" ||
    currentStatus === "COMPLETED" ||
    isTriggering;

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={[
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
        config.className,
        isDisabled && "opacity-70",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {config.icon}
      {config.label}
    </button>
  );
}
