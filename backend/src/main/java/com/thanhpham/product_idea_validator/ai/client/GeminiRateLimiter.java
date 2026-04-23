package com.thanhpham.product_idea_validator.ai.client;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
public class GeminiRateLimiter {

    private final Bucket bucket;

    public GeminiRateLimiter() {

        Bandwidth limit = Bandwidth.classic(
                2,
                Refill.intervally(2, Duration.ofSeconds(1)));

        this.bucket = Bucket.builder()
                .addLimit(limit)
                .build();
    }

    public void acquireOrWait() {
        while (!bucket.tryConsume(1)) {
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return;
            }
        }
    }
}