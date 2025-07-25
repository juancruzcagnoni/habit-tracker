import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";

interface Day {
    date: Date;
    dayLabel: string;
    isToday: boolean;
    isSelected: boolean;
}
interface WeekCalendarProps {
    weekDays: Day[];
    selectedDate: Date;
    onSelect: (date: Date) => void;
    colors: any;
    styles: any;
}

export function WeekCalendar({ weekDays, selectedDate, onSelect, colors, styles }: WeekCalendarProps) {
    return (
        <View style={[styles.calendarContainer, { backgroundColor: colors.surface }]}>
            {weekDays.map((day, index) => (
                <TouchableOpacity
                    key={index}
                    style={{ alignItems: "center", flex: 1 }}
                    onPress={() => onSelect(day.date)}
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
    );
}
