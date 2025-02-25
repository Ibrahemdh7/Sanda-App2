import { createContext } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  colors: {
    primary: string;
    background: string;
    text: string;
  };
}

export const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
  colors: {
    primary: '#007AFF',
    background: '#FFFFFF',
    text: '#000000',
  },
});
