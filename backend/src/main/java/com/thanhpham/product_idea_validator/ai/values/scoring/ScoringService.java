package com.thanhpham.product_idea_validator.ai.values.scoring;

import com.thanhpham.product_idea_validator.ai.parser.GeminiResponseParser.ParsedEvaluationResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Slf4j
@Service
public class ScoringService {

    // Weights must sum to 1.0
    private static final BigDecimal CLARITY_WEIGHT = BigDecimal.valueOf(0.35);
    private static final BigDecimal MARKET_WEIGHT = BigDecimal.valueOf(0.40);
    private static final BigDecimal RISK_WEIGHT = BigDecimal.valueOf(0.25);

    /**
     * Recomputes total_score server-side from weighted components.
     * Overrides AI's total_score to ensure consistency.
     */
    public BigDecimal computeTotal(
            BigDecimal clarity,
            BigDecimal market,
            BigDecimal risk) {
        BigDecimal total = clarity.multiply(CLARITY_WEIGHT)
                .add(market.multiply(MARKET_WEIGHT))
                .add(risk.multiply(RISK_WEIGHT))
                .setScale(2, RoundingMode.HALF_UP);

        log.debug("Score computed — clarity:{} market:{} risk:{} → total:{}",
                clarity, market, risk, total);

        return total;
    }

    /**
     * Validates parsed result and computes authoritative total.
     * Returns a ScoringResult ready to persist into IdeaVersion.
     */
    public ScoringResult process(ParsedEvaluationResult parsed) {
        BigDecimal total = computeTotal(
                parsed.clarityScore(),
                parsed.marketScore(),
                parsed.riskScore());

        return new ScoringResult(
                parsed.clarityScore(),
                parsed.marketScore(),
                parsed.riskScore(),
                total,
                buildFeedback(parsed));
    }

    /**
     * Builds final feedback string, enriching with extracted fields.
     */
    private String buildFeedback(ParsedEvaluationResult parsed) {
        StringBuilder sb = new StringBuilder();

        if (parsed.feedback() != null && !parsed.feedback().isBlank()) {
            sb.append(parsed.feedback());
        }

        if (parsed.extractedProblem() != null && !parsed.extractedProblem().isBlank()) {
            sb.append("\n\n[Core problem] ").append(parsed.extractedProblem());
        }

        if (parsed.extractedTargetUsers() != null && !parsed.extractedTargetUsers().isBlank()) {
            sb.append("\n[Target users] ").append(parsed.extractedTargetUsers());
        }

        if (parsed.extractedRisks() != null && !parsed.extractedRisks().isBlank()) {
            sb.append("\n[Key risks] ").append(parsed.extractedRisks());
        }

        return sb.toString().trim();
    }

    public record ScoringResult(
            BigDecimal clarityScore,
            BigDecimal marketScore,
            BigDecimal riskScore,
            BigDecimal totalScore,
            String feedback) {
    }
}
