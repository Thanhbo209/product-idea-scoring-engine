// ─── Enums ────────────────────────────────────────────────────────────────────

export type IdeaStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export type EvaluationStatus = "PENDING" | "PROCESSING" | "DONE" | "FAILED";

// ─── Idea ─────────────────────────────────────────────────────────────────────

export interface IdeaSummaryResponse {
  id: string;
  title: string;
  status: IdeaStatus;
  latestScore: number | null;
  versionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface IdeaDetailResponse {
  id: string;
  title: string;
  status: IdeaStatus;
  isPublic: boolean;
  shareToken: string | null;
  versionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIdeaRequest {
  title: string;
}

export interface UpdateIdeaRequest {
  title?: string;
  status?: IdeaStatus;
}

// ─── Version ──────────────────────────────────────────────────────────────────

export interface IdeaVersionResponse {
  id: string;
  ideaId: string;
  versionNumber: number;
  description: string;
  problem: string | null;
  targetUsers: string | null;
  monetization: string | null;
  risks: string | null;
  evaluationStatus: EvaluationStatus;
  clarityScore: number | null;
  marketScore: number | null;
  riskScore: number | null;
  totalScore: number | null;
  feedback: string | null;
  extractedTargetUsers: string | null;
  extractedProblem: string | null;
  extractedRisks: string | null;
  createdAt: string;
}

export interface CreateVersionRequest {
  description: string;
  problem?: string;
  targetUsers?: string;
  monetization?: string;
  risks?: string;
}

export interface EvaluationStatusResponse {
  versionId: string;
  status: EvaluationStatus;
  totalScore: number | null;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardMetrics {
  totalIdeas: number;
  avgScore: number | null;
  totalRefinements: number;
  bestScore: number | null;
  recentIdeas: IdeaSummaryResponse[];
  bestIdea: IdeaSummaryResponse | null;
}

// ─── Paginated ────────────────────────────────────────────────────────────────

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
