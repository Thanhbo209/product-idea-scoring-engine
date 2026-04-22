package com.thanhpham.product_idea_validator.idea.exception;

import java.util.UUID;

public class EvaluationConflictException extends RuntimeException {
    public EvaluationConflictException(UUID versionId, String reason) {
        super("Cannot evaluate idea version: " + versionId + ": " + reason);
    }
}
