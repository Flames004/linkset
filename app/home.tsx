// app/home.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert } from 'react-native';
import { db, auth } from '../services/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { router } from 'expo-router';

export default function HomeScreen() {
  const [link, setLink] = useState('');
  const [links, setLinks] = useState<any[]>([]);

  const user = auth.currentUser;

  const handleAddLink = async () => {
    if (!link.trim()) return Alert.alert('Link cannot be empty');
    try {
      await addDoc(collection(db, 'users', user?.uid || 'guest', 'links'), {
        url: link.trim(),
        createdAt: serverTimestamp(),
      });
      setLink('');
    } catch (error) {
      Alert.alert('Error saving link', error.message);
    }
  };

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'links'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const linkData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLinks(linkData);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    await auth.signOut();
    router.replace('/auth/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user?.email}</Text>

      <TextInput
        placeholder="Paste your link"
        value={link}
        onChangeText={setLink}
        style={styles.input}
      />

      <Button title="Save Link" onPress={handleAddLink} />

      <FlatList
        data={links}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Text style={styles.link}>{item.url}</Text>}
        style={styles.list}
      />

      <Button title="Logout" onPress={handleLogout} color="#e63946" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 40 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  list: {
    marginVertical: 20,
  },
  link: {
    padding: 8,
    fontSize: 16,
    backgroundColor: '#f1f1f1',
    borderRadius: 4,
    marginBottom: 6,
  },
});
