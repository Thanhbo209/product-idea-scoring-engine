package com.thanhpham.product_idea_validator.ai.service;

import org.springframework.stereotype.Component;

@Component
public class GeminiFallbackService {

    public String generate(String prompt) {

        return """
                {
                  "score": 0.0,
                  "confidence": 0.0,
                  "feedback": "AI service is temporarily unavailable. Using fallback response.",
                  "riskLevel": "UNKNOWN",
                  "source": "FALLBACK"
                }
                """;
    }
}
