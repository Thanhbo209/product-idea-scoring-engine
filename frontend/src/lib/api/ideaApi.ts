import { api } from "@/lib/api";
import type {
  CreateIdeaRequest,
  UpdateIdeaRequest,
  IdeaDetailResponse,
  IdeaSummaryResponse,
  IdeaStatus,
  Page,
} from "@/types/idea";

const BASE = "/api/v1/ideas";

export const ideasApi = {
  /** POST /api/v1/ideas */
  create: (body: CreateIdeaRequest) => api.post<IdeaDetailResponse>(BASE, body),

  /** GET /api/v1/ideas?status=DRAFT&page=0&size=20&sort=createdAt,desc */
  findAll: (params?: { status?: IdeaStatus; page?: number; size?: number }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    if (params?.page !== undefined) qs.set("page", String(params.page));
    if (params?.size !== undefined) qs.set("size", String(params.size));
    qs.set("sort", "createdAt,desc");
    const query = qs.toString();
    return api.get<Page<IdeaSummaryResponse>>(
      `${BASE}${query ? `?${query}` : ""}`,
    );
  },

  /** GET /api/v1/ideas/:id */
  findById: (ideaId: string) =>
    api.get<IdeaDetailResponse>(`${BASE}/${ideaId}`),

  /** PATCH /api/v1/ideas/:id */
  update: (ideaId: string, body: UpdateIdeaRequest) =>
    api.patch<IdeaDetailResponse>(`${BASE}/${ideaId}`, body),

  /** DELETE /api/v1/ideas/:id */
  delete: (ideaId: string) => api.delete<void>(`${BASE}/${ideaId}`),

  /** POST /api/v1/ideas/:id/share */
  enableShare: (ideaId: string) =>
    api.post<IdeaDetailResponse>(`${BASE}/${ideaId}/share`, {}),

  /** DELETE /api/v1/ideas/:id/share */
  disableShare: (ideaId: string) => api.delete<void>(`${BASE}/${ideaId}/share`),
};
