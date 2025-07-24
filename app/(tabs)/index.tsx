import { supabase } from "@/lib/supabase";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.titleBold}>Today, </Text>
          <Text style={styles.titleLight}>{formattedDate}</Text>
        </View>
        <Feather name="settings" size={24} color="black" />
      </View>

      <View style={styles.calendarContainer}>
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
                day.isSelected && { fontWeight: "bold", color: "coral" },
              ]}
            >
              {day.dayLabel}
            </Text>
            <Text
              style={[
                styles.dayNumber,
                day.isSelected && styles.selectedDayNumber,
              ]}
            >
              {day.date.getDate()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Incompletos */}
        {incompleteHabits.length === 0 && completedHabits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No habits found. Start by adding one!</Text>
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
                renderLeftActions={renderLeftActions}
                renderRightActions={renderRightActions}
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
                <Surface elevation={0} style={styles.card}>
                  <View style={styles.cardContent}>
                    <Text
                      style={[
                        styles.cardTitle,
                        { color: habit.color || "#22223B" },
                      ]}
                    >
                      {habit.title}
                    </Text>
                    <Text style={styles.cardDescription}>{habit.description}</Text>
                  </View>
                </Surface>
              </Swipeable>
            ))}

            {/* Completados */}
            {completedHabits.length > 0 && (
              <>
                <Text style={styles.completedTitle}>Completed</Text>
                {completedHabits.map((habit) => (
                  <Swipeable
                    key={habit.id}
                    ref={(ref: Swipeable | null) => {
                      completedRefs.current[habit.id] = ref;
                    }}
                    overshootLeft={false}
                    overshootRight={false}
                    renderLeftActions={renderLeftActions}
                    renderRightActions={() => (
                      <View style={styles.uncompleteAction}>
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
                      style={[styles.card, styles.completedCard]}
                    >
                      <View style={styles.cardContent}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <Text
                            style={[
                              styles.cardTitle,
                              {
                                color: "#5d5d5dff",
                                textDecorationLine: "line-through",
                                opacity: 0.6,
                              },
                            ]}
                          >
                            {habit.title}
                          </Text>
                        </View>
                        <Text style={[styles.cardDescription, { opacity: 0.6 }]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F5F5F5",
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
    color: "#000",
  },
  titleLight: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#666",
  },
  calendarContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
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
    color: "#666",
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  selectedDayNumber: {
    backgroundColor: "coral",
    color: "#fff",
    borderRadius: 15,
    overflow: "hidden",
    paddingHorizontal: 8,
    fontWeight: "bold",
  },
  card: {
    marginBottom: 18,
    borderRadius: 18,
    backgroundColor: "#fff",
  },
  completedCard: {
    backgroundColor: "#EEEEEE",
  },
  completedTitle: {
    marginLeft: 8,
    marginBottom: 5,
    marginTop: 15,
    fontSize: 16,
    color: "coral",
    fontWeight: "bold",
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#22223B",
  },
  cardDescription: {
    fontSize: 15,
    color: "#6C6C80",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    color: "#666666",
  },
  leftAction: {
    justifyContent: "center",
    alignItems: "flex-start",
    flex: 1,
    backgroundColor: "#E53935",
    borderRadius: 18,
    marginBottom: 18,
    marginTop: 2,
    paddingLeft: 16,
  },
  rightAction: {
    justifyContent: "center",
    alignItems: "flex-end",
    flex: 1,
    backgroundColor: "#3be535ff",
    borderRadius: 18,
    marginBottom: 18,
    marginTop: 2,
    paddingRight: 16,
  },
  uncompleteAction: {
    justifyContent: "center",
    alignItems: "flex-end",
    flex: 1,
    backgroundColor: "#FFB300",
    borderRadius: 18,
    marginBottom: 18,
    marginTop: 2,
    paddingRight: 16,
  },
});
