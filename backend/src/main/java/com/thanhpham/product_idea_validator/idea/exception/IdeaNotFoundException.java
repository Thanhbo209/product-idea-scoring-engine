package com.thanhpham.product_idea_validator.idea.exception;

import java.util.UUID;

public class IdeaNotFoundException extends RuntimeException {
    public IdeaNotFoundException(UUID id) {
        super("Idea not found: " + id);
    }
}