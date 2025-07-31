// Create: components/OnboardingScreen.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Image,
  Animated, // Add this import
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import PagerView from "react-native-pager-view";

const { width, height } = Dimensions.get("window");

// Add this interface
interface OnboardingScreenProps {
  onFinish: () => void;
}

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  image?: any;
  gradient: [string, string]; // At least two colors required by LinearGradient
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to LinkSet",
    subtitle: "Your Personal Link Manager",
    description:
      "Save, organize, and access your favorite links from anywhere. Keep your digital life organized with beautiful collections.",
    icon: "link-outline",
    image: require("@/assets/images/welcome-hero2.png"),
    gradient: ["#0bb7ebff", "#005d7eff"],
  },
  {
    id: "organize",
    title: "Smart Organization",
    subtitle: "Categories & Collections",
    description:
      "Create custom categories with beautiful colors. Group your links by work, hobbies, research, or any way that makes sense to you.",
    icon: "folder-outline",
    gradient: ["#059669", "#10B981"],
  },
  {
    id: "search",
    title: "Find Anything Fast",
    subtitle: "Powerful Search & Filter",
    description:
      "Instantly find any link with smart search. Filter by categories, search titles, or descriptions to locate exactly what you need.",
    icon: "search-outline",
    gradient: ["#DC2626", "#EF4444"],
  },
  {
    id: "swipe",
    title: "Swipe to Manage",
    subtitle: "Edit & Delete with Gestures",
    description: "Quick, intuitive gestures make link management effortless.",
    icon: "hand-left-outline",
    gradient: ["#7C3AED", "#EC4899"],
  },
  {
    id: "avatars",
    title: "Personal Touch",
    subtitle: "Adorable Animal Avatars",
    description:
      "Choose from our collection of cute animal avatars. Express your personality with bears, cats, foxes, pandas, and more!",
    icon: "happy-outline",
    gradient: ["#7C2D12", "#EA580C"],
  },
  {
    id: "sync",
    title: "Sync Everywhere",
    subtitle: "Access from Any Device",
    description:
      "Your links sync automatically across all your devices. Start on your phone, continue on your computer - seamlessly.",
    icon: "sync-outline",
    gradient: ["#053cbeff", "#0069cbff"],
  },
];

