import {NavLink} from 'react-router-dom'
import {Gauge, LogOut, PieChart, Settings} from 'lucide-react'

type Props = {
    userName?: string
    onLogout?: () => void
}

const baseItem =
    'group flex items-center gap-3 px-3 py-2 rounded-lg transition-colors border ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40'

const idleItem =
    'border-transparent hover:bg-neutral-100/80 dark:hover:bg-neutral-900 ' +
    'text-neutral-700 dark:text-neutral-200'

const activeItem =
    'border-teal-500/60 bg-teal-50/70 dark:bg-teal-400/10 ' +
    'text-teal-700 dark:text-teal-300 ring-1 ring-teal-500/20'

const iconIdle =
    'text-neutral-500 group-hover:text-neutral-700 dark:text-neutral-400 dark:group-hover:text-neutral-200'
const iconActive = 'text-teal-600 dark:text-teal-300'

export default function Sidebar({userName = 'Patrick', onLogout}: Props) {
    const initials = userName.trim().slice(0, 1).toUpperCase()

    const handleLogout = () => {
        if (confirm('로그아웃 하시겠습니까?')) {
            onLogout?.()
            // 데모용
            console.log('[logout] clicked')
        }
    }

    return (
        <nav
            className="h-full flex flex-col rounded-2xl border border-neutral-200 dark:border-neutral-800 p-3
                 bg-white/60 dark:bg-neutral-950/60 backdrop-blur"
        >
            {/* 상단 인사 카드 */}
            <div className="flex items-center gap-3 p-3 mb-3 rounded-xl border border-neutral-200/70 dark:border-neutral-800/70
                      bg-white/70 dark:bg-neutral-900/50">
                <div className="h-9 w-9 rounded-full grid place-items-center font-semibold text-white shadow-sm
                        bg-gradient-to-br from-teal-500 to-indigo-500">
                    {initials}
                </div>
                <div className="leading-tight">
                    <div className="text-base font-semibold text-neutral-900 dark:text-neutral-50">{userName}</div>
                </div>
            </div>

            {/* 상단 메뉴 */}
            <ul className="space-y-2">
                <li>
                    <NavLink to="/" end className={({isActive}) => `${baseItem} ${isActive ? activeItem : idleItem}`}>
                        {({isActive}) => (
                            <>
                                <Gauge size={18} className={isActive ? iconActive : iconIdle}/>
                                <span className="font-medium">대시보드</span>
                                {isActive &&
                                    <span className="ml-auto h-2 w-2 rounded-full bg-teal-500/70" aria-hidden/>}
                            </>
                        )}
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/portfolio"
                             className={({isActive}) => `${baseItem} ${isActive ? activeItem : idleItem}`}>
                        {({isActive}) => (
                            <>
                                <PieChart size={18} className={isActive ? iconActive : iconIdle}/>
                                <span className="font-medium">포트폴리오</span>
                                {isActive &&
                                    <span className="ml-auto h-2 w-2 rounded-full bg-teal-500/70" aria-hidden/>}
                            </>
                        )}
                    </NavLink>
                </li>
            </ul>

            {/* 하단 고정 섹션 */}
            <div className="mt-auto pt-3">
                <div className="h-px bg-neutral-200 dark:bg-neutral-800 mb-3"/>
                <ul className="space-y-2">
                    <li>
                        <NavLink to="/settings"
                                 className={({isActive}) => `${baseItem} ${isActive ? activeItem : idleItem}`}>
                            {({isActive}) => (
                                <>
                                    <Settings size={18} className={isActive ? iconActive : iconIdle}/>
                                    <span className="font-medium">설정</span>
                                    {isActive &&
                                        <span className="ml-auto h-2 w-2 rounded-full bg-teal-500/70" aria-hidden/>}
                                </>
                            )}
                        </NavLink>
                    </li>
                    <li>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className={`${baseItem} ${idleItem} w-full text-left`}
                            aria-label="로그아웃"
                        >
                            <LogOut size={18} className="text-rose-500"/>
                            <span className="font-medium">로그아웃</span>
                        </button>
                    </li>
                </ul>
            </div>
        </nav>
    )
}
