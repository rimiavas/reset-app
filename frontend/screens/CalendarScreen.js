import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import TaskList from "../components/Lists/TaskList";
import HabitGrid from "../components/Lists/HabitGrid";
import { useRouter } from "expo-router";
import { format, addDays, isSameDay } from "date-fns";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate,
} from "react-native-reanimated";
import taskCardStyles from "../constants/StyleSheet/taskCardStyles";
import tabStyles from "../constants/StyleSheet/tabStyles";
import menuStyles from "../constants/StyleSheet/menuStyles";
import habitStyles from "../constants/StyleSheet/habitStyles";
import buttonStyles from "../constants/StyleSheet/buttonStyles";
import calendarStyles from "../constants/StyleSheet/calendarStyles.js";
import useTaskHabitData from "../hooks/useTaskHabitData";

export default function CalendarScreen() {
    // ================
    // STATE MANAGEMENT
    // ================
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [view, setView] = useState("tasks"); // "tasks" or "habits"
    const {
        tasks,
        habits,
        refreshing,
        handleRefresh,
        handleDelete,
        handleMarkDone,
        updateHabit,
        handleEdit,
    } = useTaskHabitData();
    const [sortMode, setSortMode] = useState("dueDate");
    const router = useRouter();

    // Animation for tab
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

            {/* ---- List/Grid Section ---- */}
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
                    <TaskList
                        tasks={filteredTasks}
                        sortMode={sortMode}
                        onEdit={handleEdit}
                        onMarkDone={handleMarkDone}
                        onDelete={(id) => handleDelete(id, "task")}
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                    />
                </>
            ) : (
                // HABITS GRID
                <>
                    <HabitGrid
                        habits={filteredHabits}
                        onEdit={handleEdit}
                        onDelete={(id) => handleDelete(id, "habit")}
                        onUpdate={updateHabit}
                        date={selectedDate}
                    />
                </>
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
    ...buttonStyles,
    ...calendarStyles,

    // Main container styles
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
        paddingTop: 20,
        paddingHorizontal: 20,
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
    },
});
