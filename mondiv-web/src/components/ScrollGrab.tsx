import {type ReactNode, useCallback, useRef, useState} from 'react'

type Props = { className?: string; children: ReactNode; axis?: 'y' | 'x' }
type DragState = { x: number; y: number; scrollX: number; scrollY: number; moved?: boolean }

export default function ScrollGrab({className = '', children, axis = 'y'}: Props) {
    const ref = useRef<HTMLDivElement | null>(null)
    const [dragging, setDragging] = useState(false)
    const start = useRef<DragState | null>(null)
    // ⬇️ 드래그 직후 발생하는 첫 click을 막기 위한 플래그
    const suppressClickRef = useRef(false)

    const onDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (e.button !== 0) return         // 좌클릭만
        const el = ref.current;
        if (!el) return
        setDragging(true)
        start.current = {x: e.clientX, y: e.clientY, scrollX: el.scrollLeft, scrollY: el.scrollTop, moved: false}
    }, [])

    const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!dragging || !start.current || !ref.current) return
        const el = ref.current
        const dx = e.clientX - start.current.x
        const dy = e.clientY - start.current.y
        // 임계값(픽셀) 이하 움직임은 클릭으로 간주
        if (!start.current.moved && Math.abs(dx) + Math.abs(dy) < 4) return
        start.current.moved = true

        e.preventDefault()
        document.body.style.userSelect = 'none'
        document.body.style.cursor = 'grabbing'

        if (axis !== 'x') el.scrollTop = start.current.scrollY - dy
        if (axis !== 'y') el.scrollLeft = start.current.scrollX - dx
        window.getSelection()?.removeAllRanges()
    }, [dragging, axis])

    const endDrag = useCallback(() => {
        // ⬇️ 드래그가 실제로 발생했다면, 바로 이어질 click 한 번 차단
        if (start.current?.moved) {
            suppressClickRef.current = true
            setTimeout(() => {
                suppressClickRef.current = false
            }, 0) // click은 mouseup 다음 tick에 발생
        }
        setDragging(false)
        start.current = null
        document.body.style.userSelect = ''
        document.body.style.cursor = ''
    }, [])

    // ⬇️ 캡처 단계에서 click 차단
    const onClickCapture = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (suppressClickRef.current) {
            e.preventDefault()
            e.stopPropagation()
            suppressClickRef.current = false
        }
    }, [])

    return (
        <div
            ref={ref}
            role="region"
            aria-label="grab scroll area"
            className={[
                'relative overflow-auto no-scrollbar select-none',
                dragging ? 'cursor-grabbing' : 'cursor-grab',
                className,
            ].join(' ')}
            style={{WebkitOverflowScrolling: 'touch'}}
            onMouseDown={onDown}
            onMouseMove={onMove}
            onMouseLeave={endDrag}
            onMouseUp={endDrag}
            onClickCapture={onClickCapture}   // 🔒 드래그 후 클릭 억제
        >
            {children}
        </div>
    )
}
