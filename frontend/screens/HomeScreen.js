import React, { useState, useCallback, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Pressable,
    Platform,
    Alert,
    Dimensions,
    Image,
} from "react-native";
import TaskList from "../components/Lists/TaskList";
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
import { sortTasks, getPriorityStyle } from "../constants/utility/taskUtils";

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
