package com.mondiv.global.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "bavest")
public record BavestProperties(
        String apiKey,
        String baseUrl,
        Endpoints endpoints
) {
    public record Endpoints(
            Forex forex,
            Logo logo
    ) {}
    
    public record Forex(
            String quote                     // 환율 조회
    ) {}
    
    public record Logo(
            String img                   // 회사 로고 조회
    ) {}
    
}
