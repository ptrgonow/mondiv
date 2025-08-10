START TRANSACTION;

-- 1) 티커 마스터 등록/갱신
INSERT INTO instrument (ticker, name, exchange, mic_code, currency, exchange_tz, type, active) VALUES
                                                                                                   ('CONY', 'YieldMax COIN Option Income Strategy ETF',  'NYSE Arca', 'ARCX', 'USD', 'America/New_York', 'ETF',   1),
                                                                                                   ('MSTY', 'YieldMax MSTR Option Income Strategy ETF',  'NYSE Arca', 'ARCX', 'USD', 'America/New_York', 'ETF',   1),
                                                                                                   ('ULTY', 'YieldMax Ultra Option Income Strategy ETF', 'NYSE Arca', 'ARCX', 'USD', 'America/New_York', 'ETF',   1),
                                                                                                   ('^IXIC','NASDAQ Composite Index',                    'INDEX',     'INDX', 'USD', 'America/New_York', 'INDEX', 1),
                                                                                                   ('^GSPC','S&P 500 Index',                             'INDEX',     'INDX', 'USD', 'America/New_York', 'INDEX', 1),
                                                                                                   ('^KS11','KOSPI Index',                               'INDEX',     'INDX', 'KRW', 'Asia/Seoul',       'INDEX', 1)
ON DUPLICATE KEY UPDATE
                     name=VALUES(name),
                     exchange=VALUES(exchange),
                     mic_code=VALUES(mic_code),
                     currency=VALUES(currency),
                     exchange_tz=VALUES(exchange_tz),
                     type=VALUES(type),
                     active=1;

-- 2) CONY 배당 이력 (기록일 → record_date, 공표일 → declaration_date, 배당락일 → ex_date, 지급일 → pay_date)
INSERT IGNORE INTO dividend_event (
    instrument_id, declaration_date, ex_date, record_date, pay_date,
    amount_usd_per_share, frequency, source, status
)
SELECT i.id, v.declaration_date, v.ex_date, v.record_date, v.pay_date,
       v.amount_usd_per_share, v.frequency, 'manual', 'confirmed'
