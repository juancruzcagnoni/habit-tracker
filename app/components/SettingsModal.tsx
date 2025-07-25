import { Feather } from "@expo/vector-icons";
import React from "react";
import { Modal, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";

interface SettingsModalProps {
    visible: boolean;
    onClose: () => void;
    onLogout: () => void;
    onThemeToggle: () => void;
    onLanguageToggle: () => void;
    isDark: boolean;
    i18n: any;
    colors: any;
    t: (key: string) => string;
}

export function SettingsModal({
    visible,
    onClose,
    onLogout,
    onThemeToggle,
    onLanguageToggle,
    isDark,
    i18n,
    colors,
    t,
}: SettingsModalProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableOpacity style={{ flex: 1, justifyContent: "flex-end" }} onPress={onClose} activeOpacity={1}>
                <View style={{
                    padding: 24,
                    borderTopLeftRadius: 18,
                    borderTopRightRadius: 18,
                    minHeight: 260,
                    backgroundColor: colors.surface,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.15,
                    shadowRadius: 20,
                    elevation: 8,
                }}>
                    <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 14, color: colors.text }}>
                        {t("settings")}
                    </Text>
                    <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", paddingVertical: 14, gap: 12 }} onPress={onLogout}>
                        <Feather name="log-out" size={20} color={colors.error} />
                        <Text style={{ fontSize: 16, color: colors.text }}>{t("logout")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", paddingVertical: 14, gap: 12 }} onPress={onThemeToggle}>
                        <Feather name={isDark ? "sun" : "moon"} size={20} color={colors.text} />
                        <Text style={{ fontSize: 16, color: colors.text }}>
                            {t("theme")}: {isDark ? t("light") : t("dark")}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", paddingVertical: 14, gap: 12 }} onPress={onLanguageToggle}>
                        <Feather name="globe" size={20} color={colors.text} />
                        <Text style={{ fontSize: 16, color: colors.text }}>
                            {t("language")}: {i18n.language === "es" ? "Español" : "English"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}
