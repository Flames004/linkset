import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { auth, db } from "@/services/firebase";
import {
  collection,
  onSnapshot,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: Date;
  linkCount?: number;
}

const CATEGORY_COLORS = [
  "#007AFF", // Blue
  "#FF3B30", // Red
  "#FF9500", // Orange
  "#FFCC00", // Yellow
  "#34C759", // Green
  "#5856D6", // Purple
  "#AF52DE", // Magenta
  "#FF2D92", // Pink
  "#5AC8FA", // Light Blue
  "#FF6B35"  // Orange Red (replacing duplicate)
];

const CATEGORY_ICONS = [
  "folder", "bookmark", "star", "heart", "briefcase", 
  "school", "home", "car", "restaurant", "game-controller"
];

export default function CategoriesScreen() {
  const { theme, isDark } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedColor, setSelectedColor] = useState(CATEGORY_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(CATEGORY_ICONS[0]);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const categoriesQuery = query(
      collection(db, "users", uid, "categories"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(categoriesQuery, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Category[];
      setCategories(items);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleSaveCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert("Error", "Please enter a category name");
      return;
    }

    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      if (editingCategory) {
        // Update existing category
        await updateDoc(doc(db, "users", uid, "categories", editingCategory.id), {
          name: newCategoryName.trim(),
          color: selectedColor,
          icon: selectedIcon,
          updatedAt: new Date(),
        });
      } else {
        // Create new category
        await addDoc(collection(db, "users", uid, "categories"), {
          name: newCategoryName.trim(),
          color: selectedColor,
          icon: selectedIcon,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      resetModal();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    Alert.alert(
      "Delete Category",
      "This will remove the category from all links. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const uid = auth.currentUser?.uid;
            if (!uid) return;

            try {
              await deleteDoc(doc(db, "users", uid, "categories", categoryId));
              // TODO: Update all links that use this category
            } catch (error: any) {
              Alert.alert("Error", error.message);
            }
          },
        },
      ]
    );
  };

  const openEditModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setNewCategoryName(category.name);
      setSelectedColor(category.color);
      setSelectedIcon(category.icon);
    }
    setModalVisible(true);
  };

  const resetModal = () => {
    setModalVisible(false);
    setEditingCategory(null);
    setNewCategoryName("");
    setSelectedColor(CATEGORY_COLORS[0]);
    setSelectedIcon(CATEGORY_ICONS[0]);
  };

  const CategoryCard = ({ category }: { category: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
      onPress={() => openEditModal(category)}
    >
      <View style={styles.categoryHeader}>
        <View
          style={[
            styles.categoryIconContainer,
            { backgroundColor: category.color + "20" },
          ]}
        >
          <Ionicons
            name={category.icon as any}
            size={24}
            color={category.color}
          />
        </View>
        <View style={styles.categoryInfo}>
          <Text style={[styles.categoryName, { color: theme.colors.text }]}>
            {category.name}
          </Text>
          <Text
            style={[styles.categoryCount, { color: theme.colors.textSecondary }]}
          >
            {category.linkCount || 0} links
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => handleDeleteCategory(category.id)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={18} color="#FF453A" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const ColorPicker = () => (
    <View style={styles.colorPicker}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Color
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.colorRow}>
          {CATEGORY_COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                selectedColor === color && styles.selectedColor,
              ]}
              onPress={() => setSelectedColor(color)}
            >
              {selectedColor === color && (
                <Ionicons name="checkmark" size={16} color="white" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const IconPicker = () => (
    <View style={styles.iconPicker}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Icon
      </Text>
      <View style={styles.iconGrid}>
        {CATEGORY_ICONS.map((icon) => (
          <TouchableOpacity
            key={icon}
            style={[
              styles.iconOption,
              {
                backgroundColor: theme.colors.surface,
                borderColor:
                  selectedIcon === icon ? selectedColor : theme.colors.border,
              },
            ]}
            onPress={() => setSelectedIcon(icon)}
          >
            <Ionicons
              name={icon as any}
              size={20}
              color={selectedIcon === icon ? selectedColor : theme.colors.textSecondary}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Categories
        </Text>
        <TouchableOpacity
          onPress={() => openEditModal()}
          style={[
            styles.addButton,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          <Ionicons name="add" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Categories List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
        
        {categories.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons
              name="folder-outline"
              size={64}
              color={theme.colors.textSecondary}
            />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              No Categories Yet
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}
            >
              Create categories to organize your links
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Category Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalContainer,
              { backgroundColor: theme.colors.card },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                {editingCategory ? "Edit Category" : "New Category"}
              </Text>
              <TouchableOpacity onPress={resetModal}>
                <Ionicons
                  name="close"
                  size={24}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Name Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                  Name
                </Text>
                <TextInput
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                      color: theme.colors.text,
                    },
                  ]}
                  placeholder="Enter category name"
                  placeholderTextColor={theme.colors.textSecondary}
                  maxLength={20}
                />
              </View>

              <ColorPicker />
              <IconPicker />

              {/* Preview */}
              <View style={styles.preview}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Preview
                </Text>
                <View
                  style={[
                    styles.previewCard,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.previewIcon,
                      { backgroundColor: selectedColor + "20" },
                    ]}
                  >
                    <Ionicons
                      name={selectedIcon as any}
                      size={20}
                      color={selectedColor}
                    />
                  </View>
                  <Text style={[styles.previewText, { color: theme.colors.text }]}>
                    {newCategoryName || "Category Name"}
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={resetModal}
                style={[
                  styles.modalButton,
                  { backgroundColor: theme.colors.surface },
                ]}
              >
                <Text style={[styles.cancelText, { color: theme.colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveCategory}
                style={[
                  styles.modalButton,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Text style={styles.saveText}>
                  {editingCategory ? "Update" : "Create"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  categoryCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 14,
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    minHeight: "60%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5E7",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  textInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  colorPicker: {
    marginBottom: 24,
  },
  colorRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 4,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: "white",
  },
  iconPicker: {
    marginBottom: 24,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  preview: {
    marginBottom: 24,
  },
  previewCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  previewIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  previewText: {
    fontSize: 16,
    fontWeight: "500",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    paddingTop: 0,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});