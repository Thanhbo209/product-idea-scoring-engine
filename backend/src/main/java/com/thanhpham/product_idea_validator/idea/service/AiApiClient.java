package com.thanhpham.product_idea_validator.idea.service;

import java.math.BigDecimal;
import org.springframework.stereotype.Service;

@Service
public class AiApiClient {
    // TODO: replace with real AI integration; this stub returns fixed scores
    // and will make every evaluation indistinguishable in production.
    public AiResult evaluate(
            String description,
            String problem,
            String targetUsers,
            String monetization,
            String risks) {

        return new AiResult(
                BigDecimal.valueOf(0.8),
                BigDecimal.valueOf(0.7),
                BigDecimal.valueOf(0.4),
                BigDecimal.valueOf(0.63),
                "Mock AI feedback");
    }

    public record AiResult(
            BigDecimal clarityScore,
            BigDecimal marketScore,
            BigDecimal riskScore,
            BigDecimal totalScore,
            String feedback) {
    }
}