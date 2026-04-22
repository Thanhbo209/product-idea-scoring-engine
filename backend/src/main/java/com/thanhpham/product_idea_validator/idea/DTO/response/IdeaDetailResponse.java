package com.thanhpham.product_idea_validator.idea.DTO.response;

import com.thanhpham.product_idea_validator.model.Idea;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record IdeaDetailResponse(
        UUID id,
        String title,
        Idea.Status status,
        Boolean isPublic,
        String shareToken,
        Integer versionCount,
        IdeaVersionResponse latestVersion,
        List<String> tagNames,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}