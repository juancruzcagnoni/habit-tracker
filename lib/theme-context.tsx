import React, { createContext, useContext, useMemo, useState } from "react";
import { Appearance } from "react-native";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";

const ThemeContext = createContext({
    isDark: false,
    toggleTheme: () => { },
    theme: MD3LightTheme,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemPref = Appearance.getColorScheme() === "dark";
    const [isDark, setIsDark] = useState(systemPref);

    const toggleTheme = () => setIsDark((d) => !d);

    const theme = useMemo(
        () => (isDark ? MD3DarkTheme : MD3LightTheme),
        [isDark]
    );

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme, theme }}>
            <PaperProvider theme={theme}>{children}</PaperProvider>
        </ThemeContext.Provider>
    );
}

export const useThemeToggle = () => useContext(ThemeContext);
