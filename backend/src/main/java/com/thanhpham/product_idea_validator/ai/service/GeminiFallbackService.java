package com.thanhpham.product_idea_validator.ai.service;

import org.springframework.stereotype.Component;

@Component
public class GeminiFallbackService {

  public String generate(String prompt) {

    return """
        {
          "extracted_target_users": "UNKNOWN",
          "extracted_problem": "UNKNOWN",
          "extracted_risks": "UNKNOWN",
          "clarity_score": 0.0,
          "market_score": 0.0,
          "risk_score": 0.0,
          "total_score": 0.0,
          "feedback": "AI service is temporarily unavailable. Using fallback response."
          "source": "FALLBACK"
        }
        """;
  }
}
