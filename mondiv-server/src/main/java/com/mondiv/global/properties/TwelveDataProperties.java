package com.mondiv.global.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "twelve-data")
public record TwelveDataProperties(
        
        String apiKey,
        String baseUrl,
        Endpoints endpoints
) {
    
    public record Endpoints(
            ETFS etfs,
            Stocks stocks,
            News news
    ) {}
    
    public record ETFS(
            String symbol,                  // 심볼 조회
            String eod                      // 종가 데이터
    ) {}
    
    public record Stocks(
            String list,
            String quote,
            String historical,
            String technicalIndicators
    ) {}
    
    public record News(
            String latest,
            String search
    ) {}
}
