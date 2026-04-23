package com.thanhpham.product_idea_validator.ai.parser;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Slf4j
@Component
@RequiredArgsConstructor
public class GeminiResponseParser {

    private final ObjectMapper objectMapper;

    private ParsedEvaluationResult safeFallback() {
        return new ParsedEvaluationResult(
                "UNKNOWN",
                "UNKNOWN",
                "UNKNOWN",
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                "AI unavailable - fallback result");
    }

    public ParsedEvaluationResult parse(String rawText) {
        try {
            String json = extractJson(rawText);
            RawGeminiResult raw = objectMapper.readValue(json, RawGeminiResult.class);
            return validate(raw);

        } catch (Exception ex) {
            log.error("AI parse failed → using safe fallback", ex);

            return safeFallback();
        }
    }

    private String extractJson(String text) {
        if (text == null || text.isBlank()) {
            throw new RuntimeException("Empty response");
        }

        String cleaned = text
                .replaceAll("```json", "")
                .replaceAll("```", "")
                .trim();

        int first = cleaned.indexOf('{');
        int last = cleaned.lastIndexOf('}');

        if (first == -1 || last == -1 || last <= first) {
            throw new RuntimeException("No JSON found: " + cleaned);
        }

        return cleaned.substring(first, last + 1);
    }

    private ParsedEvaluationResult validate(RawGeminiResult raw) {
        return new ParsedEvaluationResult(
                raw.extractedTargetUsers(),
                raw.extractedProblem(),
                raw.extractedRisks(),
                clamp(raw.clarityScore()),
                clamp(raw.marketScore()),
                clamp(raw.riskScore()),
                clamp(raw.totalScore()),
                raw.feedback());
    }

    private BigDecimal clamp(Double value) {
        if (value == null)
            return BigDecimal.ZERO;
        double clamped = Math.max(0.0, Math.min(10.0, value));
        return BigDecimal.valueOf(clamped).setScale(2, RoundingMode.HALF_UP);
    }

    // ── Inner types ───────────────────────────────────────────────────────────

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record RawGeminiResult(
            @JsonProperty("extracted_target_users") String extractedTargetUsers,
            @JsonProperty("extracted_problem") String extractedProblem,
            @JsonProperty("extracted_risks") String extractedRisks,
            @JsonProperty("clarity_score") Double clarityScore,
            @JsonProperty("market_score") Double marketScore,
            @JsonProperty("risk_score") Double riskScore,
            @JsonProperty("total_score") Double totalScore,
            @JsonProperty("feedback") String feedback) {
    }

    public record ParsedEvaluationResult(
            String extractedTargetUsers,
            String extractedProblem,
            String extractedRisks,
            BigDecimal clarityScore,
            BigDecimal marketScore,
            BigDecimal riskScore,
            BigDecimal totalScore,
            String feedback) {
    }
}