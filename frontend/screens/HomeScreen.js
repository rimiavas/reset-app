import React, { useState, useCallback, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl } from "react-native";
import { useFocusEffect } from "expo-router";
import { API_URL } from "../constants/constants";

export default function HomeScreen() {
    const [view, setView] = useState("tasks"); // 'tasks' or 'habits'
    const [quote, setQuote] = useState("");
    const [tasks, setTasks] = useState([]);
    const [habits, setHabits] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetch(`${API_URL}/api/quotes`)
            .then((res) => res.json())
            .then((data) => setQuote(data.quote))
            .catch((err) => console.error("Error fetching quote:", err));
    }, []);

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

    return (
        <View style={styles.container}>
            <Text style={styles.quote}>“{quote}”</Text>

            {/* Toggle Tabs */}
            <View style={styles.tabRow}>
                <TouchableOpacity
                    style={[styles.tab, view === "tasks" && styles.activeTab]}
                    onPress={() => setView("tasks")}>
                    <Text style={styles.tabText}>Upcoming Tasks</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, view === "habits" && styles.activeTab]}
                    onPress={() => setView("habits")}>
                    <Text style={styles.tabText}>Daily Habits</Text>
                </TouchableOpacity>
            </View>

            {/* View Content */}
            {view === "tasks" ? (
                <FlatList
                    data={tasks}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.meta}>
                                Due: {new Date(item.dueDate).toLocaleDateString()}
                            </Text>
                        </View>
                    )}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                    }
                />
            ) : (
                <FlatList
                    data={habits}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.meta}>
                                {item.completed ? "✅ Done" : "🔄 In Progress"}
                            </Text>
                        </View>
                    )}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 60,
        paddingHorizontal: 20,
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    quote: {
        fontSize: 18,
        fontStyle: "italic",
        marginBottom: 20,
        color: "#374151",
    },
    tabRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    tab: {
        flex: 1,
        padding: 10,
        marginHorizontal: 4,
        backgroundColor: "#e5e7eb",
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: "#d1d5db",
    },
    tabText: {
        textAlign: "center",
        fontWeight: "600",
        color: "#111827",
    },
    card: {
        backgroundColor: "#ffffff",
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: "500",
    },
    meta: {
        fontSize: 14,
        color: "#6b7280",
        marginTop: 4,
    },
});
