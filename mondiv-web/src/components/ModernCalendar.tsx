// src/components/ModernCalendar.tsx
import {
    addMonths,
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    format,
    isAfter,
    isBefore,
    isSameMonth,
    isToday,
    parseISO,
    startOfMonth,
    startOfWeek,
    subMonths
} from 'date-fns'
import {ko} from "/Users/patrick/Desktop/mondiv-web/node_modules/date-fns/locale/ko"
import {useMemo, useState} from 'react'
import type {DividendEvent} from '@/types/ticker'

type EmptyMode = 'never' | 'smart' | 'always'
type Props = { events: DividendEvent[]; title?: string; emptyMode?: EmptyMode }

export default function ModernCalendar({events, title = 'Yield Calendar', emptyMode = 'smart'}: Props) {
    const latest = useMemo(() => {
        const key = events.map(e => e.payDate ?? e.exDate).filter(Boolean).sort().at(-1)
        return key ? parseISO(key) : new Date()
    }, [events])

    const [month, setMonth] = useState<Date>(startOfMonth(latest))

    const days = useMemo(() => {
        const start = startOfWeek(startOfMonth(month), {weekStartsOn: 0})
        const end = endOfWeek(endOfMonth(month), {weekStartsOn: 0})
        return eachDayOfInterval({start, end})
    }, [month])

    const map = useMemo(() => {
        const m = new Map<string, DividendEvent[]>()
        for (const e of events) {
            const k = (e.payDate ?? e.exDate) ?? ''
            if (!k) continue
            if (!m.has(k)) m.set(k, [])
            m.get(k)!.push(e)
        }
        return m
    }, [events])

    // 월에 이벤트가 있는지
    const monthHasEvent = useMemo(() => {
        const mKey = format(month, 'yyyy-MM')
        return events.some(e => (e.payDate ?? e.exDate)?.startsWith(mKey))
    }, [month, events])

    // 이벤트 존재 범위 계산
    const [minMonth, maxMonth] = useMemo(() => {
        const keys = events.map(e => e.payDate ?? e.exDate).filter(Boolean).sort()
        if (keys.length === 0) return [null, null] as const
        return [startOfMonth(parseISO(keys[0]!)), startOfMonth(parseISO(keys.at(-1)!))]
    }, [events])

    // 오버레이 노출 규칙
    const showEmpty =
        emptyMode === 'always'
            ? true
            : emptyMode === 'never'
                ? false
                : (() => {
                    if (events.length === 0) return false
                    if (minMonth && isBefore(month, minMonth)) return false
                    if (maxMonth && isAfter(month, maxMonth)) return false
                    return !monthHasEvent
                })()

    const fmt = (n: number, c: string) =>
        new Intl.NumberFormat('ko-KR', {style: 'currency', currency: c, maximumFractionDigits: 2}).format(n)

    return (
        <div className="relative grid gap-3">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <h3 className="font-semibold">{title}</h3>
                <div className="flex items-center gap-2 text-sm">
                    <button
                        className="px-2 py-1 rounded border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100/70 dark:hover:bg-neutral-900"
                        onClick={() => setMonth(m => subMonths(m, 1))}>이전
                    </button>
                    <div className="min-w-28 text-center font-medium">{format(month, 'yyyy.MM', {locale: ko})}</div>
                    <button
                        className="px-2 py-1 rounded border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100/70 dark:hover:bg-neutral-900"
                        onClick={() => setMonth(m => addMonths(m, 1))}>다음
                    </button>
                </div>
            </div>

            {/* 요일 */}
            <div className="grid grid-cols-7 text-xs text-neutral-500 select-none">
                {['일', '월', '화', '수', '목', '금', '토'].map(d => <div key={d} className="px-2 py-1">{d}</div>)}
            </div>

            {/* 달력 */}
            <div className="grid grid-cols-7 gap-1">
                {days.map(d => {
                    const key = format(d, 'yyyy-MM-dd')
                    const items = map.get(key) ?? []
                    const inMonth = isSameMonth(d, month)
                    const today = isToday(d)
                    const total = items.reduce((s, x) => s + (x.amount || 0), 0)
                    const cur = items[0]?.currency ?? 'USD'

                    return (
                        <div key={key}
                             className={[
                                 'relative min-h-[92px] rounded-xl p-2 ring-1',
                                 inMonth
                                     ? 'ring-neutral-200/70 dark:ring-neutral-800/70 bg-white/60 dark:bg-neutral-950/60'
                                     : 'ring-neutral-200/30 dark:ring-neutral-800/30 bg-white/40 dark:bg-neutral-900/40 opacity-60',
                                 today ? 'outline outline-1 outline-[var(--brand-500)]/40' : '',
                             ].join(' ')}>
                            <div className="text-xs font-medium">{format(d, 'd')}</div>
                            <div className="absolute inset-x-0 bottom-2 grid place-items-center">
                                {items.length > 0 ? (
                                    <div
                                        className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                                        style={{background: 'var(--brand-500-a10)', color: 'var(--brand-700)'}}
                                    >
                                        {fmt(total, cur)}
                                    </div>
                                ) : (
                                    <div
                                        className="h-1.5 w-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700 opacity-60"/>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* ‘빈 월’ 안내: 스마트 모드에서만 */}
            {showEmpty && (
                <div className="pointer-events-none absolute inset-0 grid place-items-center">
                    <div
                        className="px-3 py-1.5 rounded-full text-xs bg-neutral-200/60 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-300">
                        이 달에는 배당 이벤트가 없습니다
                    </div>
                </div>
            )}
        </div>
    )
}
