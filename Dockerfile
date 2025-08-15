# =========================
# 1) Web build (Vite)
# =========================
FROM node:20-alpine AS web-build
WORKDIR /web

COPY ./web/package*.json ./
RUN npm ci

COPY ./web ./
RUN npm run build    # /web/dist

# =========================
# 2) Server build (Gradle wrapper + Corretto 24)
#    - Gradle 이미지는 쓰지 않고, wrapper 사용
#    - Alpine이라 unzip/curl 필요
# =========================
FROM amazoncorretto:24-alpine AS server-build
WORKDIR /src

RUN apk add --no-cache bash curl unzip

# 루트 Gradle 래퍼/설정 먼저 복사(캐시 최적화)
COPY ./gradle ./gradle
COPY ./gradlew ./gradlew
COPY ./settings.gradle ./settings.gradle
COPY ./build.gradle ./build.gradle

# 서버 모듈 빌드 스크립트만 선복사(의존성 캐시)
COPY ./server/build.gradle ./server/build.gradle

# 권한
RUN chmod +x ./gradlew

# 의존성만 먼저 다운로드(캐시)
RUN ./gradlew :server:dependencies --no-daemon || true

# 실제 소스 복사 후 빌드
COPY ./server ./server
RUN ./gradlew clean :server:bootJar --no-daemon
# 결과: /src/server/build/libs/*.jar

# =========================
# 3) Runtime (Corretto 24 / Alpine)
# =========================
FROM amazoncorretto:24-alpine

# curl(헬스체크) + tzdata
RUN apk add --no-cache curl tzdata

ENV TZ=Asia/Seoul
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# 비루트
RUN addgroup -S app && adduser -S app -G app
USER app

WORKDIR /app

# 서버 JAR & 정적 파일
COPY --from=server-build /src/server/build/libs/*.jar /app/app.jar
COPY --from=web-build   /web/dist                   /app/public

# 정적 서빙 (application.yml과 일치)
ENV SPRING_WEB_RESOURCES_STATIC_LOCATIONS="classpath:/static/,file:/app/public/"

# Java 옵션
ENV JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75 -Duser.timezone=Asia/Seoul"
# 프리뷰 기능 쓸 경우:
# ENV JAVA_OPTS="$JAVA_OPTS --enable-preview"

# 프로파일
ARG SPRING_PROFILES_ACTIVE=prod
ENV SPRING_PROFILES_ACTIVE=${SPRING_PROFILES_ACTIVE}

EXPOSE 9900

# 헬스체크
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
  CMD curl -sf http://127.0.0.1:9900/actuator/health | grep '"status":"UP"' >/dev/null || exit 1

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
