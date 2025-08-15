import type {DividendEvent, TickerSnapshot} from '@/types/ticker'

/** ─────────────────────────────────────────────────────────────
 * 서버 CSV (예시)
 * 포맷: id,symbol,name,exchange,mic,currency,timezone,assetType,active,divFreq,lastExDate,lastDiv,enabled,createdAt,updatedAt,source,syncAt
 * ───────────────────────────────────────────────────────────── */
const SERVER_CSV = `
1,CONY,YieldMax COIN Option Income Strategy ETF,NYSE Arca,ARCX,USD,America/New_York,ETF,1,monthly,2025-07-24,0.800000,1,2025-08-10 08:47:21,2025-08-10 08:49:54,manual,2025-08-10 08:49:54
2,MSTY,YieldMax MSTR Option Income Strategy ETF,NYSE Arca,ARCX,USD,America/New_York,ETF,1,monthly,2025-07-31,0.180000,1,2025-08-10 08:47:21,2025-08-10 08:49:54,manual,2025-08-10 08:49:54
3,ULTY,YieldMax Ultra Option Income Strategy ETF,NYSE Arca,ARCX,USD,America/New_York,ETF,1,weekly,2025-07-31,0.100000,1,2025-08-10 08:47:21,2025-08-10 08:49:54,manual,2025-08-10 08:49:54
4,JEPI,JPMorgan Equity Premium Income ETF,NYSE Arca,ARCX,USD,America/New_York,ETF,1,monthly,2025-07-02,0.378000,1,2025-08-10 08:47:21,2025-08-10 08:49:54,manual,2025-08-10 08:49:54
5,JEPQ,JPMorgan Nasdaq Equity Premium Income ETF,NYSE Arca,ARCX,USD,America/New_York,ETF,1,monthly,2025-07-02,0.440000,1,2025-08-10 08:47:21,2025-08-10 08:49:54,manual,2025-08-10 08:49:54
6,TSLY,YieldMax TSLA Option Income Strategy ETF,NYSE Arca,ARCX,USD,America/New_York,ETF,1,monthly,2025-07-10,0.690000,1,2025-08-10 08:47:21,2025-08-10 08:49:54,manual,2025-08-10 08:49:54
7,NVDY,YieldMax NVDA Option Income Strategy ETF,NYSE Arca,ARCX,USD,America/New_York,ETF,1,monthly,2025-07-10,0.260000,1,2025-08-10 08:47:21,2025-08-10 08:49:54,manual,2025-08-10 08:49:54
8,APLY,YieldMax AAPL Option Income Strategy ETF,NYSE Arca,ARCX,USD,America/New_York,ETF,1,monthly,2025-07-10,0.220000,1,2025-08-10 08:47:21,2025-08-10 08:49:54,manual,2025-08-10 08:49:54
9,SCHD,Schwab U.S. Dividend Equity ETF,NYSE Arca,ARCX,USD,America/New_York,ETF,1,quarterly,2025-06-21,0.710000,1,2025-08-10 08:47:21,2025-08-10 08:49:54,manual,2025-08-10 08:49:54
10,VYM,Vanguard High Dividend Yield ETF,NYSE Arca,ARCX,USD,America/New_York,ETF,1,quarterly,2025-06-20,0.870000,1,2025-08-10 08:47:21,2025-08-10 08:49:54,manual,2025-08-10 08:49:54
11,HDV,iShares Core High Dividend ETF,NYSE Arca,ARCX,USD,America/New_York,ETF,1,quarterly,2025-06-24,0.890000,1,2025-08-10 08:47:21,2025-08-10 08:49:54,manual,2025-08-10 08:49:54
12,VNQ,Vanguard Real Estate ETF,NYSE Arca,ARCX,USD,America/New_York,ETF,1,quarterly,2025-06-24,0.560000,1,2025-08-10 08:47:21,2025-08-10 08:49:54,manual,2025-08-10 08:49:54
13,QYLD,Global X NASDAQ 100 Covered Call ETF,NASDAQ,XCIS,USD,America/New_York,ETF,1,monthly,2025-07-23,0.170000,1,2025-08-10 08:47:21,2025-08-10 08:49:54,manual,2025-08-10 08:49:54
14,RYLD,Global X Russell 2000 Covered Call ETF,NYSE Arca,ARCX,USD,America/New_York,ETF,1,monthly,2025-07-23,0.180000,1,2025-08-10 08:47:21,2025-08-10 08:49:54,manual,2025-08-10 08:49:54
15,XYLD,Global X S&P 500 Covered Call ETF,NYSE Arca,ARCX,USD,America/New_York,ETF,1,monthly,2025-07-23,0.280000,1,2025-08-10 08:47:21,2025-08-10 08:49:54,manual,2025-08-10 08:49:54
16,SPYI,NEOS S&P 500 High Income ETF,NYSE Arca,ARCX,USD,America/New_York,ETF,1,monthly,2025-07-18,0.600000,1,2025-08-10 08:47:21,2025-08-10 08:49:54,manual,2025-08-10 08:49:54
`.trim()

