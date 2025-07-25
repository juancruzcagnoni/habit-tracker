import { supabase } from "@/lib/supabase";
import { useThemeToggle } from "@/lib/theme-context";
import { AppColors } from "@/lib/theme-helpers";
import React from "react";
import { useTranslation } from "react-i18next"; // <--- IMPORTANTE
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AddHabitScreen() {
    const { t } = useTranslation(); // <--- IMPORTANTE
    const [title, setTitle] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [frequency, setFrequency] = React.useState("daily");
    const insets = useSafeAreaInsets();
    const [repeatDays, setRepeatDays] = React.useState<string[]>([]);
    const { isDark } = useThemeToggle();
    const colors = isDark ? AppColors.dark : AppColors.light;

    // Traducción de FREQUENCIES y WEEK_DAYS dinámicamente:
    const FREQUENCIES = [
        { value: "daily", label: t("daily") },
        { value: "weekly", label: t("weekly") },
        { value: "monthly", label: t("monthly") },
    ];
    const daysShort = t("daysShortAdd", { returnObjects: true }) as string[];
    const WEEK_DAYS = [
        { key: "M", label: daysShort[0] },
        { key: "T", label: daysShort[1] },
        { key: "W", label: daysShort[2] },
        { key: "T2", label: daysShort[3] },
        { key: "F", label: daysShort[4] },
        { key: "S", label: daysShort[5] },
        { key: "S2", label: daysShort[6] },
    ];

    const HABIT_COLORS = [
        "#FF5E5B", "#FFD452", "#38E68E", "#5BA8FF", "#9B6EFF", "#CFA46E", "#A0A0A0",
    ];

    const [color, setColor] = React.useState(HABIT_COLORS[0]);

    const toggleDay = (key: string) => {
        setRepeatDays((prev) =>
            prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]
        );
    };

    const handleSubmit = async () => {
        const { data: userData, error: userError } = await supabase.auth.getUser();

        if (userError || !userData?.user) {
            alert(t("mustBeLoggedIn"));
            return;
        }

        if (!title || !description) {
            alert(t("fillAllFields"));
            return;
        }

        const { error } = await supabase.from("habits").insert({
            title,
            description,
            frequency,
            color,
            repeat_days: repeatDays,
            user_id: userData.user.id,
        });

        if (error) {
            alert("Error adding habit: " + error.message);
        } else {
            alert(t("habitAdded"));
            setTitle("");
            setDescription("");
            setFrequency("daily");
        }
    };

    return (
        <View style={[
            styles.container,
            { paddingTop: insets.top, backgroundColor: colors.background }
        ]}>
            <View style={{ flex: 1 }}>
                <View style={styles.header}>
                    <View style={styles.titleContainer}>
                        <Text style={[styles.titleBold, { color: colors.text }]}>{t("createHabit")}</Text>
                    </View>
                </View>

                <TextInput
                    style={[styles.input, { backgroundColor: colors.surface }]}
                    label={t("title")}
                    value={title}
                    onChangeText={setTitle}
                    mode="outlined"
                    activeOutlineColor={colors.primary}
                    textColor={colors.text}
                    theme={{ colors: { background: colors.surface } }}
                />
                <TextInput
                    style={[styles.input, { backgroundColor: colors.surface }]}
                    label={t("description")}
                    value={description}
                    onChangeText={setDescription}
                    mode="outlined"
                    activeOutlineColor={colors.primary}
                    textColor={colors.text}
                    theme={{ colors: { background: colors.surface } }}
                />

                <View style={styles.colorsRow}>
                    {HABIT_COLORS.map((c) => (
                        <TouchableOpacity
                            key={c}
                            onPress={() => setColor(c)}
                            style={[
                                styles.colorCircle,
                                { backgroundColor: c, borderColor: color === c ? colors.primary : "transparent", borderWidth: color === c ? 2 : 0 }
                            ]}
                            activeOpacity={0.7}
                        >
                            {color === c && (
                                <Text style={styles.checkIcon}>✓</Text>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.repeatContainer}>
                    <Text style={[styles.repeatLabel, { color: colors.textSecondary }]}>{t("repeatDays")}</Text>
                    <View style={styles.repeatDaysRow}>
                        {WEEK_DAYS.map((day, idx) => (
                            <TouchableOpacity
                                key={day.key + idx}
                                onPress={() => toggleDay(day.key)}
                                style={[
                                    styles.repeatDayCircle,
                                    {
                                        backgroundColor: repeatDays.includes(day.key)
                                            ? colors.primary
                                            : colors.surface,
                                        borderColor: colors.border,
                                        borderWidth: 1,
                                    }
                                ]}
                                activeOpacity={0.7}
                            >
                                <Text
                                    style={[
                                        styles.repeatDayText,
                                        {
                                            color: repeatDays.includes(day.key)
                                                ? colors.onPrimary
                                                : colors.text,
                                        }
                                    ]}
                                >
                                    {day.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>

            <Button
                mode="contained"
                buttonColor={colors.primary}
                style={styles.button}
                onPress={handleSubmit}
                labelStyle={{ color: colors.onPrimary }}
            >
                {t("addHabit")}
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
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
    input: {
        marginBottom: 16,
    },
    colorsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
        marginTop: 8,
    },
    colorCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginHorizontal: 6,
        justifyContent: "center",
        alignItems: "center",
        elevation: 3,
        textAlign: "center",
        textAlignVertical: "center",
        fontSize: 22,
    },
    checkIcon: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
        textAlignVertical: "center",
    },
    repeatContainer: {
        marginBottom: 18,
    },
    repeatLabel: {
        fontSize: 15,
        marginBottom: 8,
        marginLeft: 6,
    },
    repeatDaysRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    repeatDayCircle: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: "center",
        justifyContent: "center",
    },
    repeatDayText: {
        fontWeight: "bold",
        fontSize: 16,
    },
    button: {
        marginBottom: 16,
    },
});
