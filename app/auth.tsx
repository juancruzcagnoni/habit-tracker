import React from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View, Image } from "react-native";
import { Button, Text, TextInput, useTheme } from "react-native-paper";
import { supabase } from "../lib/supabase";
import { useRouter } from "expo-router";

export default function AuthScreen() {
    const [isSignUp, setIsSignUp] = React.useState<boolean>(false);
    const [email, setEmail] = React.useState<string>("");
    const [password, setPassword] = React.useState<string>("");
    const [error, setError] = React.useState<string | null>("");

    const theme = useTheme();
    const router = useRouter();

    const handleAuth = async () => {
        if (!email || !password) {
            setError("Please fill in all fields.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        setError(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({ email, password });

                if (error) {
                    setError(error.message);
                    return;
                }

                alert("Check your email to confirm your account.");
                router.replace("/");
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });

                if (error) {
                    setError(error.message);
                    return;
                }

                router.replace("/");
            }
        } catch (err: any) {
            setError("Something went wrong.");
            console.error(err);
        }
    };

    const handleSwitchMode = () => {
        setIsSignUp((prev) => !prev);
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={styles.content}>
                <Image
                    source={require("../assets/logos/logo-w.png")}
                    style={styles.logo}
                />


                <Text style={styles.title} variant="headlineMedium">
                    {isSignUp ? "Create account" : "Welcome back"}
                </Text>

                <TextInput
                    label="Email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="example@gmail.com"
                    style={styles.input}
                    mode="outlined"
                    activeOutlineColor="coral"
                    onChangeText={setEmail}
                    textColor="black"
                />

                <TextInput
                    label="Password"
                    autoCapitalize="none"
                    keyboardType="visible-password"
                    passwordRules="minlength: 6; required: true;"
                    secureTextEntry
                    placeholder="Your password"
                    style={styles.input}
                    mode="outlined"
                    activeOutlineColor="coral"
                    onChangeText={setPassword}
                    textColor="black"
                />

                {error && (
                    <Text style={{ color: theme.colors.error, marginBottom: 8, textAlign: "center" }}>
                        {error}
                    </Text>
                )}

                <Button
                    mode="contained"
                    buttonColor="coral"
                    onPress={handleAuth}
                    style={styles.button}
                    textColor="white"
                >
                    {isSignUp ? "Sign Up" : "Sign In"}
                </Button>

                <Button
                    mode="text"
                    onPress={() => {
                        handleSwitchMode();
                    }}
                    style={styles.switchModeButton}
                    labelStyle={{ color: 'coral' }}
                >
                    {isSignUp
                        ? "Already have an account? Sign In"
                        : "Don't have an account? Sign Up"}
                </Button>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    content: {
        flex: 1,
        padding: 16,
        justifyContent: "center",
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 48,
        alignSelf: "center",
    },
    title: {
        textAlign: "center",
        marginBottom: 24,
        color: "#000000"
    },
    input: {
        marginBottom: 16,
        backgroundColor: "white"
    },
    button: {
        marginTop: 8,
        backgroundColor: "coral",
    },
    switchModeButton: {
        marginTop: 16,
        color: "coral"
    },
});