// Update the component declaration to accept props
export default function OnboardingScreen({ onFinish }: OnboardingScreenProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const pagerRef = useRef<PagerView>(null);

  const handleNext = () => {
    if (currentPage < ONBOARDING_STEPS.length - 1) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      pagerRef.current?.setPage(nextPage);
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleGetStarted = () => {
    onFinish(); // Only call the callback - let the parent handle navigation
    // Remove: router.replace('/(auth)/signup');
  };

  const handlePageChange = (event: any) => {
    setCurrentPage(event.nativeEvent.position);
  };

  const currentStep = ONBOARDING_STEPS[currentPage];

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={currentStep.gradient[0]}
        translucent
      />

      <LinearGradient
        colors={currentStep.gradient}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <View style={styles.pageIndicator}>
          {ONBOARDING_STEPS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === currentPage
                      ? "rgba(255, 255, 255, 1)"
                      : "rgba(255, 255, 255, 0.3)",
                  width: index === currentPage ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Content */}
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={handlePageChange}
      >
        {ONBOARDING_STEPS.map((step, index) => (
          <View key={step.id} style={styles.page}>
            <View style={styles.content}>
              {/* Visual Section */}
              <View style={styles.visualSection}>
                {step.image ? (
                  <Image
                    source={step.image}
                    style={styles.heroImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.iconContainer}>
                    <Ionicons
                      name={step.icon}
                      size={100}
                      color="rgba(255, 255, 255, 0.9)"
                    />
                  </View>
                )}
              </View>

              {/* Text Section */}
              <View style={styles.textSection}>
                <Text style={styles.title}>{step.title}</Text>
                <Text style={styles.subtitle}>{step.subtitle}</Text>
                <Text style={styles.description}>{step.description}</Text>
              </View>

              {/* Feature Section - Below text */}
              <View style={styles.featureSection}>
                {step.id === "swipe" && <SwipeDemo />}

                {step.id === "organize" && (
                  <View style={styles.featuresContainer}>
                    <FeatureItem
                      icon="color-palette-outline"
                      text="Color-coded categories"
                    />
                    <FeatureItem
                      icon="library-outline"
                      text="Unlimited collections"
                    />
                    <FeatureItem icon="create-outline" text="Custom naming" />
                  </View>
                )}

                {step.id === "avatars" && (
                  <View style={styles.avatarPreview}>
                    <View style={styles.avatarRow}>
                      <Text style={styles.avatarEmoji}>🐱</Text>
                      <Text style={styles.avatarEmoji}>🐶</Text>
                      <Text style={styles.avatarEmoji}>🦊</Text>
                      <Text style={styles.avatarEmoji}>🐻</Text>
                    </View>
                    <View style={styles.avatarRow}>
                      <Text style={styles.avatarEmoji}>🐼</Text>
                      <Text style={styles.avatarEmoji}>🦁</Text>
                      <Text style={styles.avatarEmoji}>🐨</Text>
                      <Text style={styles.avatarEmoji}>🦄</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>
        ))}
      </PagerView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
          <Text style={styles.nextButtonText}>
            {currentPage === ONBOARDING_STEPS.length - 1
              ? "Get Started"
              : "Next"}
          </Text>
          <Ionicons
            name={
              currentPage === ONBOARDING_STEPS.length - 1
                ? "rocket-outline"
                : "arrow-forward"
            }
            size={20}
            color="#fff"
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Feature Item Component
const FeatureItem = ({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) => (
  <View style={styles.featureItem}>
    <Ionicons name={icon} size={16} color="rgba(255, 255, 255, 0.8)" />
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

// Add this new component for the swipe demo:
const SwipeDemo = () => {
  const [currentDemo, setCurrentDemo] = useState<"idle" | "edit" | "delete">(
    "idle"
  );

  // Add animation values
  const translateX = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const demoSequence = () => {
      // Reset position and show idle state
      setCurrentDemo("idle");
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Show edit demo (swipe LEFT)
      setTimeout(() => {
        setCurrentDemo("edit");
        Animated.sequence([
          // Slide left
          Animated.timing(translateX, {
            toValue: -60, // Move left for edit
            duration: 500,
            useNativeDriver: true,
          }),
          // Hold position
          Animated.delay(1000),
          // Return to center
          Animated.timing(translateX, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      }, 1000);

      // Reset to idle
      setTimeout(() => {
        setCurrentDemo("idle");
      }, 3000);

      // Show delete demo (swipe RIGHT)
      setTimeout(() => {
        setCurrentDemo("delete");
        Animated.sequence([
          // Slide right
          Animated.timing(translateX, {
            toValue: 60, // Move right for delete
            duration: 500,
            useNativeDriver: true,
          }),
          // Hold position
          Animated.delay(1000),
          // Return to center
          Animated.timing(translateX, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      }, 4000);

      // Reset to idle
      setTimeout(() => {
        setCurrentDemo("idle");
      }, 6500);
    };

    demoSequence();
    const interval = setInterval(demoSequence, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.swipeDemoContainer}>
      {/* Demo Link Card with Animation */}
      <View style={styles.demoCard}>
        <Animated.View
          style={[
            styles.animatedCard,
            {
              transform: [{ translateX }],
              opacity: cardOpacity,
            },
          ]}
        >
          <View style={styles.demoLinkItem}>
            <View style={styles.linkIconDemo}>
              <Ionicons name="globe-outline" size={24} color="#4F46E5" />
            </View>
            <View style={styles.linkContentDemo}>
              <Text style={styles.linkTitleDemo}>React Native Docs</Text>
              <Text style={styles.linkUrlDemo}>reactnative.dev</Text>
              <Text style={styles.linkCategoryDemo}>Development</Text>
            </View>
          </View>

          {/* Action Overlays with CORRECTED logic */}
          {currentDemo === "edit" && (
            <Animated.View
              style={[
                styles.actionOverlay,
                styles.editOverlay,
                {
                  opacity: translateX.interpolate({
                    inputRange: [-60, 0], // Left swipe for edit
                    outputRange: [1, 0],
                    extrapolate: "clamp",
                  }),
                },
              ]}
            >
              <Ionicons name="create-outline" size={32} color="#fff" />
              <Text style={styles.actionText}>EDIT</Text>
            </Animated.View>
          )}

          {currentDemo === "delete" && (
            <Animated.View
              style={[
                styles.actionOverlay,
                styles.deleteOverlay,
                {
                  opacity: translateX.interpolate({
                    inputRange: [0, 60], // Right swipe for delete
                    outputRange: [0, 1],
                    extrapolate: "clamp",
                  }),
                },
              ]}
            >
              <Ionicons name="trash-outline" size={32} color="#fff" />
              <Text style={styles.actionText}>DELETE</Text>
            </Animated.View>
          )}
        </Animated.View>
      </View>

      {/* Gesture Instructions with CORRECTED directions */}
      <View style={styles.gestureInstructions}>
        <View
          style={[
            styles.gestureItem,
            currentDemo === "edit" && styles.gestureItemActive,
          ]}
        >
          <Ionicons
            name="arrow-back" // Left arrow for edit
            size={20}
            color={currentDemo === "edit" ? "#22C55E" : "rgba(255,255,255,0.8)"}
          />
          <Text
            style={[
              styles.gestureLabel,
              currentDemo === "edit" && styles.gestureLabelActive,
            ]}
          >
            Swipe left to edit
          </Text>
          {currentDemo === "edit" && (
            <View style={styles.activeIndicator}>
              <Text style={styles.activeText}>ACTIVE</Text>
            </View>
          )}
        </View>

        <View
          style={[
            styles.gestureItem,
            currentDemo === "delete" && styles.gestureItemActive,
          ]}
        >
          <Ionicons
            name="arrow-forward" // Right arrow for delete
            size={20}
            color={
              currentDemo === "delete" ? "#EF4444" : "rgba(255,255,255,0.8)"
            }
          />
          <Text
            style={[
              styles.gestureLabel,
              currentDemo === "delete" && styles.gestureLabelActive,
            ]}
          >
            Swipe right to delete
          </Text>
          {currentDemo === "delete" && (
            <View style={styles.activeIndicator}>
              <Text style={styles.activeText}>ACTIVE</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
    fontWeight: "500",
  },
  pageIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  pagerView: {
    flex: 1,
  },
  page: {
    flex: 1,
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    justifyContent: "flex-start", // Changed from 'center'
    alignItems: "center",
    paddingTop: 20, // Add padding
  },
  visualSection: {
    height: 200, // Fixed height instead of flex
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20, // Reduced margin
  },
  heroImage: {
    width: 200,
    height: 200,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  textSection: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20, // Add margin
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  featureSection: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  featuresContainer: {
    marginTop: 20,
    gap: 8,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    fontWeight: "500",
  },
  avatarPreview: {
    marginTop: 20,
    gap: 12,
  },
  avatarRow: {
    flexDirection: "row",
    gap: 16,
  },
  avatarEmoji: {
    fontSize: 32,
  },
  bottomNav: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  nextButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  swipeDemoContainer: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  demoCard: {
    position: "relative",
    width: "100%",
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
  },
  demoLinkItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 16,
    borderRadius: 16,
  },
  linkIconDemo: {
    width: 48,
    height: 48,
    backgroundColor: "rgba(79, 70, 229, 0.1)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  linkContentDemo: {
    flex: 1,
  },
  linkTitleDemo: {
    color: "#1F2937",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  linkUrlDemo: {
    color: "#6B7280",
    fontSize: 14,
    marginBottom: 2,
  },
  linkCategoryDemo: {
    color: "#4F46E5",
    fontSize: 12,
    fontWeight: "500",
  },
  actionOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    width: "100%", // Full width
    borderRadius: 16,
  },
  editOverlay: {
    backgroundColor: "rgba(34, 197, 94, 0.9)",
  },
  deleteOverlay: {
    backgroundColor: "rgba(239, 68, 68, 0.9)",
  },
  actionText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
    letterSpacing: 1,
  },
  gestureInstructions: {
    width: "100%",
    gap: 8,
  },
  gestureItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  gestureLabel: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  statusIndicator: {
    marginTop: 12,
    padding: 8,
  },
  statusText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  animatedCard: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
  },
  backgroundActions: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderRadius: 16,
  },
  backgroundAction: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
  },
  editBackground: {
    backgroundColor: "rgba(34, 197, 94, 0.7)",
    left: 16, // Edit is now on the LEFT
  },
  deleteBackground: {
    backgroundColor: "rgba(239, 68, 68, 0.7)",
    right: 16, // Delete is now on the RIGHT
  },
  gestureItemActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  gestureLabelActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  activeIndicator: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#22C55E",
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  activeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  editStatusText: {
    color: "#22C55E",
    fontWeight: "600",
  },
  deleteStatusText: {
    color: "#EF4444",
    fontWeight: "600",
  },
});
