import { createContext, useContext, useState, ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
  colors: typeof darkColors;
}

const darkColors = {
  background: '#071325',
  surface: '#101c2e',
  surfaceHigh: '#1f2a3d',
  surfaceHighest: '#2a3548',
  card: '#b2c5ff',
  cardText: '#002b73',
  primary: '#b2c5ff',
  secondary: '#ffd65b',
  textPrimary: '#d7e3fc',
  textSecondary: '#8c90a1',
  textMuted: '#424655',
  border: '#1f2a3d',
  navBg: 'rgba(7,19,37,0.95)',
  error: '#ffb4ab',
};

const lightColors = {
  background: '#f0f4ff',
  surface: '#ffffff',
  surfaceHigh: '#e8eeff',
  surfaceHighest: '#dce4ff',
  card: '#1a3a8c',
  cardText: '#ffffff',
  primary: '#1a3a8c',
  secondary: '#c9a84c',
  textPrimary: '#0a1628',
  textSecondary: '#4a5568',
  textMuted: '#718096',
  border: '#cbd5e0',
  navBg: 'rgba(240,244,255,0.95)',
  error: '#e53e3e',
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
  isDark: true,
  colors: darkColors,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  function toggleTheme() {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }

  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark', colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}