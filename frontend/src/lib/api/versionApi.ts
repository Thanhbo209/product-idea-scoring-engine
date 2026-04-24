import { api } from "@/lib/api";
import type {
  CreateVersionRequest,
  IdeaVersionResponse,
  EvaluationStatusResponse,
} from "@/types/idea";

const base = (ideaId: string) => `/api/v1/ideas/${ideaId}/versions`;

export const versionsApi = {
  /** POST /api/v1/ideas/:ideaId/versions */
  create: (ideaId: string, body: CreateVersionRequest) =>
    api.post<IdeaVersionResponse>(base(ideaId), body),

  /** GET /api/v1/ideas/:ideaId/versions */
  findAll: (ideaId: string) => api.get<IdeaVersionResponse[]>(base(ideaId)),

  /** GET /api/v1/ideas/:ideaId/versions/:versionId */
  findById: (ideaId: string, versionId: string) =>
    api.get<IdeaVersionResponse>(`${base(ideaId)}/${versionId}`),

  /** POST /api/v1/ideas/:ideaId/versions/:versionId/evaluate → 202 */
  triggerEvaluation: (ideaId: string, versionId: string) =>
    api.post<void>(`${base(ideaId)}/${versionId}/evaluate`, {}),

  /** GET /api/v1/ideas/:ideaId/versions/:versionId/evaluate/status */
  getEvaluationStatus: (ideaId: string, versionId: string) =>
    api.get<EvaluationStatusResponse>(
      `${base(ideaId)}/${versionId}/evaluate/status`,
    ),
};

// ─── Poll helper ──────────────────────────────────────────────────────────────
// Polls evaluation status every `intervalMs` until DONE or FAILED.
// Resolves with the final EvaluationStatusResponse.

export async function pollEvaluationStatus(
  ideaId: string,
  versionId: string,
  options: { intervalMs?: number; timeoutMs?: number } = {},
): Promise<EvaluationStatusResponse> {
  const { intervalMs = 2000, timeoutMs = 120_000 } = options;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const status = await versionsApi.getEvaluationStatus(ideaId, versionId);
    if (status.status === "DONE" || status.status === "FAILED") {
      return status;
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }

  throw new Error("Evaluation timed out");
}
