package com.thanhpham.product_idea_validator.idea.service;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;

@Service

public interface AiApiClient {
        AiResult evaluate(
                        String description,
                        String problem,
                        String targetUsers,
                        String monetization,
                        String risks);

        record AiResult(
                        BigDecimal clarityScore,
                        BigDecimal marketScore,
                        BigDecimal riskScore,
                        BigDecimal totalScore,
                        String feedback) {
        }
}
