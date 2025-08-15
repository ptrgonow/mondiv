import {useEffect, useState} from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem('theme') as Theme | null;
        return saved ?? 'system';
    });

    useEffect(() => {
        const root = document.documentElement;
        const apply = () => {
            const isDark = theme === 'dark' ||
                (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
            root.classList.toggle('dark', isDark);
            // 브라우저 폼/스크롤바 색감 일치
            (document.querySelector('meta[name="color-scheme"]') as HTMLMetaElement | null)?.setAttribute('content', isDark ? 'dark light' : 'light dark');
        };

        apply();

        let mql: MediaQueryList | null = null;
        if (theme === 'system') {
            mql = window.matchMedia('(prefers-color-scheme: dark)');
            const handler = () => apply();
            mql.addEventListener('change', handler);
            return () => mql?.removeEventListener('change', handler);
        }
    }, [theme]);

    const setAndPersist = (t: Theme) => {
        setTheme(t);
        if (t === 'system') localStorage.removeItem('theme');
        else localStorage.setItem('theme', t);
    };

    const toggle = () => setAndPersist(theme === 'dark' ? 'light' : 'dark');

    return {theme, setTheme: setAndPersist, toggle};
}
