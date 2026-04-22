package com.thanhpham.product_idea_validator.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean("aiEvaluationExecutor")
    public Executor aiEvaluationExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();

        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("ai-eval-");
        executor.setKeepAliveSeconds(60);

        // If queue full: fail fast so the enqueue path can return an explicit
        // retry/overload response
        // or mark the evaluation as failed instead of running AI work on request
        // threads.
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.AbortPolicy());

        executor.initialize();
        return executor;
    }
}
