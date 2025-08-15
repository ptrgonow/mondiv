import type {TickerSnapshot} from '@/types/ticker'
import TickerCard from './TickerCard'

export default function TickerList({
                                       items,
                                       onSelect,
                                       selectedSymbol,
                                   }: {
    items: TickerSnapshot[]
    onSelect: (t: TickerSnapshot) => void
    selectedSymbol?: string
}) {
    return (
        <div className="grid gap-2">
            {items.map(it => {
                const active = it.info.symbol === selectedSymbol
                return (
                    <button
                        key={it.info.symbol}
                        onClick={() => onSelect(it)}
                        className="text-left"
                        aria-current={active ? 'true' : undefined}
                    >
                        <TickerCard snapshot={it} active={active}/>
                    </button>
                )
            })}
        </div>
    )
}
