import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
    const { colorMode, toggleColorMode } = useTheme(); // Changed from theme, toggleTheme

    return (
        <button
            onClick={toggleColorMode}
            className="p-2 rounded-lg bg-orange-100 dark:bg-gray-700 hover:bg-orange-200 dark:hover:bg-gray-600 transition-colors"
            aria-label="Toggle theme"
        >
            {colorMode === 'light' ? (
                <Moon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            ) : (
                <Sun className="w-5 h-5 text-orange-400" />
            )}
        </button>
    );
};