import { useEffect, useState } from 'react'
import { cn } from '@/utils/cn'
import { Search, Sun, MoonStar } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import Logo from '@/components/Logo'
import GlassPill from '@/components/GlassPill'

export default function Header() {
    const { theme, toggle } = useTheme()
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 2)
        onScroll()
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <header className="liquid-vars sticky top-0 z-50">
            <div className="mx-auto max-w-7xl px-2 py-2">
                <div className={cn('liquid-tray px-3 py-2 flex items-center gap-3', scrolled && 'shadow-lg/0')}>
                    {/* 로고는 기존처럼 캡슐 내부에 */}
                    <GlassPill><Logo /></GlassPill>

                    <div className="flex-1" />

                    {/* 검색: bg를 더 투명하게 */}
                    <div className="relative w-72 max-sm:hidden">
                        <Search className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <input
                            placeholder="티커 검색 (예: CONY)"
                            className={cn(
                                'w-full rounded-md pl-8 pr-3 py-1.5 text-sm outline-none transition',
                                'border border-white/30 dark:border-white/10',
                                'bg-white/10 dark:bg-white/[.04]',
                                'focus:ring-2 focus:ring-[color:var(--brand-500)]/40'
                            )}
                        />
                    </div>

                    {/* 테마 토글 (유리 버튼) */}
                    <button
                        type="button"
                        onClick={toggle}
                        aria-pressed={theme === 'dark'}
                        title="Dark/Light Toggle"
                        className={cn(
                            'inline-flex h-8 w-8 items-center justify-center rounded-md transition',
                            'border border-white/30 dark:border-white/10',
                            'bg-white/10 dark:bg-white/[.04]',
                            'hover:bg-white/15 dark:hover:bg-white/[.06]'
                        )}
                    >
                        {theme === 'dark' ? <Sun size={16} /> : <MoonStar size={16} />}
                    </button>

                    {/* 은은한 컬러 확산 */}
                    <span aria-hidden className="liquid-halo" />
                </div>
            </div>
        </header>
    )
}
