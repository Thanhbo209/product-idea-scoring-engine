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

    public String generate(String prompt) {
        GeminiDto.Request request = GeminiDto.Request.of(prompt);

        try {
            GeminiDto.Response response = webClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .queryParam("key", props.key())
                            .build())
                    .bodyValue(request)
                    .retrieve()

                    // 🔥 FIX 1: map error rõ ràng hơn
                    .onStatus(
                            status -> status.value() == 429,
                            res -> {
                                log.warn("Gemini rate limited (429)");
                                return res.createException();
                            })
                    .onStatus(
                            status -> status.value() >= 500,
                            res -> {
                                log.error("Gemini server error (5xx)");
                                return res.createException();
                            })

                    .bodyToMono(GeminiDto.Response.class)

                    // 🔥 FIX 2: retry nhẹ cho transient error
                    .retryWhen(
                            reactor.util.retry.Retry.backoff(2, Duration.ofMillis(500))
                                    .filter(ex -> ex instanceof WebClientResponseException &&
                                            ((WebClientResponseException) ex).getStatusCode().is5xxServerError()))

                    // 🔥 FIX 3: timeout rõ ràng
                    .timeout(Duration.ofSeconds(props.timeoutSeconds()))

                    .block();

            if (response == null) {
                throw new RuntimeException("Gemini returned null response");
            }

            return response.extractText();

        } catch (WebClientResponseException ex) {

            // 🔥 FIX 4: phân loại lỗi quan trọng
            if (ex.getStatusCode().value() == 429) {
                throw new RuntimeException("RATE_LIMITED_429", ex);
            }

            if (ex.getStatusCode().is5xxServerError()) {
                throw new RuntimeException("GEMINI_DOWN_5XX", ex);
            }

            throw new RuntimeException("GEMINI_ERROR: " + ex.getStatusCode(), ex);

        } catch (Exception ex) {
            log.error("Gemini call failed: {}", ex.getMessage());
            throw new RuntimeException("GEMINI_UNKNOWN_ERROR", ex);
        }
    }
}