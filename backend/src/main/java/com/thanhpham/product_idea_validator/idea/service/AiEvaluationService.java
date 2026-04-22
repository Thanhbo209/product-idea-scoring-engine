package com.thanhpham.product_idea_validator.idea.service;

import com.thanhpham.product_idea_validator.idea.exception.EvaluationConflictException;
import com.thanhpham.product_idea_validator.idea.mapper.IdeaMapper;
import com.thanhpham.product_idea_validator.idea.repository.IdeaVersionRepository;
import com.thanhpham.product_idea_validator.model.IdeaVersion;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.Duration;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiEvaluationService {

    private final IdeaVersionRepository versionRepository;
    private final AiApiClient aiApiClient;
    private final IdeaMapper ideaMapper;

    /**
     * Step 1 — called synchronously before returning 202.
     * Guards against duplicate triggers.
     */
    @Transactional
    public void markAsInProgress(UUID versionId) {
        IdeaVersion version = versionRepository.findById(versionId)
                .orElseThrow(() -> new RuntimeException("Version not found: " + versionId));

        EvaluationStatus status = ideaMapper.deriveStatus(version);

        switch (status) {
            case COMPLETED ->
                throw new EvaluationConflictException(versionId, "already evaluated");

            case PENDING -> {
                // Allow re-trigger only if stale (> 5 min)
                if (!isStale(version)) {
                    throw new EvaluationConflictException(versionId, "evaluation already in progress");
                }
                log.warn("Stale PENDING detected for version {} — allowing retry", versionId);
            }

            case NOT_EVALUATED, FAILED -> {
                // Allow — proceed to mark PENDING
            }
        }

        version.setAiFeedback("__PENDING__:" + Instant.now().toEpochMilli());
        versionRepository.save(version);
    }

    /**
     * Step 2 — fire-and-forget async execution.
     */
    @Async("aiEvaluationExecutor")
    @Transactional
    public CompletableFuture<Void> evaluateAsync(UUID versionId) {
        IdeaVersion version = versionRepository.findById(versionId)
                .orElseGet(() -> {
                    log.error("Version {} not found during async evaluation", versionId);
                    return null;
                });

        if (version == null)
            return CompletableFuture.completedFuture(null);

        try {
            AiApiClient.AiResult result = aiApiClient.evaluate(
                    version.getDescription(),
                    version.getProblem(),
                    version.getTargetUsers(),
                    version.getMonetization(),
                    version.getRisks());

            // Conditional write — WHERE totalScore IS NULL (atomic guard)
            int updated = versionRepository.updateScoresIfNotEvaluated(
                    versionId,
                    result.clarityScore(),
                    result.marketScore(),
                    result.riskScore(),
                    result.totalScore(),
                    result.feedback());

            if (updated == 0) {
                log.warn("Score write skipped for version {} — already evaluated by concurrent request", versionId);
            } else {
                log.info("AI evaluation completed for version {}", versionId);
            }

        } catch (Exception ex) {
            log.error("AI evaluation failed for version {}: {}", versionId, ex.getMessage());
            // Mark as FAILED — allows retry
            version.setAiFeedback("__FAILED__:" + ex.getMessage());
            versionRepository.save(version);
        }

        return CompletableFuture.completedFuture(null);
    }

    private boolean isStale(IdeaVersion version) {
        if (version.getAiFeedback() == null)
            return false;
        try {
            String[] parts = version.getAiFeedback().split(":");
            long startedAt = Long.parseLong(parts[1]);
            return Instant.now().toEpochMilli() - startedAt > Duration.ofMinutes(5).toMillis();
        } catch (Exception e) {
            return true;
        }
    }
}
