package com.thanhpham.product_idea_validator.ai.client;

import com.thanhpham.product_idea_validator.ai.DTO.GeminiDto;
import com.thanhpham.product_idea_validator.ai.config.GeminiProperties;
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

    @Qualifier("geminiWebClient")
    private final WebClient webClient;
    private final GeminiProperties props;

    /**
     * Sends a prompt to Gemini and returns the raw text response.
     * Throws RuntimeException on HTTP error or timeout.
     */
    public String generate(String prompt) {
        GeminiDto.Request request = GeminiDto.Request.of(prompt);

        try {
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

            String text = response.extractText();
            log.debug("Gemini raw response: {}", text);
            return text;

        } catch (WebClientResponseException ex) {
            log.error("Gemini API error {}: {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            throw new RuntimeException("Gemini API error: " + ex.getStatusCode(), ex);
        } catch (Exception ex) {
            log.error("Gemini call failed: {}", ex.getMessage());
            throw new RuntimeException("Gemini call failed: " + ex.getMessage(), ex);
        }
    }
}