package com.thanhpham.product_idea_validator.idea.DTO.response;

import java.math.BigDecimal;

public record ScoreResponse(
        BigDecimal clarity,
        BigDecimal market,
        BigDecimal risk,
        BigDecimal total) {
}