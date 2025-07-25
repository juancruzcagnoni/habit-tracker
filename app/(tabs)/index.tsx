import { supabase } from "@/lib/supabase";
import { useThemeToggle } from "@/lib/theme-context";
import { AppColors } from "@/lib/themeHelpers";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { Alert, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Surface, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Función para formatear fecha a YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default function IndexScreen() {
  const [habits, setHabits] = useState<any[]>([]);
  const [completed, setCompleted] = useState<any[]>([]);
  const [exclusions, setExclusions] = useState<any[]>([]);
  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});
  const completedRefs = useRef<{ [key: string]: Swipeable | null }>({});
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { month: "long", day: "numeric" };
  const formattedDate = today.toLocaleDateString("en-US", options);
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const { isDark, toggleTheme } = useThemeToggle();
  const colors = isDark ? AppColors.dark : AppColors.light;

  // Calendario
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const WEEK_DAYS_KEYS = ["S2", "M", "T", "W", "T2", "F", "S"];
  const selectedDayKey = WEEK_DAYS_KEYS[selectedDate.getDay()];
  const userDateStr = formatDate(selectedDate);

  // Cargar hábitos, completados y exclusiones
  const fetchHabits = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      console.error("No user logged in", userError?.message);
      return;
    }
    const userId = userData.user.id;

    // Hábitos
    const { data, error } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", userId);

    // Completados
    const { data: completions, error: error2 } = await supabase
      .from("habit_completions")
      .select("*")
      .eq("user_id", userId)
      .eq("date", userDateStr);

    // Exclusiones
    const { data: exclusionData, error: error3 } = await supabase
      .from("habit_exclusions")
      .select("*")
      .eq("user_id", userId)
      .eq("date", userDateStr);

    if (error) {
      console.error("Error fetching habits:", error.message);
    } else {
      setHabits(data || []);
    }
    if (error2) {
      console.error("Error fetching completions:", error2.message);
    } else {
      setCompleted(completions?.map((c: any) => c.habit_id) || []);
    }
    if (error3) {
      console.error("Error fetching exclusions:", error3.message);
    } else {
      setExclusions(exclusionData?.map((e: any) => e.habit_id) || []);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHabits();
    }, [selectedDate])
  );

  const router = useRouter();

  // Eliminar
  const handleDeleteHabit = (habitId: number, habitTitle: string) => {
    Alert.alert(
      "Delete Habit",
      `Do you want to delete "${habitTitle}" just for today or for all days?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Only for today",
          style: "destructive",
          onPress: async () => {
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError || !userData?.user) {
              alert("You must be logged in.");
              return;
            }
            const userId = userData.user.id;
            // Inserta exclusión para ese día/hábito/usuario
            const { error } = await supabase
              .from("habit_exclusions")
              .insert([
                {
                  habit_id: habitId,
                  user_id: userId,
                  date: userDateStr,
                },
              ]);
            if (error) {
              alert("Error excluding for today: " + error.message);
            }
            fetchHabits();
          },
        },
        {
          text: "For all days",
          style: "destructive",
          onPress: async () => {
            // Borra completions
            await supabase
              .from("habit_completions")
              .delete()
              .eq("habit_id", habitId);
            // Borra exclusiones
            await supabase
              .from("habit_exclusions")
              .delete()
              .eq("habit_id", habitId);
            // Borra el hábito
            const { error } = await supabase
              .from("habits")
              .delete()
              .eq("id", habitId);
            if (error) {
              alert("Error deleting habit: " + error.message);
            }
            fetchHabits();
          },
        },
      ]
    );
  };

  // Marcar como completado
  const handleCompleteHabit = async (habitId: number) => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      alert("You must be logged in.");
      return;
    }
    const userId = userData.user.id;

    const { error } = await supabase
      .from("habit_completions")
      .insert([
        {
          habit_id: habitId,
          user_id: userId,
          date: userDateStr,
        },
      ]);

    if (error) {
      alert("Error marking habit as completed: " + error.message);
    }
    fetchHabits();
  };

  // Marcar como incompleto (eliminar completion)
  const handleUncompleteHabit = async (habitId: number) => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      alert("You must be logged in.");
      return;
    }
    const userId = userData.user.id;

    // Elimina solo la completion de ese día y ese hábito
    const { error } = await supabase
      .from("habit_completions")
      .delete()
      .eq("habit_id", habitId)
      .eq("user_id", userId)
      .eq("date", userDateStr);

    if (error) {
      alert("Error marking habit as incomplete: " + error.message);
    }
    fetchHabits();
  };

  const renderLeftActions = () => (
    <View style={styles.leftAction}>
      <Feather name="trash-2" size={28} color="#FFF" />
    </View>
  );

  const renderRightActions = () => (
    <View style={styles.rightAction}>
      <Feather name="check-circle" size={28} color="#FFF" />
    </View>
  );

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
    return habit.repeat_days.includes(selectedDayKey);
  }).filter((habit) => !exclusions.includes(habit.id)); // Excluir los de ese día

  const incompleteHabits = visibleHabits.filter((habit) => !completed.includes(habit.id));
  const completedHabits = visibleHabits.filter((habit) => completed.includes(habit.id));

  // Cerrar sesión
  const handleLogout = async () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro de que querés cerrar sesión?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Cerrar sesión",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
              Alert.alert("Error", "Hubo un problema al cerrar sesión.");
            } else {
              setShowSettings(false);
              router.replace("/auth");
            }
          },
        },
      ]
    );
  };

  const actionColors = {
    left: colors.error,
    right: colors.primary,
    uncomplete: "#FFB300",
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.titleBold, { color: colors.text }]}>Today, </Text>
          <Text style={[styles.titleLight, { color: colors.textSecondary }]}>{formattedDate}</Text>
        </View>
        <TouchableOpacity onPress={() => setShowSettings(true)}>
          <Feather name="settings" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={[styles.calendarContainer, { backgroundColor: colors.surface }]}>
        {weekDays.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={{ alignItems: "center", flex: 1 }}
            onPress={() => setSelectedDate(day.date)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.dayLabel,
                { color: colors.textSecondary },
                day.isSelected && { fontWeight: "bold", color: colors.primary },
              ]}
            >
              {day.dayLabel}
            </Text>
            <View
              style={[
                styles.dayNumberContainer,
                day.isSelected && { backgroundColor: colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.dayNumber,
                  { color: day.isSelected ? colors.onPrimary : colors.text },
                ]}
              >
                {day.date.getDate()}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Incompletos */}
        {incompleteHabits.length === 0 && completedHabits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              No habits found. Start by adding one!
            </Text>
          </View>
        ) : (
          <>
            {incompleteHabits.map((habit) => (
              <Swipeable
                key={habit.id}
                ref={(ref: Swipeable | null) => {
                  swipeableRefs.current[habit.id] = ref;
                }}
                overshootLeft={false}
                overshootRight={false}
                renderLeftActions={() => (
                  <View style={[styles.leftAction, { backgroundColor: actionColors.left }]}>
                    <Feather name="trash-2" size={28} color="#FFF" />
                  </View>
                )}
                renderRightActions={() => (
                  <View style={[styles.rightAction, { backgroundColor: actionColors.right }]}>
                    <Feather name="check-circle" size={28} color="#FFF" />
                  </View>
                )}
                onSwipeableWillOpen={(direction) => {
                  if (direction === "left") {
                    handleDeleteHabit(habit.id, habit.title);
                    swipeableRefs.current[habit.id]?.close();
                  }
                  if (direction === "right") {
                    handleCompleteHabit(habit.id);
                    swipeableRefs.current[habit.id]?.close();
                  }
                }}
              >
                <Surface elevation={0} style={[styles.card, { backgroundColor: colors.card }]}>
                  <View style={styles.cardContent}>
                    <Text
                      style={[
                        styles.cardTitle,
                        { color: habit.color || colors.text },
                      ]}
                    >
                      {habit.title}
                    </Text>
                    <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
                      {habit.description}
                    </Text>
                  </View>
                </Surface>
              </Swipeable>
            ))}

            {/* Completados */}
            {completedHabits.length > 0 && (
              <>
                <Text style={[styles.completedTitle, { color: colors.primary }]}>Completed</Text>
                {completedHabits.map((habit) => (
                  <Swipeable
                    key={habit.id}
                    ref={(ref: Swipeable | null) => {
                      completedRefs.current[habit.id] = ref;
                    }}
                    overshootLeft={false}
                    overshootRight={false}
                    renderLeftActions={() => (
                      <View style={[styles.leftAction, { backgroundColor: actionColors.left }]}>
                        <Feather name="trash-2" size={28} color="#FFF" />
                      </View>
                    )}
                    renderRightActions={() => (
                      <View style={[styles.uncompleteAction, { backgroundColor: actionColors.uncomplete }]}>
                        <Feather name="rotate-ccw" size={28} color="#FFF" />
                      </View>
                    )}
                    onSwipeableWillOpen={(direction) => {
                      if (direction === "left") {
                        handleDeleteHabit(habit.id, habit.title);
                        completedRefs.current[habit.id]?.close();
                      }
                      if (direction === "right") {
                        handleUncompleteHabit(habit.id);
                        completedRefs.current[habit.id]?.close();
                      }
                    }}
                  >
                    <Surface
                      elevation={0}
                      style={[styles.card, styles.completedCard, { backgroundColor: colors.cardCompleted }]}
                    >
                      <View style={styles.cardContent}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <Text
                            style={[
                              styles.cardTitle,
                              {
                                color: colors.textSecondary,
                                textDecorationLine: "line-through",
                                opacity: 0.6,
                              },
                            ]}
                          >
                            {habit.title}
                          </Text>
                        </View>
                        <Text style={[styles.cardDescription, { opacity: 0.6, color: colors.textSecondary }]}>
                          {habit.description}
                        </Text>
                      </View>
                    </Surface>
                  </Swipeable>
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>

      <Modal
        visible={showSettings}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSettings(false)}
      >
        <TouchableOpacity style={styles.modalBackdrop} onPress={() => setShowSettings(false)} activeOpacity={1}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Settings</Text>
            <TouchableOpacity style={styles.modalOption} onPress={handleLogout}>
              <Feather name="log-out" size={20} color={colors.error} />
              <Text style={[styles.modalOptionText, { color: colors.text }]}>Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={toggleTheme}>
              <Feather name={isDark ? "sun" : "moon"} size={20} color={colors.text} />
              <Text style={[styles.modalOptionText, { color: colors.text }]}>
                Tema: {isDark ? "Claro" : "Oscuro"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption}>
              <Feather name="trash-2" size={20} color={colors.error} />
              <Text style={[styles.modalOptionText, { color: colors.text }]}>Delete Account</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption}>
              <Feather name="globe" size={20} color={colors.text} />
              <Text style={[styles.modalOptionText, { color: colors.text }]}>Language: Español</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// Sólo quedan los valores no de color en el StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  titleBold: {
    fontSize: 26,
    fontWeight: "bold",
  },
  titleLight: {
    fontSize: 20,
    fontWeight: "bold",
  },
  calendarContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 16,
    marginBottom: 16,
  },
  dayContainer: {
    alignItems: "center",
    padding: 6,
    borderRadius: 12,
    width: 42,
  },
  dayLabel: {
    fontSize: 14,
  },
  dayNumberContainer: {
    borderRadius: 15,
    paddingHorizontal: 6,
    paddingVertical: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: "600",
  },
  card: {
    marginBottom: 18,
    borderRadius: 18,
  },
  completedCard: {
  },
  completedTitle: {
    marginLeft: 8,
    marginBottom: 5,
    marginTop: 15,
    fontSize: 16,
    fontWeight: "bold",
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 15,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
  },
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
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    padding: 24,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    minHeight: 260,
    // Sombras para iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    // Sombra para Android
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 14,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  modalOptionText: {
    fontSize: 16,
  },
});