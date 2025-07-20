import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import TaskList from "../components/Lists/TaskList";
import HabitGrid from "../components/Lists/HabitGrid";
import EmptyState from "../components/EmptyState";
import { useRouter } from "expo-router";
import useTaskHabitData from "../hooks/useTaskHabitData";
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

    // Tasks and habits data
    const { tasks, habits, refreshing, handleRefresh, handleDelete, handleMarkDone, updateHabit } =
        useTaskHabitData();

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

    // Fetch daily quote on component mount
    useEffect(() => {
        fetch(`${API_URL}/api/quotes`)
            .then((res) => res.json())
            .then((data) => setQuote(data.quote))
            .catch((err) => console.error("Error fetching quote:", err));
    }, []);

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
                    onDelete={(id) => handleDelete(id, "task")}
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
                    <HabitGrid
                        habits={habits}
                        onDelete={(id) => handleDelete(id, "habit")}
                        onUpdate={updateHabit}
                    />

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