FROM instrument i
         JOIN (
    SELECT DATE '2024-12-27' AS declaration_date, DATE '2025-07-24' AS ex_date, DATE '2025-07-24' AS record_date, DATE '2025-07-25' AS pay_date, 0.80 AS amount_usd_per_share, 'monthly' AS frequency
    UNION ALL SELECT DATE '2024-12-27', DATE '2025-06-26', DATE '2025-06-26', DATE '2025-06-27', 0.54, 'monthly'
    UNION ALL SELECT DATE '2025-02-20', DATE '2025-05-29', DATE '2025-05-29', DATE '2025-05-30', 0.74, 'irregular'
    UNION ALL SELECT DATE '2024-12-27', DATE '2025-05-01', DATE '2025-05-01', DATE '2025-05-02', 0.65, 'monthly'
    UNION ALL SELECT DATE '2024-12-27', DATE '2025-04-03', DATE '2025-04-03', DATE '2025-04-04', 0.44, 'monthly'
    UNION ALL SELECT DATE '2024-12-27', DATE '2025-03-06', DATE '2025-03-06', DATE '2025-03-07', 0.60, 'monthly'
    UNION ALL SELECT DATE '2024-12-27', DATE '2025-02-06', DATE '2025-02-06', DATE '2025-02-07', 1.05, 'monthly'
    UNION ALL SELECT DATE '2024-12-27', DATE '2025-01-08', DATE '2025-01-08', DATE '2025-01-10', 0.83, 'monthly'
    UNION ALL SELECT DATE '2023-12-18', DATE '2024-12-12', DATE '2024-12-12', DATE '2024-12-13', 1.34, 'monthly'
    UNION ALL SELECT DATE '2024-11-13', DATE '2024-11-14', DATE '2024-11-14', DATE '2024-11-15', 2.02, 'monthly'
    UNION ALL SELECT DATE '2023-12-18', DATE '2024-10-17', DATE '2024-10-17', DATE '2024-10-18', 1.11, 'monthly'
    UNION ALL SELECT DATE '2023-12-18', DATE '2024-09-06', DATE '2024-09-06', DATE '2024-09-09', 1.04, 'monthly'
    UNION ALL SELECT DATE '2023-12-15', DATE '2024-09-06', DATE '2024-09-06', DATE '2024-09-09', 1.04, 'monthly'
    UNION ALL SELECT DATE '2023-12-18', DATE '2024-08-07', DATE '2024-08-07', DATE '2024-08-08', 1.01, 'monthly'
    UNION ALL SELECT DATE '2023-12-18', DATE '2024-07-05', DATE '2024-07-05', DATE '2024-07-08', 1.57, 'monthly'
    UNION ALL SELECT DATE '2023-12-18', DATE '2024-06-06', DATE '2024-06-06', DATE '2024-06-07', 1.70, 'monthly'
    UNION ALL SELECT DATE '2023-12-18', DATE '2024-05-06', DATE '2024-05-07', DATE '2024-05-08', 2.28, 'monthly'
    UNION ALL SELECT DATE '2023-12-18', DATE '2024-04-04', DATE '2024-04-05', DATE '2024-04-08', 2.79, 'monthly'
    UNION ALL SELECT DATE '2023-12-18', DATE '2024-03-06', DATE '2024-03-07', DATE '2024-03-08', 1.66, 'monthly'
    UNION ALL SELECT DATE '2023-12-18', DATE '2024-02-07', DATE '2024-02-08', DATE '2024-02-09', 1.08, 'monthly'
    UNION ALL SELECT DATE '2023-12-18', DATE '2024-01-05', DATE '2024-01-08', DATE '2024-01-09', 2.69, 'monthly'
    UNION ALL SELECT DATE '2023-12-06', DATE '2023-12-07', DATE '2023-12-08', DATE '2023-12-13', 2.46, 'monthly'
    UNION ALL SELECT DATE '2023-11-07', DATE '2023-11-08', DATE '2023-11-09', DATE '2023-11-16', 1.08, 'monthly'
    UNION ALL SELECT DATE '2023-10-05', DATE '2023-10-06', DATE '2023-10-10', DATE '2023-10-16', 1.21, 'monthly'
) v
WHERE i.ticker = 'CONY';

-- 3) MSTY 배당 이력
INSERT IGNORE INTO dividend_event (
    instrument_id, declaration_date, ex_date, record_date, pay_date,
    amount_usd_per_share, frequency, source, status
)
SELECT i.id, v.declaration_date, v.ex_date, v.record_date, v.pay_date,
       v.amount_usd_per_share, v.frequency, 'manual', 'confirmed'
FROM instrument i
         JOIN (
    SELECT DATE '2025-02-20' AS declaration_date, DATE '2025-07-31' AS ex_date, DATE '2025-07-31' AS record_date, DATE '2025-08-01' AS pay_date, 1.18 AS amount_usd_per_share, 'irregular' AS frequency
    UNION ALL SELECT DATE '2024-12-24', DATE '2025-07-03', DATE '2025-07-03', DATE '2025-07-07', 1.24, 'monthly'
    UNION ALL SELECT DATE '2024-12-24', DATE '2025-06-05', DATE '2025-06-05', DATE '2025-06-06', 1.47, 'monthly'
    UNION ALL SELECT DATE '2024-12-24', DATE '2025-05-08', DATE '2025-05-08', DATE '2025-05-09', 2.37, 'monthly'
    UNION ALL SELECT DATE '2024-12-24', DATE '2025-04-10', DATE '2025-04-10', DATE '2025-04-11', 1.34, 'monthly'
    UNION ALL SELECT DATE '2024-12-24', DATE '2025-03-13', DATE '2025-03-13', DATE '2025-03-14', 1.38, 'monthly'
    UNION ALL SELECT DATE '2024-12-24', DATE '2025-02-13', DATE '2025-02-13', DATE '2025-02-14', 2.02, 'monthly'
    UNION ALL SELECT DATE '2025-01-15', DATE '2025-01-16', DATE '2025-01-16', DATE '2025-01-17', 2.28, 'monthly'
    UNION ALL SELECT DATE '2024-02-27', DATE '2024-12-19', DATE '2024-12-19', DATE '2024-12-20', 3.08, 'monthly'
    UNION ALL SELECT DATE '2024-02-27', DATE '2024-11-21', DATE '2024-11-21', DATE '2024-11-22', 4.42, 'monthly'
    UNION ALL SELECT DATE '2024-02-27', DATE '2024-10-24', DATE '2024-10-24', DATE '2024-10-25', 4.20, 'monthly'
    UNION ALL SELECT DATE '2024-02-27', DATE '2024-09-06', DATE '2024-09-06', DATE '2024-09-09', 1.85, 'monthly'
    UNION ALL SELECT DATE '2024-02-26', DATE '2024-09-06', DATE '2024-09-06', DATE '2024-09-09', 1.85, 'monthly'
    UNION ALL SELECT DATE '2024-02-27', DATE '2024-08-07', DATE '2024-08-07', DATE '2024-08-08', 1.94, 'monthly'
    UNION ALL SELECT DATE '2024-02-27', DATE '2024-07-05', DATE '2024-07-05', DATE '2024-07-08', 2.33, 'monthly'
    UNION ALL SELECT DATE '2024-02-27', DATE '2024-06-06', DATE '2024-06-06', DATE '2024-06-07', 3.03, 'monthly'
    UNION ALL SELECT DATE '2024-02-27', DATE '2024-05-06', DATE '2024-05-07', DATE '2024-05-08', 2.52, 'monthly'
    UNION ALL SELECT DATE '2024-02-27', DATE '2024-04-04', DATE '2024-04-05', DATE '2024-04-08', 4.13, 'monthly'
) v
WHERE i.ticker = 'MSTY';

