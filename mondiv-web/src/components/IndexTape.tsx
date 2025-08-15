// src/components/IndexTape.tsx
import {useEffect, useMemo, useState} from 'react'
import {fetchIndexTape, type IndexItem} from '@/api/indices'
import {TrendingDown, TrendingUp} from 'lucide-react'
import '@/styles/marquee.css'

function Pill({it}: { it: IndexItem }) {
    const up = it.change >= 0
    const nf = new Intl.NumberFormat('en-US', {maximumFractionDigits: 2})
    return (
        <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-200/70 dark:border-neutral-800/70 bg-white/50 dark:bg-neutral-900/50">
            <span className="font-semibold">{it.name}</span>
            <span className="text-xs text-neutral-500">{it.symbol}</span>
            <span className="ml-2 font-semibold">{it.currency} {nf.format(it.price)}</span>
            <span className={`ml-1 flex items-center gap-0.5 text-sm ${up ? 'text-emerald-500' : 'text-rose-500'}`}>
        {up ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}
                {`${up ? '+' : ''}${nf.format(it.change)} (${up ? '+' : ''}${it.changePct.toFixed(2)}%)`}
      </span>
        </div>
    )
}

export default function IndexTape() {
    const [items, setItems] = useState<IndexItem[] | null>(null)
    useEffect(() => {
        fetchIndexTape().then(setItems)
    }, [])

    // 무한 루프를 위해 2회 복제
    const loop = useMemo(() => items ? [...items, ...items] : [], [items])

    return (
        <div className="tape-viewport rounded-xl dark:bg-neutral-950/40 backdrop-blur">
            <div className="tape-track">
                {loop.map((it, i) => (
                    <div key={i} className="px-2 py-2">
                        <Pill it={it}/>
                    </div>
                ))}
            </div>
        </div>
    )
}
