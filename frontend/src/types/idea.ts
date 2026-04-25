export type IdeaStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";
export type EvaluationStatus =
  | "NOT_EVALUATED"
  | "PENDING"
  | "COMPLETED"
  | "FAILED";

export interface ScoreResponse {
  clarity: number;
  market: number;
  risk: number;
  total: number;
}

export interface IdeaVersionResponse {
  id: string;
  versionNumber: number;
  description: string;
  problem: string;
  targetUsers: string;
  monetization: string;
  risks: string;
  scores: ScoreResponse | null;
  aiFeedback: string | null;
  evaluationStatus: EvaluationStatus;
  createdAt: string;
}

export interface IdeaSummaryResponse {
  id: string;
  title: string;
  status: IdeaStatus;
  isPublic: boolean;
  versionCount: number;
  latestTotalScore: number | null;
  tagNames: string[];
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
  latestVersion: IdeaVersionResponse | null;
  tagNames: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationStatusResponse {
  versionId: string;
  status: EvaluationStatus;
  scores: ScoreResponse | null;
}

export interface CreateIdeaRequest {
  title: string;
}

export interface CreateVersionRequest {
  description: string;
  problem: string;
  targetUsers: string;
  monetization?: string;
  risks?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
