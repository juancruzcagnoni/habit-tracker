import { supabase } from "@/lib/supabase";
import { useThemeToggle } from "@/lib/theme-context";
import { AppColors } from "@/lib/theme-helpers";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Componentes
import { HabitsList } from "../components/HabitsList";
import { HeaderCalendar } from "../components/HeaderCalendar";
import { SettingsModal } from "../components/SettingsModal";
import { WeekCalendar } from "../components/WeekCalendar";

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default function IndexScreen() {
  const [habits, setHabits] = useState<any[]>([]);
  const [completed, setCompleted] = useState<any[]>([]);
  const [exclusions, setExclusions] = useState<any[]>([]);
  const swipeableRefs = useRef<{ [key: string]: any }>({});
  const completedRefs = useRef<{ [key: string]: any }>({});
  const today = new Date();
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const { isDark, toggleTheme } = useThemeToggle();
  const colors = isDark ? AppColors.dark : AppColors.light;
  const { i18n, t } = useTranslation();
  const months = t("months", { returnObjects: true }) as string[];

  // Calendario
  const daysOfWeek = t("daysShort", { returnObjects: true }) as string[];
  const WEEK_DAYS_KEYS = ["S2", "M", "T", "W", "T2", "F", "S"];
  const selectedDayKey = WEEK_DAYS_KEYS[selectedDate.getDay()];
  const userDateStr = formatDate(selectedDate);

  // Fetch hábitos, completados y exclusiones
  const fetchHabits = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) return;
    const userId = userData.user.id;

    // Hábitos
    const { data, error } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", userId);

    // Completados
    const { data: completions } = await supabase
      .from("habit_completions")
      .select("*")
      .eq("user_id", userId)
      .eq("date", userDateStr);

    // Exclusiones
    const { data: exclusionData } = await supabase
      .from("habit_exclusions")
      .select("*")
      .eq("user_id", userId)
      .eq("date", userDateStr);

    setHabits(data || []);
    setCompleted(completions?.map((c: any) => c.habit_id) || []);
    setExclusions(exclusionData?.map((e: any) => e.habit_id) || []);
  };

  useFocusEffect(
    useCallback(() => {
      fetchHabits();
    }, [selectedDate])
  );

  const router = useRouter();

  // Eliminar hábito
  const handleDeleteHabit = (habitId: number, habitTitle: string) => {
    Alert.alert(
      t("deleteHabit"),
      t("deleteHabitPrompt", { habitTitle }),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("onlyToday"),
          style: "destructive",
          onPress: async () => {
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError || !userData?.user) return;
            const userId = userData.user.id;
            await supabase.from("habit_exclusions").insert([
              { habit_id: habitId, user_id: userId, date: userDateStr },
            ]);
            fetchHabits();
          },
        },
        {
          text: t("forAllDays"),
          style: "destructive",
          onPress: async () => {
            await supabase.from("habit_completions").delete().eq("habit_id", habitId);
            await supabase.from("habit_exclusions").delete().eq("habit_id", habitId);
            await supabase.from("habits").delete().eq("id", habitId);
            fetchHabits();
          },
        },
      ]
    );
  };

  // Marcar como completado
  const handleCompleteHabit = async (habitId: number) => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) return;
    const userId = userData.user.id;
    await supabase.from("habit_completions").insert([
      { habit_id: habitId, user_id: userId, date: userDateStr },
    ]);
    fetchHabits();
  };

  // Marcar como incompleto
  const handleUncompleteHabit = async (habitId: number) => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) return;
    const userId = userData.user.id;
    await supabase
      .from("habit_completions")
      .delete()
      .eq("habit_id", habitId)
      .eq("user_id", userId)
      .eq("date", userDateStr);
    fetchHabits();
  };

  // Semana actual de lunes a domingo
  function getWeekDaysMondayToSunday(date: Date) {
    const monday = new Date(date);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      return {
        date: day,
        dayLabel: daysOfWeek[day.getDay()],
        isToday: day.toDateString() === today.toDateString(),
        isSelected: day.toDateString() === selectedDate.toDateString(),
      };
    });
  }
  const weekDays = getWeekDaysMondayToSunday(selectedDate);

  // Separar hábitos visibles y completados
  const visibleHabits = habits.filter((habit) => {
    if (!habit.repeat_days || habit.repeat_days.length === 0) return true;
    return habit.repeat_days.includes(WEEK_DAYS_KEYS[selectedDate.getDay()]);
  }).filter((habit) => !exclusions.includes(habit.id));

  const incompleteHabits = visibleHabits.filter((habit) => !completed.includes(habit.id));
  const completedHabits = visibleHabits.filter((habit) => completed.includes(habit.id));

  // Cerrar sesión
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowSettings(false);
    router.replace("/auth");
  };

  const actionColors = {
    left: colors.error,
    right: colors.primary,
    uncomplete: "#FFB300",
  };

  const handleToggleLanguage = () => {
    const newLang = i18n.language === "es" ? "en" : "es";
    i18n.changeLanguage(newLang);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <HeaderCalendar
        month={months[selectedDate.getMonth()]}
        day={selectedDate.getDate()}
        onSettingsPress={() => setShowSettings(true)}
        t={t}
        colors={colors}
      />
      <WeekCalendar
        weekDays={weekDays}
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
        colors={colors}
        styles={styles}
      />
      <HabitsList
        incompleteHabits={incompleteHabits}
        completedHabits={completedHabits}
        swipeableRefs={swipeableRefs}
        completedRefs={completedRefs}
        actionColors={actionColors}
        handleDeleteHabit={handleDeleteHabit}
        handleCompleteHabit={handleCompleteHabit}
        handleUncompleteHabit={handleUncompleteHabit}
        styles={styles}
        colors={colors}
        t={t}
      />
      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        onLogout={handleLogout}
        onThemeToggle={toggleTheme}
        onLanguageToggle={handleToggleLanguage}
        isDark={isDark}
        i18n={i18n}
        colors={colors}
        t={t}
      />
    </View>
  );
}

// Sólo quedan los valores no de color en el StyleSheet
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  calendarContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 16,
    marginBottom: 16,
  },
  dayLabel: { fontSize: 14 },
  dayNumberContainer: {
    borderRadius: 15,
    paddingHorizontal: 6,
    paddingVertical: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dayNumber: { fontSize: 16, fontWeight: "600" },
  card: { marginBottom: 18, borderRadius: 18 },
  completedCard: {},
  completedTitle: { marginLeft: 8, marginBottom: 5, marginTop: 15, fontSize: 16, fontWeight: "bold" },
  cardContent: { padding: 16 },
  cardTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 4 },
  cardDescription: { fontSize: 15 },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center" },
  leftAction: {
    justifyContent: "center",
    alignItems: "flex-start",
    flex: 1,
    borderRadius: 18,
    marginBottom: 18,
    marginTop: 2,
    paddingLeft: 16,
  },
  rightAction: {
    justifyContent: "center",
    alignItems: "flex-end",
    flex: 1,
    borderRadius: 18,
    marginBottom: 18,
    marginTop: 2,
    paddingRight: 16,
  },
  uncompleteAction: {
    justifyContent: "center",
    alignItems: "flex-end",
    flex: 1,
    borderRadius: 18,
    marginBottom: 18,
    marginTop: 2,
    paddingRight: 16,
  },
});
