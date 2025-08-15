// src/components/TickerCard.tsx
import type {TickerSnapshot} from '@/types/ticker'

export default function TickerCard({
                                       snapshot,
                                       active = false,
                                   }: {
    snapshot: TickerSnapshot
    active?: boolean
}) {
    const {info, series} = snapshot
    const nf = new Intl.NumberFormat('ko-KR', {style: 'currency', currency: info.currency})
    const lastAmt = series.at(-1)?.amount ?? 0

    return (
        <div
            className={[
                'relative flex items-center justify-between rounded-xl border p-4 transition-colors',
                active
                    ? 'ring-1 ring-[color:var(--brand-500)] border-[color:var(--brand-500)] bg-[color:var(--brand-500-a10)]'
                    : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100/60 dark:hover:bg-neutral-900/60',
            ].join(' ')}
        >
            {/* 좌측 액센트 바 (활성 시 표시) */}
            {active && (
                <span
                    aria-hidden="true"
                    className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-[color:var(--brand-500)]"
                />
            )}

            <div className="pr-3">
                <div className="font-semibold truncate">{info.symbol}</div>
                <div className="text-sm text-neutral-500">
                    {info.currency} {info.price.toFixed(2)}
                </div>
            </div>

            <div className="text-right">
                <div className="text-xs text-neutral-500">배당(최근)</div>
                <div
                    className={[
                        'font-bold',
                        active ? 'text-[color:var(--brand-600)] dark:text-[color:var(--brand-700)]' : '',
                    ].join(' ')}
                >
                    {nf.format(lastAmt)}
                </div>
            </div>
        </div>
    )
}
