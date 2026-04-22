package com.thanhpham.product_idea_validator.idea.DTO.response;

import com.thanhpham.product_idea_validator.model.Idea;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record IdeaSummaryResponse(
        UUID id,
        String title,
        Idea.Status status,
        Boolean isPublic,
        Integer versionCount,
        BigDecimal latestTotalScore,
        List<String> tagNames,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}
