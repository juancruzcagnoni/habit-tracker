import { Feather } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
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
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", }}>
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <Text style={[styles.titleBold, { color: colors.text }]}>{t("today")}, </Text>
                    <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.textSecondary }}>
                        {month} {day}
                    </Text>
                </View>
            </View>
            <TouchableOpacity onPress={onSettingsPress}>
                <Feather name="settings" size={24} color={colors.text} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24
    },
    titleContainer: {
        flexDirection: "row",
        alignItems: "baseline",
    },
    titleBold: {
        fontSize: 26,
        fontWeight: "bold",
    },
});

