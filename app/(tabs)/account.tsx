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
  KeyboardAvoidingView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { auth } from "@/services/firebase";
import { 
  signOut, 
  updateProfile, 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider 
} from "firebase/auth";
import { router } from "expo-router";
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';

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

  const CONTACT_TYPES = [
    { id: 'feedback', name: 'General Feedback', emoji: '💬' },
    { id: 'bug', name: 'Bug Report', emoji: '🐛' },
    { id: 'feature', name: 'Feature Request', emoji: '💡' },
    { id: 'support', name: 'Technical Support', emoji: '🛠️' },
    { id: 'other', name: 'Other', emoji: '📝' },
  ];

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedName, setEditedName] = useState(user?.displayName || "");
  const [selectedAvatar, setSelectedAvatar] = useState(
    user?.photoURL || 'cat'
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactType, setContactType] = useState("feedback");
  const [isSendingContact, setIsSendingContact] = useState(false);

  // Enhanced change password state variables
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleLogout = async () => {
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
              // Redirect to login screen, not welcome
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

  // Function to save profile updates
  const saveProfile = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      await updateProfile(user, {
        displayName: editedName.trim() || user.displayName,
        photoURL: selectedAvatar,
      });
      
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

  // Contact submission function
  const submitContact = async () => {
    if (!contactSubject.trim() || !contactMessage.trim()) {
      Alert.alert("Missing Information", "Please fill in both subject and message.");
      return;
    }

    setIsSendingContact(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        userId: user?.uid,
        userEmail: user?.email,
        userName: user?.displayName || 'Anonymous',
        userAvatar: user?.photoURL || 'cat',
        contactType: contactType,
        contactTypeName: CONTACT_TYPES.find(t => t.id === contactType)?.name || 'General Feedback',
        subject: contactSubject.trim(),
        message: contactMessage.trim(),
        timestamp: new Date(),
        status: 'unread',
        platform: 'mobile'
      });
      
      Alert.alert(
        "Message Sent!", 
        "Thanks for reaching out! We'll get back to you soon.",
        [{ text: "OK", onPress: () => {
          setContactModalVisible(false);
          setContactSubject("");
          setContactMessage("");
          setContactType("feedback");
        }}]
      );
    } catch (error: any) {
      console.error('Contact submission error:', error);
      Alert.alert("Error", "Failed to send message. Please try again.");
    } finally {
      setIsSendingContact(false);
    }
  };

  // Enhanced password change function
  const changePassword = async () => {
    if (!user) return;

    // Validation
    if (!currentPassword.trim()) {
      Alert.alert("Error", "Please enter your current password.");
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert("Error", "Please enter a new password.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords don't match.");
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert("Error", "New password must be different from current password.");
      return;
    }

    setIsChangingPassword(true);
    try {
      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(
        user.email!,
        currentPassword
      );
      
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
      Alert.alert(
        "Success", 
        "Password changed successfully!",
        [{ 
          text: "OK", 
          onPress: () => {
            setChangePasswordModalVisible(false);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
          }
        }]
      );
      
    } catch (error: any) {
      console.error("Password change error:", error);
      
      let errorMessage = "Failed to change password. Please try again.";
      
      switch (error.code) {
        case 'auth/wrong-password':
          errorMessage = "Current password is incorrect.";
          break;
        case 'auth/weak-password':
          errorMessage = "New password is too weak. Please choose a stronger password.";
          break;
        case 'auth/requires-recent-login':
          errorMessage = "Please sign out and sign back in before changing your password.";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Too many failed attempts. Please try again later.";
          break;
      }
      
      Alert.alert("Error", errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44;

  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />

      <LinearGradient
        colors={isDark ? ["#000000", "#1C1C1E"] : ["#FAFAFA", "#F2F2F7"]}
        style={[styles.container, { paddingTop: statusBarHeight }]}
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
              onPress={() => {
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setChangePasswordModalVisible(true);
              }}
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
              icon="chatbubble-outline"
              title="Contact Us"
              subtitle="Send feedback or report issues"
              onPress={() => setContactModalVisible(true)}
            />
            
            <SettingItem
              icon="information-circle-outline"
              title="About"
              subtitle="App version and info"
              onPress={() => Alert.alert("LinkSet", "Version 1.0.0\nAuthor: Flames")}
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
                          width: 50,
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

        {/* Contact Us Modal */}
        <Modal visible={contactModalVisible} transparent animationType="slide">
          <View style={styles.modalBackdrop}>
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              activeOpacity={1}
              onPress={() => setContactModalVisible(false)}
            />
            <View
              style={[
                styles.contactModalContainer,
                { backgroundColor: theme.colors.card },
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  Contact Us
                </Text>
                <TouchableOpacity
                  onPress={() => setContactModalVisible(false)}
                  style={styles.modalCloseButton}
                >
                  <Ionicons
                    name="close"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Contact Type Selection */}
              <View style={styles.contactTypeSection}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                  What can we help you with?
                </Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.contactTypeScrollView}
                  contentContainerStyle={styles.contactTypeScrollContent}
                >
                  {CONTACT_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.contactTypeChip,
                        {
                          backgroundColor: contactType === type.id 
                            ? theme.colors.primary 
                            : theme.colors.surface,
                          borderColor: contactType === type.id 
                            ? theme.colors.primary 
                            : theme.colors.border,
                        },
                      ]}
                      onPress={() => setContactType(type.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.contactTypeEmoji}>{type.emoji}</Text>
                      <Text
                        style={[
                          styles.contactTypeText,
                          {
                            color: contactType === type.id 
                              ? 'white' 
                              : theme.colors.text,
                          },
                        ]}
                      >
                        {type.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Subject Input */}
              <View style={styles.inputSection}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                  Subject
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
                    value={contactSubject}
                    onChangeText={setContactSubject}
                    style={[styles.editInput, { color: theme.colors.text }]}
                    placeholder="Brief description of your message"
                    placeholderTextColor={theme.colors.textSecondary}
                    autoCapitalize="sentences"
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* Message Input */}
              <View style={styles.inputSection}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                  Message
                </Text>
                <View
                  style={[
                    styles.messageInputWrapper,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <TextInput
                    value={contactMessage}
                    onChangeText={setContactMessage}
                    style={[styles.messageInput, { color: theme.colors.text }]}
                    placeholder="Tell us more about your feedback, issue, or question..."
                    placeholderTextColor={theme.colors.textSecondary}
                    multiline
                    numberOfLines={4}
                    autoCapitalize="sentences"
                    returnKeyType="done"
                    textAlignVertical="top"
                  />
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.editModalActions}>
                <TouchableOpacity
                  onPress={() => setContactModalVisible(false)}
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
                  onPress={submitContact}
                  style={[
                    styles.editModalButton,
                    styles.saveButton,
                    {
                      backgroundColor: theme.colors.primary,
                      opacity: isSendingContact ? 0.6 : 1,
                    },
                  ]}
                  disabled={isSendingContact}
                >
                  {isSendingContact ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>
                      Send Message
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Enhanced Change Password Modal */}
        <Modal visible={changePasswordModalVisible} transparent animationType="slide">
          <View style={styles.modalBackdrop}>
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              activeOpacity={1}
              onPress={() => setChangePasswordModalVisible(false)}
            />
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardAvoidingView}
            >
              <View
                style={[
                  styles.changePasswordModalContainer,
                  { backgroundColor: theme.colors.card },
                ]}
              >
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                    Change Password
                  </Text>
                  <TouchableOpacity
                    onPress={() => setChangePasswordModalVisible(false)}
                    style={styles.modalCloseButton}
                  >
                    <Ionicons
                      name="close"
                      size={20}
                      color={theme.colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                <ScrollView 
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={styles.scrollModalContent}
                >
                  {/* Security Notice */}
                  <View style={styles.securityNotice}>
                    <View style={styles.securityIconContainer}>
                      <Ionicons name="shield-checkmark" size={24} color="#22C55E" />
                    </View>
                    <View style={styles.securityTextContainer}>
                      <Text style={[styles.securityTitle, { color: theme.colors.text }]}>
                        Secure Password Change
                      </Text>
                      <Text style={[styles.securityDescription, { color: theme.colors.textSecondary }]}>
                        For your security, please enter your current password to verify your identity.
                      </Text>
                    </View>
                  </View>

                  {/* Current Password Input */}
                  <View style={styles.inputSection}>
                    <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                      Current Password
                    </Text>
                    <View
                      style={[
                        styles.stablePasswordInputWrapper,
                        {
                          backgroundColor: theme.colors.surface,
                          borderColor: theme.colors.border,
                        },
                      ]}
                    >
                      <TextInput
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        style={[styles.stablePasswordInput, { color: theme.colors.text }]}
                        placeholder="Enter your current password"
                        placeholderTextColor={theme.colors.textSecondary}
                        secureTextEntry={!showCurrentPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="current-password"
                        textContentType="password"
                        returnKeyType="next"
                        blurOnSubmit={false}
                      />
                      <TouchableOpacity
                        onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                        style={styles.stablePasswordToggle}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={showCurrentPassword ? "eye-off-outline" : "eye-outline"}
                          size={20}
                          color={theme.colors.textSecondary}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* New Password Input */}
                  <View style={styles.inputSection}>
                    <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                      New Password
                    </Text>
                    <View
                      style={[
                        styles.stablePasswordInputWrapper,
                        {
                          backgroundColor: theme.colors.surface,
                          borderColor: theme.colors.border,
                        },
                      ]}
                    >
                      <TextInput
                        value={newPassword}
                        onChangeText={setNewPassword}
                        style={[styles.stablePasswordInput, { color: theme.colors.text }]}
                        placeholder="Enter new password (min. 6 characters)"
                        placeholderTextColor={theme.colors.textSecondary}
                        secureTextEntry={!showNewPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="new-password"
                        textContentType="newPassword"
                        returnKeyType="next"
                        blurOnSubmit={false}
                      />
                      <TouchableOpacity
                        onPress={() => setShowNewPassword(!showNewPassword)}
                        style={styles.stablePasswordToggle}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                          size={20}
                          color={theme.colors.textSecondary}
                        />
                      </TouchableOpacity>
                    </View>
                    {newPassword.length > 0 && newPassword.length < 6 && (
                      <View style={styles.validationContainer}>
                        <Ionicons name="warning-outline" size={14} color="#F59E0B" />
                        <Text style={styles.passwordHint}>
                          Password must be at least 6 characters
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Confirm Password Input */}
                  <View style={styles.inputSection}>
                    <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                      Confirm New Password
                    </Text>
                    <View
                      style={[
                        styles.stablePasswordInputWrapper,
                        {
                          backgroundColor: theme.colors.surface,
                          borderColor: theme.colors.border,
                        },
                      ]}
                    >
                      <TextInput
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        style={[styles.stablePasswordInput, { color: theme.colors.text }]}
                        placeholder="Confirm your new password"
                        placeholderTextColor={theme.colors.textSecondary}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="new-password"
                        textContentType="newPassword"
                        returnKeyType="done"
                        onSubmitEditing={changePassword}
                      />
                      <TouchableOpacity
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={styles.stablePasswordToggle}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                          size={20}
                          color={theme.colors.textSecondary}
                        />
                      </TouchableOpacity>
                    </View>
                    {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                      <View style={styles.validationContainer}>
                        <Ionicons name="close-circle-outline" size={14} color="#EF4444" />
                        <Text style={styles.passwordError}>
                          Passwords don't match
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Enhanced Password Requirements */}
                  <View style={[styles.passwordRequirements, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[styles.requirementsTitle, { color: theme.colors.text }]}>
                      Password Requirements:
                    </Text>
                    <View style={styles.requirementsList}>
                      <View style={styles.requirementItem}>
                        <Ionicons 
                          name={newPassword.length >= 6 ? "checkmark-circle" : "ellipse-outline"} 
                          size={16} 
                          color={newPassword.length >= 6 ? "#22C55E" : theme.colors.textSecondary} 
                        />
                        <Text style={[
                          styles.requirementText, 
                          { 
                            color: newPassword.length >= 6 ? "#22C55E" : theme.colors.textSecondary 
                          }
                        ]}>
                          At least 6 characters
                        </Text>
                      </View>
                      <View style={styles.requirementItem}>
                        <Ionicons 
                          name={newPassword !== currentPassword && newPassword.length > 0 ? "checkmark-circle" : "ellipse-outline"} 
                          size={16} 
                          color={newPassword !== currentPassword && newPassword.length > 0 ? "#22C55E" : theme.colors.textSecondary} 
                        />
                        <Text style={[
                          styles.requirementText, 
                          { 
                            color: newPassword !== currentPassword && newPassword.length > 0 ? "#22C55E" : theme.colors.textSecondary 
                          }
                        ]}>
                          Different from current password
                        </Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>

                {/* Enhanced Action Buttons */}
                <View style={styles.enhancedModalActions}>
                  <TouchableOpacity
                    onPress={() => setChangePasswordModalVisible(false)}
                    style={[
                      styles.enhancedButton,
                      styles.enhancedCancelButton,
                      { 
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    activeOpacity={0.8}
                  >
                    <Ionicons 
                      name="close-outline" 
                      size={18} 
                      color={theme.colors.text} 
                      style={styles.buttonIcon}
                    />
                    <Text style={[styles.enhancedCancelButtonText, { color: theme.colors.text }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={changePassword}
                    style={[
                      styles.enhancedButton,
                      styles.enhancedSaveButton,
                      {
                        backgroundColor: theme.colors.primary,
                        opacity: isChangingPassword || 
                          !currentPassword || 
                          !newPassword || 
                          !confirmPassword || 
                          newPassword !== confirmPassword || 
                          newPassword.length < 6 ? 0.5 : 1,
                      },
                    ]}
                    disabled={
                      isChangingPassword || 
                      !currentPassword || 
                      !newPassword || 
                      !confirmPassword || 
                      newPassword !== confirmPassword || 
                      newPassword.length < 6
                    }
                    activeOpacity={0.8}
                  >
                    {isChangingPassword ? (
                      <>
                        <ActivityIndicator size="small" color="#fff" style={styles.buttonIcon} />
                        <Text style={styles.enhancedSaveButtonText}>Changing...</Text>
                      </>
                    ) : (
                      <>
                        <Ionicons 
                          name="shield-checkmark-outline" 
                          size={18} 
                          color="#fff" 
                          style={styles.buttonIcon}
                        />
                        <Text style={styles.enhancedSaveButtonText}>Change</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
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
    gap: 8,
  },
  avatarOption: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
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

  /* Modal Styles */
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 24,
  },
  keyboardAvoidingView: {
    width: '100%',
    maxWidth: 400,
    justifyContent: 'center',
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

  /* Contact Modal Styles */
  contactModalContainer: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  contactTypeSection: {
    marginBottom: 20,
  },
  contactTypeScrollView: {
    marginTop: 8,
  },
  contactTypeScrollContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  contactTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  contactTypeEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  contactTypeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  messageInputWrapper: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 100,
  },
  messageInput: {
    fontSize: 16,
    fontWeight: '400',
    minHeight: 80,
  },

  /* Enhanced Change Password Modal Styles */
  changePasswordModalContainer: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  scrollModalContent: {
    flexGrow: 1,
  },
  securityNotice: {
    flexDirection: 'row',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  securityIconContainer: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityTextContainer: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  securityDescription: {
    fontSize: 12,
    lineHeight: 16,
  },

  /* Stable Password Input Styles */
  stablePasswordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    height: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  stablePasswordInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  stablePasswordToggle: {
    padding: 8,
    marginLeft: 4,
    borderRadius: 6,
  },

  /* Enhanced Validation Styles */
  validationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginLeft: 4,
    gap: 6,
  },
  passwordHint: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500',
  },
  passwordError: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
  },

  /* Enhanced Password Requirements */
  passwordRequirements: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  requirementsList: {
    gap: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  requirementText: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
  },

  /* Enhanced Button Styles */
  enhancedModalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  enhancedButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  enhancedCancelButton: {
    borderWidth: 1.5,
  },
  enhancedSaveButton: {
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonIcon: {
    marginRight: 8,
  },
  enhancedCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  enhancedSaveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.3,
  },
});