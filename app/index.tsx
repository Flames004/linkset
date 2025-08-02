// app/index.tsx (new file)
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingScreen from '@/components/OnboardingScreen';

export default function IndexScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!isMounted) return;

        console.log('🔥 Index: Auth state changed:', user ? 'LOGGED IN' : 'NOT LOGGED IN');

        if (user) {
          // User is authenticated, go to main app
          console.log('🔥 Index: Redirecting to tabs');
          router.replace('/(tabs)');
        } else {
          // User not authenticated, check onboarding
          const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
          
          if (hasSeenOnboarding === 'true') {
            // User has seen onboarding, go to login
            console.log('🔥 Index: Redirecting to login');
            router.replace('/(auth)/login');
          } else {
            // First time user, show onboarding
            console.log('🔥 Index: Showing onboarding');
            if (isMounted) {
              setIsLoading(false);
              setIsCheckingAuth(false);
            }
          }
        }
      } catch (error) {
        console.error('🔥 Index: Error during auth check:', error);
        if (isMounted) {
          router.replace('/(auth)/login');
        }
      }
    });

    // Cleanup function
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      router.replace('/(auth)/login');
    }
  };

  if (isLoading || isCheckingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <OnboardingScreen onFinish={handleOnboardingComplete} />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});