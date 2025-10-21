import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Theme } from "@shared/schema";
import { themeConfigs } from "@/lib/themes";

type ColorMode = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    colorMode: ColorMode;
    toggleColorMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => {
        const saved = localStorage.getItem("pomodoro-theme");
        return (saved as Theme) || "purple";
    });

    const [colorMode, setColorMode] = useState<ColorMode>(() => {
        const saved = localStorage.getItem("pomodoro-color-mode");
        return (saved as ColorMode) || "light";
    });

    useEffect(() => {
        const config = themeConfigs[theme];
        const root = document.documentElement;

        // Apply theme colors
        root.style.setProperty("--primary", config.primary);
        root.style.setProperty("--sidebar-primary", config.primary);
        root.style.setProperty("--ring", config.primary);
        root.style.setProperty("--sidebar-ring", config.primary);
        root.style.setProperty("--accent", config.accent);

        config.chartColors.forEach((color, index) => {
            root.style.setProperty(`--chart-${index + 1}`, color);
        });

        localStorage.setItem("pomodoro-theme", theme);
    }, [theme]);

    useEffect(() => {
        // Apply dark/light mode
        if (colorMode === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem("pomodoro-color-mode", colorMode);
    }, [colorMode]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    const toggleColorMode = () => {
        setColorMode(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, colorMode, toggleColorMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within ThemeProvider");
    }
    return context;
}