package com.thanhpham.product_idea_validator.ai.client;

import com.thanhpham.product_idea_validator.ai.DTO.GeminiDto;
import com.thanhpham.product_idea_validator.ai.config.GeminiProperties;
import com.thanhpham.product_idea_validator.ai.service.GeminiFallbackService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;

@Slf4j
@Component
@RequiredArgsConstructor
public class GeminiClient {

    private static final int MAX_RETRY = 4;

    @Qualifier("geminiWebClient")
    private final WebClient webClient;

    private final GeminiProperties props;
    private final GeminiFallbackService fallbackService;
    private final GeminiRateLimiter rateLimiter;

    public String generate(String prompt) {

        // 1. RATE LIMIT (chặn từ đầu)
        rateLimiter.acquireOrWait();

        int attempt = 0;

        while (attempt < MAX_RETRY) {
            try {
                return callGemini(prompt);

            } catch (WebClientResponseException ex) {

                int status = ex.getStatusCode().value();

                // retryable errors
                if (status == 429 || status == 503) {
                    attempt++;

                    long backoff = calculateBackoff(attempt);

                    log.warn("Gemini retry {}/{} | status={} | wait={}ms",
                            attempt, MAX_RETRY, status, backoff);

                    sleep(backoff);
                    continue;
                }

                // non-retryable
                log.error("Gemini fatal error: {}", ex.getResponseBodyAsString(), ex);
                throw new RuntimeException("Gemini fatal error: " + status, ex);
            }

        }

        // fallback after retry exhausted
        log.error("Gemini exhausted retries → fallback triggered");
        return fallbackService.generate(prompt);
    }

    private String callGemini(String prompt) {

        GeminiDto.Request request = GeminiDto.Request.of(prompt);

        GeminiDto.Response response = webClient.post()
                .uri(uriBuilder -> uriBuilder
                        .queryParam("key", props.key())
                        .build())
                .bodyValue(request)
                .retrieve()
                .bodyToMono(GeminiDto.Response.class)
                .timeout(Duration.ofSeconds(props.timeoutSeconds()))
                .block();

        if (response == null) {
            throw new RuntimeException("Gemini returned null response");
        }

        return response.extractText();
    }

    /**
     * Exponential backoff + jitter
     */
    private long calculateBackoff(int attempt) {

        long base = 500L * (1L << (attempt - 1));

        // jitter 70% - 130%
        double jitter = 0.7 + Math.random() * 0.6;

        return (long) (base * jitter);
    }

    private void sleep(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}