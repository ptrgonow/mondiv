/* =========================================================
   Mondiv schema.sql - 테이블 전용 (비즈니스 로직은 서비스 레이어)
   - 목적: 배당/인컴 대시보드 + 포트폴리오 + 리밸런싱
   - 표준: MySQL 8.0, InnoDB, utf8mb4, UTC 저장
========================================================= */

-- [선택] 전역 세션 세팅(실DB 파라미터 그룹은 UTC/utf8mb4로 설정되어 있다고 가정)
SET NAMES utf8mb4;
SET time_zone = '+00:00';

/* =========================================================
  0) 종목 마스터 (티커 메타)
  - Twelve Data meta: symbol, exchange, mic_code, currency, exchange_timezone 등 매핑
========================================================= */
CREATE TABLE IF NOT EXISTS instrument (
                                          id               BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'PK',
                                          ticker           VARCHAR(24)  NOT NULL COMMENT '예: AAPL, CONY',
                                          name             VARCHAR(255) NOT NULL COMMENT '정식 명칭',
                                          exchange         VARCHAR(64)  NOT NULL COMMENT '예: NASDAQ, NYSE Arca',
                                          mic_code         VARCHAR(16)  NULL     COMMENT '예: XNAS',
                                          currency         CHAR(3)      NOT NULL DEFAULT 'USD' COMMENT '시세/배당 통화',
                                          exchange_tz      VARCHAR(64)  NULL     COMMENT '예: America/New_York',
                                          type             ENUM('ETF','EQUITY','INDEX') NOT NULL DEFAULT 'EQUITY' COMMENT '자산 유형',
                                          active           TINYINT(1)   NOT NULL DEFAULT 1,
                                          created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                          updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                          UNIQUE KEY uk_instrument_ticker (ticker),
                                          KEY ix_instrument_type_active (type, active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    COMMENT='종목 메타: ticker↔id 매핑, 거래소/통화/타임존';

/* =========================================================
  1) 사용자 / 포트폴리오 / 포지션
========================================================= */
CREATE TABLE IF NOT EXISTS app_user (
                                        id               BINARY(16) PRIMARY KEY COMMENT '사용자 UUID(BINARY(16))',
                                        email            VARCHAR(255) UNIQUE,
                                        display_name     VARCHAR(100),
                                        created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    COMMENT='사용자';

CREATE TABLE IF NOT EXISTS portfolio (
                                         id               BINARY(16) PRIMARY KEY COMMENT '포트폴리오 UUID(BINARY(16))',
                                         user_id          BINARY(16) NOT NULL,
                                         name             VARCHAR(100) NOT NULL,
                                         group_name       VARCHAR(100) NULL,
                                         created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                         KEY ix_portfolio_user (user_id),
                                         CONSTRAINT fk_portfolio_user FOREIGN KEY (user_id) REFERENCES app_user(id)
                                             ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    COMMENT='사용자별 포트폴리오';

CREATE TABLE IF NOT EXISTS portfolio_position (
                                                  id               BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                  portfolio_id     BINARY(16) NOT NULL,
                                                  instrument_id    BIGINT     NOT NULL,
                                                  shares           DECIMAL(20,6) NOT NULL CHECK (shares >= 0) COMMENT '보유 주수(소수점 허용)',
                                                  avg_cost_krw     DECIMAL(18,2) NULL COMMENT '평단가(₩). avg 또는 orig 중 하나 사용',
                                                  orig_cost_krw    DECIMAL(18,2) NULL COMMENT '총 원금(₩)',
                                                  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                                  UNIQUE KEY uk_position (portfolio_id, instrument_id),
                                                  KEY ix_position_pf (portfolio_id),
                                                  KEY ix_position_instr (instrument_id),
                                                  CONSTRAINT fk_pos_pf  FOREIGN KEY (portfolio_id)  REFERENCES portfolio(id)  ON DELETE CASCADE,
                                                  CONSTRAINT fk_pos_ins FOREIGN KEY (instrument_id) REFERENCES instrument(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    COMMENT='포트폴리오 포지션(보유/평단/원금)';

/* =========================================================
  2) 환율 (USD/KRW) — 세후 원화 환산용
========================================================= */
CREATE TABLE IF NOT EXISTS fx_rate_daily (
                                             rate_date        DATE NOT NULL,
                                             base_ccy         CHAR(3) NOT NULL DEFAULT 'USD',
                                             quote_ccy        CHAR(3) NOT NULL DEFAULT 'KRW',
                                             rate             DECIMAL(12,6) NOT NULL COMMENT '1 USD = rate KRW',
                                             source           VARCHAR(64),
                                             ingested_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                             PRIMARY KEY (rate_date, base_ccy, quote_ccy),
                                             KEY ix_fx_rate_date (rate_date DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    COMMENT='환율(USD/KRW) 1일 1값';

/* =========================================================
  3) 가격: 분봉/시간봉 — /time_series 매핑
========================================================= */
CREATE TABLE IF NOT EXISTS price_bar (
                                         instrument_id    BIGINT       NOT NULL,
                                         `interval`       ENUM('1min','5min','15min','30min','1h') NOT NULL,
                                         ts_utc           DATETIME(0)  NOT NULL COMMENT '캔들 시각(UTC, 종가 시각)',
                                         open             DECIMAL(18,6) NOT NULL,
                                         high             DECIMAL(18,6) NOT NULL,
                                         low              DECIMAL(18,6) NOT NULL,
                                         close            DECIMAL(18,6) NOT NULL,
                                         volume           BIGINT        NULL,
                                         ingested_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                         PRIMARY KEY (instrument_id, `interval`, ts_utc),
                                         KEY ix_bar_instr_ts (instrument_id, ts_utc DESC),
                                         CONSTRAINT fk_bar_instr FOREIGN KEY (instrument_id) REFERENCES instrument(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    COMMENT='OHLCV 분/시간봉(time_series)';

/* =========================================================
  4) 가격: Quote 스냅샷 — /quote 매핑(히스토리 보관)
========================================================= */
CREATE TABLE IF NOT EXISTS price_quote_snapshot (
                                                    instrument_id         BIGINT       NOT NULL,
                                                    snapshot_utc          DATETIME(0)  NOT NULL COMMENT '스냅샷 시각(UTC)',
                                                    open                  DECIMAL(18,6) NULL,
                                                    high                  DECIMAL(18,6) NULL,
                                                    low                   DECIMAL(18,6) NULL,
                                                    close                 DECIMAL(18,6) NULL,
                                                    volume                BIGINT        NULL,
                                                    previous_close        DECIMAL(18,6) NULL,
                                                    change_abs            DECIMAL(18,6) NULL,
                                                    percent_change        DECIMAL(12,6) NULL,
                                                    average_volume        BIGINT        NULL,
                                                    rolling_1day_change   DECIMAL(12,6) NULL,
                                                    rolling_7day_change   DECIMAL(12,6) NULL,
                                                    rolling_period_change DECIMAL(12,6) NULL,
                                                    is_market_open        TINYINT(1)    NULL,
    -- 52주 정보
                                                    wk52_low              DECIMAL(18,6) NULL,
                                                    wk52_high             DECIMAL(18,6) NULL,
                                                    wk52_low_change       DECIMAL(18,6) NULL,
                                                    wk52_high_change      DECIMAL(18,6) NULL,
                                                    wk52_low_change_pct   DECIMAL(12,6) NULL,
                                                    wk52_high_change_pct  DECIMAL(12,6) NULL,
    -- 장외(extended)
                                                    ext_change            DECIMAL(18,6) NULL,
                                                    ext_percent_change    DECIMAL(12,6) NULL,
                                                    ext_price             DECIMAL(18,6) NULL,
                                                    ext_ts_utc            DATETIME(0)   NULL,
    -- 원천 메타(감사/디버깅)
                                                    source                VARCHAR(32)   NOT NULL DEFAULT 'twelvedata',
                                                    raw_symbol            VARCHAR(32)   NULL,
                                                    raw_exchange          VARCHAR(64)   NULL,
                                                    raw_mic               VARCHAR(16)   NULL,
                                                    raw_currency          CHAR(3)       NULL,
                                                    ingested_at           TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                                    PRIMARY KEY (instrument_id, snapshot_utc),
                                                    KEY ix_quote_recent (instrument_id, snapshot_utc DESC),
                                                    CONSTRAINT fk_quote_instr FOREIGN KEY (instrument_id) REFERENCES instrument(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    COMMENT='Quote 스냅샷(히스토리). /quote 매핑';

/* =========================================================
  5) 가격: EOD(일봉) — /eod 매핑
========================================================= */
CREATE TABLE IF NOT EXISTS price_eod (
                                         instrument_id    BIGINT NOT NULL,
                                         price_date       DATE   NOT NULL,
                                         close            DECIMAL(18,6) NOT NULL,
                                         open             DECIMAL(18,6) NULL,
                                         high             DECIMAL(18,6) NULL,
                                         low              DECIMAL(18,6) NULL,
                                         volume           BIGINT        NULL,
                                         adj_close        DECIMAL(18,6) NULL,
                                         ingested_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                         PRIMARY KEY (instrument_id, price_date),
                                         KEY ix_eod_date (price_date DESC),
                                         KEY ix_eod_instr_date (instrument_id, price_date DESC),
                                         CONSTRAINT fk_eod_instr FOREIGN KEY (instrument_id) REFERENCES instrument(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    COMMENT='EOD(일봉) 종가/거래량. /eod 매핑';

/* =========================================================
  6) 배당: 이벤트(공시) / 오버라이드(보정) / 실수취(브로커)
========================================================= */
CREATE TABLE IF NOT EXISTS dividend_event (
                                              id                       BIGINT AUTO_INCREMENT PRIMARY KEY,
                                              instrument_id            BIGINT NOT NULL,
                                              declaration_date         DATE NULL,
                                              ex_date                  DATE NOT NULL,
                                              record_date              DATE NULL,
                                              pay_date                 DATE NULL,
                                              amount_usd_per_share     DECIMAL(12,6) NOT NULL COMMENT '주당 배당금(USD, 세전)',
                                              frequency                ENUM('weekly','monthly','quarterly','irregular') NULL,
                                              dist_type                VARCHAR(16) NULL COMMENT '성분(CD/ROC/ST/LT 등)',
                                              income_pct               DECIMAL(6,4) NULL,
                                              roc_pct                  DECIMAL(6,4) NULL,
                                              stcg_pct                 DECIMAL(6,4) NULL,
                                              ltcg_pct                 DECIMAL(6,4) NULL,
                                              source                   VARCHAR(32) NOT NULL DEFAULT 'provider',
                                              status                   ENUM('estimated','confirmed') NOT NULL DEFAULT 'estimated',
                                              ingested_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                              UNIQUE KEY uk_div_evt (instrument_id, ex_date, pay_date, source),
                                              KEY ix_div_ex (instrument_id, ex_date),
                                              KEY ix_div_pay (instrument_id, pay_date),
                                              KEY ix_div_pay_date (pay_date DESC),
                                              CONSTRAINT fk_div_evt_instr FOREIGN KEY (instrument_id) REFERENCES instrument(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    COMMENT='배당 이벤트(공시 기준 원장)';

CREATE TABLE IF NOT EXISTS dividend_override (
                                                 id                       BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                 dividend_event_id        BIGINT NOT NULL UNIQUE,
                                                 override_amount_usd      DECIMAL(12,6) NULL,
                                                 override_ex_date         DATE NULL,
                                                 override_pay_date        DATE NULL,
                                                 note                     VARCHAR(255) NULL COMMENT '근거/링크/메모',
                                                 created_by_user_id       BINARY(16) NULL,
                                                 created_at               TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                                 CONSTRAINT fk_div_ov_evt  FOREIGN KEY (dividend_event_id)  REFERENCES dividend_event(id) ON DELETE CASCADE,
                                                 CONSTRAINT fk_div_ov_user FOREIGN KEY (created_by_user_id) REFERENCES app_user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    COMMENT='배당 이벤트 수기 보정(금액/날짜)';

CREATE TABLE IF NOT EXISTS dividend_receipt (
                                                id                       BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                portfolio_id             BINARY(16) NOT NULL,
                                                instrument_id            BIGINT NOT NULL,
                                                dividend_event_id        BIGINT NULL,
                                                pay_date                 DATE NOT NULL,
                                                shares_entitled          DECIMAL(20,6) NOT NULL COMMENT 'Ex-Date 기준 권리 주수',
                                                gross_usd_per_share      DECIMAL(12,6) NOT NULL,
                                                gross_usd_total          DECIMAL(18,6) NOT NULL,
                                                us_withholding_usd       DECIMAL(18,6) NOT NULL DEFAULT 0.0,
                                                fx_rate_applied          DECIMAL(12,6) NOT NULL COMMENT '브로커 적용 환율(USD/KRW)',
                                                fee_krw                  DECIMAL(18,2) NULL,
                                                net_krw_total            DECIMAL(18,2) NOT NULL COMMENT '실입금액(세후·수수료 포함)',
                                                source_ref               VARCHAR(64) NULL COMMENT '브로커 명세서 ID/참조',
                                                created_at               TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                                UNIQUE KEY uk_div_rcpt (portfolio_id, instrument_id, pay_date, source_ref),
                                                KEY ix_div_rcpt_pf (portfolio_id, instrument_id, pay_date),
                                                KEY ix_div_rcpt_pay_date (pay_date DESC),
                                                CONSTRAINT fk_rcpt_pf  FOREIGN KEY (portfolio_id)  REFERENCES portfolio(id)  ON DELETE CASCADE,
                                                CONSTRAINT fk_rcpt_ins FOREIGN KEY (instrument_id) REFERENCES instrument(id),
                                                CONSTRAINT fk_rcpt_evt FOREIGN KEY (dividend_event_id) REFERENCES dividend_event(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    COMMENT='배당 실수취(세후·환율 반영, 브로커 명세)';

/* =========================================================
  7) 포지션 일별 스냅샷(Ex-Date 권리 주수 산정 보조)
========================================================= */
CREATE TABLE IF NOT EXISTS position_snapshot_daily (
                                                       portfolio_id     BINARY(16) NOT NULL,
                                                       instrument_id    BIGINT     NOT NULL,
                                                       asof_date        DATE       NOT NULL COMMENT 'KST 기준 EOD 날짜',
                                                       shares_eod       DECIMAL(20,6) NOT NULL,
                                                       PRIMARY KEY (portfolio_id, instrument_id, asof_date),
                                                       KEY ix_psd_instr (instrument_id),
                                                       KEY ix_psd_date (asof_date DESC),
                                                       CONSTRAINT fk_psd_pf  FOREIGN KEY (portfolio_id)  REFERENCES portfolio(id)  ON DELETE CASCADE,
                                                       CONSTRAINT fk_psd_ins FOREIGN KEY (instrument_id) REFERENCES instrument(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    COMMENT='일별 포지션 스냅샷(권리 주수 산정)';

/* =========================================================
  8) 롤링 통계 캐시(리밸런싱/랭킹 가속) - 서비스 레이어에서 계산 후 캐시
========================================================= */
CREATE TABLE IF NOT EXISTS dividend_stats (
                                              instrument_id            BIGINT NOT NULL,
                                              window_months            INT NOT NULL COMMENT '예: 3/6/12',
                                              avg_usd_per_share_m      DECIMAL(12,6) NOT NULL COMMENT '월 환산 평균(주배당은 월합산 후 평균)',
                                              stdev_usd_per_share_m    DECIMAL(12,6) NULL,
                                              last_ex_date             DATE NULL,
                                              last_pay_date            DATE NULL,
                                              data_points              INT NULL COMMENT '계산에 사용된 데이터 포인트 수',
                                              updated_at               TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                              PRIMARY KEY (instrument_id, window_months),
                                              KEY ix_div_stats_updated (updated_at DESC),
                                              CONSTRAINT fk_dst_instr FOREIGN KEY (instrument_id) REFERENCES instrument(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    COMMENT='배당 롤링 통계 캐시 - 서비스에서 계산';

/* =========================================================
  9) 배치/수집 로그
========================================================= */
CREATE TABLE IF NOT EXISTS ingest_job_run (
                                              id                BIGINT AUTO_INCREMENT PRIMARY KEY,
                                              job_name          VARCHAR(64) NOT NULL,
                                              started_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                              finished_at       TIMESTAMP NULL,
                                              success           TINYINT(1) NULL,
                                              rows_affected     INT NULL,
                                              note              VARCHAR(255) NULL,
                                              KEY ix_job_run_started (started_at DESC),
                                              KEY ix_job_run_name_started (job_name, started_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    COMMENT='배치 실행 로그';

/* =========================================================
  10) 효율적인 조회를 위한 인덱스 추가 최적화
========================================================= */

-- 최신 Quote 조회용 인덱스
CREATE INDEX ix_quote_instrument_latest ON price_quote_snapshot (instrument_id, snapshot_utc DESC);

-- 최신 EOD 조회용 인덱스
CREATE INDEX ix_eod_instrument_latest ON price_eod (instrument_id, price_date DESC);

-- 배당 이벤트 월별 집계용 인덱스
CREATE INDEX ix_div_event_month ON dividend_event (instrument_id, pay_date);

-- 환율 최신 조회용 인덱스
CREATE INDEX ix_fx_latest ON fx_rate_daily (base_ccy, quote_ccy, rate_date DESC);

-- 포트폴리오 포지션 조회 최적화
CREATE INDEX ix_position_portfolio_instr ON portfolio_position (portfolio_id, instrument_id);

/* =========================================================
  사용 예시 (서비스 레이어에서 실행할 쿼리들)

  -- 최신 환율 조회
  SELECT rate FROM fx_rate_daily
  WHERE base_ccy='USD' AND quote_ccy='KRW'
  ORDER BY rate_date DESC LIMIT 1;

  -- 최신 시세 조회
  SELECT close FROM price_quote_snapshot
  WHERE instrument_id = ?
  ORDER BY snapshot_utc DESC LIMIT 1;

  -- 배당 3개월 평균 계산
  SELECT instrument_id, AVG(monthly_sum) as avg_monthly
  FROM (
    SELECT instrument_id,
           DATE_FORMAT(pay_date, '%Y-%m') as month_key,
           SUM(amount_usd_per_share) as monthly_sum
    FROM dividend_event
    WHERE instrument_id = ?
      AND pay_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
      AND pay_date IS NOT NULL
    GROUP BY instrument_id, DATE_FORMAT(pay_date, '%Y-%m')
  ) monthly_data
  GROUP BY instrument_id;

  -- 포트폴리오 현황 조회
  SELECT p.instrument_id, p.shares, p.orig_cost_krw,
         i.ticker, i.name,
         q.close as current_price_usd,
         f.rate as usd_krw_rate
  FROM portfolio_position p
  JOIN instrument i ON i.id = p.instrument_id
  LEFT JOIN (SELECT instrument_id, close
             FROM price_quote_snapshot pqs1
             WHERE snapshot_utc = (SELECT MAX(snapshot_utc)
                                  FROM price_quote_snapshot pqs2
                                  WHERE pqs2.instrument_id = pqs1.instrument_id)
            ) q ON q.instrument_id = p.instrument_id
  CROSS JOIN (SELECT rate FROM fx_rate_daily
              WHERE base_ccy='USD' AND quote_ccy='KRW'
              ORDER BY rate_date DESC LIMIT 1) f
  WHERE p.portfolio_id = ?;

========================================================= */
