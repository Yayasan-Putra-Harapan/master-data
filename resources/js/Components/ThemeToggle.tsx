import { useEffect, useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme');
            if (saved) {
                return saved === 'dark';
            }
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const toggleTheme = () => {
        setIsDark((prev) => !prev);
    };

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 cursor-pointer"
            title={isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
        >
            {isDark ? (
                <Sun className="h-4 w-4 transition-transform rotate-0" />
            ) : (
                <Moon className="h-4 w-4 transition-transform rotate-0" />
            )}
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
