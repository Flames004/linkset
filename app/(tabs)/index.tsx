import React, { useEffect, useState, useRef, useMemo } from "react";
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
  StatusBar,
  Animated,
  Dimensions,
  ScrollView,
} from "react-native";
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  addDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db, auth } from "@/services/firebase";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { Picker } from "@react-native-picker/picker";

const { width: screenWidth } = Dimensions.get("window");

// CategorySelector Component - moved to proper location
const CategorySelector = ({
  categories,
  selectedCategory,
  onCategoryChange,
  theme,
}: {
  categories: any[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  theme: any;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedCat = categories.find(
    (cat: any) => cat.id === selectedCategory
  );

  return (
    <View style={categoryStyles.container}>
      <TouchableOpacity
        style={[
          categoryStyles.button,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.7}
      >
        <View style={categoryStyles.content}>
          {selectedCat ? (
            <>
              <View
                style={[
                  categoryStyles.miniIcon,
                  { backgroundColor: selectedCat.color + "20" },
                ]}
              >
                <Ionicons
                  name={selectedCat.icon}
                  size={12}
                  color={selectedCat.color}
                />
              </View>
              <Text
                style={[
                  categoryStyles.text,
                  { color: theme.colors.text },
                ]}
                numberOfLines={1}
              >
                {selectedCat.name}
              </Text>
            </>
          ) : (
            <>
              <Ionicons
                name="folder-outline"
                size={14}
                color={theme.colors.textSecondary}
              />
              <Text
                style={[
                  categoryStyles.text,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Category
              </Text>
            </>
          )}
        </View>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={14}
          color={theme.colors.textSecondary}
        />
      </TouchableOpacity>

      {isOpen && (
        <View
          style={[
            categoryStyles.dropdown,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <ScrollView
            style={categoryStyles.dropdownScroll}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <TouchableOpacity
              style={categoryStyles.option}
              onPress={() => {
                onCategoryChange("");
                setIsOpen(false);
              }}
            >
              <Ionicons
                name="close-circle-outline"
                size={16}
                color={theme.colors.textSecondary}
              />
              <Text
                style={[
                  categoryStyles.optionText,
                  { color: theme.colors.text },
                ]}
              >
                No Category
              </Text>
            </TouchableOpacity>

            {categories.map((category: any) => (
              <TouchableOpacity
                key={category.id}
                style={categoryStyles.option}
                onPress={() => {
                  onCategoryChange(category.id);
                  setIsOpen(false);
                }}
              >
                <View
                  style={[
                    categoryStyles.miniIcon,
                    { backgroundColor: category.color + "20" },
                  ]}
                >
                  <Ionicons
                    name={category.icon}
                    size={12}
                    color={category.color}
                  />
                </View>
                <Text
                  style={[
                    categoryStyles.optionText,
                    { color: theme.colors.text },
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default function HomeScreen() {
  const { theme, toggleTheme, isDark } = useTheme();
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLink, setNewLink] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedLink, setEditedLink] = useState("");
  const [editedTitle, setEditedTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const swipeableRefs = useRef<{ [key: string]: any }>({});

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const linksQuery = query(
      collection(db, "users", uid, "links"),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(
      linksQuery,
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
      }));
      setCategories(items);
    });

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
      const now = new Date();
      await addDoc(collection(db, "users", uid, "links"), {
        url: newLink.trim(),
        title: newTitle.trim() || "Untitled Link",
        categoryId: selectedCategory || null,
        createdAt: now,
        updatedAt: now,
      });
      setNewLink("");
      setNewTitle("");
      setSelectedCategory("");
      setAddModalVisible(false); // Close modal after adding
    } catch (error: any) {
      Alert.alert("Add Error", error.message);
    } finally {
      setAdding(false);
    }
  };

  const openEditModal = (id: string, url: string, title: string) => {
    setEditingId(id);
    setEditedLink(url);
    setEditedTitle(title || "");
    setEditModalVisible(true);
  };

  const saveEdit = async () => {
    if (!editingId || !editedLink.trim()) return;
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      await updateDoc(doc(db, "users", uid, "links", editingId), {
        url: editedLink.trim(),
        title: editedTitle.trim() || "Untitled Link",
        updatedAt: new Date(),
      });

      if (swipeableRefs.current[editingId]) {
        swipeableRefs.current[editingId].close();
      }

      setEditModalVisible(false);
      setEditingId(null);
      setEditedLink("");
      setEditedTitle("");
    } catch (error: any) {
      Alert.alert("Edit Error", error.message);
    }
  };

  const closeEditModal = () => {
    if (editingId && swipeableRefs.current[editingId]) {
      swipeableRefs.current[editingId].close();
    }

    setEditModalVisible(false);
    setEditingId(null);
    setEditedLink("");
    setEditedTitle("");
  };

  const filteredLinks = useMemo(() => {
    let filtered = links;

    // Apply category filter
    if (filterCategory === "uncategorized") {
      filtered = filtered.filter((link) => !link.categoryId);
    } else if (filterCategory !== "all") {
      filtered = filtered.filter((link) => link.categoryId === filterCategory);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((link) =>
        link.title.toLowerCase().includes(query) ||
        link.url.toLowerCase().includes(query) ||
        categories.find(cat => cat.id === link.categoryId)?.name.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [links, filterCategory, searchQuery, categories]);

  const renderLeftActions = (
    progress: Animated.AnimatedAddition<number>,
    dragX: Animated.AnimatedAddition<number>,
    onDelete: () => void
  ) => {
    const scale = dragX.interpolate({
      inputRange: [0, 60, 120],
      outputRange: [0.8, 1, 1.1],
      extrapolate: "clamp",
    });

    return (
      <View style={styles.swipeActionsContainer}>
        <Animated.View
          style={[styles.swipeActionWrapper, { transform: [{ scale }] }]}
        >
          <TouchableOpacity
            onPress={onDelete}
            style={[
              styles.swipeActionButton,
              styles.deleteButton,
              { backgroundColor: "#FF453A" },
            ]}
          >
            <Ionicons name="trash-outline" size={20} color="white" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const renderRightActions = (
    progress: Animated.AnimatedAddition<number>,
    dragX: Animated.AnimatedAddition<number>,
    onEdit: () => void
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-120, -60, 0],
      outputRange: [1.1, 1, 0.8],
      extrapolate: "clamp",
    });

    return (
      <View style={styles.swipeActionsContainer}>
        <Animated.View
          style={[styles.swipeActionWrapper, { transform: [{ scale }] }]}
        >
          <TouchableOpacity
            onPress={onEdit}
            style={[
              styles.swipeActionButton,
              styles.editButton,
              { backgroundColor: "#30D158" },
            ]}
          >
            <Ionicons name="pencil" size={20} color="white" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const category = categories.find((cat) => cat.id === item.categoryId);

    return (
      <Swipeable
        ref={(ref) => {
          if (ref) {
            swipeableRefs.current[item.id] = ref;
          } else {
            delete swipeableRefs.current[item.id];
          }
        }}
        overshootLeft={false}
        overshootRight={false}
        renderLeftActions={(progress, dragX) =>
          renderLeftActions(progress, dragX, () => {
            Alert.alert("Delete Link", "This action cannot be undone.", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: () => handleDelete(item.id),
              },
            ]);
          })
        }
        renderRightActions={(progress, dragX) =>
          renderRightActions(progress, dragX, () =>
            openEditModal(item.id, item.url, item.title)
          )
        }
        leftThreshold={40}
        rightThreshold={40}
      >
        <TouchableOpacity
          onPress={() => Linking.openURL(item.url)}
          style={[
            styles.linkCard,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
              borderLeftWidth: category ? 4 : 1,
              borderLeftColor: category?.color || theme.colors.border,
            },
          ]}
          activeOpacity={0.7}
        >
          <View style={styles.linkHeader}>
            <View
              style={[
                styles.linkIcon,
                {
                  backgroundColor:
                    (category?.color || theme.colors.primary) + "20",
                },
              ]}
            >
              <Ionicons
                name={category?.icon || "bookmark"}
                size={16}
                color={category?.color || theme.colors.primary}
              />
            </View>
            <View style={styles.linkContent}>
              <Text
                style={[styles.linkTitle, { color: theme.colors.text }]}
                numberOfLines={1}
              >
                {item.title || "Untitled Link"}
              </Text>
              <Text
                style={[styles.linkUrl, { color: theme.colors.textSecondary }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.url}
              </Text>
              {category && (
                <View style={styles.categoryTag}>
                  <Text
                    style={[styles.categoryTagText, { color: category.color }]}
                  >
                    {category.name}
                  </Text>
                </View>
              )}
            </View>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={theme.colors.textSecondary}
            />
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <View
        style={[
          styles.emptyIcon,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <Ionicons
          name={searchQuery ? "search" : "link"}
          size={32}
          color={theme.colors.textSecondary}
        />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        {searchQuery
          ? "No links found"
          : filterCategory === "all"
          ? "No links yet"
          : "No links in this category"}
      </Text>
      <Text
        style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}
      >
        {searchQuery
          ? `No links match "${searchQuery}". Try a different search term.`
          : filterCategory === "all"
          ? "Tap the + button to add your first link"
          : "Links in this category will appear here"}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
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
            <View>
              <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                LinkSet
              </Text>
              <Text
                style={[
                  styles.headerSubtitle,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {searchQuery
                  ? `${filteredLinks.length} result${
                      filteredLinks.length !== 1 ? "s" : ""
                    } for "${searchQuery}"`
                  : `${links.length} saved links`}
              </Text>
            </View>
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

        {/* Search Bar */}
        <View
          style={[
            styles.searchSection,
            {
              backgroundColor: theme.colors.card,
              borderBottomColor: theme.colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.searchContainer,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Ionicons
              name="search"
              size={18}
              color={theme.colors.textSecondary}
              style={styles.searchIcon}
            />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder="Search links, titles, or categories..."
              placeholderTextColor={theme.colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                style={styles.clearSearchButton}
              >
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Filter */}
        <View
          style={[
            styles.filterSection,
            {
              backgroundColor: theme.colors.card,
              borderBottomColor: theme.colors.border,
            },
          ]}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  {
                    backgroundColor:
                      filterCategory === "all"
                        ? theme.colors.primary
                        : theme.colors.surface,
                  },
                ]}
                onPress={() => setFilterCategory("all")}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color:
                        filterCategory === "all" ? "white" : theme.colors.text,
                    },
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterChip,
                  {
                    backgroundColor:
                      filterCategory === "uncategorized"
                        ? theme.colors.primary
                        : theme.colors.surface,
                  },
                ]}
                onPress={() => setFilterCategory("uncategorized")}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color:
                        filterCategory === "uncategorized"
                          ? "white"
                          : theme.colors.text,
                    },
                  ]}
                >
                  Uncategorized
                </Text>
              </TouchableOpacity>

              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor:
                        filterCategory === category.id
                          ? category.color
                          : theme.colors.surface,
                      borderColor: category.color,
                      borderWidth: 1,
                    },
                  ]}
                  onPress={() => setFilterCategory(category.id)}
                >
                  <Ionicons
                    name={category.icon}
                    size={14}
                    color={
                      filterCategory === category.id ? "white" : category.color
                    }
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={[
                      styles.filterChipText,
                      {
                        color:
                          filterCategory === category.id
                            ? "white"
                            : theme.colors.text,
                      },
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Links List */}
        <FlatList
          data={filteredLinks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContainer,
            links.length === 0 && styles.emptyListContainer,
          ]}
          ListEmptyComponent={EmptyState}
          showsVerticalScrollIndicator={false}
        />

        {/* Edit Modal */}
        <Modal visible={editModalVisible} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              activeOpacity={1}
              onPress={closeEditModal}
            />
            <View
              style={[
                styles.modalContainer,
                { backgroundColor: theme.colors.card },
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  Edit Link
                </Text>
                <TouchableOpacity
                  onPress={closeEditModal}
                  style={styles.modalCloseButton}
                >
                  <Ionicons
                    name="close"
                    size={16}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <View
                style={[
                  styles.modalInputWrapper,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <TextInput
                  value={editedTitle}
                  onChangeText={setEditedTitle}
                  style={[styles.modalInput, { color: theme.colors.text }]}
                  placeholder="Link title"
                  placeholderTextColor={theme.colors.textSecondary}
                  autoCapitalize="words"
                  autoCorrect={true}
                  returnKeyType="next"
                />
              </View>

              <View
                style={[
                  styles.modalInputWrapper,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <TextInput
                  value={editedLink}
                  onChangeText={setEditedLink}
                  style={[styles.modalInput, { color: theme.colors.text }]}
                  placeholder="Link URL"
                  placeholderTextColor={theme.colors.textSecondary}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  returnKeyType="done"
                  onSubmitEditing={saveEdit}
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={closeEditModal}
                  style={[
                    styles.modalButton,
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
                  onPress={saveEdit}
                  style={[
                    styles.modalButton,
                    styles.saveButton,
                    {
                      backgroundColor: editedLink.trim()
                        ? theme.colors.primary
                        : theme.colors.surface,
                      opacity: editedLink.trim() ? 1 : 0.6,
                    },
                  ]}
                  disabled={!editedLink.trim()}
                >
                  <Text
                    style={[
                      styles.saveButtonText,
                      {
                        color: editedLink.trim()
                          ? "#fff"
                          : theme.colors.textSecondary,
                      },
                    ]}
                  >
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Add Link Modal */}
        <Modal visible={addModalVisible} transparent animationType="slide">
          <View style={styles.modalBackdrop}>
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              activeOpacity={1}
              onPress={() => setAddModalVisible(false)}
            />
            <View
              style={[
                styles.addModalContainer,
                { backgroundColor: theme.colors.card },
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  Add New Link
                </Text>
                <TouchableOpacity
                  onPress={() => setAddModalVisible(false)}
                  style={styles.modalCloseButton}
                >
                  <Ionicons
                    name="close"
                    size={16}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <View
                style={[
                  styles.modalInputWrapper,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <TextInput
                  value={newTitle}
                  onChangeText={setNewTitle}
                  style={[styles.modalInput, { color: theme.colors.text }]}
                  placeholder="Title (optional)"
                  placeholderTextColor={theme.colors.textSecondary}
                  autoCapitalize="words"
                  autoCorrect={true}
                  returnKeyType="next"
                />
              </View>

              <CategorySelector
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                theme={theme}
              />

              <View
                style={[
                  styles.modalInputWrapper,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <TextInput
                  value={newLink}
                  onChangeText={setNewLink}
                  style={[styles.modalInput, { color: theme.colors.text }]}
                  placeholder="Paste your link here"
                  placeholderTextColor={theme.colors.textSecondary}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  returnKeyType="done"
                  onSubmitEditing={handleAddLink}
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={() => setAddModalVisible(false)}
                  style={[
                    styles.modalButton,
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
                  onPress={handleAddLink}
                  style={[
                    styles.modalButton,
                    styles.saveButton,
                    {
                      backgroundColor: newLink.trim()
                        ? theme.colors.primary
                        : theme.colors.surface,
                      opacity: adding ? 0.6 : 1,
                    },
                  ]}
                  disabled={adding || !newLink.trim()}
                >
                  {adding ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text
                      style={[
                        styles.saveButtonText,
                        {
                          color: newLink.trim()
                            ? "#fff"
                            : theme.colors.textSecondary,
                        },
                      ]}
                    >
                      Add Link
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </LinearGradient>

      {/* Floating Add Button - OUTSIDE LinearGradient */}
      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: theme.colors.primary,
            shadowColor: theme.colors.primary,
          },
        ]}
        onPress={() => setAddModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

// Main styles
const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

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
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  themeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },

  addModalContainer: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },

  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "400",
  },
  clearSearchButton: {
    marginLeft: 8,
    padding: 2,
  },

  filterSection: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "500",
  },

  addSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  listContainer: {
    padding: 20,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
  },

  linkCard: {
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
  linkHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  linkIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  linkContent: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
    marginBottom: 2,
  },
  linkUrl: {
    fontSize: 13,
    lineHeight: 18,
  },
  categoryTag: {
    marginTop: 4,
  },
  categoryTagText: {
    fontSize: 12,
    fontWeight: "500",
  },

  swipeActionsContainer: {
    flexDirection: "row",
    width: 60,
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  swipeActionWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  swipeActionButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 44,
    height: 44,
    borderRadius: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editButton: {},
  deleteButton: {},

  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },

  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 24,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 320,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  modalCloseButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  modalInputWrapper: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 44,
    justifyContent: "center",
    marginBottom: 12,
  },
  modalInput: {
    fontSize: 15,
    fontWeight: "400",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {},
  saveButton: {},
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "500",
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },

// CategorySelector styles
});

const categoryStyles = StyleSheet.create({
  container: {
    position: "relative",
    minWidth: 120,
    maxWidth: 140,
    marginBottom: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 6,
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  miniIcon: {
    width: 18,
    height: 18,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  dropdown: {
    position: "absolute",
    top: 48,
    left: 0,
    right: 0,
    borderRadius: 8,
    borderWidth: 1,
    maxHeight: 150,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  dropdownScroll: {
    maxHeight: 150,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    minHeight: 40,
  },
  optionText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
});
