import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface Theme {
  name: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  gradient: string;
}

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (theme: Theme) => void;
  themes: Theme[];
}

const themes: Theme[] = [
  {
    name: 'Azul',
    primary: '#3B82F6',
    primaryLight: '#60A5FA',
    primaryDark: '#2563EB',
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    name: 'Verde',
    primary: '#10B981',
    primaryLight: '#34D399',
    primaryDark: '#059669',
    gradient: 'from-green-500 to-green-600'
  },
  {
    name: 'Naranja',
    primary: '#F59E0B',
    primaryLight: '#FBBF24',
    primaryDark: '#D97706',
    gradient: 'from-orange-500 to-orange-600'
  },
  {
    name: 'Rojo',
    primary: '#EF4444',
    primaryLight: '#F87171',
    primaryDark: '#DC2626',
    gradient: 'from-red-500 to-red-600'
  },
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return themes[0];
      }
    }
    return themes[0];
  });

  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify(currentTheme));

    const root = document.documentElement;
    root.style.setProperty('--color-primary', currentTheme.primary);
    root.style.setProperty('--color-primary-light', currentTheme.primaryLight);
    root.style.setProperty('--color-primary-dark', currentTheme.primaryDark);

    const styleId = 'dynamic-theme-styles';
    let styleTag = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }

    styleTag.textContent = `
      .theme-bg-gradient {
        background: linear-gradient(to bottom right, ${currentTheme.primary}, ${currentTheme.primaryDark});
      }

      .theme-bg-primary {
        background-color: ${currentTheme.primary};
      }

      .theme-text-primary {
        color: ${currentTheme.primary};
      }

      .theme-border-primary {
        border-color: ${currentTheme.primary};
      }

      .theme-hover-bg:hover {
        background-color: ${currentTheme.primary}20;
      }

      .theme-btn-primary {
        background: linear-gradient(to right, ${currentTheme.primary}, ${currentTheme.primaryDark});
      }

      .theme-btn-primary:hover {
        background: linear-gradient(to right, ${currentTheme.primaryDark}, ${currentTheme.primaryDark});
      }
    `;
  }, [currentTheme]);

  const setTheme = (theme: Theme) => {
    setCurrentTheme(theme);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};
