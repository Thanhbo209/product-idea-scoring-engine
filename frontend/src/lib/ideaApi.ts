import { api } from "@/lib/api";
import type {
  CreateIdeaRequest,
  CreateVersionRequest,
  EvaluationStatusResponse,
  IdeaDetailResponse,
  IdeaSummaryResponse,
  IdeaVersionResponse,
  PageResponse,
} from "@/types/idea";

const BASE = "/api/v1";

export const ideaApi = {
  // ── Idea ────────────────────────────────────────────────────────────────────

  createIdea: (data: CreateIdeaRequest) =>
    api.post<IdeaDetailResponse>(`${BASE}/ideas`, data),

  getIdeas: (params?: { status?: string; page?: number; size?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.page !== undefined) query.set("page", String(params.page));
    if (params?.size !== undefined) query.set("size", String(params.size));
    const qs = query.toString();
    return api.get<PageResponse<IdeaSummaryResponse>>(
      `${BASE}/ideas${qs ? `?${qs}` : ""}`,
    );
  },

  getIdea: (ideaId: string) =>
    api.get<IdeaDetailResponse>(`${BASE}/ideas/${ideaId}`),

  // ── Version ──────────────────────────────────────────────────────────────────

  createVersion: (ideaId: string, data: CreateVersionRequest) =>
    api.post<IdeaVersionResponse>(`${BASE}/ideas/${ideaId}/versions`, data),

  getVersions: (ideaId: string) =>
    api.get<IdeaVersionResponse[]>(`${BASE}/ideas/${ideaId}/versions`),

  // ── AI Evaluation ────────────────────────────────────────────────────────────

  triggerEvaluation: (ideaId: string, versionId: string) =>
    api.post<void>(
      `${BASE}/ideas/${ideaId}/versions/${versionId}/evaluate`,
      {},
    ),

  getEvaluationStatus: (ideaId: string, versionId: string) =>
    api.get<EvaluationStatusResponse>(
      `${BASE}/ideas/${ideaId}/versions/${versionId}/evaluate/status`,
    ),
};
