import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useColorScheme, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DARK_COLORS, LIGHT_COLORS } from '../constants/theme';

type ThemeType = 'dark' | 'light';

interface ThemeContextValue {
  theme: ThemeType;
  toggleTheme: () => void;
  colors: typeof DARK_COLORS;
  isDark: boolean;
  themeAnim: Animated.Value;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => {},
  colors: DARK_COLORS,
  isDark: true,
  themeAnim: new Animated.Value(0),
});

const STORAGE_KEY = 'albank-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeType>('dark');
  const themeAnim = useRef(new Animated.Value(theme === 'dark' ? 0 : 1)).current;

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'dark' || saved === 'light') {
        setTheme(saved);
        themeAnim.setValue(saved === 'dark' ? 0 : 1);
      } else if (systemScheme) {
        setTheme(systemScheme === 'light' ? 'light' : 'dark');
        themeAnim.setValue(systemScheme === 'light' ? 1 : 0);
      }
    });
  }, []);

  const toggleTheme = () => {
    const next: ThemeType = theme === 'dark' ? 'light' : 'dark';
    Animated.timing(themeAnim, {
      toValue: next === 'dark' ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    setTheme(next);
    AsyncStorage.setItem(STORAGE_KEY, next);
  };

  const colors = theme === 'dark' ? DARK_COLORS : LIGHT_COLORS;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors, isDark: theme === 'dark', themeAnim }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
