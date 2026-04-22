package com.thanhpham.product_idea_validator.idea.DTO.request;

import jakarta.validation.constraints.NotBlank;

public record CreateVersionRequest(
                @NotBlank(message = "Description is required") String description,

                @NotBlank(message = "Problem is required") String problem,

                @NotBlank(message = "Target users is required") String targetUsers,

                String monetization,

                String risks) {
}
