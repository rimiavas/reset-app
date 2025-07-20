import React, { useState, useCallback, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, Image } from "react-native";
import TaskList from "../components/Lists/TaskList";
import HabitGrid from "../components/Lists/HabitGrid";
import { useFocusEffect, useRouter } from "expo-router";
import { API_URL } from "../constants/constants";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate,
} from "react-native-reanimated";
import Logo from "../assets/images/Reset.png";
import tabStyles from "../constants/StyleSheet/tabStyles";
import taskCardStyles from "../constants/StyleSheet/taskCardStyles";
import buttonStyles from "../constants/StyleSheet/buttonStyles";
import habitStyles from "../constants/StyleSheet/habitStyles";
import emptyStateStyles from "../constants/StyleSheet/emptyStateStyles";
import menuStyles from "../constants/StyleSheet/menuStyles";

export default function HomeScreen() {
    // =================
    // STATE MANAGEMENT
    // =================

    // Controls which tab is active (tasks or habits)
    const [view, setView] = useState("tasks");

    // Stores the motivational quote displayed at the top
    const [quote, setQuote] = useState("");

    // Arrays to store tasks and habits data from the API
    const [tasks, setTasks] = useState([]);
    const [habits, setHabits] = useState([]);

    // Controls the pull-to-refresh loading state
    const [refreshing, setRefreshing] = useState(false);

    // Stores the width of each tab for animation calculations
    const [tabWidth, setTabWidth] = useState(0);

    // Router instance for navigation
    const router = useRouter();

    // =================
    // ANIMATION SETUP
    // =================

    // Shared value for tab sliding animation
    const tabTranslate = useSharedValue(0);

    // Controls how tasks are sorted (dueDate or priority)
    const [sortMode, setSortMode] = useState("dueDate");

    // =================
    // DATA FETCHING
    // =================

    // Fetch daily quote on component mount
    useEffect(() => {
        fetch(`${API_URL}/api/quotes`)
            .then((res) => res.json())
            .then((data) => setQuote(data.quote))
            .catch((err) => console.error("Error fetching quote:", err));
    }, []);

    // Fetch tasks and habits data from API
    const fetchData = useCallback(() => {
        return Promise.all([
            // Fetch tasks and filter out completed ones
            fetch(`${API_URL}/api/tasks`)
                .then((res) => res.json())
                .then((data) => setTasks(data.filter((task) => !task.completed)))
                .catch((err) => console.error("Error fetching tasks:", err)),

            // Fetch all habits
            fetch(`${API_URL}/api/habits`)
                .then((res) => res.json())
                .then(setHabits)
                .catch((err) => console.error("Error fetching habits:", err)),
        ]);
    }, []);

    // Refresh data when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    // =================
    // EVENT HANDLERS
    // =================

    // Handle pull-to-refresh functionality
    const handleRefresh = () => {
        setRefreshing(true);
        fetchData().finally(() => setRefreshing(false));
    };

    // Animate tab indicator when view changes
    useEffect(() => {
        tabTranslate.value = withTiming(view === "tasks" ? 0 : 1, {
            duration: 300,
        });
    }, [view]);

    // Create animated style for tab background slider
    const animatedBgStyle = useAnimatedStyle(() => {
        const translateX = interpolate(tabTranslate.value, [0, 1], [0, tabWidth]);
        return {
            transform: [{ translateX }],
        };
    });

    // =================
    // CRUD OPERATIONS
    // =================

    // Delete a task or habit with platform-specific confirmation
    const handleDelete = async (id) => {
        const route = view === "habits" ? "habits" : "tasks";

        // Use different confirmation dialogs for web vs mobile
        if (Platform.OS === "web") {
            const confirm = window.confirm(
                `Are you sure you want to delete this ${route.slice(0, -1)}?`
            );
            if (confirm) {
                try {
                    await fetch(`${API_URL}/api/${route}/${id}`, { method: "DELETE" });

                    // Update local state to remove deleted item
                    if (view === "tasks") {
                        setTasks((prev) => prev.filter((task) => task._id !== id));
                    } else {
                        setHabits((prev) => prev.filter((habit) => habit._id !== id));
                    }
                } catch (err) {
                    console.error(`Error deleting ${route.slice(0, -1)}:`, err);
                }
            }
        } else {
            // Native mobile alert dialog
            Alert.alert(
                "Delete Entry",
                `Are you sure you want to delete this ${route.slice(0, -1)}?`,
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Yes",
                        style: "destructive",
                        onPress: async () => {
                            try {
                                await fetch(`${API_URL}/api/${route}/${id}`, {
                                    method: "DELETE",
                                });

                                // Update local state to remove deleted item
                                if (view === "tasks") {
                                    setTasks((prev) => prev.filter((task) => task._id !== id));
                                } else {
                                    setHabits((prev) => prev.filter((habit) => habit._id !== id));
                                }
                            } catch (err) {
                                console.error(`Error deleting ${route.slice(0, -1)}:`, err);
                            }
                        },
                    },
                ],
                { cancelable: true }
            );
        }
    };

    // Mark a task as completed
    const handleMarkDone = async (id) => {
        try {
            await fetch(`${API_URL}/api/tasks/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ completed: true }),
            });

            // Remove completed task from the tasks list
            setTasks((prev) => prev.filter((task) => task._id !== id));
        } catch (err) {
            console.error("Error marking task done:", err);
        }
    };

    // =================
    // UTILITY FUNCTIONS
    // =================

    // Update habit progress (increment/decrement counter)
    const updateHabit = async (id, delta) => {
        try {
            const res = await fetch(`${API_URL}/api/habits/log/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: delta }),
            });
            const updated = await res.json();

            // Update the habit in local state with new progress
            setHabits((prev) => prev.map((h) => (h._id === id ? updated : h)));
        } catch (err) {
            console.error("Failed to update habit log:", err);
        }
    };

    // =================
    // COMPONENTS
    // =================

    // Empty state component shown when no tasks/habits exist
    function EmptyState({ label, onPress }) {
        return (
            <View style={styles.EmptyContainer}>
                <Text style={styles.EmptyText}>No {label.toLowerCase()} yet.</Text>
                <TouchableOpacity onPress={onPress} style={styles.EmptyButton}>
                    <Text style={styles.EmptyButtonText}>+ Create {label}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // =================
    // MAIN RENDER
    // =================

    return (
        <View style={styles.container}>
            {/* =================
                    LOGO 
                ================= */}

            <Image source={Logo} style={styles.logo} resizeMode="contain" />

            {/* =================
                QUOTE SECTION
                ================= */}
            <View style={styles.quoteBox}>
                <Text style={styles.quoteLine}>
                    <Text style={styles.quoteMark}>"</Text>
                    <Text style={styles.quoteText}>{quote}</Text>
                    <Text style={styles.quoteMark}>"</Text>
                </Text>
            </View>

            {/* =================
                ANIMATED TAB SWITCHER
                ================= */}
            <View
                style={styles.tabRow}
                onLayout={(event) => {
                    // Calculate width for each tab when layout is measured
                    const fullWidth = event.nativeEvent.layout.width;
                    setTabWidth(fullWidth / 2);
                }}>
                {/* Animated background that slides between tabs */}
                <Animated.View style={[styles.animatedBg, animatedBgStyle]} />

                {/* Tasks Tab */}
                <TouchableOpacity style={styles.tabTouchable} onPress={() => setView("tasks")}>
                    <Text style={[styles.tabText, view === "tasks" && styles.activeTabText]}>
                        Upcoming Tasks
                    </Text>
                </TouchableOpacity>

                {/* Habits Tab */}
                <TouchableOpacity style={styles.tabTouchable} onPress={() => setView("habits")}>
                    <Text style={[styles.tabText, view === "habits" && styles.activeTabText]}>
                        Daily Habits
                    </Text>
                </TouchableOpacity>
            </View>

            {/* =================
                SORT AND COMPLETED
                ================= */}
            {view === "tasks" && (
                <>
                    {/* Sort Toggle Button */}
                    <TouchableOpacity
                        onPress={() =>
                            setSortMode((prev) => (prev === "dueDate" ? "priority" : "dueDate"))
                        }
                        style={styles.sortButton}>
                        <Text style={styles.sortButtonText}>
                            Sort by: {sortMode === "dueDate" ? "Due Date" : "Priority"}
                        </Text>
                    </TouchableOpacity>

                    {/* View Completed Tasks Button */}
                    <TouchableOpacity
                        style={styles.viewCompletedBtn}
                        onPress={() => router.push("/completed-tasks")}>
                        <Text style={styles.viewCompletedText}> View Completed</Text>
                    </TouchableOpacity>
                </>
            )}

            {/* =================
                TASKS LIST VIEW
                ================= */}
            {view === "tasks" ? (
                <TaskList
                    tasks={tasks}
                    sortMode={sortMode}
                    onMarkDone={handleMarkDone}
                    onDelete={handleDelete}
                    onEdit={(item) =>
                        router.push({
                            pathname: "/create-entry",
                            params: {
                                mode: "edit",
                                type: "task",
                                id: item._id,
                                title: item.title,
                                description: item.description || "",
                                dueDate: item.dueDate,
                                reminder: item.reminder
                                    ? new Date(item.reminder).toISOString()
                                    : "",
                                tags: Array.isArray(item.tags) ? item.tags.join(",") : "",
                                priority: item.priority || "Medium",
                                target: item.target?.toString() || "",
                                unit: item.unit || "",
                                habitType: item.type || "",
                            },
                        })
                    }
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    /* Show empty state when no tasks exist */
                    ListEmptyComponent={
                        <EmptyState
                            label="Task"
                            onPress={() =>
                                router.push({
                                    pathname: "/create-entry",
                                    params: { mode: "create", type: "task" },
                                })
                            }
                        />
                    }
                />
            ) : (
                //   HABITS GRID VIEW
                <>
                    <HabitGrid habits={habits} onDelete={handleDelete} onUpdate={updateHabit} />

                    {/* Show empty state when no habits exist */}
                    {habits.length === 0 && (
                        <EmptyState
                            label="Habit"
                            onPress={() =>
                                router.push({
                                    pathname: "/create-entry",
                                    params: { mode: "create", type: "habit" },
                                })
                            }
                        />
                    )}
                </>
            )}
        </View>
    );
}

// =================
// STYLES
// =================

const styles = StyleSheet.create({
    ...tabStyles,
    ...taskCardStyles,
    ...buttonStyles,
    ...habitStyles,
    ...emptyStateStyles,
    ...menuStyles,

    // Main container styles
    container: {
        paddingHorizontal: 20,
        flex: 1,
        backgroundColor: "#f9fafb",
    },

    //LOGO STYLES
    logo: {
        width: 60,
        height: 60,
        alignSelf: "center",
        marginBottom: 10,
        marginTop: 10,
    },

    // Quote section styles
    quoteBox: {
        backgroundColor: "#ffffff",
        padding: 16,
        borderRadius: 10,
        marginBottom: 20,
        elevation: 1,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
        alignItems: "center",
    },
    quoteLine: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        letterSpacing: 1,
    },
    quoteMark: {
        color: "#54D2E1",
        fontFamily: "Rufina",
        fontSize: 20,
        letterSpacing: 0.52,
    },
    quoteText: {
        color: "#000000",
        fontFamily: "Rufina",
        fontSize: 15,
        fontWeight: "700",
        letterSpacing: 0.52,
        textTransform: "capitalize",
    },
});