/** ─────────────────────────────────────────────────────────────
 * 타입 & 파서
 * ───────────────────────────────────────────────────────────── */
type DividendFrequency = 'monthly' | 'weekly' | 'quarterly' | 'semiannual' | 'annual' | 'irregular'

type ServerTicker = {
    id: number
    symbol: string
    name: string
    exchange: string
    mic: string
    currency: 'USD' | 'KRW'
    timezone: string
    assetType: 'ETF' | 'EQUITY'
    active: number
    dividendFrequency: DividendFrequency
    lastExDate: string
    lastDividend: number
    enabled: number
    createdAt: string
    updatedAt: string
    source: string
    syncAt: string
}

function parseServerCsv(csv: string): ServerTicker[] {
    return csv
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean)
        .map(line => {
            const cols = line.split(',').map(s => s.trim())
            const [
                id, symbol, name, exchange, mic, currency, timezone, assetType, active,
                dividendFrequency, lastExDate, lastDividend, enabled, createdAt, updatedAt, source, syncAt
            ] = cols
            return {
                id: Number(id),
                symbol,
                name,
                exchange,
                mic,
                currency: (currency as 'USD' | 'KRW'),
                timezone,
                assetType: (assetType as 'ETF' | 'EQUITY'),
                active: Number(active),
                dividendFrequency: (dividendFrequency as DividendFrequency),
                lastExDate,
                lastDividend: Number(lastDividend),
                enabled: Number(enabled),
                createdAt,
                updatedAt,
                source,
                syncAt,
            }
        })
}

/** ─────────────────────────────────────────────────────────────
 * 유틸 (시드 고정 PRNG + 날짜 헬퍼)
 * ───────────────────────────────────────────────────────────── */
function guessPrice(symbol: string): number {
    const override: Record<string, number> = {CONY: 56.2, MSTY: 21.4, ULTY: 12.1}
    if (override[symbol]) return override[symbol]
    let h = 0
    for (const c of symbol) h = (h * 31 + c.charCodeAt(0)) >>> 0
    return Math.round((10 + (h % 111) + (h % 10) / 10) * 10) / 10
}

const FREQ_MULTIPLIER: Record<DividendFrequency, number> = {
    monthly: 12, weekly: 52, quarterly: 4, semiannual: 2, annual: 1, irregular: 12
}

function estForwardYieldPct(price: number, lastDiv: number, freq: DividendFrequency): number {
    const annual = lastDiv * (FREQ_MULTIPLIER[freq] ?? 12)
    return +(annual / price * 100).toFixed(2)
}

const toISO = (d: Date) => d.toISOString().slice(0, 10)
const adjustWeekend = (d: Date) => {
    const wd = d.getDay();
    if (wd === 0) d.setDate(d.getDate() - 2); else if (wd === 6) d.setDate(d.getDate() - 1);
    return d
}
const addDays = (d: Date, dd: number) => {
    const x = new Date(d);
    x.setDate(x.getDate() + dd);
    return x
}
const addMonths = (d: Date, mm: number) => {
    const x = new Date(d);
    x.setMonth(x.getMonth() + mm);
    return x
}

/** 시드 고정 PRNG (LCG) */
function makeRng(seed: number) {
    return () => (seed = (seed * 1664525 + 1013904223) >>> 0, seed / 0x100000000)
}

function hashSeed(...xs: (string | number)[]) {
    let h = 2166136261 >>> 0
    for (const v of xs.join('|')) {
        h ^= v.charCodeAt(0)
        h = Math.imul(h, 16777619)
    }
    return h >>> 0
}

