package com.thanhpham.product_idea_validator.idea.DTO.response;

import java.util.List;

public record PublicIdeaResponse(
        String title,
        IdeaVersionResponse latestVersion,
        List<String> tagNames) {
}