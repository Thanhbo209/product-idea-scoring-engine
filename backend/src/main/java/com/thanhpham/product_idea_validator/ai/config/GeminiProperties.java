package com.thanhpham.product_idea_validator.ai.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

@Validated
@ConfigurationProperties(prefix = "gemini.api")
public record GeminiProperties(
                @NotBlank String key,
                @NotBlank String url,
                @Positive int timeoutSeconds) {
}
