package com.thanhpham.product_idea_validator.ai.DTO;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;
import java.util.stream.Collectors;

public class GeminiDto {

    // ── Request ──────────────────────────────────────────────────────────────

    public record Request(List<Content> contents, GenerationConfig generationConfig) {
        public static Request of(String prompt) {
            return new Request(
                    List.of(new Content(List.of(new Part(prompt)))),
                    new GenerationConfig(0.2f, 2048));
        }
    }

    public record Content(List<Part> parts) {
    }

    public record Part(String text) {
    }

    public record GenerationConfig(float temperature, int maxOutputTokens) {
    }

    // ── Response ─────────────────────────────────────────────────────────────

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Response(List<Candidate> candidates) {
        public String extractText() {
            if (candidates == null || candidates.isEmpty())
                return "";
            Candidate c = candidates.get(0);
            if (c.content() == null || c.content().parts() == null)
                return "";
            return c.content().parts().stream()
                    .map(Part::text)
                    .filter(java.util.Objects::nonNull)
                    .collect(Collectors.joining())
                    .trim();
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Candidate(Content content, String finishReason) {
    }

}
