package com.thanhpham.product_idea_validator.idea.exception;

import java.util.UUID;

import lombok.NoArgsConstructor;

@NoArgsConstructor
public class IdeaNotFoundException extends RuntimeException {
    public IdeaNotFoundException(UUID id) {
        super("Idea not found: " + id);
    }
}