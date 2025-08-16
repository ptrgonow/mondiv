// src/components/GlassPill.tsx
import {cn} from '@/utils/cn'
import type {ReactNode} from 'react'

export default function GlassPill({children, className}: { children: ReactNode; className?: string }) {
    return <div className={cn('glass-pill', className)}>{children}</div>
}