-- 4) ULTY 배당 이력 (주배당)
INSERT IGNORE INTO dividend_event (
    instrument_id, declaration_date, ex_date, record_date, pay_date,
    amount_usd_per_share, frequency, source, status
)
SELECT i.id, v.declaration_date, v.ex_date, v.record_date, v.pay_date,
       v.amount_usd_per_share, v.frequency, 'manual', 'confirmed'
FROM instrument i
         JOIN (
    SELECT DATE '2024-12-31' AS declaration_date, DATE '2025-07-31' AS ex_date, DATE '2025-07-31' AS record_date, DATE '2025-08-01' AS pay_date, 0.10 AS amount_usd_per_share, 'weekly' AS frequency
    UNION ALL SELECT DATE '2024-12-31', DATE '2025-07-24', DATE '2025-07-24', DATE '2025-07-25', 0.10, 'weekly'
    UNION ALL SELECT DATE '2025-03-06', DATE '2025-07-17', DATE '2025-07-17', DATE '2025-07-18', 0.10, 'weekly'
    UNION ALL SELECT DATE '2025-03-06', DATE '2025-07-10', DATE '2025-07-10', DATE '2025-07-11', 0.10, 'weekly'
    UNION ALL SELECT DATE '2025-03-06', DATE '2025-07-03', DATE '2025-07-03', DATE '2025-07-07', 0.10, 'weekly'
    UNION ALL SELECT DATE '2024-12-31', DATE '2025-06-26', DATE '2025-06-26', DATE '2025-06-27', 0.09, 'weekly'
    UNION ALL SELECT DATE '2025-03-06', DATE '2025-06-20', DATE '2025-06-20', DATE '2025-06-23', 0.09, 'weekly'
    UNION ALL SELECT DATE '2025-03-06', DATE '2025-06-12', DATE '2025-06-12', DATE '2025-06-13', 0.10, 'weekly'
    UNION ALL SELECT DATE '2025-03-06', DATE '2025-06-05', DATE '2025-06-05', DATE '2025-06-06', 0.09, 'weekly'
    UNION ALL SELECT DATE '2025-02-20', DATE '2025-05-29', DATE '2025-05-29', DATE '2025-05-30', 0.10, 'weekly'
    UNION ALL SELECT DATE '2025-03-06', DATE '2025-05-22', DATE '2025-05-22', DATE '2025-05-23', 0.10, 'weekly'
    UNION ALL SELECT DATE '2025-03-06', DATE '2025-05-15', DATE '2025-05-15', DATE '2025-05-16', 0.11, 'weekly'
    UNION ALL SELECT DATE '2025-03-06', DATE '2025-05-08', DATE '2025-05-08', DATE '2025-05-09', 0.12, 'weekly'
    UNION ALL SELECT DATE '2025-03-06', DATE '2025-05-01', DATE '2025-05-01', DATE '2025-05-02', 0.09, 'weekly'
    UNION ALL SELECT DATE '2025-03-06', DATE '2025-04-24', DATE '2025-04-24', DATE '2025-04-25', 0.08, 'weekly'
    UNION ALL SELECT DATE '2025-03-06', DATE '2025-04-17', DATE '2025-04-17', DATE '2025-04-21', 0.09, 'weekly'
    UNION ALL SELECT DATE '2025-03-06', DATE '2025-04-10', DATE '2025-04-10', DATE '2025-04-11', 0.08, 'weekly'
    UNION ALL SELECT DATE '2024-12-31', DATE '2025-04-03', DATE '2025-04-03', DATE '2025-04-04', 0.09, 'weekly'
    UNION ALL SELECT DATE '2025-03-06', DATE '2025-03-27', DATE '2025-03-27', DATE '2025-03-28', 0.10, 'weekly'
    UNION ALL SELECT DATE '2025-03-06', DATE '2025-03-20', DATE '2025-03-20', DATE '2025-03-21', 0.10, 'weekly'
    UNION ALL SELECT DATE '2025-03-06', DATE '2025-03-13', DATE '2025-03-13', DATE '2025-03-14', 0.10, 'weekly'
    UNION ALL SELECT DATE '2024-12-31', DATE '2025-03-06', DATE '2025-03-06', DATE '2025-03-07', 0.47, 'weekly'
) v
WHERE i.ticker = 'ULTY';

