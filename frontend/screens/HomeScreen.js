import React, { useState, useCallback, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    RefreshControl,
    Pressable,
    Platform,
    Alert,
    Dimensions,
    Image,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { API_URL } from "../constants/constants";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate,
} from "react-native-reanimated";
import Logo from "../assets/images/Reset.png";

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

    // Track which task/habit has its 3-dot menu open
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [selectedHabitId, setSelectedHabitId] = useState(null);

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
    // RESPONSIVE LAYOUT
    // =================

    // Calculate number of columns for habits grid based on screen width
    const numColumns =
        Dimensions.get("window").width < 600 ? 2 : Dimensions.get("window").width < 900 ? 3 : 4;

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
                } finally {
                    setSelectedTaskId(null);
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
                            } finally {
                                setSelectedTaskId(null);
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
        } finally {
            setSelectedTaskId(null);
        }
    };

    // =================
    // UTILITY FUNCTIONS
    // =================

    // Sort tasks by due date or priority
    const sortTasks = (data) => {
        if (sortMode === "dueDate") {
            return [...data].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        } else if (sortMode === "priority") {
            const order = { High: 0, Medium: 1, Low: 2 };
            return [...data].sort(
                (a, b) => order[a.priority || "Medium"] - order[b.priority || "Medium"]
            );
        }
        return data;
    };

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

    // Helper function to get the appropriate style object based on priority level
    const getPriorityStyle = (priority) => {
        switch (priority) {
            case "High":
                return styles.highPriority;
            case "Medium":
                return styles.mediumPriority;
            case "Low":
                return styles.lowPriority;
            default:
                return styles.lowPriority;
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
                TASKS VIEW CONTROLS
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
                <FlatList
                    style={{ flex: 1 }}
                    data={sortTasks(tasks)}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <View style={{ position: "relative" }}>
                            {/* Overlay to close menu when tapping outside */}
                            {selectedTaskId === item._id && (
                                <Pressable
                                    onPress={() => setSelectedTaskId(null)}
                                    style={StyleSheet.absoluteFillObject}
                                />
                            )}

                            {/* Task Card */}
                            <View style={styles.taskCard}>
                                {/* Task Header: Title, Priority Badge, and Menu Button */}
                                <View style={styles.taskHeader}>
                                    <View style={styles.titleRow}>
                                        {/* Priority Badge */}
                                        <View
                                            style={[
                                                styles.priorityBadge,
                                                styles[`priority${item.priority}`],
                                            ]}>
                                            <Text style={styles.priorityBadgeText}>
                                                {item.priority?.[0] || "M"}
                                            </Text>
                                        </View>

                                        {/* Task Title */}
                                        <Text style={styles.taskTitle}>{item.title}</Text>
                                    </View>

                                    {/* Three-dot Menu Button */}
                                    <TouchableOpacity onPress={() => setSelectedTaskId(item._id)}>
                                        <Text style={styles.dots}>⋯</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Dropdown Menu (Mark Done, Edit, Delete) */}
                                {selectedTaskId === item._id && (
                                    <View style={styles.menu}>
                                        <TouchableOpacity onPress={() => handleMarkDone(item._id)}>
                                            <Text style={styles.menuItem}>✅ Mark as Done</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() =>
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
                                                        tags: Array.isArray(item.tags)
                                                            ? item.tags.join(",")
                                                            : "",
                                                        priority: item.priority || "Medium",
                                                        target: item.target?.toString() || "",
                                                        unit: item.unit || "",
                                                        habitType: item.type || "",
                                                    },
                                                })
                                            }>
                                            <Text style={styles.menuItem}>✏️ Edit</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDelete(item._id)}>
                                            <Text style={styles.menuItem}>🗑️ Delete</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {/* Task Description */}
                                <Text style={styles.taskDescription}>{item.description}</Text>

                                {/* Task Footer: Tags and Timeline */}
                                <View style={styles.taskFooter}>
                                    {/* Tags Container */}
                                    <View style={styles.tagContainer}>
                                        {item.tags?.length > 0 &&
                                            item.tags.map((tag, index) => (
                                                <Text key={index} style={styles.tag}>
                                                    #{tag}
                                                </Text>
                                            ))}
                                    </View>

                                    {/* Timeline (Created Date → Due Date) */}
                                    <Text
                                        style={[
                                            styles.taskTimeline,
                                            getPriorityStyle(item.priority),
                                        ]}>
                                        {new Date(item.createdAt).toLocaleDateString()} →{" "}
                                        {new Date(item.dueDate).toLocaleDateString()}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}
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
                    /* Pull-to-refresh functionality */
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                    }
                    /* Add bottom padding for navigation and scrolling */
                    contentContainerStyle={{ paddingBottom: 80, flexGrow: 1 }}
                />
            ) : (
                // =================
                //   HABITS GRID VIEW
                // =================
                <View style={styles.habitGrid}>
                    {/* Create rows for habits grid based on numColumns */}
                    {Array.from({ length: Math.ceil(habits.length / numColumns) }).map(
                        (_, rowIndex) => (
                            <View key={rowIndex} style={styles.habitRow}>
                                {/* Slice habits array for current row */}
                                {habits
                                    .slice(
                                        rowIndex * numColumns,
                                        rowIndex * numColumns + numColumns
                                    )
                                    .map((habit) => {
                                        // Calculate today's logged value for this habit
                                        const todayStr = new Date().toISOString().split("T")[0];
                                        const loggedValue =
                                            habit.log && habit.log[todayStr]
                                                ? habit.log[todayStr]
                                                : 0;

                                        return (
                                            <View
                                                key={habit._id}
                                                style={[
                                                    styles.habitCard,
                                                    { position: "relative" },
                                                ]}>
                                                {/* Habit Header: Title and Menu Button */}
                                                <View style={styles.habitHeader}>
                                                    <Text style={styles.habitTitle}>
                                                        {habit.title}
                                                    </Text>
                                                    <TouchableOpacity
                                                        onPress={() =>
                                                            setSelectedHabitId(habit._id)
                                                        }>
                                                        <Text style={styles.dots}>⋯</Text>
                                                    </TouchableOpacity>
                                                </View>

                                                {/* Habit Menu (Edit/Delete) */}
                                                {selectedHabitId === habit._id && (
                                                    <>
                                                        {/* Overlay to close menu */}
                                                        <Pressable
                                                            onPress={() => setSelectedHabitId(null)}
                                                            style={StyleSheet.absoluteFillObject}
                                                        />
                                                        <View style={styles.menu}>
                                                            <TouchableOpacity
                                                                onPress={() => {
                                                                    setSelectedHabitId(null);
                                                                    router.push({
                                                                        pathname: "/create-entry",
                                                                        params: {
                                                                            mode: "edit",
                                                                            type: "habit",
                                                                            id: habit._id,
                                                                            title: habit.title,
                                                                            target:
                                                                                habit.target?.toString() ||
                                                                                "",
                                                                            unit: habit.unit || "",
                                                                            habitType:
                                                                                habit.type || "",
                                                                        },
                                                                    });
                                                                }}>
                                                                <Text style={styles.menuItem}>
                                                                    ✏️ Edit
                                                                </Text>
                                                            </TouchableOpacity>
                                                            <TouchableOpacity
                                                                onPress={() => {
                                                                    setSelectedHabitId(null);
                                                                    handleDelete(habit._id);
                                                                }}>
                                                                <Text style={styles.menuItem}>
                                                                    🗑️ Delete
                                                                </Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                    </>
                                                )}

                                                {/* Habit Counter Controls */}
                                                <View style={styles.counterRow}>
                                                    {/* Decrease Button */}
                                                    <TouchableOpacity
                                                        style={styles.counterBtn}
                                                        onPress={() => updateHabit(habit._id, -1)}>
                                                        <Text style={styles.counterText}>−</Text>
                                                    </TouchableOpacity>

                                                    {/* Progress Display */}
                                                    <View>
                                                        <Text style={styles.counterValue}>
                                                            {loggedValue} / {habit.target || 0}
                                                        </Text>
                                                        <Text style={styles.unitText}>
                                                            {habit.unit}
                                                        </Text>
                                                    </View>

                                                    {/* Increase Button */}
                                                    <TouchableOpacity
                                                        style={styles.counterBtn}
                                                        onPress={() => updateHabit(habit._id, 1)}>
                                                        <Text style={styles.counterText}>＋</Text>
                                                    </TouchableOpacity>
                                                </View>

                                                {/* Habit Type/Category Tag */}
                                                <View style={styles.habitTagContainer}>
                                                    <Text style={styles.habitTag}>
                                                        {habit.type || "habit"}
                                                    </Text>
                                                </View>
                                            </View>
                                        );
                                    })}
                            </View>
                        )
                    )}

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
                </View>
            )}
        </View>
    );
}

