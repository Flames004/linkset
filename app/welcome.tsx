// app/index.tsx
import React, { useContext, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
  ScrollView,
  Image,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import { Redirect, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const { user, loading } = useContext(AuthContext);
  const { theme, isDark } = useTheme();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Start pulse animation for logo
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  // Loading state
  if (loading) {
    return (
      <LinearGradient
        colors={isDark ? ["#000000", "#1C1C1E"] : ["#FAFAFA", "#F2F2F7"]}
        style={styles.loadingContainer}
      >
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor="transparent"
          translucent
        />
        <Animated.View
          style={[
            styles.loadingLogo,
            {
              backgroundColor: theme.colors.primary + "20",
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Ionicons name="link" size={32} color={theme.colors.primary} />
        </Animated.View>
        <Text
          style={[styles.loadingText, { color: theme.colors.textSecondary }]}
        >
          Loading LinkSet...
        </Text>
      </LinearGradient>
    );
  }

  // Redirect authenticated users
  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  const handleGetStarted = () => {
    router.push("/(auth)/signup");
  };

  const handleSignIn = () => {
    router.push("/(auth)/login");
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      <LinearGradient
        colors={
          isDark
            ? ["#1a1a2e", "#16213e", "#0f3460"]
            : ["#667eea", "#764ba2", "#f093fb"]
        }
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Floating Elements */}
        <View style={styles.floatingElements}>
          {[...Array(8)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.floatingDot,
                {
                  opacity: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.3],
                  }),
                  transform: [
                    {
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 50],
                        outputRange: [0, (i % 3) * 30 - 30],
                      }),
                    },
                    {
                      translateX: slideAnim.interpolate({
                        inputRange: [0, 50],
                        outputRange: [0, (i % 2) * 20 - 10],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <Animated.View
            style={[
              styles.heroSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.logoContainer,
                {
                  transform: [
                    { scale: Animated.multiply(scaleAnim, pulseAnim) },
                  ],
                },
              ]}
            >
              <Image
                source={require("@/assets/images/welcome-hero2.png")}
                style={{ width: 250, height: 250 }}
                resizeMode="contain"
              />
              {/* <LinearGradient
                colors={['#ffffff', '#f8f9fa']}
                style={styles.logoGradient}
              >
                <Ionicons name="link" size={56} color="#667eea" />
              </LinearGradient> */}
            </Animated.View>

            <Text style={styles.welcomeText}>Welcome to</Text>
            <Text style={styles.appName}>LinkSet</Text>
            <Text style={styles.tagline}>
              Your digital life, beautifully organized
            </Text>
          </Animated.View>

          {/* Features Showcase */}
          <Animated.View
            style={[
              styles.featuresSection,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 50],
                      outputRange: [0, 30],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.featuresTitle}>
              Everything you need to stay organized
            </Text>

            <View style={styles.featureCards}>
              <FeatureCard
                icon="bookmark"
                title="Save Instantly"
                description="Capture important links in seconds"
                delay={200}
                fadeAnim={fadeAnim}
              />
              <FeatureCard
                icon="color-palette"
                title="Organize Beautifully"
                description="Custom categories with colors & icons"
                delay={400}
                fadeAnim={fadeAnim}
              />
              <FeatureCard
                icon="sync"
                title="Access Anywhere"
                description="Sync across all your devices"
                delay={600}
                fadeAnim={fadeAnim}
              />
            </View>
          </Animated.View>

          {/* Benefits Section */}
          <Animated.View
            style={[
              styles.benefitsSection,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 50],
                      outputRange: [0, 40],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={24} color="#4ade80" />
              <Text style={styles.benefitText}>Free forever</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={24} color="#4ade80" />
              <Text style={styles.benefitText}>No ads, ever</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={24} color="#4ade80" />
              <Text style={styles.benefitText}>Privacy focused</Text>
            </View>
          </Animated.View>

          {/* Call to Action */}
          <Animated.View
            style={[
              styles.ctaSection,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 50],
                      outputRange: [0, 50],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity
              onPress={handleGetStarted}
              style={styles.primaryButton}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={["#ffffff", "#f8f9fa"]}
                style={styles.buttonGradient}
              >
                <Text style={styles.primaryButtonText}>Get Started Free</Text>
                <Ionicons name="arrow-forward" size={20} color="#667eea" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSignIn}
              style={styles.secondaryButton}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>
                Already have an account? Sign in
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Footer */}
          <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
            <Text style={styles.footerText}>
              Join thousands of users organizing their digital life
            </Text>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

// Feature Card Component
const FeatureCard = ({ icon, title, description, delay, fadeAnim }: any) => (
  <Animated.View
    style={[
      styles.featureCard,
      {
        opacity: fadeAnim,
        transform: [
          {
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [30, 0],
            }),
          },
        ],
      },
    ]}
  >
    <View style={styles.featureCardIcon}>
      <Ionicons name={icon} size={28} color="#667eea" />
    </View>
    <Text style={styles.featureCardTitle}>{title}</Text>
    <Text style={styles.featureCardDescription}>{description}</Text>
  </Animated.View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "500",
  },
  gradient: {
    flex: 1,
  },
  floatingElements: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingDot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 60,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "400",
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 8,
  },
  appName: {
    fontSize: 48,
    fontWeight: "900",
    color: "white",
    letterSpacing: -2,
    marginBottom: 16,
  },
  tagline: {
    fontSize: 18,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  featuresSection: {
    marginBottom: 50,
  },
  featuresTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 30,
  },
  featureCards: {
    gap: 20,
  },
  featureCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    // backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  featureCardIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  featureCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
    textAlign: "center",
  },
  featureCardDescription: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 22,
  },
  benefitsSection: {
    marginBottom: 40,
    gap: 16,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  benefitText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  ctaSection: {
    gap: 20,
    marginBottom: 40,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 12,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#667eea",
  },
  secondaryButton: {
    paddingVertical: 16,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
  },
  footer: {
    alignItems: "center",
    paddingTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },
});
