// app/index.tsx (new file)
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

export default function RootIndex() {
  const { user, loading } = useContext(AuthContext);
  const { theme } = useTheme();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <View 
        style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          backgroundColor: theme.colors.background 
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Redirect based on auth status
  if (user) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/welcome" />;
  }
}