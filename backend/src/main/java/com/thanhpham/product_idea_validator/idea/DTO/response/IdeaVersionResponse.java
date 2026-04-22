package com.thanhpham.product_idea_validator.idea.DTO.response;

import com.thanhpham.product_idea_validator.idea.service.EvaluationStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record IdeaVersionResponse(
        UUID id,
        Integer versionNumber,
        String description,
        String problem,
        String targetUsers,
        String monetization,
        String risks,
        ScoreResponse scores,
        String aiFeedback,
        EvaluationStatus evaluationStatus,
        LocalDateTime createdAt) {
}