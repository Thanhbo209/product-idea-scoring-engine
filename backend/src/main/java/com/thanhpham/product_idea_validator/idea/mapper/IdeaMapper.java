package com.thanhpham.product_idea_validator.idea.mapper;

import com.thanhpham.product_idea_validator.idea.DTO.response.IdeaDetailResponse;
import com.thanhpham.product_idea_validator.idea.DTO.response.IdeaSummaryResponse;
import com.thanhpham.product_idea_validator.idea.DTO.response.IdeaVersionResponse;
import com.thanhpham.product_idea_validator.idea.DTO.response.ScoreResponse;
import com.thanhpham.product_idea_validator.idea.service.EvaluationStatus;
import com.thanhpham.product_idea_validator.model.Idea;
import com.thanhpham.product_idea_validator.model.IdeaVersion;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Component
public class IdeaMapper {

    public IdeaVersionResponse toVersionResponse(IdeaVersion v) {
        ScoreResponse scores = v.getTotalScore() != null
                ? new ScoreResponse(v.getClarityScore(), v.getMarketScore(), v.getRiskScore(), v.getTotalScore())
                : null;

        String feedback = resolvePublicFeedback(v);

        return new IdeaVersionResponse(
                v.getId(),
                v.getVersionNumber(),
                v.getDescription(),
                v.getProblem(),
                v.getTargetUsers(),
                v.getMonetization(),
                v.getRisks(),
                scores,
                feedback,
                deriveStatus(v),
                v.getCreatedAt());
    }

    public IdeaSummaryResponse toSummaryResponse(Idea idea) {
        IdeaVersion latest = idea.getVersions().isEmpty()
                ? null
                : idea.getVersions().get(idea.getVersions().size() - 1);

        List<String> tagNames = idea.getIdeaTags().stream()
                .map(it -> it.getTag().getName())
                .toList();

        return new IdeaSummaryResponse(
                idea.getId(),
                idea.getTitle(),
                idea.getStatus(),
                idea.getIsPublic(),
                idea.getVersions().size(),
                latest != null ? latest.getTotalScore() : null,
                tagNames,
                idea.getCreatedAt(),
                idea.getUpdatedAt());
    }

    public IdeaDetailResponse toDetailResponse(Idea idea) {
        IdeaVersion latest = idea.getVersions().isEmpty()
                ? null
                : idea.getVersions().get(idea.getVersions().size() - 1);

        List<String> tagNames = idea.getIdeaTags().stream()
                .map(it -> it.getTag().getName())
                .toList();

        return new IdeaDetailResponse(
                idea.getId(),
                idea.getTitle(),
                idea.getStatus(),
                idea.getIsPublic(),
                idea.getIsPublic() ? idea.getShareToken() : null,
                idea.getVersions().size(),
                latest != null ? toVersionResponse(latest) : null,
                tagNames,
                idea.getCreatedAt(),
                idea.getUpdatedAt());
    }

    public EvaluationStatus deriveStatus(IdeaVersion v) {
        if (v.getTotalScore() != null)
            return EvaluationStatus.COMPLETED;
        if (v.getAiFeedback() == null)
            return EvaluationStatus.NOT_EVALUATED;
        if (v.getAiFeedback().startsWith("__PENDING__")) {
            long startedAt = Long.parseLong(v.getAiFeedback().split(":")[1]);
            boolean stale = Instant.now().toEpochMilli() - startedAt > Duration.ofMinutes(5).toMillis();
            return stale ? EvaluationStatus.FAILED : EvaluationStatus.PENDING;
        }
        if (v.getAiFeedback().startsWith("__FAILED__"))
            return EvaluationStatus.FAILED;
        return EvaluationStatus.NOT_EVALUATED;
    }

    // Strip sentinel prefixes before returning to client
    private String resolvePublicFeedback(IdeaVersion v) {
        if (v.getAiFeedback() == null)
            return null;
        if (v.getAiFeedback().startsWith("__PENDING__"))
            return null;
        if (v.getAiFeedback().startsWith("__FAILED__"))
            return null;
        return v.getAiFeedback();
    }
}