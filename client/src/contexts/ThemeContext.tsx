import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Theme } from "@shared/schema";
import { themeConfigs } from "@/lib/themes";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem("pomodoro-theme");
    return (saved as Theme) || "purple";
  });

  useEffect(() => {
    const config = themeConfigs[theme];
    const root = document.documentElement;
    
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

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
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
