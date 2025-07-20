import React, { useState, useCallback, useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ScrollView,
    RefreshControl,
    Pressable,
    Platform,
    Alert,
    Dimensions,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { format, addDays, isSameDay } from "date-fns";
import { API_URL } from "../constants/constants";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate,
} from "react-native-reanimated";
import taskCardStyles from "../constants/taskCardStyles";
import tabStyles from "../constants/tabStyles";
import menuStyles from "../constants/menuStyles";
import habitStyles from "../constants/habitStyles";
import emptyStateStyles from "../constants/emptyStateStyles";
import buttonStyles from "../constants/buttonStyles";
import calendarStyles from "../constants/calendarStyles.js";

export default function CalendarScreen() {
    // ================
    // STATE MANAGEMENT
    // ================
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [view, setView] = useState("tasks"); // "tasks" or "habits"
    const [tasks, setTasks] = useState([]);
    const [habits, setHabits] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [selectedHabitId, setSelectedHabitId] = useState(null);
    const [sortMode, setSortMode] = useState("dueDate");
    const isToday = isSameDay(selectedDate, new Date());
    const numColumns =
        Dimensions.get("window").width < 600 ? 2 : Dimensions.get("window").width < 900 ? 3 : 4;
    const router = useRouter();

    // Animation for tab switcher
    const [tabWidth, setTabWidth] = useState(0);
    const tabTranslate = useSharedValue(0);

    // ================
    // ANIMATION EFFECTS
    // ================
    useEffect(() => {
        tabTranslate.value = withTiming(view === "tasks" ? 0 : 1, { duration: 300 });
    }, [view]);
    const animatedBgStyle = useAnimatedStyle(() => {
        const translateX = interpolate(tabTranslate.value, [0, 1], [0, tabWidth]);
        return { transform: [{ translateX }] };
    });

    // ================
    // DATA FETCHING
    // ================
    const fetchData = useCallback(() => {
        return Promise.all([
            fetch(`${API_URL}/api/tasks`)
                .then((res) => res.json())
                .then((data) => setTasks(data.filter((task) => !task.completed)))
                .catch((err) => console.error("Error fetching tasks:", err)),
            fetch(`${API_URL}/api/habits`)
                .then((res) => res.json())
                .then(setHabits)
                .catch((err) => console.error("Error fetching habits:", err)),
        ]);
    }, []);
    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );
    const handleRefresh = () => {
        setRefreshing(true);
        fetchData().finally(() => setRefreshing(false));
    };

    // ================
    // DATE RANGE + SCROLL LOGIC
    // ================
    const [dateRange, setDateRange] = useState({
        start: addDays(new Date(), -30),
        end: addDays(new Date(), 30),
    });
    const scrollRef = useRef();
    const getDates = () => {
        const dates = [];
        let current = dateRange.start;
        while (current <= dateRange.end) {
            dates.push(current);
            current = addDays(current, 1);
        }
        return dates;
    };
    // Auto-scroll to today on mount
    useEffect(() => {
        if (scrollRef.current && getDates().length) {
            const todayIndex = getDates().findIndex((date) => isSameDay(date, new Date()));
            if (todayIndex > 0) {
                scrollRef.current.scrollTo({
                    x: Math.max(0, (todayIndex - 4) * 50),
                    animated: false,
                });
            }
        }
    }, []);

    const goToToday = () => {
        const today = new Date();
        setSelectedDate(today);
        const todayIndex = getDates().findIndex((date) => isSameDay(date, today));
        if (scrollRef.current && todayIndex > -1) {
            scrollRef.current.scrollTo({
                x: Math.max(0, (todayIndex - 4) * 50), // Adjust scroll offset if needed
                animated: true,
            });
        }
    };

    // Dynamically extend date range when scrolling left/right
    const handleDateScroll = (event) => {
        const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
        if (contentOffset.x + layoutMeasurement.width > contentSize.width - 200) {
            setDateRange((prev) => ({
                ...prev,
                end: addDays(prev.end, 60),
            }));
        }
        if (contentOffset.x < 200) {
            setDateRange((prev) => ({
                ...prev,
                start: addDays(prev.start, -60),
            }));
        }
    };

    // ================
    // FILTERS & SORTS
    // ================
    const filteredTasks = Array.isArray(tasks)
        ? tasks.filter((task) => isSameDay(new Date(task.dueDate), selectedDate))
        : [];
    const filteredHabits = Array.isArray(habits) ? habits : [];
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

    // ================
    // CRUD OPERATIONS
    // ================
    const updateHabit = async (id, delta) => {
        try {
            const res = await fetch(`${API_URL}/api/habits/log/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: delta }),
            });
            const updated = await res.json();
            setHabits((prev) => prev.map((h) => (h._id === id ? updated : h)));
        } catch (err) {
            console.error("Failed to update habit log:", err);
        }
    };
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
    const handleDelete = async (id) => {
        const route = view === "habits" ? "habits" : "tasks";
        if (Platform.OS === "web") {
            const confirm = window.confirm(
                `Are you sure you want to delete this ${route.slice(0, -1)}?`
            );
            if (!confirm) return;
            try {
                await fetch(`${API_URL}/api/${route}/${id}`, { method: "DELETE" });
                if (view === "tasks") {
                    setTasks((prev) => prev.filter((t) => t._id !== id));
                } else {
                    setHabits((prev) => prev.filter((h) => h._id !== id));
                }
            } catch (err) {
                console.error(`Error deleting ${route.slice(0, -1)}:`, err);
            } finally {
                setSelectedTaskId(null);
                setSelectedHabitId(null);
            }
        } else {
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
                                if (view === "tasks") {
                                    setTasks((prev) => prev.filter((t) => t._id !== id));
                                } else {
                                    setHabits((prev) => prev.filter((h) => h._id !== id));
                                }
                            } catch (err) {
                                console.error(`Error deleting ${route.slice(0, -1)}:`, err);
                            } finally {
                                setSelectedTaskId(null);
                                setSelectedHabitId(null);
                            }
                        },
                    },
                ],
                { cancelable: true }
            );
        }
    };
    const handleMarkDone = async (id) => {
        try {
            await fetch(`${API_URL}/api/tasks/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ completed: true }),
            });
            setTasks((prev) => prev.filter((task) => task._id !== id));
        } catch (err) {
            console.error("Error marking task done:", err);
        } finally {
            setSelectedTaskId(null);
        }
    };

    // ================
    // EMPTY STATE COMPONENT
    // ================
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

    // ================
    // MAIN RENDER
    // ================
    return (
        <View style={styles.container}>
            {/* ---- Top Calendar Section ---- */}
            <View style={styles.topSection}>
                <View style={styles.calendarContainer}>
                    <View style={styles.topRow}>
                        <View style={styles.monthRow}>
                            <Text style={styles.monthLabel}>
                                {format(selectedDate, "MMMM yyyy")}
                            </Text>
                            <TouchableOpacity onPress={goToToday} style={styles.todayButton}>
                                <Text style={styles.todayButtonText}>Go to Today</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() =>
                                router.push({
                                    pathname: "/create-entry",
                                    params: {
                                        mode: "create",
                                        type: view === "tasks" ? "task" : "habit",
                                    },
                                })
                            }>
                            <Text style={styles.addButtonText}>
                                + Add {view === "tasks" ? "Task" : "Habit"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView
                        ref={scrollRef}
                        horizontal
                        showsHorizontalScrollIndicator={true}
                        style={styles.dateRow}
                        contentContainerStyle={styles.dateRowContent}
                        onScroll={handleDateScroll}
                        scrollEventThrottle={16}>
                        {getDates().map((date) => {
                            const active = isSameDay(date, selectedDate);
                            return (
                                <TouchableOpacity
                                    key={date.toISOString()}
                                    style={[styles.dateButton, active && styles.activeDate]}
                                    onPress={() => setSelectedDate(date)}>
                                    <Text style={[styles.dayText, active && styles.activeDateText]}>
                                        {format(date, "EEE")}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.dateNumber,
                                            active && styles.activeDateText,
                                        ]}>
                                        {format(date, "d")}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
                <View
                    style={styles.tabRow}
                    onLayout={(event) => {
                        const fullWidth = event.nativeEvent.layout.width;
                        setTabWidth(fullWidth / 2);
                    }}>
                    <Animated.View style={[styles.animatedBg, animatedBgStyle]} />
                    <TouchableOpacity style={styles.tabTouchable} onPress={() => setView("tasks")}>
                        <Text style={[styles.tabText, view === "tasks" && styles.activeTabText]}>
                            Tasks
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tabTouchable} onPress={() => setView("habits")}>
                        <Text style={[styles.tabText, view === "habits" && styles.activeTabText]}>
                            Habits
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* ---- List Section ---- */}
            {view === "tasks" ? (
                <>
                    {/* Sort + Completed Controls */}
                    <TouchableOpacity
                        onPress={() =>
                            setSortMode((prev) => (prev === "dueDate" ? "priority" : "dueDate"))
                        }
                        style={styles.sortButton}>
                        <Text style={styles.sortButtonText}>
                            Sort by: {sortMode === "dueDate" ? "Due Date" : "Priority"}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.viewCompletedBtn}
                        onPress={() => router.push("/completed-tasks")}>
                        <Text style={styles.viewCompletedText}> View Completed</Text>
                    </TouchableOpacity>
                    {/* Tasks List */}
                    <FlatList
                        style={{ flex: 1 }}
                        data={sortTasks(filteredTasks)}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => (
                            <View style={{ position: "relative" }}>
                                {/* Overlay closes menu */}
                                {selectedTaskId === item._id && (
                                    <Pressable
                                        onPress={() => setSelectedTaskId(null)}
                                        style={StyleSheet.absoluteFillObject}
                                    />
                                )}
                                {/* Task Card */}
                                <View style={styles.taskCard}>
                                    <View style={styles.taskHeader}>
                                        <View style={styles.titleRow}>
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
                                        <TouchableOpacity
                                            onPress={() => setSelectedTaskId(item._id)}>
                                            <Text style={styles.dots}>⋯</Text>
                                        </TouchableOpacity>
                                    </View>
                                    {/* Dropdown Menu */}
                                    {selectedTaskId === item._id && (
                                        <View style={styles.menu}>
                                            <TouchableOpacity
                                                onPress={() => handleMarkDone(item._id)}>
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
                                                                ? new Date(
                                                                      item.reminder
                                                                  ).toISOString()
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
                                            <TouchableOpacity
                                                onPress={() => handleDelete(item._id)}>
                                                <Text style={styles.menuItem}>🗑️ Delete</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                    {/* Task Details */}
                                    <Text style={styles.taskDescription}>{item.description}</Text>
                                    <View style={styles.taskFooter}>
                                        <View style={styles.tagContainer}>
                                            {item.tags?.length > 0 &&
                                                item.tags.map((tag, index) => (
                                                    <Text key={index} style={styles.tag}>
                                                        #{tag}
                                                    </Text>
                                                ))}
                                        </View>
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
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                        }
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
                        contentContainerStyle={{ paddingBottom: 80, flexGrow: 1 }}
                    />
                </>
            ) : (
                // ========
                // HABITS GRID
                // =========
                <View style={styles.habitGrid}>
                    {Array.from({
                        length: Math.ceil(filteredHabits.length / numColumns),
                    }).map((_, rowIndex) => (
                        <View key={rowIndex} style={styles.habitRow}>
                            {filteredHabits
                                .slice(rowIndex * numColumns, rowIndex * numColumns + numColumns)
                                .map((habit) => {
                                    const dateStr = selectedDate.toISOString().split("T")[0];
                                    const loggedValue =
                                        habit.log && habit.log[dateStr] ? habit.log[dateStr] : 0;
                                    return (
                                        <View
                                            key={habit._id}
                                            style={[styles.habitCard, { position: "relative" }]}>
                                            <View style={styles.habitHeader}>
                                                <Text style={styles.habitTitle}>{habit.title}</Text>
                                                <TouchableOpacity
                                                    onPress={() => setSelectedHabitId(habit._id)}>
                                                    <Text style={styles.dots}>⋯</Text>
                                                </TouchableOpacity>
                                            </View>
                                            {selectedHabitId === habit._id && (
                                                <>
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
                                                                        habitType: habit.type || "",
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
                                            <View style={styles.counterRow}>
                                                <TouchableOpacity
                                                    style={[
                                                        styles.counterBtn,
                                                        !isToday && { opacity: 0.3 },
                                                    ]}
                                                    onPress={() =>
                                                        isToday && updateHabit(habit._id, -1)
                                                    }
                                                    disabled={!isToday}>
                                                    <Text style={styles.counterText}>−</Text>
                                                </TouchableOpacity>
                                                <View>
                                                    <Text style={styles.counterValue}>
                                                        {loggedValue} / {habit.target || 0}
                                                    </Text>
                                                    <Text style={styles.unitText}>
                                                        {habit.unit}
                                                    </Text>
                                                </View>
                                                <TouchableOpacity
                                                    style={[
                                                        styles.counterBtn,
                                                        !isToday && { opacity: 0.3 },
                                                    ]}
                                                    onPress={() =>
                                                        isToday && updateHabit(habit._id, 1)
                                                    }
                                                    disabled={!isToday}>
                                                    <Text style={styles.counterText}>＋</Text>
                                                </TouchableOpacity>
                                            </View>
                                            <View style={styles.habitTagContainer}>
                                                <Text style={styles.habitTag}>
                                                    {habit.type || "habit"}
                                                </Text>
                                            </View>
                                        </View>
                                    );
                                })}
                        </View>
                    ))}
                    {filteredHabits.length === 0 && (
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

// ===================
// STYLES
// ===================
const styles = StyleSheet.create({
    ...taskCardStyles,
    ...tabStyles,
    ...menuStyles,
    ...habitStyles,
    ...emptyStateStyles,
    ...buttonStyles,
    ...calendarStyles,

    // Main container styles
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
        paddingTop: 20,
        paddingHorizontal: 20,
        paddingHorizontal: 16,
    },

    addButton: {
        width: 96,
        height: 36,
        borderRadius: 10,
        backgroundColor: "#2196F3",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#0D60DF",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 20,
        elevation: 4,
        flexShrink: 0,
    },
    addButtonText: {
        fontFamily: "Inter",
        color: "#fff",
        fontWeight: "bold",
        fontSize: Dimensions.get("window").width < 380 ? 11 : 14,
        fontFamily: "Inter",
    },
});
