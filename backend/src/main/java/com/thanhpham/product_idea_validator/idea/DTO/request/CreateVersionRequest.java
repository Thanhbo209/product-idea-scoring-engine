package com.thanhpham.product_idea_validator.idea.DTO.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateVersionRequest(
                @NotBlank(message = "Description is required") @Size(max = 4000, message = "Description must not exceed 4000 characters") String description,

                @NotBlank(message = "Problem is required") @Size(max = 2000, message = "Problem must not exceed 2000 characters") String problem,

                @NotBlank(message = "Target users is required") @Size(max = 1000, message = "Target users must not exceed 1000 characters") String targetUsers,

                @Size(max = 2000, message = "Monetization must not exceed 2000 characters") String monetization,

                @Size(max = 2000, message = "Risks must not exceed 2000 characters") String risks) {
}
