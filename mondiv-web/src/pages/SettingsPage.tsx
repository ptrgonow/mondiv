// src/pages/SettingsPage.tsx
import {type ReactNode, useEffect, useMemo, useState} from 'react'

type AppSettings = {
    theme: 'system' | 'light' | 'dark'
    baseCurrency: 'USD' | 'KRW'
    taxResidency: 'KR' | 'US' | 'JP' | 'EU'
    usWithholding: number
    drip: boolean
}

const KEY = 'mondiv:settings'
const DEFAULTS: AppSettings = {
    theme: 'system',
    baseCurrency: 'USD',
    taxResidency: 'KR',
    usWithholding: 0.15,
    drip: true,
}

function applyTheme(theme: AppSettings['theme']) {
    const root = document.documentElement
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
    const wantDark = theme === 'dark' || (theme === 'system' && prefersDark)
    root.classList.toggle('dark', wantDark)
}

/* ----- 공통 UI 유틸 ----- */
const inputCls =
    'h-10 w-full rounded-lg border border-neutral-200 dark:border-neutral-800 ' +
    'bg-white/70 dark:bg-neutral-900 px-3 py-2 ' +
    'focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60'

const labelCls = 'text-sm font-medium text-neutral-800 dark:text-neutral-100'
const hintCls = 'text-xs text-neutral-500 dark:text-neutral-400 mt-1'

function Card({title, children, desc}: { title: string; children: ReactNode; desc?: ReactNode }) {
    return (
        <section
            className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-950/60 p-5">
            <div className="mb-4">
                <h2 className="text-lg font-semibold">{title}</h2>
                {desc ? <p className="text-sm text-neutral-500 mt-1">{desc}</p> : null}
            </div>
            {children}
        </section>
    )
}

function Row({
                 label,
                 control,
                 hint,
             }: {
    label: string
    control: ReactNode
    hint?: ReactNode
}) {
    return (
        <div className="py-2 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-3">
                <div className={labelCls}>{label}</div>
            </div>
            <div className="sm:col-span-9">
                {control}
                {hint ? <div className={hintCls}>{hint}</div> : null}
            </div>
        </div>
    )
}

export default function SettingsPage() {
    const [s, setS] = useState<AppSettings>(() => {
        try {
            return {...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}')}
        } catch {
            return DEFAULTS
        }
    })

    useEffect(() => {
        localStorage.setItem(KEY, JSON.stringify(s))
    }, [s])

    useEffect(() => {
        applyTheme(s.theme)
    }, [s.theme])

    const pctFmt = useMemo(
        () => new Intl.NumberFormat('ko-KR', {style: 'percent', maximumFractionDigits: 1}),
        []
    )

    return (
        <div className="grid gap-6">
            <h1 className="text-2xl font-extrabold">설정</h1>

            {/* 표시 & 테마 */}
            <Card title="표시 및 테마">
                <Row
                    label="테마"
                    control={
                        <div className="grid grid-cols-3 gap-2">
                            {(['system', 'light', 'dark'] as const).map((v) => (
                                <button
                                    key={v}
                                    type="button"
                                    onClick={() => setS((cur) => ({...cur, theme: v}))}
                                    className={[
                                        'h-10 rounded-lg border text-sm',
                                        s.theme === v
                                            ? 'border-blue-500/60 bg-blue-50/70 dark:bg-blue-400/10 text-blue-700 dark:text-blue-300'
                                            : 'border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900 hover:bg-neutral-100/80 dark:hover:bg-neutral-900',
                                    ].join(' ')}
                                >
                                    {v === 'system' ? '시스템' : v === 'light' ? '라이트' : '다크'}
                                </button>
                            ))}
                        </div>
                    }
                />
                <Row
                    label="기본 통화"
                    control={
                        <select
                            className={inputCls}
                            value={s.baseCurrency}
                            onChange={(e) =>
                                setS((v) => ({...v, baseCurrency: e.target.value as AppSettings['baseCurrency']}))
                            }
                        >
                            <option value="USD">USD</option>
                            <option value="KRW">KRW</option>
                        </select>
                    }
                />
                <Row
                    label="DRIP(배당 재투자)"
                    control={
                        <label className="inline-flex items-center gap-2 select-none">
                            <input
                                type="checkbox"
                                checked={s.drip}
                                onChange={(e) => setS((v) => ({...v, drip: e.target.checked}))}
                                className="size-4 accent-blue-600"
                            />
                            <span className="text-sm">{s.drip ? '사용' : '미사용'}</span>
                        </label>
                    }
                />
            </Card>

            {/* 세금 기본값 */}
            <Card title="세금 기본값">
                <Row
                    label="세무 거주지"
                    control={
                        <select
                            className={inputCls}
                            value={s.taxResidency}
                            onChange={(e) =>
                                setS((v) => ({...v, taxResidency: e.target.value as AppSettings['taxResidency']}))
                            }
                        >
                            <option value="KR">Korea</option>
                            <option value="US">United States</option>
                            <option value="JP">Japan</option>
                            <option value="EU">EU</option>
                        </select>
                    }
                />
                <Row
                    label="미국 원천징수율"
                    control={
                        <input
                            type="number"
                            inputMode="decimal"
                            min={0}
                            max={0.5}
                            step={0.005}
                            value={s.usWithholding}
                            onChange={(e) =>
                                setS((v) => ({...v, usWithholding: Math.min(0.5, Math.max(0, Number(e.target.value)))}))
                            }
                            className={inputCls}
                        />
                    }
                    hint={`현재: ${pctFmt.format(s.usWithholding)} (예: 한국 거주자 기본 15%)`}
                />
            </Card>

            <div className="text-xs text-neutral-500 dark:text-neutral-400">
                * 설정은 브라우저 로컬에 임시 저장됩니다. 서버 연동 시 사용자별 동기화로 전환 예정.
            </div>
        </div>
    )
}
