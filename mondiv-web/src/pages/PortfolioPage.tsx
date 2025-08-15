// src/pages/PortfolioPage.tsx
export default function PortfolioPage() {
    return (
        <div className="grid gap-6">
            <h1 className="text-2xl font-extrabold">포트폴리오</h1>
            <div
                className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 bg-white/60 dark:bg-neutral-950/60">
                <div className="text-neutral-500">보유/현금/세후/환율 반영 테이블은 서버 연동 시 붙입니다.</div>
            </div>
        </div>
    )
}
