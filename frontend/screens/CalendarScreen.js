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
import { useFocusEffect } from "expo-router";
import { format, addDays, isSameDay } from "date-fns";
import { API_URL } from "../constants/constants";
import { useRouter } from "expo-router";

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
    });

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

    const filteredTasks = tasks.filter((task) => isSameDay(new Date(task.dueDate), selectedDate));

    const filteredHabits = habits; // Future: you can filter habits by date

    return (
        <View style={styles.container}>
            {/* Fixed Header: Date Scroll + Tabs */}
            <View>
                {/* Date Scroll */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.dateRow}
                    contentContainerStyle={{ paddingRight: 16 }}>
                    {getDates().map((date, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.dateButton,
                                isSameDay(date, selectedDate) && styles.activeDate,
                            ]}
                            onPress={() => setSelectedDate(date)}>
                            <Text style={styles.dateText}>{format(date, "dd MMM")}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* View Toggle Tabs */}
                <View style={styles.tabRow}>
                    <TouchableOpacity
                        style={[styles.tab, view === "tasks" && styles.activeTab]}
                        onPress={() => setView("tasks")}>
                        <Text style={[styles.tabText, view === "tasks" && styles.activeTabText]}>
                            Upcoming Tasks
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, view === "habits" && styles.activeTab]}
                        onPress={() => setView("habits")}>
                        <Text style={styles.tabText}>Habits</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Scrollable Task/Habit List */}
            <FlatList
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 100 }}
                data={view === "tasks" ? filteredTasks : filteredHabits}
                keyExtractor={(item) => item._id}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
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

            {/* Floating Action Button */}
            <TouchableOpacity style={styles.fab} onPress={() => router.push("/create-entry")}>
                <Text style={styles.fabText}>＋</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 80,
        paddingHorizontal: 20,
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    quote: {
        fontSize: 20,
        fontStyle: "italic",
        color: "#374151",
        marginBottom: 28,
        lineHeight: 28,
        textAlign: "center",
    },
    tabRow: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 16,
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
        color: "#111827",
        fontWeight: "600",
    },
    activeTabText: {
        color: "#ffffff",
    },
    card: {
        backgroundColor: "#ffffff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 4,
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
});
