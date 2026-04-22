package com.thanhpham.product_idea_validator.idea.service;

import com.thanhpham.product_idea_validator.idea.DTO.request.CreateVersionRequest;
import com.thanhpham.product_idea_validator.idea.DTO.response.EvaluationStatusResponse;
import com.thanhpham.product_idea_validator.idea.DTO.response.IdeaVersionResponse;
import com.thanhpham.product_idea_validator.idea.DTO.response.ScoreResponse;
import com.thanhpham.product_idea_validator.idea.exception.IdeaVersionNotFoundException;
import com.thanhpham.product_idea_validator.idea.mapper.IdeaMapper;
import com.thanhpham.product_idea_validator.idea.repository.IdeaVersionRepository;
import com.thanhpham.product_idea_validator.model.Idea;
import com.thanhpham.product_idea_validator.model.IdeaVersion;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class IdeaVersionService {

    private final IdeaVersionRepository versionRepository;
    private final IdeaService ideaService;
    private final AiEvaluationService aiEvaluationService;
    private final IdeaMapper ideaMapper;

    // ── CREATE VERSION ────────────────────────────────────────────────────────

    @Transactional
    public IdeaVersionResponse create(UUID ideaId, CreateVersionRequest req, UUID userId) {
        // PESSIMISTIC_WRITE lock on idea — prevents version_number race condition
        Idea idea = ideaService.getAndAssertOwner(ideaId, userId);

        int nextVersionNumber = versionRepository.findMaxVersionNumber(ideaId) + 1;

        IdeaVersion version = IdeaVersion.builder()
                .idea(idea)
                .versionNumber(nextVersionNumber)
                .description(req.description())
                .problem(req.problem())
                .targetUsers(req.targetUsers())
                .monetization(req.monetization())
                .risks(req.risks())
                .build();

        IdeaVersion saved = versionRepository.save(version);
        log.info("Created version {} for idea {}", nextVersionNumber, ideaId);

        return ideaMapper.toVersionResponse(saved);
    }

    // ── READ ──────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<IdeaVersionResponse> findAll(UUID ideaId, UUID userId) {
        ideaService.getAndAssertOwner(ideaId, userId);
        return versionRepository.findAllByIdeaIdOrderByVersionNumberAsc(ideaId)
                .stream()
                .map(ideaMapper::toVersionResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public IdeaVersionResponse findById(UUID ideaId, UUID versionId, UUID userId) {
        ideaService.getAndAssertOwner(ideaId, userId);
        IdeaVersion version = getVersion(ideaId, versionId);
        return ideaMapper.toVersionResponse(version);
    }

    // ── AI EVALUATION ─────────────────────────────────────────────────────────

    /**
     * Returns 202 Accepted immediately.
     * AI runs in background thread pool.
     */
    @Transactional
    public void triggerEvaluation(UUID ideaId, UUID versionId, UUID userId) {
        ideaService.getAndAssertOwner(ideaId, userId);
        getVersion(ideaId, versionId); // assert version belongs to idea

        // Idempotency guard — throws 409 if already COMPLETED or PENDING (non-stale)
        aiEvaluationService.markAsInProgress(versionId);

        // Fire and forget — does NOT block HTTP response
        aiEvaluationService.evaluateAsync(versionId);
    }

    @Transactional(readOnly = true)
    public EvaluationStatusResponse getEvaluationStatus(UUID ideaId, UUID versionId, UUID userId) {
        ideaService.getAndAssertOwner(ideaId, userId);
        IdeaVersion version = getVersion(ideaId, versionId);

        EvaluationStatus status = ideaMapper.deriveStatus(version);

        ScoreResponse scores = (status == EvaluationStatus.COMPLETED)
                ? new ScoreResponse(
                        version.getClarityScore(),
                        version.getMarketScore(),
                        version.getRiskScore(),
                        version.getTotalScore())
                : null;

        return new EvaluationStatusResponse(versionId, status, scores);
    }

    // ── INTERNAL ──────────────────────────────────────────────────────────────

    private IdeaVersion getVersion(UUID ideaId, UUID versionId) {
        return versionRepository.findByIdeaIdAndVersionId(ideaId, versionId)
                .orElseThrow(() -> new IdeaVersionNotFoundException(versionId));
    }
}