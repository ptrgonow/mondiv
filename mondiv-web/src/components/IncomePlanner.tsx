import {useMemo, useState} from 'react'
import type {TickerSnapshot} from '@/types/ticker'

const KEY = 'mondiv:settings'
type Settings = { usWithholding?: number; baseCurrency?: 'USD' | 'KRW' }

export default function IncomePlanner({snapshot}: { snapshot: TickerSnapshot }) {
    const [shares, setShares] = useState(100)

    const settings: Settings = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem(KEY) || '{}')
        } catch {
            return {}
        }
    }, [])

    const price = snapshot.info.price
    const yr = (snapshot.info.forwardYieldPct / 100) * price // 1주당 연 배당(USD/KRW 동일 통화)
    const grossYear = yr * shares
    const tax = settings.usWithholding ?? 0.15
    const netYear = grossYear * (1 - tax)
    const grossMonth = grossYear / 12
    const netMonth = netYear / 12
    const cost = price * shares
    const nf = new Intl.NumberFormat('ko-KR', {style: 'currency', currency: snapshot.info.currency})

    return (
        <div className="flex flex-col gap-3 h-full">
            <h3 className="font-semibold">Income Planner</h3>

            <div className="grid grid-cols-12 gap-3 items-center">
                <label className="col-span-4 text-sm text-neutral-500">보유 주수</label>
                <input
                    type="number" min={0}
                    className="col-span-8 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900 px-3 py-2 h-10"
                    value={shares}
                    onChange={(e) => setShares(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Stat label="월 배당(세전)" value={nf.format(grossMonth)} />
                <Stat label="월 배당(세후)" value={nf.format(netMonth)} />
                <Stat label="연 배당(세전)" value={nf.format(grossYear)} />
                <Stat label="연 배당(세후)" value={nf.format(netYear)} />
                <Stat label="예상 수익률(FWD)" value={`${snapshot.info.forwardYieldPct.toFixed(2)}%`} />
                <Stat label="총 매입금액" value={nf.format(cost)} />
            </div>

            {/* ⬇︎ 하단 고정 */}
            <div className="mt-auto text-xs text-neutral-500">
                * 세후 = 세전 × (1 - 원천징수 {Math.round((tax) * 100)}%). 통화 변환/실배당 변동은 추후 서버 연동 시 반영.
            </div>
        </div>

    )
}

function Stat({label, value}: { label: string; value: string }) {
    return (
        <div
            className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 bg-white/50 dark:bg-neutral-950/50">
            <div className="text-xs text-neutral-500">{label}</div>
            <div className="mt-1 font-semibold">{value}</div>
        </div>
    )
}
