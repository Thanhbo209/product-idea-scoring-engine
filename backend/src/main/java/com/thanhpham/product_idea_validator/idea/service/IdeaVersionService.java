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

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

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

    @Transactional
    public IdeaVersionResponse create(UUID ideaId, CreateVersionRequest req, UUID userId) {

        Idea idea = ideaService.getAndAssertOwner(ideaId, userId);

        int maxRetries = 3;

        for (int attempt = 1; attempt <= maxRetries; attempt++) {

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

            try {
                IdeaVersion saved = versionRepository.save(version);
                return ideaMapper.toVersionResponse(saved);

            } catch (DataIntegrityViolationException ex) {

                if (attempt == maxRetries) {
                    throw ex;
                }

                log.warn("Version conflict for idea {} attempt {}/{}",
                        ideaId, attempt, maxRetries);
            }
        }

        throw new IllegalStateException("Failed to create version after retries");
    }

    @Transactional(readOnly = true)
    public List<IdeaVersionResponse> findAll(UUID ideaId, UUID userId) {
        ideaService.getAndAssertOwner(ideaId, userId);
        return versionRepository.findAllByIdeaIdOrderByVersionNumberAsc(ideaId)
                .stream()
                .toList();
    }

    @Transactional(readOnly = true)
    public IdeaVersionResponse findById(UUID ideaId, UUID versionId, UUID userId) {
        ideaService.getAndAssertOwner(ideaId, userId);
        IdeaVersion version = getVersion(ideaId, versionId);
        return ideaMapper.toVersionResponse(version);
    }

    // ── AI EVALUATION ─────────────────────────────────────────────────────────
    @Transactional

    public void triggerEvaluation(UUID ideaId, UUID versionId, UUID userId) {

        ideaService.getAndAssertOwner(ideaId, userId);
        getVersion(ideaId, versionId);

        aiEvaluationService.markAsInProgress(versionId);

        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {

                    @Override
                    public void afterCommit() {
                        aiEvaluationService.evaluateAsync(versionId);
                    }
                });
        ;
        ;
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

    private IdeaVersion getVersion(UUID ideaId, UUID versionId) {
        return versionRepository.findByIdeaIdAndVersionId(ideaId, versionId)
                .orElseThrow(() -> new IdeaVersionNotFoundException(versionId));
    }
}