import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { auth } from "@/services/firebase";
import { signOut } from "firebase/auth";
import { router } from "expo-router";

export default function AccountScreen() {
  const { theme, toggleTheme, isDark } = useTheme();
  const user = auth.currentUser;

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Sign Out", 
          style: "destructive", 
          onPress: async () => {
            try {
              await signOut(auth);
              // The AuthContext will automatically handle navigation to login
              // due to the onAuthStateChanged listener
              router.replace("/(auth)/login");
            } catch (error: any) {
              Alert.alert("Error", "Failed to sign out. Please try again.");
              console.error("Logout error:", error);
            }
          }
        },
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showArrow = true,
    isDestructive = false 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress: () => void;
    showArrow?: boolean;
    isDestructive?: boolean;
  }) => (
    <TouchableOpacity
      style={[
        styles.settingItem,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingContent}>
        <View
          style={[
            styles.settingIcon,
            { 
              backgroundColor: isDestructive 
                ? "#FF453A20" 
                : theme.colors.primary + "20" 
            },
          ]}
        >
          <Ionicons
            name={icon as any}
            size={20}
            color={isDestructive ? "#FF453A" : theme.colors.primary}
          />
        </View>
        <View style={styles.settingText}>
          <Text
            style={[
              styles.settingTitle,
              { 
                color: isDestructive ? "#FF453A" : theme.colors.text 
              },
            ]}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[
                styles.settingSubtitle,
                { color: theme.colors.textSecondary },
              ]}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {showArrow && (
        <Ionicons
          name="chevron-forward"
          size={16}
          color={theme.colors.textSecondary}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />

      <LinearGradient
        colors={isDark ? ["#000000", "#1C1C1E"] : ["#FAFAFA", "#F2F2F7"]}
        style={styles.container}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: theme.colors.card,
              borderBottomColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              Account
            </Text>
            <TouchableOpacity
              onPress={toggleTheme}
              style={[
                styles.themeButton,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Ionicons
                name={isDark ? "sunny" : "moon"}
                size={20}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* User Profile Section */}
          <View style={styles.section}>
            <View
              style={[
                styles.profileCard,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.avatarContainer,
                  { backgroundColor: theme.colors.primary + "20" },
                ]}
              >
                <Ionicons
                  name="person"
                  size={32}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.profileInfo}>
                <Text
                  style={[styles.profileName, { color: theme.colors.text }]}
                >
                  {user?.displayName || "User"}
                </Text>
                <Text
                  style={[
                    styles.profileEmail,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {user?.email || "user@example.com"}
                </Text>
              </View>
            </View>
          </View>

          {/* Account Settings */}
          <View style={styles.section}>
            <Text
              style={[styles.sectionTitle, { color: theme.colors.text }]}
            >
              Account Settings
            </Text>
            
            <SettingItem
              icon="person-outline"
              title="Edit Profile"
              subtitle="Update your name and photo"
              onPress={() => Alert.alert("Coming Soon", "Profile editing will be available soon")}
            />
            
            <SettingItem
              icon="lock-closed-outline"
              title="Change Password"
              subtitle="Update your account password"
              onPress={() => Alert.alert("Coming Soon", "Password change will be available soon")}
            />
            
            <SettingItem
              icon="mail-outline"
              title="Email Preferences"
              subtitle="Manage notification settings"
              onPress={() => Alert.alert("Coming Soon", "Email preferences will be available soon")}
            />
          </View>

          {/* App Settings */}
          <View style={styles.section}>
            <Text
              style={[styles.sectionTitle, { color: theme.colors.text }]}
            >
              App Settings
            </Text>
            
            <SettingItem
              icon={isDark ? "sunny" : "moon"}
              title="Theme"
              subtitle={isDark ? "Dark mode" : "Light mode"}
              onPress={toggleTheme}
              showArrow={false}
            />
            
            <SettingItem
              icon="notifications-outline"
              title="Notifications"
              subtitle="Push notifications and alerts"
              onPress={() => Alert.alert("Coming Soon", "Notification settings will be available soon")}
            />
            
            <SettingItem
              icon="download-outline"
              title="Export Data"
              subtitle="Download your saved links"
              onPress={() => Alert.alert("Coming Soon", "Data export will be available soon")}
            />
          </View>

          {/* Support */}
          <View style={styles.section}>
            <Text
              style={[styles.sectionTitle, { color: theme.colors.text }]}
            >
              Support
            </Text>
            
            <SettingItem
              icon="help-circle-outline"
              title="Help Center"
              subtitle="Get help and support"
              onPress={() => Alert.alert("Coming Soon", "Help center will be available soon")}
            />
            
            <SettingItem
              icon="chatbubble-outline"
              title="Contact Us"
              subtitle="Send feedback or report issues"
              onPress={() => Alert.alert("Coming Soon", "Contact form will be available soon")}
            />
            
            <SettingItem
              icon="information-circle-outline"
              title="About"
              subtitle="App version and info"
              onPress={() => Alert.alert("LinkSet", "Version 1.0.0\nBuilt with React Native")}
            />
          </View>

          {/* Logout */}
          <View style={styles.section}>
            <SettingItem
              icon="log-out-outline"
              title="Sign Out"
              onPress={handleLogout}
              showArrow={false}
              isDestructive={true}
            />
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  themeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    marginLeft: 4,
  },

  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    lineHeight: 20,
  },

  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  settingContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
  },
  settingSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
});