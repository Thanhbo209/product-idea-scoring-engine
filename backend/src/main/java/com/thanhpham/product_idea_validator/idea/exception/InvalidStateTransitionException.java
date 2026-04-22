package com.thanhpham.product_idea_validator.idea.exception;

import com.thanhpham.product_idea_validator.model.Idea;

public class InvalidStateTransitionException extends RuntimeException {
    public InvalidStateTransitionException(Idea.Status from, Idea.Status to) {
        super("Cannot transition from " + from + " to " + to);
    }
}
