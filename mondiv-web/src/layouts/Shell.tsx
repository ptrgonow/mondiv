// src/layouts/Shell.tsx
import type {ReactNode} from 'react'
import {useLayoutEffect, useRef} from 'react'
import Header from './Header'
import Sidebar from '@/layouts/Sidebar'
import IndexTape from '@/components/IndexTape'

export default function Shell({children}: { children: ReactNode }) {
    const tapeRef = useRef<HTMLDivElement>(null)

    // 지수 테이프 실제 높이를 CSS 변수(--tape-h)에 반영
    useLayoutEffect(() => {
        const setVar = () => {
            const h = tapeRef.current?.offsetHeight ?? 0
            document.documentElement.style.setProperty('--tape-h', `${h}px`)
        }
        setVar()
        const ro = new ResizeObserver(setVar)
        if (tapeRef.current) ro.observe(tapeRef.current)
        window.addEventListener('resize', setVar)
        return () => {
            ro.disconnect()
            window.removeEventListener('resize', setVar)
        }
    }, [])

    return (
        // --hdr-h: Header 높이(기본 64px). 헤더 높이 바꾸면 여기만 수정.
        <div className="min-h-dvh flex flex-col bg-neutral-100 dark:bg-neutral-950 [--hdr-h:64px]">
            {/* 상단 헤더 */}
            <Header/>

            {/* 헤더 바로 아래: 지수 테이프 (높이 측정을 위해 ref 부착) */}
            <div ref={tapeRef} className="mx-auto max-w-7xl w-full px-4 pt-3">
                <IndexTape/>
            </div>

            {/* 본문: 좌측 네비 + 메인 콘텐츠 */}
            <div className="mx-auto max-w-7xl w-full px-4 py-6 grid grid-cols-12 gap-6 flex-1">
                {/* Sidebar: lg 이상에서만 보이도록, 헤더+테이프만큼 아래에 sticky 고정 */}
                <aside className="hidden lg:block col-span-2">
                    <div
                        className="sticky"
                        style={{
                            // 상단 고정 기준(헤더 + 테이프 + 상단 여백 16px)
                            top: 'calc(var(--hdr-h,64px) + var(--tape-h,40px) + 16px)',
                            // 사이드바 카드가 화면 높이에 맞게 꽉 차도록
                            height: 'calc(100vh - var(--hdr-h,64px) - var(--tape-h,40px) - 32px)',
                        }}
                    >
                        <Sidebar/>
                    </div>
                </aside>

                {/* Main 영역 */}
                <main className="col-span-12 lg:col-span-10">
                    {children}
                </main>
            </div>
        </div>
    )
}
