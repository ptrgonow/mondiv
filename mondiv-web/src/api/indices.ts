export type IndexItem = {
    symbol: string
    name: string
    price: number
    change: number
    changePct: number  // %
    currency: 'USD' | 'KRW'
}

export async function fetchIndexTape(): Promise<IndexItem[]> {
    // 네트워크 느낌
    await new Promise(r => setTimeout(r, 200))
    return [
        {symbol: '^GSPC', name: 'S&P 500', price: 5665.8, change: +12.4, changePct: +0.22, currency: 'USD'},
        {symbol: '^IXIC', name: 'NASDAQ', price: 17888.1, change: -65.2, changePct: -0.36, currency: 'USD'},
        {symbol: '^DJI', name: 'Dow Jones', price: 40210.4, change: +45.7, changePct: +0.11, currency: 'USD'},
        {symbol: '^VIX', name: 'VIX', price: 12.84, change: -0.15, changePct: -1.16, currency: 'USD'},
        {symbol: '^KS11', name: 'KOSPI', price: 2777.3, change: +8.9, changePct: +0.32, currency: 'KRW'},
        {symbol: 'USDKRW', name: 'USD/KRW', price: 1365.2, change: -1.8, changePct: -0.13, currency: 'KRW'},
    ]
}
