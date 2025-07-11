import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ScrollView,
    RefreshControl,
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
    const router = useRouter();

    const fetchData = useCallback(() => {
        return Promise.all([
            fetch(`${API_URL}/api/tasks`)
                .then((res) => res.json())
                .then(setTasks)
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

    return (
        <View style={styles.container}>
            {/* Top Section: Date + Tabs */}
            <View style={styles.topSection}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.dateRow}
                    contentContainerStyle={styles.dateRowContent}>
                    {getDates().map((date, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.dateButton,
                                isSameDay(date, selectedDate) && styles.activeDate,
                            ]}
                            onPress={() => setSelectedDate(date)}>
                            <Text
                                style={[
                                    styles.dateText,
                                    isSameDay(date, selectedDate) && styles.activeDateText,
                                ]}>
                                {format(date, "dd MMM")}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

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
            <FlatList
                style={styles.list}
                data={view === "tasks" ? filteredTasks : filteredHabits}
                keyExtractor={(item) => item._id}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
                contentContainerStyle={{ paddingBottom: 100 }}
                ListEmptyComponent={<Text style={styles.empty}>No {view} for this date.</Text>}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.title}>{item.title}</Text>
                        {view === "tasks" && (
                            <Text style={styles.meta}>
                                Due: {format(new Date(item.dueDate), "dd MMM yyyy")}
                            </Text>
                        )}
                    </View>
                )}
            />

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
    dateRow: {
        flexDirection: "row",
        marginBottom: 8,
        height: 40,
    },
    dateRowContent: {
        paddingHorizontal: 4,
    },
    dateButton: {
        width: 72,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#e5e7eb",
        marginRight: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    activeDate: {
        backgroundColor: "#111827",
    },
    dateText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#111827",
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
});
