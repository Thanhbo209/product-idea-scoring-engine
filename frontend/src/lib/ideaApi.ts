import axios from "axios";
import type {
  CreateIdeaRequest,
  CreateVersionRequest,
  EvaluationStatusResponse,
  IdeaDetailResponse,
  IdeaSummaryResponse,
  IdeaVersionResponse,
  PageResponse,
} from "@/types/idea";

const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1",
  withCredentials: true, // cookie-based auth
  headers: { "Content-Type": "application/json" },
});

// ── Idea ──────────────────────────────────────────────────────────────────────

export const ideaApi = {
  createIdea: (data: CreateIdeaRequest) =>
    client.post<IdeaDetailResponse>("/ideas", data).then((r) => r.data),

  getIdeas: (params?: { status?: string; page?: number; size?: number }) =>
    client
      .get<PageResponse<IdeaSummaryResponse>>("/ideas", { params })
      .then((r) => r.data),

  getIdea: (ideaId: string) =>
    client.get<IdeaDetailResponse>(`/ideas/${ideaId}`).then((r) => r.data),

  // ── Version ────────────────────────────────────────────────────────────────

  createVersion: (ideaId: string, data: CreateVersionRequest) =>
    client
      .post<IdeaVersionResponse>(`/ideas/${ideaId}/versions`, data)
      .then((r) => r.data),

  getVersions: (ideaId: string) =>
    client
      .get<IdeaVersionResponse[]>(`/ideas/${ideaId}/versions`)
      .then((r) => r.data),

  // ── AI Evaluation ──────────────────────────────────────────────────────────

  triggerEvaluation: (ideaId: string, versionId: string) =>
    client
      .post<void>(`/ideas/${ideaId}/versions/${versionId}/evaluate`)
      .then((r) => r.data),

  getEvaluationStatus: (ideaId: string, versionId: string) =>
    client
      .get<EvaluationStatusResponse>(
        `/ideas/${ideaId}/versions/${versionId}/evaluate/status`,
      )
      .then((r) => r.data),
};
