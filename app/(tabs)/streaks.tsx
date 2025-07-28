import { useHabits } from "@/lib/habits-context";
import { useThemeToggle } from "@/lib/theme-context";
import { AppColors } from "@/lib/theme-helpers";
import React from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HabitGrid from "../components/HabitGrid";

const DOT_SIZE = 18;
const GAP = 6;
const ROWS = 4;

function getColumns() {
  const screenWidth = Dimensions.get("window").width;
  const horizontalPadding = 32 + 4 * 2;
  return Math.floor((screenWidth - horizontalPadding + GAP) / (DOT_SIZE + GAP));
}

function getLastNDates(n: number) {
  const arr: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    arr.push(d.toISOString().slice(0, 10));
  }
  return arr;
}

export default function StreaksScreen() {
  const { completions, habits } = useHabits(); // ✅ usar contexto
  const { isDark } = useThemeToggle();
  const colors = isDark ? AppColors.dark : AppColors.light;
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const columns = getColumns();
  const totalDots = columns * ROWS;
  const lastNDates = getLastNDates(totalDots);

  return (
    <ScrollView
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: colors.background }
      ]}
      contentContainerStyle={{ paddingBottom: 32 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false} 
    >
      <View style={{ marginBottom: 16 }}>
        <Text style={{
          fontSize: 26, fontWeight: "bold", color: colors.text
        }}>
          {t("streaksTitle", "Habit Streaks")}
        </Text>
      </View>

      {habits.map((habit) => {
        const days = lastNDates.map((date) =>
          completions.some(
            (c) => c.habit_id === habit.id && c.date === date
          )
        );
        return (
          <View key={habit.id} style={[styles.habitRow, { backgroundColor: colors.surface }]}>
            <Text style={[styles.habitTitle, { color: colors.text }]}>{habit.title}</Text>
            <HabitGrid color={habit.color} days={days} columns={columns} rows={ROWS} size={DOT_SIZE} />
          </View>
        );
      })}

      {habits.length === 0 && (
        <View style={{ alignItems: "center", marginTop: 32 }}>
          <Text style={{ color: colors.textSecondary }}>{t("No habits found")}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  habitRow: {
    borderRadius: 16,
    marginBottom: 18,
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
    alignItems: "flex-start",
  },
  habitTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
