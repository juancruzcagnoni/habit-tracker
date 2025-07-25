import { useThemeToggle } from "@/lib/theme-context";
import { AppColors } from "@/lib/theme-helpers";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";

export function AddHabitTabIcon({ color, size }) {
  const { isDark } = useThemeToggle();
  const colors = isDark ? AppColors.dark : AppColors.light;

  return (
    <View
      style={{
        backgroundColor: colors.primary,
        borderRadius: 14,
        padding: 12,
        alignItems: "center",
        justifyContent: "center",
        height: 52,
        width: 52,
        // Shadow
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 6,
      }}
    >
      <Feather name="plus" size={26} color={colors.onPrimary} />
    </View>
  );
}
