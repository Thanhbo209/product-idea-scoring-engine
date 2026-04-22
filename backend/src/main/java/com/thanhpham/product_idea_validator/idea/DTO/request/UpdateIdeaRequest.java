package com.thanhpham.product_idea_validator.idea.DTO.request;

import com.thanhpham.product_idea_validator.model.Idea;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateIdeaRequest(
                @Size(max = 255, message = "Title must not exceed 255 characters") @Pattern(regexp = ".*\\S.*", message = "Title must not be blank") String title,

                Idea.Status status,

                Boolean isPublic) {
}