import { useMutation, useQuery } from 'convex/react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { api } from '../convex/_generated/api';

type ThemeMode = 'auto' | 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  colorScheme: ColorSchemeName;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
  const [colorScheme, setColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  const savedThemeMode = useQuery(api.mutations.getThemeMode);
  const saveThemeModeMutation = useMutation(api.mutations.saveThemeMode);

  useEffect(() => {
    if (savedThemeMode) {
      setThemeModeState(savedThemeMode);
    }
  }, [savedThemeMode]);

  useEffect(() => {
    const updateColorScheme = () => {
      if (themeMode === 'auto') {
        setColorScheme(Appearance.getColorScheme());
      } else {
        setColorScheme(themeMode);
      }
    };

    updateColorScheme();

    if (themeMode === 'auto') {
      const subscription = Appearance.addChangeListener(({ colorScheme }) => {
        setColorScheme(colorScheme);
      });
      return () => subscription?.remove();
    }
  }, [themeMode]);

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await saveThemeModeMutation({ themeMode: mode });
  };

  return (
    <ThemeContext.Provider value={{ themeMode, colorScheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Hook for backward compatibility
export function useColorScheme() {
  const { colorScheme } = useTheme();
  return colorScheme;
}