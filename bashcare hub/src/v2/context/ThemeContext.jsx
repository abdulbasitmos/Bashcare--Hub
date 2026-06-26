import React, { createContext, useContext } from 'react';
import { useGlobalSettings } from '../../context/GlobalSettingsContext';

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const { theme, toggleTheme } = useGlobalSettings();

  const setTheme = () => {
    toggleTheme();
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
