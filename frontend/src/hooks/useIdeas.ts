import { ideaApi } from "@/lib/ideaApi";
import type { CreateIdeaRequest, CreateVersionRequest } from "@/types/idea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ── Query keys ────────────────────────────────────────────────────────────────

export const ideaKeys = {
  all: ["ideas"] as const,
  lists: () => [...ideaKeys.all, "list"] as const,
  list: (filters?: object) => [...ideaKeys.lists(), filters] as const,
  details: () => [...ideaKeys.all, "detail"] as const,
  detail: (id: string) => [...ideaKeys.details(), id] as const,
  versions: (ideaId: string) =>
    [...ideaKeys.detail(ideaId), "versions"] as const,
  evalStatus: (ideaId: string, versionId: string) =>
    [...ideaKeys.versions(ideaId), versionId, "status"] as const,
};

// ── Queries ───────────────────────────────────────────────────────────────────

export function useIdeas(params?: { status?: string; page?: number }) {
  return useQuery({
    queryKey: ideaKeys.list(params),
    queryFn: () => ideaApi.getIdeas(params),
  });
}

export function useIdea(ideaId: string) {
  return useQuery({
    queryKey: ideaKeys.detail(ideaId),
    queryFn: () => ideaApi.getIdea(ideaId),
    enabled: !!ideaId,
  });
}

export function useVersions(ideaId: string) {
  return useQuery({
    queryKey: ideaKeys.versions(ideaId),
    queryFn: () => ideaApi.getVersions(ideaId),
    enabled: !!ideaId,
  });
}

export function useEvaluationStatus(
  ideaId: string,
  versionId: string,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ideaKeys.evalStatus(ideaId, versionId),
    queryFn: () => ideaApi.getEvaluationStatus(ideaId, versionId),
    enabled: enabled && !!ideaId && !!versionId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // Stop polling when terminal state reached
      if (status === "COMPLETED" || status === "FAILED") return false;
      return 2000; // poll every 2s
    },
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useCreateIdea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateIdeaRequest) => ideaApi.createIdea(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ideaKeys.lists() });
    },
  });
}

export function useCreateVersion(ideaId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateVersionRequest) =>
      ideaApi.createVersion(ideaId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ideaKeys.versions(ideaId) });
      qc.invalidateQueries({ queryKey: ideaKeys.detail(ideaId) });
    },
  });
}

export function useEvaluateVersion(ideaId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (versionId: string) =>
      ideaApi.triggerEvaluation(ideaId, versionId),
    onSuccess: (_data, versionId) => {
      // Invalidate status so polling starts fresh
      qc.invalidateQueries({
        queryKey: ideaKeys.evalStatus(ideaId, versionId),
      });
    },
  });
}
