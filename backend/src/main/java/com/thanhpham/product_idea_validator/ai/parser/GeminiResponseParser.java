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

    public ParsedEvaluationResult parse(String rawText) {
        String json = extractJson(rawText);
        try {
            RawGeminiResult raw = objectMapper.readValue(json, RawGeminiResult.class);
            return validate(raw);
        } catch (Exception ex) {
            log.error("Failed to parse Gemini response: {}\nRaw: {}", ex.getMessage(), rawText);
            throw new RuntimeException("Failed to parse AI response: " + ex.getMessage(), ex);
        }
    }

    /**
     * Strips markdown code fences if Gemini ignores the "no markdown" instruction.
     * e.g. ```json { ... } ``` → { ... }
     */
    private String extractJson(String text) {
        if (text == null || text.isBlank()) {
            throw new RuntimeException("Empty response from Gemini");
        }
        // Remove ```json ... ``` or ``` ... ```
        String cleaned = text
                .replaceAll("(?s)```json\\s*", "")
                .replaceAll("(?s)```\\s*", "")
                .trim();

        // Find first { and last }
        int start = cleaned.indexOf('{');
        int end = cleaned.lastIndexOf('}');
        if (start == -1 || end == -1 || start >= end) {
            throw new RuntimeException("No valid JSON object found in response: " + cleaned);
        }
        return cleaned.substring(start, end + 1);
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