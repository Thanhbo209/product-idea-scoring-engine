package com.thanhpham.product_idea_validator.ai.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "gemini.api")
public record GeminiProperties(
        String key,
        String url,
        int timeoutSeconds) {
}
