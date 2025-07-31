import React, { useState, useEffect } from "react";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, router } from "expo-router"; // Add router import here
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/context/AuthContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import { ThemeProvider as CustomThemeProvider } from "@/context/ThemeContext";
import SplashScreen from "@/components/SplashScreen";
import OnboardingScreen from "@/components/OnboardingScreen";
import * as ExpoSplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Prevent the splash screen from auto-hiding before asset loading is complete.
ExpoSplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true); // Always true for testing
  const [appIsReady, setAppIsReady] = useState(false);
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      ExpoSplashScreen.hideAsync();
    }
  }, [appIsReady]);

  // COMMENT OUT the onboarding check for testing:
  // useEffect(() => {
  //   async function checkOnboarding() {
  //     const hasSeenOnboarding = await AsyncStorage.getItem("hasSeenOnboarding");
  //     if (!hasSeenOnboarding) {
  //       setShowOnboarding(true);
  //     }
  //   }
  //   checkOnboarding();
  // }, []);

  // Show custom splash screen
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // Show onboarding screen (always for testing)
  if (showOnboarding) {
    return (
      <OnboardingScreen
        onFinish={() => {
          setShowOnboarding(false);
          // Navigate to auth after onboarding
          router.replace("/(auth)/signup");
        }}
      />
    );
  }

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={styles.container}>
      <AuthProvider>
        <StatusBar style="dark" />
        <CustomThemeProvider>
          <ThemeProvider value={DefaultTheme}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="welcome" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
            </Stack>
          </ThemeProvider>
        </CustomThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
