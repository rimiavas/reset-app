import React, { useState, useCallback } from "react";
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

export default function CalendarScreen() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [view, setView] = useState("tasks");
    const [tasks, setTasks] = useState([]);
    const [habits, setHabits] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [selectedHabitId, setSelectedHabitId] = useState(null);
    const [sortMode, setSortMode] = useState("dueDate");
    const numColumns =
        Dimensions.get("window").width < 600 ? 2 : Dimensions.get("window").width < 900 ? 3 : 4;
    const router = useRouter();

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

    const getDates = () => {
        const dates = [];
        for (let i = -3; i <= 7; i++) {
            dates.push(addDays(new Date(), i));
        }
        return dates;
    };

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
            if (confirm) {
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
                }
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

    return (
        <View style={styles.container}>
            {/* Top Section: Date + Tabs */}
            <View style={styles.topSection}>
                <View style={styles.calendarContainer}>
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}>
                        <Text style={styles.monthLabel}>{format(selectedDate, "MMMM yyyy")}</Text>
                        <TouchableOpacity
                            tyle={styles.addButton}
                            onPress={() =>
                                router.push({
                                    pathname: "/create-entry",
                                    params: {
                                        mode: "create",
                                        type: view === "tasks" ? "task" : "habit",
                                    },
                                })
                            }>
                            <Text style={styles.addButtonText}>Add Task/Habit</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.dateRow}
                        contentContainerStyle={styles.dateRowContent}>
                        {getDates().map((date, index) => {
                            const active = isSameDay(date, selectedDate);
                            return (
                                <TouchableOpacity
                                    key={index}
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

                <View style={styles.tabRow}>
                    <TouchableOpacity
                        style={[styles.tab, view === "tasks" && styles.activeTab]}
                        onPress={() => setView("tasks")}>
                        <Text style={[styles.tabText, view === "tasks" && styles.activeTabText]}>
                            Tasks
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, view === "habits" && styles.activeTab]}
                        onPress={() => setView("habits")}>
                        <Text style={[styles.tabText, view === "habits" && styles.activeTabText]}>
                            Habits
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* List Section */}
            {view === "tasks" ? (
                <>
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

                    <FlatList
                        style={{ flex: 1 }}
                        data={sortTasks(filteredTasks)}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => (
                            <View style={{ position: "relative" }}>
                                {selectedTaskId === item._id && (
                                    <Pressable
                                        onPress={() => setSelectedTaskId(null)}
                                        style={StyleSheet.absoluteFillObject}
                                    />
                                )}

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
                                                    style={styles.counterBtn}
                                                    onPress={() => updateHabit(habit._id, -1)}>
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
                                                    style={styles.counterBtn}
                                                    onPress={() => updateHabit(habit._id, 1)}>
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
            {/* FAB */}
            <TouchableOpacity style={styles.fab} onPress={() => router.push("/create-entry")}>
                <Text style={styles.fabText}>＋</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
        paddingTop: 80,
        paddingHorizontal: 16,
    },
    topSection: {
        marginBottom: 12,
    },
    alendarContainer: {
        width: "100%",
        height: 144,
        flexShrink: 0,
        marginBottom: 12,
    },
    monthLabel: {
        width: 127,
        height: 20,
        textAlign: "center",
        fontSize: 24,
        fontWeight: "600",
        color: "#111827",
    },
    addButton: {
        width: 96,
        height: 36,
        borderRadius: 10,
        backgroundColor: "#2196F3",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    addButtonText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },
    dateRow: {
        flexDirection: "row",
        marginTop: 12,
        marginBottom: 8,
        height: 64,
    },
    dateRowContent: {
        paddingHorizontal: 4,
    },
    dateButton: {
        width: 50,
        height: 50,
        borderRadius: 10,
        backgroundColor: "#EBF2FF",
        marginRight: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    activeDate: {
        width: 64,
        height: 64,
        borderRadius: 10,
        backgroundColor: "#2196F3",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    dateNumber: {
        fontFamily: "Inter",
        fontSize: 14,
        fontWeight: "600",
        color: "#2196F3",
    },
    activeDateText: {
        color: "#ffffff",
    },
    tabRow: {
        flexDirection: "row",
        justifyContent: "center",
    },
    tab: {
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 20,
        marginHorizontal: 8,
        backgroundColor: "#e5e7eb",
    },
    activeTab: {
        backgroundColor: "#111827",
    },
    tabText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#111827",
    },
    activeTabText: {
        color: "#ffffff",
    },
    list: {
        flex: 1,
    },
    card: {
        backgroundColor: "#ffffff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 1,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 3,
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
    },
    meta: {
        fontSize: 14,
        color: "#6b7280",
        marginTop: 6,
    },
    empty: {
        textAlign: "center",
        marginTop: 32,
        color: "#9ca3af",
        fontSize: 14,
    },
    fab: {
        position: "absolute",
        bottom: 30,
        right: 20,
        backgroundColor: "#111827",
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        elevation: 4,
    },
    fabText: {
        fontSize: 28,
        color: "#ffffff",
        lineHeight: 28,
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
        color: "#2196F3",
        fontSize: 12,
        fontWeight: "500",
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
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 4,
    },
    taskTitle: {
        color: "#2196F3",
        fontFamily: "Rufina",
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
        fontFamily: "Inter",
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
        fontFamily: "SpaceMono",
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

    // Habit tracker styles
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
        fontFamily: "Rufina",
        fontSize: 15,
        fontWeight: "500",
        color: "#2196F3",
        flex: 1,
        marginRight: 8,
    },
    habitTagContainer: {
        alignItems: "flex-start",
        width: "100%",
        marginTop: 10,
    },
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
        fontSize: 16,
        fontWeight: "bold",
        color: "#2196F3",
    },
    counterValue: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
    },
    unitText: {
        fontSize: 10,
        color: "#666",
        textAlign: "center",
    },
    EmptyContainer: {
        alignItems: "center",
        marginTop: 40,
    },
    EmptyText: {
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
        color: "#fff",
        fontWeight: "600",
        fontSize: 15,
    },
});
