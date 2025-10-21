import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export function DarkModeToggle() {
    const { colorMode, toggleColorMode } = useTheme();

    return (
        <button
            onClick={toggleColorMode}
            className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            aria-label="Toggle dark mode"
        >
            {colorMode === 'light' ? (
                <Moon className="w-5 h-5" />
            ) : (
                <Sun className="w-5 h-5" />
            )}
        </button>
    );
}