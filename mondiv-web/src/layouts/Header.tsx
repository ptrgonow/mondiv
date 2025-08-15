import {cn} from '@/utils/cn'
import {MoonStar, Search, Sun} from 'lucide-react'
import {useTheme} from '@/hooks/useTheme'
import Logo from '@/components/Logo'

export default function Header() {
    const {theme, toggle} = useTheme()

    return (
        <header
            className={cn(
                'sticky top-0 z-40 backdrop-blur border-b',
                'border-gray-200/70 dark:border-neutral-800/80',
                'bg-white/70 dark:bg-neutral-950/60',
            )}
        >
            <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
                {/* 로고 */}
                <Logo/>

                <div className="flex-1"/>

                {/* 검색 */}
                <div className="relative w-72 max-sm:hidden">
                    <Search
                        className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/>
                    <input
                        className={cn(
                            'w-full rounded-md border pl-8 pr-3 py-1.5 text-sm outline-none transition',
                            'border-gray-200 dark:border-neutral-800',
                            'bg-white/70 dark:bg-neutral-900',
                            'focus:ring-2 focus:ring-[color:var(--brand-500)]/50',
                            'focus:border-[color:var(--brand-500)]/50'
                        )}
                        placeholder="티커 검색 (예: CONY)"
                    />
                </div>

                {/* 테마 토글 */}
                <button
                    type="button"
                    onClick={toggle}
                    aria-pressed={theme === 'dark'}
                    title="Dark/Light Toggle"
                    className={cn(
                        'ml-3 inline-flex h-8 w-8 items-center justify-center rounded-md border transition',
                        'border-gray-200 dark:border-neutral-700',
                        'hover:bg-neutral-100/70 dark:hover:bg-neutral-900/70',
                        'focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-500)]/50'
                    )}
                >
                    {theme === 'dark' ? <Sun size={16}/> : <MoonStar size={16}/>}
                </button>
            </div>
        </header>
    )
}
