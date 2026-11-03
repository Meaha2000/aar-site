import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('aar_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return 'dark';
  });

  const [sakuraEnabled, setSakuraEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('aar_sakura');
      if (saved !== null) return saved === 'true';
    } catch {}
    return true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('aar_theme', theme);
    } catch {}
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem('aar_sakura', String(sakuraEnabled));
    } catch {}
  }, [sakuraEnabled]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleSakura = () => {
    setSakuraEnabled((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, sakuraEnabled, toggleSakura, setSakuraEnabled }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
