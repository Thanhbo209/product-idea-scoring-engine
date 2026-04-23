package com.thanhpham.product_idea_validator.ai.total.service;

import com.thanhpham.product_idea_validator.ai.client.GeminiClient;
import com.thanhpham.product_idea_validator.ai.parser.GeminiResponseParser;
import com.thanhpham.product_idea_validator.ai.prompt.IdeaPromptBuilder;
import com.thanhpham.product_idea_validator.ai.values.scoring.ScoringService;
import com.thanhpham.product_idea_validator.idea.service.AiApiClient;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiAiApiClient implements AiApiClient {

        private final GeminiClient geminiClient;
        private final IdeaPromptBuilder promptBuilder;
        private final GeminiResponseParser parser;
        private final ScoringService scoringService;

        @Override
        public AiResult evaluate(
                        String description,
                        String problem,
                        String targetUsers,
                        String monetization,
                        String risks) {
                log.info("Starting AI evaluation via Gemini");

                // 1. Build structured prompt
                String prompt = promptBuilder.buildEvaluationPrompt(
                                description, problem, targetUsers, monetization, risks);

                // 2. Call Gemini API
                String rawResponse = geminiClient.generate(prompt);

                // 3. Parse JSON from response
                GeminiResponseParser.ParsedEvaluationResult parsed = parser.parse(rawResponse);

                // 4. Compute authoritative score (override AI total with server-side formula)
                ScoringService.ScoringResult scored = scoringService.process(parsed);

                log.info("AI evaluation completed — total score: {}", scored.totalScore());

                return new AiResult(
                                scored.clarityScore(),
                                scored.marketScore(),
                                scored.riskScore(),
                                scored.totalScore(),
                                scored.feedback());
        }
}
