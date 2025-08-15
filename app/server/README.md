****
# Mondiv — 배당·인컴 포트폴리오 대시보드 (Demo)

> **한 줄 소개** <br>
> *Mondiv*는 **배당(월/주) 현금흐름**과 **EOD/실시간 시세**를 결합해, <br>
> **간단한 입력(보유·평단/원금)** 만으로 **수익률·월 순배당·D-day**를 한눈에 보여주는 웹 대시보드입니다.  
> 
> **데모 목적**: Twelve Data **Basic(무료)** 한도(**8 credits/min, 800/day**)에서 안전하게 돌아가는 **MVP**.

---

## 핵심 기능

- **대시보드**
    - 상단 **메인 4티커 카드**: 현재가(라이브/EOD), 전일대비(₩/%), 이번 달 예상 **순배당(세후·KRW)**, **다음 Ex/Pay D-day**
    - **EOD 등락표**(전일 종가 기준 Top movers)
    - **주요 지수 차트**: S&P500, Nasdaq, KOSPI (1M/3M/1Y)

- **포트폴리오**
    - 입력: **보유수량, 평단가 또는 총 원금(₩)**
    - 출력: **EOD 기준** 평가액, 손익(₩/%), 이번 달 순배당(세후·KRW), 차기 배당 D-day

- **전략(리밸런싱)**
    - 입력: **월 추가자금(₩/US$)**, DRIP, 비중 제약
    - 출력: **권장 매수 주수(정수)**, 6M/1Y **월 순배당 성장곡선**, 목표비중 달성 예상월

---

## 아키텍처 개요

- **Frontend**: 단일 페이지(3탭) — 대시보드 / 포트폴리오 / 전략
- **Backend**: Spring Boot (JPA, Batch), REST API
- **DB**: MySQL 8.x (UTC 저장, KST 표시)
- **Data**:
    - **Twelve Data**: 시세(REST; 선택적 WS Trial), 지수
    - **환율(USD/KRW)**: 일 1회 수집
    - **배당 이벤트**: 데모는 시드/CSV, 운영은 외부 API(Polygon 등)로 전환

---

## 크레딧 전략 (Twelve Data **Basic** 기준)

- 한도: **8 credits/min**, **800/day**
- **감시 티커 4개**일 때 **멀티심볼** 호출 **2분마다 1회(=0.5 rpm)** 권장
    - 분당 크레딧 = `weight(1) × 4 × 0.5 = 2`
    - 일일 = `2 × 390분 ≈ 780` (**≤ 800/day** 안전)
- **WS(Trial ≤8 심볼)** 지원 시: 4티커 실시간은 WS, REST는 **30분/1회 보조**
- **펀더멘털·재무제표**(예: `/income_statement` weight=100/심볼)는 **희소 배치(일/주 1회)**

> **주의**: 4심볼을 1분마다 폴링(1 rpm)하면 하루 **1,560 credits**로 초과됩니다. **반드시 0.5 rpm 이하**로 설계하세요.

---

## 빠른 시작

### 요구 사항
- JDK 21+, Maven, MySQL 8.x
- Twelve Data API Key (Basic)

### 환경 변수(.env 예시)
```bash
TD_API_KEY=your_twelvedata_key
TD_BASE_URL=https://api.twelvedata.com

DB_URL=jdbc:mysql://localhost:3306/mondiv?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
DB_USER=mondiv
DB_PASS=mondiv_pw

APP_TIMEZONE=Asia/Seoul
```

### MySQL (Docker 예시)
```yaml
version: "3.8"
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: mondiv
      MYSQL_USER: mondiv
      MYSQL_PASSWORD: mondiv_pw
      MYSQL_ROOT_PASSWORD: root_pw
    ports: ["3306:3306"]
    command: ["--default-time-zone=+00:00",
              "--character-set-server=utf8mb4",
              "--collation-server=utf8mb4_0900_ai_ci"]
```

### 실행
```bash
./mvnw spring-boot:run
```

---

## 데이터베이스

