// app/index.tsx
import { View, Text, Button, StyleSheet } from 'react-native';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { auth } from '../services/firebase';
import { Redirect, router } from 'expo-router';

export default function HomeScreen() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;
  if (!user) return <Redirect href="/login" />;

  const handleLogout = async () => {
    await auth.signOut();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to LinkSet 🔗</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, marginBottom: 20 },
});
