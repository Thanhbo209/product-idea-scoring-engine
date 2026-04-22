package com.thanhpham.product_idea_validator.idea.exception;

import java.util.UUID;

public class IdeaVersionNotFoundException extends RuntimeException {
    public IdeaVersionNotFoundException(UUID versionId) {
        super("Idea version not found: " + versionId);
    }

}
