package com.thanhpham.product_idea_validator.idea.DTO.response;

import com.thanhpham.product_idea_validator.idea.service.EvaluationStatus;

import java.util.UUID;

public record EvaluationStatusResponse(
        UUID versionId,
        EvaluationStatus status,
        ScoreResponse scores // null unless COMPLETED
) {
}
