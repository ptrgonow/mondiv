import {differenceInCalendarDays, isAfter, parseISO} from 'date-fns'
import type {TickerSnapshot} from '@/types/ticker'

export default function UpcomingAlerts({items}: { items: TickerSnapshot[] }) {
    const now = new Date()
    const upcoming = items.flatMap(t =>
        (t.dividends ?? [])
            .filter(d => d.exDate)
            .map(d => ({sym: t.info.symbol, name: t.info.name, ex: d.exDate!, cur: t.info.currency, amt: d.amount}))
    )
        .filter(x => isAfter(parseISO(x.ex), now))
        .sort((a, b) => a.ex.localeCompare(b.ex))
        .slice(0, 3)

    if (upcoming.length === 0) {
        return <div className="text-sm text-neutral-500">임박한 이벤트가 없습니다.</div>
    }

    const nf = new Intl.NumberFormat('ko-KR', {style: 'currency', currency: upcoming[0].cur})

    return (
        <div className="grid gap-2">
            <h3 className="font-semibold">Upcoming Event</h3>
            <ul className="space-y-2">
                {upcoming.map(u => {
                    const d = parseISO(u.ex)
                    const dd = differenceInCalendarDays(d, now)
                    return (
                        <li key={u.sym + u.ex}
                            className="flex items-center justify-between rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 bg-white/50 dark:bg-neutral-950/50">
                            <div>
                                <div className="font-medium">{u.sym}</div>
                                <div className="text-xs text-neutral-500 truncate">{u.name}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-neutral-500">Ex-Date {u.ex}</div>
                                <div className="font-semibold">{nf.format(u.amt)} <span
                                    className="text-xs text-neutral-500">({dd}일 후)</span></div>
                            </div>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}
