import { ThemeProvider } from "@/lib/theme-context";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../lib/auth-context";
import { supabase } from "../lib/supabase";
import { ThemedStatusBar } from "./components/ThemedStatusBar";

function RouteGuard({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (error) {
          console.error("Error checking auth:", error.message);
          setIsAuthenticated(false);
          setIsLoading(false);
          setTimeout(() => router.replace("/auth"), 0);
          return;
        }

        setIsAuthenticated(!!session);
        setIsLoading(false);

        if (!session) {
          setTimeout(() => router.replace("/auth"), 0);
        }
      } catch (error) {
        console.error("Error:", error);
        setIsAuthenticated(false);
        setIsLoading(false);
        setTimeout(() => router.replace("/auth"), 0);
      }
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (!session) {
        setTimeout(() => router.replace("/auth"), 0);
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (

    <GestureHandlerRootView style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{ flex: 1 }}>
          <AuthProvider>
            <ThemeProvider>
              <SafeAreaProvider>
                <RouteGuard>
                  <ThemedStatusBar />
                  <Stack>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="auth" options={{ headerShown: false }} />
                  </Stack>
                </RouteGuard>
              </SafeAreaProvider>
            </ThemeProvider>
          </AuthProvider>
        </View>
      </TouchableWithoutFeedback>
    </GestureHandlerRootView>
  );
}