### 스키마(요약)
- **instrument**: 티커 메타(ETF/EQUITY/INDEX)
- **price_eod / price_intraday**: EOD/인트라데이 시세(USD 저장 권장)
- **portfolio / portfolio_position**: 사용자 포트, 보유/평단/원금
- **dividend_event / dividend_override / dividend_receipt**: 배당(공시/오버라이드/실수취)
- **position_snapshot_daily**: 일별 보유 스냅샷(권리주 산정 보조)
- **fx_rate_daily**: 환율 USD/KRW
- **dividend_stats**: 롤링 평균 캐시(리밸런싱 효율 가속)
- **ingest_job_run**: 배치 로그

> 상세 DDL은 `/src/main/resources/db/migration/V1__init.sql` 에 포함.  
> 데모 시드: `/db/migration/V2__seed_instruments.sql` (CONY/MSTY/ULTY, ^GSPC/^IXIC/^KS11 등)

---

## 스케줄러(데모 기본값, KST 하계 기준)

| 작업          | 주기       | 시간(KST)         | 비고                                 |
|-------------|----------|-----------------|------------------------------------|
| 시세 폴링(멀티심볼) | **2분마다** | **22:30–05:00** | 4티커, `/quote` 또는 최근 바(Time Series) |
| EOD 적재      | 1회/일     | 06:10           | 일봉·거래량                             |
| 배당 이벤트      | 1회/일     | 02:10           | 데모: 시드/CSV, 운영: 외부 API             |
| 환율 USD/KRW  | 1회/일     | 09:00           | 세후 KRW 환산                          |

- **레이트리미터**: 토큰버킷(`capacity=8`, `refill=8/min`, `day<=800`)  
  임계치 접근 시 자동 **4분 간격(0.25 rpm)** 로 다운시프트

---

## 주요 API (샘플)

```http
GET  /api/dashboard/cards?pid=UUID          # 4티커 카드(현재가, 전일대비, 순배당, D-Day)
GET  /api/dashboard/eod-gainers?limit=20    # 전일 EOD 등락표
GET  /api/index/series?symbol=^GSPC&range=1M
GET  /api/portfolio/holdings?pid=UUID       # EOD 기준 평가/손익/월 순배당
POST /api/portfolio/positions               # {ticker, shares, avgCostKrw | origCostKrw}
POST /api/strategy/rebalance                # {monthlyBudgetKRW, drip, maxWeightPerName, horizonMonths}
```

---

## 화면(3 탭) 가이드

- **대시보드**: 상단 4카드(라이브/EOD 뱃지), 전일 등락표, 지수 차트
- **포트폴리오**: 보유수·평단/원금 입력 → EOD 평가/손익, 이번 달 순배당, D-day
- **전략**: 월 추가자금/DRIP/비중 제약 입력 → 권장 매수주수(정수), 6M/1Y 시뮬

---

## 예외 처리 & 데이터 품질

- **시세 폴링 실패**: 자동 **EOD 폴백** + **stale** 뱃지
- **배당 누락/오류**: **오버라이드**(금액/날짜/메모) UI → 즉시 반영, 확정 공시 도착 시 자동 해소(옵션)
- **수취 매칭**: 브로커 CSV 업로드 → 미매칭 UI에서 이벤트 매칭 or 새 이벤트+오버라이드 생성

---

## 로드맵

- [ ] **Grow/Pro** 전환(분당 크레딧 상향, 일일 캡 제거)
- [ ] **WS 정식 도입**(상단 카드 완전 실시간)
- [ ] **Polygon** 배당 캘린더 자동화(확정/추정 + 알림)
- [ ] 알림: D-Ex ≤ 3일, D-Pay=오늘, 배당금 변경
- [ ] 다중 포트폴리오/공유 그룹, 액세스 제어

---

## 라이선스 & 고지

- 이 저장소는 **데모**용으로 제공됩니다. 데이터 사용은 Twelve Data 약관을 준수해야 합니다.
- 재무/세무 조언이 아니며, 모든 투자 판단의 책임은 사용자에게 있습니다.

---

## 기여(Contributing)

- 이슈/PR 환영합니다. 코드 스타일과 커밋 메시지 컨벤션은 `CONTRIBUTING.md` 참고(추가 예정).
- 버그 리포트 시 **재현 절차/로그/요청량(분·일)** 정보를 함께 제공해 주세요.

---

## 문의

- 프로젝트: **Mondiv**
- 메일: `dev_patrick@naver.com`

> “Find Flow, Get Money. — **Mondiv**.”
