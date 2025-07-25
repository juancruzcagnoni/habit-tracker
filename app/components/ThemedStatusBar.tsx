import { useThemeToggle } from "@/lib/theme-context";
import React from "react";
import { StatusBar } from "react-native";

export function ThemedStatusBar() {
  const { isDark, theme } = useThemeToggle();
  const barStyle = isDark ? "light-content" : "dark-content";
  const statusBarColor = theme.colors?.background || (isDark ? "#181825" : "#F5F5F5");

  return <StatusBar barStyle={barStyle} backgroundColor={statusBarColor} />;
}
