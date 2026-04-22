package com.thanhpham.product_idea_validator.idea.DTO.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateIdeaRequest(
                @NotBlank(message = "Title is required") @Size(max = 255, message = "Title must not exceed 255 characters") String title) {
}