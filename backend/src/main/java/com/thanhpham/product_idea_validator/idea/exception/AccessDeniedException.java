package com.thanhpham.product_idea_validator.idea.exception;

public class AccessDeniedException extends RuntimeException {
    public AccessDeniedException() {
        super("You do not have permission to access this resource");
    }

}
