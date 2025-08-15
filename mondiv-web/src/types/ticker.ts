export type DividendFrequency =
    | 'weekly' | 'monthly' | 'quarterly' | 'semiannual' | 'annual' | 'irregular'

export type AmountPoint = { date: string; amount: number };

export type TickerInfo = {
    symbol: string; name: string; price: number;
    forwardYieldPct: number; currency: 'USD' | 'KRW';
};

export type DividendEvent = {
    exDate: string; payDate?: string; amount: number; currency: 'USD' | 'KRW';
};

export type TickerSnapshot = {
    info: TickerInfo;
    series: AmountPoint[];
    dividends?: DividendEvent[];
    frequency: DividendFrequency;
    timezone?: string;
};
