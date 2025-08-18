package com.mondiv.global.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.lang.NonNull;
import org.springframework.web.client.RestClient;

import java.io.IOException;
import java.net.http.HttpClient;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.UUID;

@Configuration
public class HttpClientConfig {
    
    // 공통 HTTP 클라이언트 설정: 타임아웃/JDK HttpClient/기본 헤더/로깅/요청 ID 주입
    @Bean
    public RestClient.Builder restClientBuilder() {
        // 1) JDK HttpClient 구성: 연결 타임아웃, HTTP/2, 리다이렉트 정책
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(3))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .version(HttpClient.Version.HTTP_2)
                .build();
        
        // 2) Spring JDK 요청 팩토리 구성: 응답 읽기 타임아웃
        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(Duration.ofSeconds(10));
        
        // 3) 공통 인터셉터(로깅 + X-Request-Id 자동 주입)
        ClientHttpRequestInterceptor logging = new LoggingInterceptor();
        ClientHttpRequestInterceptor requestId = (request, body, execution) -> {
            if (!request.getHeaders().containsKey("X-Request-Id")) {
                request.getHeaders().add("X-Request-Id", UUID.randomUUID().toString());
            }
            return execution.execute(request, body);
        };
        
        // 4) 공통 헤더 + 요청 팩토리 + 인터셉터 적용
        return RestClient.builder()
                .requestFactory(requestFactory)
                .defaultHeader("User-Agent", "MondivServer/1.0 (+https://mondiv.example)")
                .defaultHeader("Accept", "application/json")
                .defaultHeader("Accept-Encoding", "gzip")
                .defaultHeader("Connection", "keep-alive")
                // 순서: 요청 ID 주입 후 → 로깅 수행
                .requestInterceptor(requestId)
                .requestInterceptor(logging);
    }
    
    @Bean
    public RestClient restClient(RestClient.Builder builder) {
        return builder.build();
    }
    
    // 간단 로깅 인터셉터: 요청 메서드/URI/상태/헤더 일부 출력
    static class LoggingInterceptor implements ClientHttpRequestInterceptor {
        private static final Logger log = LoggerFactory.getLogger(LoggingInterceptor.class);
        
        @Override
        public @NonNull ClientHttpResponse intercept(@NonNull HttpRequest request,
                                                     @NonNull byte[] body,
                                                     @NonNull ClientHttpRequestExecution execution) throws IOException {
            long start = System.nanoTime();
            request.getMethod();
            String method = request.getMethod().name();
            String uri = request.getURI().toString();
            String reqId = request.getHeaders().getFirst("X-Request-Id");
            if (reqId == null || reqId.isBlank()) {
                reqId = "-";
            }
            
            if (log.isDebugEnabled()) {
                log.debug("id: {} {} {} headers: {} bodySize: {}, duration: {}ms",
                        reqId, method, uri, sanitizeHeaders(request), body.length, System.nanoTime() - start);
            }
            
            ClientHttpResponse response = execution.execute(request, body);
            
            var statusCode = response.getStatusCode();
            int status = statusCode.value();
            boolean isError = statusCode.is4xxClientError() || statusCode.is5xxServerError();
            
            if (isError) {
                log.warn("id: {} {} {} -> status: {}", reqId, method, uri, status);
            } else {
                log.info("id: {} {} {} -> status: {}", reqId, method, uri, status);
            }
            return response;
        }
        
        private String sanitizeHeaders(HttpRequest req) {
            var headers = new LinkedHashMap<String, Object>();
            req.getHeaders().forEach((k, v) -> {
                if ("authorization".equalsIgnoreCase(k) || "api-key".equalsIgnoreCase(k)) {
                    // headers.put(k, "***");
                } else {
                    headers.put(k, v);
                }
            });
            return headers.toString();
        }
    }
}