// =================
// STYLES
// =================

const styles = StyleSheet.create({
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
        borderRadius: 12,
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
        fontWeight: "700",
        letterSpacing: 0.52,
        textTransform: "capitalize",
    },
    quoteText: {
        color: "#000000",
        fontFamily: "Rufina",
        fontSize: 15,
        fontWeight: "700",
        letterSpacing: 0.52,
        textTransform: "capitalize",
    },

    // Tab switcher styles
    tabRow: {
        flexDirection: "row",
        backgroundColor: "#ffffff",
        borderRadius: 10,
        marginBottom: 20,
        alignSelf: "center",
        width: "100%",
        height: 40,
        position: "relative",
        overflow: "hidden",
    },
    tabTouchable: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1,
    },
    animatedBg: {
        position: "absolute",
        height: "100%",
        width: "50%",
        backgroundColor: "#2196F3",
        borderRadius: 10,
        top: 0,
        left: 0,
        zIndex: 0,
    },
    tabText: {
        fontFamily: "Inter",
        fontSize: 15,
        fontWeight: "500",
        letterSpacing: 0.6,
        textTransform: "capitalize",
        color: "#90A5B4",
    },
    activeTabText: {
        fontFamily: "Inter",
        color: "#ffffff",
    },

    // Generic card styles
    card: {
        backgroundColor: "#ffffff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
    },
    empty: {
        fontSize: 14,
        color: "#94a3b8",
        textAlign: "center",
        marginTop: 40,
    },

    // Task card specific styles
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
        letterSpacing: 0.4,
        color: "#4A4646",
        textTransform: "lowercase",
        marginBottom: 8,
        flexWrap: "wrap",
    },
    taskTimeline: {
        fontFamily: "Poppins",
        fontSize: 10,
        fontWeight: "400",
        color: "#0668E5",
        textAlign: "right",
    },
    taskFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
    },

    // Tag styles
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

    // Menu styles (3-dot dropdown)
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

    // Control button styles
    viewCompletedBtn: {
        position: "absolute",
        bottom: 10,
        left: 20,
        backgroundColor: "#E0F2FE",
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 8,
        zIndex: 5,
    },
    viewCompletedText: {
        fontFamily: "Inter",
        color: "#2196F3",
        fontSize: 12,
        fontWeight: "500",
    },
    sortButton: {
        alignSelf: "flex-end",
        marginBottom: 8,
        backgroundColor: "#E0F2FE",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    sortButtonText: {
        fontFamily: "Inter",
        color: "#2196F3",
        fontSize: 12,
        fontWeight: "500",
    },

    // Priority badge styles
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 4,
    },
    priorityBadge: {
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: "center",
        alignItems: "center",
    },
    priorityBadgeText: {
        fontFamily: "Inter",
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
    highPriority: {
        color: "#EF4444",
    },
    mediumPriority: {
        color: "#F97316",
    },
    lowPriority: {
        color: "#0EA5E9",
    },

    // Habit tracker specific styles
    habitGrid: {
        width: "100%",
    },

    habitRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
    },

    habitCard: {
        flex: 1,
        marginHorizontal: 4,
        padding: 12,
        backgroundColor: "#ffffff",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E0F2FE",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        alignItems: "center",
    },

    habitTag: {
        fontFamily: "SpaceMono",
        fontSize: 10,
        fontWeight: "bold",
        color: "#2196F3",
        backgroundColor: "#E0F2FE",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginBottom: 6,
    },
    habitHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        marginBottom: 10,
    },
    habitTitle: {
        color: "#2196F3",
        fontFamily: "Inter",
        fontSize: 15,
        fontWeight: "500",
        letterSpacing: 0.6,
        textTransform: "capitalize",
        width: "100%",
    },
    habitTagContainer: {
        alignItems: "flex-start",
        width: "100%",
        marginTop: 10,
    },

    // Counter controls for habit tracking
    counterRow: {
        flexDirection: "row",
        alignItems: "center",
        margin: 10,
    },

    counterBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#E0F2FE",
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 8,
    },

    counterText: {
        fontFamily: "Poppins",
        fontSize: 16,
        fontWeight: "bold",
        color: "#2196F3",
    },

    counterValue: {
        fontFamily: "Poppins",
        fontSize: 12,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
    },

    unitText: {
        fontFamily: "Poppins",
        fontSize: 10,
        color: "#666",
        textAlign: "center",
    },

    EmptyContainer: {
        alignItems: "center",
        marginTop: 40,
    },
    EmptyText: {
        fontFamily: "Inter",
        color: "#94a3b8",
        fontSize: 14,
        marginBottom: 14,
    },
    EmptyButton: {
        backgroundColor: "#2196F3",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    EmptyButtonText: {
        fontFamily: "Inter",
        color: "#fff",
        fontWeight: "600",
        fontSize: 15,
    },
});