function randn(rng: () => number) {
    // Box–Muller (정규 N(0,1))
    const u = Math.max(1e-9, rng())
    const v = Math.max(1e-9, rng())
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

/** ─────────────────────────────────────────────────────────────
 * 사실적인 더미 배당 스케줄 생성
 *  - AR(1) + 로그정규 노이즈 + 주기별 스케줄링
 *  - 마지막 이벤트는 lastExDate/lastAmount로 앵커링
 * ───────────────────────────────────────────────────────────── */
function genDividends(
    symbol: string,
    lastExDate: string,
    lastAmount: number,
    freq: DividendFrequency,
    months = 12,
    currency: 'USD' | 'KRW' = 'USD'
): DividendEvent[] {
    const seed = hashSeed(symbol, lastExDate, lastAmount, freq)
    const rng = makeRng(seed)

    // 변동성(표준편차, 비율)
    const VOL: Record<DividendFrequency, number> = {
        weekly: 0.28, monthly: 0.18, quarterly: 0.22, semiannual: 0.25, annual: 0.30, irregular: 0.40,
    }
    const vol = VOL[freq] ?? 0.2
    const k = 0.35 // 평균회귀 강도

    const last = adjustWeekend(new Date(lastExDate))
    const events: DividendEvent[] = []

    if (freq === 'weekly') {
        // 최근 ex-date 요일 유지
        const weekday = last.getDay() || 5 // 일(0)→금(5)
        const count = Math.min(52, Math.max(26, 40)) // 약 40주
        // 가장 오래된 시점부터 생성하여 부드러운 경로
        let base = lastAmount * (0.95 + 0.1 * rng())
        let t = addDays(last, -7 * (count - 1))
        for (let i = 0; i < count; i++) {
            // 해당 주의 요일 정렬
            const d = new Date(t)
            d.setDate(d.getDate() + ((7 + weekday - d.getDay()) % 7))
            // AR(1) + 로그정규 노이즈
            const eps = randn(rng) * vol
            base = Math.max(0.01, base + k * (lastAmount - base) + base * eps)
            const amt = +Math.max(0.01, base).toFixed(2)
            events.push({exDate: toISO(adjustWeekend(d)), payDate: toISO(adjustWeekend(d)), amount: amt, currency})
            t = addDays(t, 7)
        }
        // 마지막 포인트를 서버 값으로 덮어 맞춤
        events[events.length - 1] = {
            ...events.at(-1)!,
            exDate: toISO(last),
            payDate: toISO(last),
            amount: +lastAmount.toFixed(2)
        }
        return events
    }

    if (freq === 'monthly' || freq === 'quarterly' || freq === 'semiannual' || freq === 'annual') {
        const step = freq === 'monthly' ? 1 : freq === 'quarterly' ? 3 : freq === 'semiannual' ? 6 : 12
        const count = Math.ceil(months / step)
        // 월중 7~15일 사이에서 심볼마다 일정한 선호일 선택
        const baseDay = 7 + Math.floor(rng() * 9)

        let base = lastAmount * (0.95 + 0.1 * rng())
        let cursor = addMonths(last, -step * (count - 1))
        for (let i = 0; i < count; i++) {
            const d = new Date(cursor)
            d.setDate(baseDay + Math.floor(rng() * 2) - 1) // ±1일
            adjustWeekend(d)
            const eps = randn(rng) * vol
            base = Math.max(0.01, base + k * (lastAmount - base) + base * eps)
            const amt = +Math.max(0.01, base).toFixed(2)
            events.push({exDate: toISO(d), payDate: toISO(d), amount: amt, currency})
            cursor = addMonths(cursor, step)
        }
        // 마지막을 서버 값으로 정확히 맞춤
        events[events.length - 1] = {
            ...events.at(-1)!,
            exDate: toISO(last),
            payDate: toISO(last),
            amount: +lastAmount.toFixed(2)
        }
        return events
    }

    // irregular: 지난 12개월 동안 6~9회 랜덤
    {
        const today = new Date()
        const n = 6 + Math.floor(rng() * 4) // 6~9회
        const buckets = new Set<number>()
        while (buckets.size < n - 1) { // 마지막은 lastExDate로 예약
            buckets.add(Math.floor(rng() * 12)) // 0~11개월 전 중 선택
        }
        const arr: Date[] = [...buckets].map(m => {
            const d = addMonths(today, -m)
            d.setDate(10 + Math.floor(rng() * 15)) // 10~25일
            return adjustWeekend(d)
        })
        arr.push(last)
        arr.sort((a, b) => a.getTime() - b.getTime())

        let base = lastAmount * (0.9 + 0.2 * rng())
        for (let i = 0; i < arr.length; i++) {
            const d = arr[i]
            const eps = randn(rng) * vol
            // 불규칙: 변동성 더 큼, 간헐적 점프/감소
            const jump = (rng() < 0.15 ? (rng() - 0.5) * 0.6 : 0)
            base = Math.max(0.01, base + k * (lastAmount - base) + base * (eps + jump))
            const amt = +Math.max(0.01, base).toFixed(2)
            events.push({exDate: toISO(d), payDate: toISO(d), amount: amt, currency})
        }
        // 마지막 정확히 앵커
        events[events.length - 1] = {
            ...events.at(-1)!,
            exDate: toISO(last),
            payDate: toISO(last),
            amount: +lastAmount.toFixed(2)
        }
        return events
    }
}

/** ─────────────────────────────────────────────────────────────
 * 공개 API: 서버 CSV → 사실적인 TickerSnapshot[]
 * ───────────────────────────────────────────────────────────── */
export async function fetchTopTickers(): Promise<TickerSnapshot[]> {
    await new Promise(r => setTimeout(r, 350))
    const rows = parseServerCsv(SERVER_CSV)
    const active = rows.filter(r => r.active === 1)

    return active.map(r => {
        const price = guessPrice(r.symbol)
        const fwd = estForwardYieldPct(price, r.lastDividend, r.dividendFrequency)
        const divs = genDividends(r.symbol, r.lastExDate, r.lastDividend, r.dividendFrequency, 12, r.currency)

        // 이벤트 → 시리즈(지급일 기준 금액)
        const series = divs
            .map(d => ({date: d.payDate ?? d.exDate, amount: +d.amount.toFixed(2)}))
            .sort((a, b) => a.date.localeCompare(b.date))

        return {
            info: {symbol: r.symbol, name: r.name, price, forwardYieldPct: fwd, currency: r.currency},
            series,
            dividends: divs,
            frequency: r.dividendFrequency,
            timezone: r.timezone,
        }
    })
}
