import { Feather } from "@expo/vector-icons";
import React from "react";
import { ScrollView, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Surface, Text } from "react-native-paper";

interface Habit {
    id: number;
    title: string;
    description: string;
    color?: string;
}

interface HabitsListProps {
    incompleteHabits: Habit[];
    completedHabits: Habit[];
    swipeableRefs: React.MutableRefObject<{ [key: string]: Swipeable | null }>;
    completedRefs: React.MutableRefObject<{ [key: string]: Swipeable | null }>;
    actionColors: any;
    handleDeleteHabit: (id: number, title: string) => void;
    handleCompleteHabit: (id: number) => void;
    handleUncompleteHabit: (id: number) => void;
    styles: any;
    colors: any;
    t: (key: string) => string;
}

export function HabitsList({
    incompleteHabits,
    completedHabits,
    swipeableRefs,
    completedRefs,
    actionColors,
    handleDeleteHabit,
    handleCompleteHabit,
    handleUncompleteHabit,
    styles,
    colors,
    t,
}: HabitsListProps) {
    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            {/* Incompletos */}
            {incompleteHabits.length === 0 && completedHabits.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                        {t("noHabits")}
                    </Text>
                </View>
            ) : (
                <>
                    {incompleteHabits.map((habit) => (
                        <Swipeable
                            key={habit.id}
                            ref={(ref) => {
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
                            <Text style={[styles.completedTitle, { color: colors.primary }]}>{t("completed")}</Text>
                            {completedHabits.map((habit) => (
                                <Swipeable
                                    key={habit.id}
                                    ref={(ref) => {
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
    );
}
