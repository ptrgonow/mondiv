// src/components/charts/AmountAreaChart.tsx
import {Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts'
import type {AmountPoint, DividendFrequency} from '@/types/ticker'
import {useId, useMemo} from 'react'

export default function AmountAreaChart({
                                            data, currency, height = 300, label = 'Dividend',
                                            frequency = 'monthly',
                                        }: {
    data: AmountPoint[];
    currency: 'USD' | 'KRW';
    height?: number;
    label?: string;
    frequency?: DividendFrequency;
    timezone?: string;
}) {
    const gid = useId()
    const nf = useMemo(() => new Intl.NumberFormat('ko-KR', {style: 'currency', currency}), [currency])

    // ── 1) 주배당이면 월 합산으로 변환 ─────────────────────────────
    const monthlyData: AmountPoint[] = useMemo(() => {
        if (frequency !== 'weekly') return data
        const m = new Map<string, number>() // key: YYYY-MM
        for (const p of data) {
            const ym = new Date(p.date).toISOString().slice(0, 7)
            m.set(ym, (m.get(ym) ?? 0) + p.amount)
        }
        return [...m.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([ym, amt]) => ({date: `${ym}-01`, amount: +amt.toFixed(2)}))
    }, [data, frequency])

    // 이 차트에서 쓸 실제 데이터
    const prepared = frequency === 'weekly' ? monthlyData : data

    // ts 변환
    const tsData = useMemo(
        () => prepared.map(p => ({...p, ts: new Date(p.date).getTime()})),
        [prepared]
    )
    const minTs = tsData[0]?.ts ?? Date.now()
    const maxTs = tsData.at(-1)?.ts ?? minTs

    // ── 2) 모든 포인트에 격자 정렬 + 라벨 포맷(1월만 연도 표기) ─────
    const allTicks = useMemo(() => tsData.map(p => p.ts), [tsData])

    const ymLabel = (ts: number) => {
        const d = new Date(ts)
        const m = d.getMonth() + 1
        const mm = String(m).padStart(2, '0')
        // 1월이면 MM’YY (예: 01’25), 그 외 MM
        if (m === 1) return `${mm}’${String(d.getFullYear()).slice(2)}`
        return mm
    }

    // 주배당은 월 기준으로 바뀌었으니 YYYY-MM, 그 외도 월기준이면 YYYY-MM, 일기준이면 YYYY-MM-DD
    const labelFull = (ts: number) => {
        const d = new Date(ts)
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        /*const day = String(d.getDate()).padStart(2, '0')*/
        return `${y}-${m}` // 툴팁 라벨은 풀 YYYY-MM로
    }

    return (
        <div style={{width: '100%', height}}>
            <ResponsiveContainer>
                <AreaChart data={tsData} margin={{top: 8, right: 12, left: 0, bottom: 8}}>
                    <defs>
                        <linearGradient id={`amt-${gid}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--chart-area-from)" stopOpacity={1}/>
                            <stop offset="95%" stopColor="var(--chart-area-to)" stopOpacity={1}/>
                        </linearGradient>
                    </defs>

                    <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3"/>

                    <XAxis
                        dataKey="ts" type="number" scale="time"
                        domain={[minTs, maxTs]}
                        ticks={allTicks}
                        interval={0}
                        minTickGap={24}
                        tickFormatter={ymLabel}
                        tick={{fontSize: 12, fill: 'var(--chart-axis)'}}
                        axisLine={{stroke: 'var(--chart-axis)'}}
                        tickLine={{stroke: 'var(--chart-axis)'}}
                    />

                    <YAxis
                        width={64}
                        tickFormatter={(v) => nf.format(v as number)}
                        tick={{fontSize: 12, fill: 'var(--chart-axis)'}}
                        axisLine={{stroke: 'var(--chart-axis)'}}
                        tickLine={{stroke: 'var(--chart-axis)'}}
                    />

                    <Tooltip
                        formatter={(v) => [nf.format(v as number), label]}
                        labelFormatter={(ts) => labelFull(Number(ts))} // YYYY-MM
                        contentStyle={{
                            background: 'var(--tooltip-bg)', color: 'var(--tooltip-text)',
                            border: '1px solid var(--tooltip-border)', borderRadius: 8,
                        }}
                        labelStyle={{color: 'var(--tooltip-text)'}}
                        itemStyle={{color: 'var(--tooltip-text)'}}
                    />

                    <Area type="monotone" dataKey="amount" stroke="var(--chart-line)" strokeWidth={2}
                          fill={`url(#amt-${gid})`}/>
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
