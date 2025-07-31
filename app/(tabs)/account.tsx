import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { auth } from "@/services/firebase";
import { signOut, updateProfile } from "firebase/auth";
import { router } from "expo-router";

export default function AccountScreen() {
  const { theme, toggleTheme, isDark } = useTheme();
  const user = auth.currentUser;

  // Replace the ANIMAL_AVATARS array with your complete collection:
  const ANIMAL_AVATARS = [
    { id: 'bear', name: 'Bear', emoji: '🐻', image: require('@/assets/avatars/bear.png') },
    { id: 'cat', name: 'Cat', emoji: '🐱', image: require('@/assets/avatars/cat.png') },
    { id: 'cow', name: 'Cow', emoji: '🐮', image: require('@/assets/avatars/cow.png') },
    { id: 'deer', name: 'Deer', emoji: '🦌', image: require('@/assets/avatars/deer.png') },
    { id: 'dog', name: 'Dog', emoji: '🐶', image: require('@/assets/avatars/dog.png') },
    { id: 'elephant', name: 'Elephant', emoji: '🐘', image: require('@/assets/avatars/elephant.png') },
    { id: 'fox', name: 'Fox', emoji: '🦊', image: require('@/assets/avatars/fox.png') },
    { id: 'giraffe', name: 'Giraffe', emoji: '🦒', image: require('@/assets/avatars/giraffe.png') },
    { id: 'hippo', name: 'Hippo', emoji: '🦛', image: require('@/assets/avatars/hippo.png') },
    { id: 'horse', name: 'Horse', emoji: '🐴', image: require('@/assets/avatars/horse.png') },
    { id: 'koala', name: 'Koala', emoji: '🐨', image: require('@/assets/avatars/koala.png') },
    { id: 'lion', name: 'Lion', emoji: '🦁', image: require('@/assets/avatars/lion.png') },
    { id: 'monkey', name: 'Monkey', emoji: '🐵', image: require('@/assets/avatars/monkey.png') },
    { id: 'owl', name: 'Owl', emoji: '🦉', image: require('@/assets/avatars/owl.png') },
    { id: 'panda', name: 'Panda', emoji: '🐼', image: require('@/assets/avatars/panda.png') },
    { id: 'penguin', name: 'Penguin', emoji: '🐧', image: require('@/assets/avatars/penguin.png') },
    { id: 'pig', name: 'Pig', emoji: '🐷', image: require('@/assets/avatars/pig.png') },
    { id: 'rabbit', name: 'Rabbit', emoji: '🐰', image: require('@/assets/avatars/rabbit.png') },
    { id: 'sloth', name: 'Sloth', emoji: '🦥', image: require('@/assets/avatars/sloth.png') },
    { id: 'tiger', name: 'Tiger', emoji: '🐯', image: require('@/assets/avatars/tiger.png') },
    { id: 'unicorn', name: 'Unicorn', emoji: '🦄', image: require('@/assets/avatars/unicorn.png') },
    { id: 'zebra', name: 'Zebra', emoji: '🦓', image: require('@/assets/avatars/zebra.png') },
  ];

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedName, setEditedName] = useState(user?.displayName || "");
  const [selectedAvatar, setSelectedAvatar] = useState(
    user?.photoURL || 'cat' // Changed default from 'person' to 'cat'
  );
  const [isUpdating, setIsUpdating] = useState(false);

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

  // Helper to get avatar data by ID
  const getAnimalData = (animalId: string) => {
    return ANIMAL_AVATARS.find(a => a.id === animalId) || ANIMAL_AVATARS[0];
  };

  // Update the profile card avatar display
  const renderAvatar = (animalId: string, size: number = 32) => {
    const animalData = getAnimalData(animalId);
    
    return (
      <View
        style={[
          styles.avatarContainer,
          { 
            width: size * 2,
            height: size * 2,
            borderRadius: size,
            backgroundColor: theme.colors.surface,
            overflow: 'hidden',
            borderWidth: 2,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Image
          source={animalData.image}
          style={{
            width: size * 2,
            height: size * 2,
          }}
          resizeMode="cover"
        />
      </View>
    );
  };

  // Function to save profile updates (much simpler now)
  const saveProfile = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      // Update Firebase Auth profile with avatar ID
      await updateProfile(user, {
        displayName: editedName.trim() || user.displayName,
        photoURL: selectedAvatar, // Store avatar ID instead of image URL
      });
      
      // Force refresh the user to get updated data
      await user.reload();
      
      Alert.alert("Success", "Profile updated successfully!");
      setEditModalVisible(false);
      
    } catch (error: any) {
      console.error("Profile update error:", error);
      Alert.alert("Error", error.message || "Failed to update profile. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

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
              {renderAvatar(user?.photoURL || 'cat', 30)}
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
              subtitle="Update your name and animal avatar"
              onPress={() => {
                setEditedName(user?.displayName || "");
                setSelectedAvatar(user?.photoURL || 'cat');
                setEditModalVisible(true);
              }}
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

        {/* Edit Profile Modal */}
        <Modal visible={editModalVisible} transparent animationType="slide">
          <View style={styles.modalBackdrop}>
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              activeOpacity={1}
              onPress={() => setEditModalVisible(false)}
            />
            <View
              style={[
                styles.editModalContainer,
                { backgroundColor: theme.colors.card },
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  Edit Profile
                </Text>
                <TouchableOpacity
                  onPress={() => setEditModalVisible(false)}
                  style={styles.modalCloseButton}
                >
                  <Ionicons
                    name="close"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Avatar Selection Section */}
              <View style={styles.avatarSection}>
                <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>
                  Choose Your Animal Avatar
                </Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.avatarScrollView}
                  contentContainerStyle={styles.avatarScrollContent}
                >
                  {ANIMAL_AVATARS.map((animal) => (
                    <TouchableOpacity
                      key={animal.id}
                      style={[
                        styles.avatarOption,
                        {
                          backgroundColor: theme.colors.surface,
                          borderColor: selectedAvatar === animal.id 
                            ? theme.colors.primary 
                            : theme.colors.border,
                          borderWidth: 3,
                          overflow: 'hidden',
                        },
                      ]}
                      onPress={() => setSelectedAvatar(animal.id)}
                      activeOpacity={0.7}
                    >
                      <Image
                        source={animal.image}
                        style={{
                          width: 50, // Adjusted to fit new container
                          height: 50,
                        }}
                        resizeMode="cover"
                      />
                      <View style={styles.animalEmoji}>
                        <Text style={styles.emojiText}>{animal.emoji}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <Text style={[styles.avatarHint, { color: theme.colors.textSecondary }]}>
                  {getAnimalData(selectedAvatar).name}
                </Text>
              </View>

              {/* Name Input */}
              <View style={styles.inputSection}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                  Display Name
                </Text>
                <View
                  style={[
                    styles.editInputWrapper,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <TextInput
                    value={editedName}
                    onChangeText={setEditedName}
                    style={[styles.editInput, { color: theme.colors.text }]}
                    placeholder="Enter your name"
                    placeholderTextColor={theme.colors.textSecondary}
                    autoCapitalize="words"
                    autoCorrect={true}
                    returnKeyType="done"
                    onSubmitEditing={saveProfile}
                  />
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.editModalActions}>
                <TouchableOpacity
                  onPress={() => setEditModalVisible(false)}
                  style={[
                    styles.editModalButton,
                    styles.cancelButton,
                    { backgroundColor: theme.colors.surface },
                  ]}
                >
                  <Text
                    style={[
                      styles.cancelButtonText,
                      { color: theme.colors.text },
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={saveProfile}
                  style={[
                    styles.editModalButton,
                    styles.saveButton,
                    {
                      backgroundColor: theme.colors.primary,
                      opacity: isUpdating ? 0.6 : 1,
                    },
                  ]}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>
                      Save Changes
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  avatarScrollView: {
    marginBottom: 8,
  },
  avatarScrollContent: {
    paddingHorizontal: 16,
    gap: 8, // Reduced gap for more avatars
  },
  avatarOption: {
    width: 54, // Slightly smaller
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2, // Reduced margin
    position: 'relative',
  },
  animalEmoji: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: 'white',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  emojiText: {
    fontSize: 10,
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
    justifyContent: 'center',
    alignItems: 'center',
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

  /* Edit Profile Modal Styles */
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 24,
  },
  editModalContainer: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSection: {
    marginBottom: 24,
  },
  avatarHint: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  editInputWrapper: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 48,
    justifyContent: 'center',
  },
  editInput: {
    fontSize: 16,
    fontWeight: '400',
  },
  editModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editModalButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {},
  saveButton: {},
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});