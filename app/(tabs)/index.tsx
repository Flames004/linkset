// app/(tabs)/index.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  TouchableOpacity,
} from "react-native";
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/services/firebase";
import { auth } from "@/services/firebase";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { RectButton } from "react-native-gesture-handler";
import { addDoc } from "firebase/firestore";

export default function HomeScreen() {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState("");
  const [newLink, setNewLink] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const unsubscribe = onSnapshot(
      collection(db, "users", uid, "links"),
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLinks(items);
        setLoading(false);
      },
      (error) => {
        Alert.alert("Error fetching links", error.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const handleAddLink = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid || !newLink.trim()) return;

    setAdding(true);

    try {
      await addDoc(collection(db, "users", uid, "links"), {
        url: newLink.trim(),
        createdAt: new Date(),
      });
      setNewLink("");
    } catch (error: any) {
      Alert.alert("Add Error", error.message);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      await deleteDoc(doc(db, "users", uid, "links", id));
    } catch (error: any) {
      Alert.alert("Delete Error", error.message);
    }
  };

  const handleEdit = (id: string, currentText: string) => {
    setEditingLinkId(id);
    setEditedText(currentText);
  };

  const saveEdit = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid || !editingLinkId) return;

    try {
      await updateDoc(doc(db, "users", uid, "links", editingLinkId), {
        url: editedText,
      });
      setEditingLinkId(null);
      setEditedText("");
    } catch (error: any) {
      Alert.alert("Edit Error", error.message);
    }
  };

  const renderRightActions = (item: any) => (
    <View style={{ flexDirection: "row" }}>
      <RectButton
        style={styles.editButton}
        onPress={() => handleEdit(item.id, item.url)}
      >
        <Text style={styles.actionText}>Edit</Text>
      </RectButton>
      <RectButton
        style={styles.deleteButton}
        onPress={() =>
          Alert.alert("Delete", "Are you sure?", [
            { text: "Cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => handleDelete(item.id),
            },
          ])
        }
      >
        <Text style={styles.actionText}>Delete</Text>
      </RectButton>
    </View>
  );

  const renderItem = ({ item }: { item: any }) => (
    <Swipeable renderRightActions={() => renderRightActions(item)}>
      <View style={styles.item}>
        {editingLinkId === item.id ? (
          <View style={styles.editContainer}>
            <TextInput
              value={editedText}
              onChangeText={setEditedText}
              style={styles.input}
              placeholder="Edit link"
            />
            <TouchableOpacity onPress={saveEdit}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.text}>{item.url}</Text>
        )}
      </View>
    </Swipeable>
  );

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Paste a new link"
        value={newLink}
        onChangeText={setNewLink}
        style={styles.input}
      />
      <TouchableOpacity onPress={handleAddLink} disabled={adding}>
        <Text style={styles.saveButton}>{adding ? "Adding..." : "Add"}</Text>
      </TouchableOpacity>
      <FlatList
        data={links}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 50 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fafafa",
  },
  text: {
    fontSize: 16,
  },
  editContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 8,
    marginRight: 8,
  },
  saveButton: {
    color: "blue",
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "#ff3b30",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
  },
  editButton: {
    backgroundColor: "#ffcc00",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
  },
  actionText: {
    color: "#fff",
    fontWeight: "bold",
  },
  addContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f5f5f5",
  },
});
