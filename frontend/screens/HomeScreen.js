import React, { useState, useCallback, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl } from "react-native";
import { useFocusEffect } from "expo-router";
import { API_URL } from "../constants/constants";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate,
} from "react-native-reanimated";

export default function HomeScreen() {
    const [view, setView] = useState("tasks");
    const [quote, setQuote] = useState("");
    const [tasks, setTasks] = useState([]);
    const [habits, setHabits] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [tabWidth, setTabWidth] = useState(0);

    const tabTranslate = useSharedValue(0);

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

    useEffect(() => {
        tabTranslate.value = withTiming(view === "tasks" ? 0 : 1, {
            duration: 300,
        });
    }, [view]);

    const animatedBgStyle = useAnimatedStyle(() => {
        const translateX = interpolate(tabTranslate.value, [0, 1], [0, tabWidth]);
        return {
            transform: [{ translateX }],
        };
    });

    return (
        <View style={styles.container}>
            {/* Quote Box */}
            <View style={styles.quoteBox}>
                <Text style={styles.quoteLine}>
                    <Text style={styles.quoteMark}>“</Text>
                    <Text style={styles.quoteText}>{quote}</Text>
                    <Text style={styles.quoteMark}>”</Text>
                </Text>
            </View>

            {/* Animated Tabs */}
            <View
                style={styles.tabRow}
                onLayout={(event) => {
                    const fullWidth = event.nativeEvent.layout.width;
                    setTabWidth(fullWidth / 2);
                }}>
                <Animated.View style={[styles.animatedBg, animatedBgStyle]} />
                <TouchableOpacity style={styles.tabTouchable} onPress={() => setView("tasks")}>
                    <Text style={[styles.tabText, view === "tasks" && styles.activeTabText]}>
                        Upcoming Tasks
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabTouchable} onPress={() => setView("habits")}>
                    <Text style={[styles.tabText, view === "habits" && styles.activeTabText]}>
                        Daily Habits
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Entry List */}
            <FlatList
                style={{ flex: 1 }}
                data={view === "tasks" ? tasks : habits}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.meta}>
                            {view === "tasks"
                                ? `Due: ${new Date(item.dueDate).toLocaleDateString()}`
                                : item.completed
                                ? "✅ Done"
                                : "🔄 In Progress"}
                        </Text>
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={styles.empty}>
                        No {view === "tasks" ? "tasks" : "habits"} yet.
                    </Text>
                }
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
                contentContainerStyle={{ paddingBottom: 80, flexGrow: 1 }}
            />
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
    },
    quoteMark: {
        color: "#54D2E1",
        fontFamily: "Rufina",
        fontSize: 13,
        fontWeight: "700",
        letterSpacing: 0.52,
        textTransform: "capitalize",
    },
    quoteText: {
        color: "#000000",
        fontFamily: "Rufina",
        fontSize: 13,
        fontWeight: "700",
        letterSpacing: 0.52,
        textTransform: "capitalize",
    },
    tabRow: {
        flexDirection: "row",
        backgroundColor: "#ffffff",
        borderRadius: 10,
        marginBottom: 20,
        alignSelf: "center",
        width: "100%",
        height: 57,
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
        color: "#ffffff",
    },
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
    meta: {
        fontSize: 14,
        color: "#6b7280",
        marginTop: 6,
    },
    empty: {
        fontSize: 14,
        color: "#94a3b8",
        textAlign: "center",
        marginTop: 40,
    },
});
