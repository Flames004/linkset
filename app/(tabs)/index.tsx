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
  Linking,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { db, auth } from "@/services/firebase";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLink, setNewLink] = useState("");
  const [adding, setAdding] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedLink, setEditedLink] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

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

  const handleDelete = async (id: string) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    try {
      await deleteDoc(doc(db, "users", uid, "links", id));
    } catch (error: any) {
      Alert.alert("Delete Error", error.message);
    }
  };

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

  const openEditModal = (id: string, url: string) => {
    setEditingId(id);
    setEditedLink(url);
    setEditModalVisible(true);
  };

  const saveEdit = async () => {
    if (!editingId || !editedLink.trim()) return;
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      await updateDoc(doc(db, "users", uid, "links", editingId), {
        url: editedLink.trim(),
      });
      setEditModalVisible(false);
      setEditingId(null);
      setEditedLink("");
    } catch (error: any) {
      Alert.alert("Edit Error", error.message);
    }
  };

  const renderSwipeActions = (item: any) => ({
    right: () => (
      <TouchableOpacity
        style={styles.actionButtonRight}
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
        <Ionicons name="trash-outline" size={24} color="#fff" />
      </TouchableOpacity>
    ),
    left: () => (
      <TouchableOpacity
        style={styles.actionButtonLeft}
        onPress={() => openEditModal(item.id, item.url)}
      >
        <Ionicons name="pencil-outline" size={24} color="#fff" />
      </TouchableOpacity>
    ),
  });

  const renderItem = ({ item }: { item: any }) => (
    <Swipeable
      renderLeftActions={renderSwipeActions(item).left}
      renderRightActions={renderSwipeActions(item).right}
    >
      <TouchableOpacity
        onPress={() => Linking.openURL(item.url)}
        style={styles.card}
      >
        <Text style={styles.cardText} numberOfLines={2}>
          {item.url}
        </Text>
      </TouchableOpacity>
    </Swipeable>
  );

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <View style={styles.addContainer}>
          <TextInput
            placeholder="Paste a new link"
            value={newLink}
            onChangeText={setNewLink}
            style={styles.input}
          />
          <TouchableOpacity
            onPress={handleAddLink}
            style={styles.addButton}
            disabled={adding}
          >
            <Text style={styles.addButtonText}>
              {adding ? "Adding..." : "Add"}
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={links}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 80 }}
        />

        <Modal visible={editModalVisible} transparent animationType="slide">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Edit Link</Text>
              <TextInput
                value={editedLink}
                onChangeText={setEditedLink}
                style={styles.input}
                placeholder="Update your link"
              />
              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <Text style={{ color: "#888" }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={saveEdit}>
                  <Text style={{ color: "#007AFF", fontWeight: "600" }}>
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f4f8" },

  addContainer: {
    flexDirection: "row",
    padding: 14,
    backgroundColor: "#fff",
    alignItems: "center",
    gap: 8,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  input: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  addButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 14,
    marginVertical: 6,
    padding: 16,
    borderRadius: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardText: {
    fontSize: 16,
    color: "#333",
  },
  actionButtonLeft: {
    backgroundColor: "#FFCC00",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    marginVertical: 6,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  actionButtonRight: {
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    marginVertical: 6,
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 24,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
});