-- 5) 지수 전일 종가(EOD) 입력 (기준일: 2025-08-08)
INSERT INTO price_eod (instrument_id, price_date, close)
SELECT i.id, '2025-08-08', 21450.02 FROM instrument i WHERE i.ticker='^IXIC'
ON DUPLICATE KEY UPDATE close=VALUES(close);

INSERT INTO price_eod (instrument_id, price_date, close)
SELECT i.id, '2025-08-08', 6389.45 FROM instrument i WHERE i.ticker='^GSPC'
ON DUPLICATE KEY UPDATE close=VALUES(close);

INSERT INTO price_eod (instrument_id, price_date, close)
SELECT i.id, '2025-08-08', 3210.01 FROM instrument i WHERE i.ticker='^KS11'
ON DUPLICATE KEY UPDATE close=VALUES(close);

-- 6) 환율 USD/KRW (기준일: 2025-08-08, 매매기준율 1391.50)
INSERT INTO fx_rate_daily (rate_date, base_ccy, quote_ccy, rate, source)
VALUES ('2025-08-08', 'USD', 'KRW', 1391.50, 'manual')
ON DUPLICATE KEY UPDATE rate=VALUES(rate), source=VALUES(source);

COMMIT;

-- 최신 지급일(pay_date) 기준으로 instrument.last_div_ex_date / last_div_amount_usd 채우기
-- 대상: ETF(CONY, MSTY, ULTY)
UPDATE instrument i
    JOIN (
        /* instrument_id별 최신 지급일(pay_date) 레코드 추출 */
        SELECT de.instrument_id,
               de.pay_date,
               de.ex_date,
               de.amount_usd_per_share,
               de.frequency
        FROM dividend_event de
                 JOIN (
            SELECT instrument_id, MAX(pay_date) AS max_pay_date
            FROM dividend_event
            WHERE pay_date IS NOT NULL
            GROUP BY instrument_id
        ) x ON x.instrument_id = de.instrument_id AND x.max_pay_date = de.pay_date
    ) t ON t.instrument_id = i.id
SET i.last_div_ex_date    = t.ex_date,
    i.last_div_amount_usd = t.amount_usd_per_share,
    i.div_supported       = 1,
    i.div_frequency       = COALESCE(t.frequency, i.div_frequency),
    i.meta_provider       = 'manual',
    i.meta_last_sync      = NOW()
WHERE i.type = 'ETF'
  AND i.ticker IN ('CONY','MSTY','ULTY');
