import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    TouchableOpacity,
    Pressable,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { API_URL } from "../constants/constants";

export default function CompletedTasksScreen() {
    // =================
    // STATE MANAGEMENT
    // =================

    // Array to store completed tasks data from the API
    const [tasks, setTasks] = useState([]);

    // Controls the pull-to-refresh loading state
    const [refreshing, setRefreshing] = useState(false);

    // Track which task has its 3-dot menu open
    const [selectedTaskId, setSelectedTaskId] = useState(null);

    // Router instance for navigation
    const router = useRouter();

    // =================
    // DATA FETCHING
    // =================

    // Fetch completed tasks from API
    const fetchTasks = useCallback(() => {
        return fetch(`${API_URL}/api/tasks/completed`)
            .then((res) => res.json())
            .then(setTasks)
            .catch((err) => console.error("Error fetching completed tasks:", err));
    }, []);

    // Refresh data when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchTasks();
        }, [fetchTasks])
    );

    // =================
    // EVENT HANDLERS
    // =================

    // Handle pull-to-refresh functionality
    const handleRefresh = () => {
        setRefreshing(true);
        fetchTasks().finally(() => setRefreshing(false));
    };

    // Mark a completed task as incomplete (undo completion)
    const handleUndo = async (id) => {
        try {
            await fetch(`${API_URL}/api/tasks/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ completed: false }),
            });

            // Refresh the list to remove the undone task
            fetchTasks();
        } catch (err) {
            console.error("Error undoing completion:", err);
        } finally {
            // Close the menu after action
            setSelectedTaskId(null);
        }
    };

    // =================
    // MAIN RENDER
    // =================

    return (
        <View style={styles.container}>
            {/* =================
                NAVIGATION + HEADER
                ================= */}
            <View style={styles.headerRow}>
                {/* Back Button */}
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                {/* Header */}
                <Text style={styles.heading}>Completed Tasks</Text>
            </View>

            {/* =================
                COMPLETED TASKS LIST 
                ================= */}
            <FlatList
                data={tasks}
                keyExtractor={(item) => item._id}
                /* Pull-to-refresh functionality */
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
                renderItem={({ item }) => (
                    <View style={{ position: "relative" }}>
                        {/* Overlay to close menu when tapping outside */}
                        {selectedTaskId === item._id && (
                            <Pressable
                                onPress={() => setSelectedTaskId(null)}
                                style={StyleSheet.absoluteFillObject}
                            />
                        )}

                        {/* Task Card - now styled like HomeScreen */}
                        <View style={styles.taskCard}>
                            {/* Task Header: Priority badge, Title, Menu Button */}
                            <View style={styles.taskHeader}>
                                <View style={styles.titleRow}>
                                    {/* Priority Badge (HomeScreen style) */}
                                    <View
                                        style={[
                                            styles.priorityBadge,
                                            styles[`priority${item.priority}`],
                                        ]}>
                                        <Text style={styles.priorityBadgeText}>
                                            {item.priority?.[0] || "M"}
                                        </Text>
                                    </View>
                                    <Text style={styles.taskTitle}>{item.title}</Text>
                                </View>

                                {/* Three-dot Menu Button */}
                                <TouchableOpacity onPress={() => setSelectedTaskId(item._id)}>
                                    <Text style={styles.dots}>⋯</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Dropdown Menu (Undo Complete) */}
                            {selectedTaskId === item._id && (
                                <View style={styles.menu}>
                                    <TouchableOpacity onPress={() => handleUndo(item._id)}>
                                        <Text style={styles.menuItem}>↩️ Undo Complete</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* Task Description */}
                            <Text style={styles.taskDescription}>{item.description}</Text>

                            {/* Tag List + Timeline (coloured by priority) */}
                            <View style={styles.taskFooter}>
                                {/* Tags */}
                                <View style={styles.tagContainer}>
                                    {item.tags?.length > 0 &&
                                        item.tags.map((tag, idx) => (
                                            <Text key={idx} style={styles.tag}>
                                                #{tag}
                                            </Text>
                                        ))}
                                </View>
                                {/* Timeline with priority colour */}
                                <Text
                                    style={[
                                        styles.taskTimeline,
                                        item.priority === "High"
                                            ? { color: "#EF4444" }
                                            : item.priority === "Medium"
                                            ? { color: "#F97316" }
                                            : { color: "#0EA5E9" },
                                    ]}>
                                    {new Date(item.createdAt).toLocaleDateString()} →{" "}
                                    {new Date(item.dueDate).toLocaleDateString()}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}
                /* Show empty state when no completed tasks exist */
                ListEmptyComponent={<Text style={styles.empty}>No completed tasks yet.</Text>}
                /* Add bottom padding for navigation and scrolling */
                contentContainerStyle={{ paddingBottom: 60 }}
            />
        </View>
    );
}

// =================
// STYLES
// =================

const styles = StyleSheet.create({
    // Main container styles
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
        paddingTop: 20,
        paddingHorizontal: 20,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        gap: 8,
    },
    heading: {
        fontFamily: "Poppins-SemiBold",
        flex: 1,
        fontSize: 20,
        color: "#2196F3",
        marginBottom: 20,
        textAlign: "center",
    },

    // Task card styles
    taskCard: {
        width: "100%",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "rgba(0, 110, 233, 0.06)",
        backgroundColor: "#FFF",
        padding: 16,
        marginBottom: 12,
        shadowColor: "#006EE9",
        shadowOpacity: 0.02,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 20,
        flexShrink: 1,
        position: "relative",
    },
    taskHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 4,
    },
    taskTitle: {
        color: "#2196F3",
        fontFamily: "Inter",
        fontSize: 15,
        fontWeight: "500",
        letterSpacing: 0.6,
        textTransform: "capitalize",
        width: "100%",
    },
    dots: {
        fontSize: 20,
        color: "#ABCEF5",
        lineHeight: 5,
    },
    taskDescription: {
        fontFamily: "Poppins",
        fontSize: 10,
        fontWeight: "400",
        color: "#4A4646",
        textTransform: "lowercase",
        marginBottom: 8,
        flexWrap: "wrap",
    },
    taskFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
    },
    tagContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 4,
    },
    tag: {
        fontFamily: "SpaceMono",
        fontSize: 10,
        fontWeight: "400",
        color: "#2196F3",
        backgroundColor: "#E0F2FE",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: 4,
        marginBottom: 4,
    },
    taskTimeline: {
        fontFamily: "Poppins",
        fontSize: 10,
        fontWeight: "400",
        color: "#0668E5",
        textAlign: "right",
    },

    // Priority badge styles
    priorityBadge: {
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: "center",
        alignItems: "center",
    },
    priorityBadgeText: {
        fontFamily: "Poppins",
        fontSize: 10,
        color: "#fff",
        fontWeight: "bold",
    },
    priorityHigh: {
        backgroundColor: "#EF4444",
    },
    priorityMedium: {
        backgroundColor: "#F97316",
    },
    priorityLow: {
        backgroundColor: "#0EA5E9",
    },

    // Dropdown menu styles
    menu: {
        position: "absolute",
        top: -10,
        right: 10,
        backgroundColor: "#ffffff",
        borderRadius: 8,
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 8,
        elevation: 5,
        zIndex: 20,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    menuItem: {
        fontFamily: "Inter",
        fontSize: 12,
        paddingVertical: 6,
        paddingHorizontal: 10,
        color: "#111827",
    },

    // Empty state styles
    empty: {
        fontFamily: "Inter",
        fontSize: 14,
        color: "#94a3b8",
        textAlign: "center",
        marginTop: 40,
    },

    // Back button styles
    backBtn: {
        marginBottom: 20,
        marginTop: 10,
        alignSelf: "flex-start",
        backgroundColor: "#E0F2FE",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
    },
    backText: {
        fontFamily: "Inter",
        fontSize: 14,
        fontWeight: "500",
        color: "#2196F3",
    },
});
