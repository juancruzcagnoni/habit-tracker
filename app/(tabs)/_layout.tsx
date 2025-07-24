import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: "coral",
      tabBarInactiveTintColor: "gray",
      headerShadowVisible: false,
      headerStyle: { backgroundColor: "f5f5f5" },
      tabBarStyle: {
        backgroundColor: "f5f5f5",
        borderTopWidth: 0,
        elevation: 0,
        shadowOpacity: 0,
        height: 85,
      },
    }}>
      < Tabs.Screen
        name="index"
        options={{
          title: "Today's Habits",
          tabBarIcon: ({ color }) => (
            <Feather name="calendar" size={24} color={color} />
          ),
          headerShown: false
        }}
      />

      < Tabs.Screen
        name="streaks"
        options={{
          title: "Streaks",
          tabBarIcon: ({ color }) => (
            <Feather name="bar-chart-2" size={24} color={color} />
          ),
          headerShown: false
        }}
      />

      < Tabs.Screen
        name="add-habit"
        options={{
          title: "Add Habit",
          tabBarIcon: ({ color }) => (
            <Feather name="plus-circle" size={24} color={color} />
          ),
          headerShown: false
        }}
      />

      < Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Feather name="user" size={24} color={color} />
          ),
          headerShown: false
        }}
      />
    </Tabs>
  );
}
