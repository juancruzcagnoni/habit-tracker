import { Feather } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";

interface HeaderCalendarProps {
    month: string;
    day: number;
    onSettingsPress: () => void;
    t: (key: string) => string;
    colors: any;
}

export function HeaderCalendar({ month, day, onSettingsPress, t, colors }: HeaderCalendarProps) {
    return (
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                <Text style={{ fontSize: 26, fontWeight: "bold", color: colors.text }}>{t("today")}, </Text>
                <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.textSecondary }}>
                    {month} {day}
                </Text>
            </View>
            <TouchableOpacity onPress={onSettingsPress}>
                <Feather name="settings" size={24} color={colors.text} />
            </TouchableOpacity>
        </View>
    );
}
