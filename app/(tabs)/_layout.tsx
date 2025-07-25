import { useThemeToggle } from "@/lib/theme-context";
import { AppColors } from "@/lib/themeHelpers";
import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { AddHabitTabIcon } from "../components/CustomTabBarIcon";

export default function TabsLayout() {
  const { isDark } = useThemeToggle();
  const colors = isDark ? AppColors.dark : AppColors.light;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 85,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today's Habits",
          tabBarIcon: ({ color }) => (
            <Feather name="calendar" size={24} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="add-habit"
        options={{
          tabBarLabel: () => null, 
          tabBarIcon: (props) => <AddHabitTabIcon {...props} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="streaks"
        options={{
          title: "Streaks",
          tabBarIcon: ({ color }) => (
            <Feather name="bar-chart-2" size={24} color={color} />
          ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
