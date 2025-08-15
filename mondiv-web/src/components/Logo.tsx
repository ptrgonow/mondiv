import {Link} from 'react-router-dom'

export default function Logo({className = ''}: { className?: string }) {
    return (
        <Link
            to="/"
            aria-label="MonDiv 홈"
            className={['group inline-flex items-center gap-2', className].join(' ')}
        >
            {/* 엠블럼 */}
            <span className="relative grid place-items-center h-9 w-9 rounded-xl">
        <span
            className="absolute inset-0 rounded-xl ring-1 transition-colors
                     bg-[color:var(--brand-500-a10)]
                     ring-[color:var(--brand-500)]/35
                     group-hover:ring-[color:var(--brand-500)]/55"/>
                {/* 텍스트를 svg 중앙에 배치 + 옵티컬 보정 */}
                <svg viewBox="0 0 24 24" className="relative h-5 w-5">
          <text
              x="51%"              /* ➜ 약간 오른쪽으로 보정 */
              y="54%"              /* ➜ 약간 아래로 보정 */
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="13"
              fontWeight="800"
              fill="var(--brand-600)"
              style={{fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto'}}
          >
            M
          </text>
        </svg>
      </span>

            {/* 워드마크 */}
            <span className="text-lg font-extrabold tracking-tight leading-none">
        <span className="text-neutral-900 dark:text-neutral-100">Mon</span>
        <span className="text-[color:var(--brand-600)] dark:text-[color:var(--brand-700)]">Div</span>
      </span>
        </Link>
    )
}
