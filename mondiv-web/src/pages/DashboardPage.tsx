// src/pages/DashboardPage.tsx
import {useEffect, useMemo, useState} from 'react'
import type {TickerSnapshot} from '@/types/ticker'
import {fetchTopTickers} from '@/api/tickers'
import AmountAreaChart from '@/components/AmountAreaChart'
import TickerList from '@/components/TickerList'
import Skeleton from '@/components/Skeleton'
import ScrollGrab from '@/components/ScrollGrab'
import ModernCalendar from '@/components/ModernCalendar'
import IncomePlanner from '@/components/IncomePlanner'
import UpcomingAlerts from '@/components/UpcomingAlerts'

const PANEL_H = 360

export default function DashboardPage() {
    const [items, setItems] = useState<TickerSnapshot[] | null>(null)
    const [selected, setSelected] = useState<TickerSnapshot | null>(null)

    useEffect(() => {
        fetchTopTickers().then(d => {
            setItems(d);
            setSelected(d[0] ?? null)
        })
    }, [])

    const kpis = useMemo(() => {
        if (!selected) return null
        const {forwardYieldPct, price, currency} = selected.info

        const year = new Date().getFullYear()
        const ytd = (selected.dividends ?? [])
            .filter(d => new Date(d.payDate ?? d.exDate).getFullYear() === year)
            .reduce((s, d) => s + d.amount, 0)
        const nf = new Intl.NumberFormat('ko-KR', {style: 'currency', currency})

        return [
            {label: '전일 종가(EOD)', value: `${currency} ${price.toFixed(2)}`},
            {label: '예상 수익률(FWD)', value: `${forwardYieldPct.toFixed(2)}%`},
            {label: '총 배당금(YTD)', value: nf.format(ytd)},
        ]
    }, [selected])

    // 우측 어사이드: 카드가 3개 이하일 때 중앙(버티컬) 정렬
    const compactAside = (items?.length ?? 0) <= 3

    return (
        <div className="grid gap-6">
            <div className="grid gap-6">
                {selected ? (
                    <h1 className="text-2xl font-extrabold">{selected.info.symbol} · {selected.info.name}</h1>
                ) : (
                    <div className="h-7">
                        <Skeleton className="h-full w-64"/>
                    </div>
                )}
            </div>

            {/* 패널 영역 */}
            <div className="grid grid-cols-12 gap-6 items-start">
                {/* LEFT: 차트 */}
                <section className="col-span-12 lg:col-span-8">
                    <div
                        className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-950/60 backdrop-blur p-3 h-[360px]">
                        {!selected ? (
                            <Skeleton className="h-full"/>
                        ) : (
                            <>
                                {/** ⬇⬇ 변경: 최근 1회 배당 금액으로 캡션 표시 */}
                                {(() => {
                                    const lastAmt = selected.series.at(-1)?.amount ?? 0
                                    const nf = new Intl.NumberFormat('ko-KR', {
                                        style: 'currency',
                                        currency: selected.info.currency
                                    })
                                    return (
                                        <div className="mb-1 px-1 font-semibold">
                                            {selected.info.symbol} — {nf.format(lastAmt)} (최근)
                                        </div>
                                    )
                                })()}

                                <div className="h-[calc(360px-40px)]">
                                    <AmountAreaChart
                                        data={selected.series}
                                        currency={selected.info.currency}
                                        height={PANEL_H - 40}
                                        label="Dividend"
                                        frequency={selected.frequency}
                                        timezone={selected.timezone}
                                    />
                                </div>

                            </>
                        )}
                    </div>
                </section>

                {/* RIGHT: 리스트 (3개 이하면 중앙 정렬, 많으면 스크롤) */}
                <aside className="col-span-12 lg:col-span-4">
                    <div
                        className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-950/60 backdrop-blur p-3 h-[360px]">
                        {!items ? (
                            <Skeleton className="h-full"/>
                        ) : compactAside ? (
                            <div className="h-full flex flex-col justify-center gap-2">
                                <TickerList
                                    items={items}
                                    onSelect={setSelected}
                                    selectedSymbol={selected?.info.symbol}
                                />
                            </div>
                        ) : (
                            <ScrollGrab className="h-full no-scrollbar pr-1" axis="y">
                                <div className="grid gap-2">
                                    <TickerList
                                        items={items}
                                        onSelect={setSelected}
                                        selectedSymbol={selected?.info.symbol}
                                    />
                                </div>
                            </ScrollGrab>
                        )}
                    </div>
                </aside>
            </div>

            {/* KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {!kpis ? (
                    <>
                        <Skeleton className="h-24"/>
                        <Skeleton className="h-24"/>
                        <Skeleton className="h-24"/>
                    </>
                ) : (
                    kpis.map(k => (
                        <div key={k.label} className="rounded-xl border p-4 border-gray-200 dark:border-neutral-800">
                            <div className="text-xs text-gray-500">{k.label}</div>
                            <div className="mt-1 text-lg font-bold">{k.value}</div>
                        </div>
                    ))
                )}
            </div>

            {/* === 하단: 캘린더 + 플래너/알림 === */}
            <div className="grid grid-cols-12 gap-6 items-stretch">
                <section className="col-span-12 lg:col-span-7">
                    <div
                        className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-950/60 p-4 min-h-[480px]">
                        <ModernCalendar events={selected?.dividends ?? []}/>
                    </div>
                </section>

                <aside className="col-span-12 lg:col-span-5">
                    <div className="grid gap-6 h-full">
                        <div
                            className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-950/60 p-4">
                            {selected && <IncomePlanner snapshot={selected}/>}
                        </div>
                        <div
                            className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-950/60 p-4">
                            {items && <UpcomingAlerts items={items}/>}
                        </div>
                    </div>
                </aside>
            </div>

        </div>
    )
}
