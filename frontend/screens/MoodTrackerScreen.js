import React, { useState, useCallback, useRef, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
    TextInput,
    Dimensions,
} from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";

import { useFocusEffect } from "expo-router";
import { format, addDays, isSameDay } from "date-fns";
import { API_URL } from "../constants/constants";

const moods = ["😊", "😐", "😢", "😠", "😌", "😴"];
const countMoods = (entriesForDay) => {
    const counts = {};
    moods.forEach((mood) => {
        counts[mood] = entriesForDay.filter((e) => e.mood === mood).length;
    });
    return counts;
};

export default function MoodTrackerScreen() {
    const [selectedMood, setSelectedMood] = useState("");
    const [note, setNote] = useState("");
    const [entries, setEntries] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [refreshing, setRefreshing] = useState(false);
    const [dateRange, setDateRange] = useState({
        start: addDays(new Date(), -30),
        end: addDays(new Date(), 30),
    });
    const scrollRef = useRef();

    const fetchEntries = useCallback(() => {
        fetch(`${API_URL}/api/moods`)
            .then((res) => res.json())
            .then(setEntries)
            .catch((err) => console.error("Error fetching moods:", err));
    }, []);
    const handleRefresh = () => {
        setRefreshing(true);
        fetchEntries();
        setRefreshing(false);
    };

    const getDates = () => {
        const dates = [];
        let current = dateRange.start;
        while (current <= dateRange.end) {
            dates.push(current);
            current = addDays(current, 1);
        }
        return dates;
    };

    useEffect(() => {
        if (scrollRef.current && getDates().length) {
            const todayIndex = getDates().findIndex((d) => isSameDay(d, new Date()));
            if (todayIndex > 0) {
                scrollRef.current.scrollTo({
                    x: Math.max(0, (todayIndex - 4) * 50),
                    animated: false,
                });
            }
        }
    }, []);

    const handleDateScroll = (event) => {
        const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
        if (contentOffset.x + layoutMeasurement.width > contentSize.width - 200) {
            setDateRange((prev) => ({ ...prev, end: addDays(prev.end, 60) }));
        }
        if (contentOffset.x < 200) {
            setDateRange((prev) => ({ ...prev, start: addDays(prev.start, -60) }));
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchEntries();
        }, [fetchEntries])
    );

    const handleSubmit = async () => {
        if (!selectedMood) return;

        const payload = {
            mood: selectedMood,
            note,
        };

        await fetch(`${API_URL}/api/moods`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        setSelectedMood("");
        setNote("");
        fetchEntries(); // refresh list
    };

    return (
        <View style={styles.container}>
            {/* Fixed Top Section */}
            <View>
                {/* Date Picker Row */}
                <View style={styles.calendarContainer}>
                    <View style={styles.topRow}>
                        <Text style={styles.monthLabel}>{format(selectedDate, "MMM yyyy")}</Text>
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
                                    style={[styles.dateButton, active && styles.dateActive]}
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

                <Text style={styles.heading}>How are you feeling today?</Text>

                <View style={styles.moodRow}>
                    {moods.map((m, i) => {
                        const scale = useSharedValue(1);
                        const animatedStyle = useAnimatedStyle(() => ({
                            transform: [{ scale: scale.value }],
                        }));

                        const handleSelect = () => {
                            scale.value = withSpring(1.2, { damping: 5 }, () => {
                                scale.value = withSpring(1);
                            });
                            setSelectedMood(m);
                        };

                        return (
                            <TouchableOpacity key={i} onPress={handleSelect}>
                                <Animated.View
                                    style={[
                                        styles.moodButton,
                                        selectedMood === m && styles.moodSelected,
                                        animatedStyle,
                                    ]}>
                                    <Text
                                        style={[
                                            styles.moodText,
                                            selectedMood === m && styles.moodTextSelected,
                                        ]}>
                                        {m}
                                    </Text>
                                </Animated.View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <TextInput
                    placeholder="Write a journal entry (optional)"
                    value={note}
                    onChangeText={setNote}
                    style={styles.input}
                    multiline
                />

                <TouchableOpacity style={styles.submit} onPress={handleSubmit}>
                    <Text style={styles.submitText}>Log Mood</Text>
                </TouchableOpacity>
            </View>

            {/* Scrollable Bottom Section */}
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }>
                <Text style={styles.subheading}>Mood Stats</Text>
                <View style={styles.statsContainer}>
                    {Object.entries(
                        countMoods(entries.filter((e) => isSameDay(new Date(e.date), selectedDate)))
                    ).map(([mood, count], i) => (
                        <View key={i} style={styles.statRow}>
                            <Text style={styles.statMood}>{mood}</Text>
                            <View style={[styles.statBar, { width: count * 20 || 4 }]} />
                            <Text style={styles.statCount}>{count}</Text>
                        </View>
                    ))}
                </View>

                <Text style={styles.subheading}>Past Entries</Text>
                {entries
                    .filter((e) => isSameDay(new Date(e.date), selectedDate))
                    .reverse()
                    .map((item) => (
                        <View key={item._id} style={styles.entry}>
                            <Text style={styles.entryMood}>{item.mood}</Text>
                            <Text style={styles.entryNote}>{item.note}</Text>
                            <Text style={styles.entryDate}>
                                {format(new Date(item.date), "dd MMM yyyy, HH:mm")}
                            </Text>
                        </View>
                    ))}
            </ScrollView>
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
    heading: {
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 12,
        color: "#2196F3",
        fontFamily: "Rufina",
    },
    subheading: {
        fontSize: 16,
        fontWeight: "500",
        marginTop: 24,
        marginBottom: 8,
        color: "#2196F3",
        fontFamily: "Rufina",
    },
    moodRow: {
        flexDirection: "row",
        marginBottom: 16,
        flexWrap: "wrap",
    },
    moodButton: {
        padding: 10,
        margin: 6,
        borderRadius: 8,
        backgroundColor: "#e5e7eb",
    },

    moodSelected: {
        backgroundColor: "#2196F3",
    },
    moodText: {
        fontSize: 24,
        color: "#2196F3",
        fontFamily: "Rufina",
    },
    moodTextSelected: {
        color: "#ffffff",
    },

    input: {
        borderColor: "#d1d5db",
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        minHeight: 60,
        textAlignVertical: "top",
        fontFamily: "Inter",
    },
    submit: {
        backgroundColor: "#2196F3",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 20,
    },
    submitText: {
        color: "#fff",
        fontWeight: "600",
        fontFamily: "Inter",
    },
    entry: {
        backgroundColor: "#FFF",
        padding: 16,
        borderRadius: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "rgba(0, 110, 233, 0.06)",
        shadowColor: "#006EE9",
        shadowOpacity: 0.02,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 20,
    },
    entryMood: {
        fontSize: 22,
        color: "#2196F3",
        fontFamily: "Rufina",
    },
    entryNote: {
        marginTop: 4,
        fontSize: 14,
        color: "#4A4646",
        fontFamily: "Inter",
    },
    entryDate: {
        fontSize: 12,
        color: "#6b7280",
        marginTop: 6,
        fontFamily: "SpaceMono",
    },
    calendarContainer: {
        width: "100%",
        height: 144,
        flexShrink: 0,
        marginBottom: 12,
    },
    topRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
        width: "100%",
        gap: 8,
    },
    monthLabel: {
        fontSize: Dimensions.get("window").width < 380 ? 18 : 24,
        fontWeight: "600",
        color: "#111827",
        fontFamily: "Rufina",
        flexShrink: 1,
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
        width: Dimensions.get("window").width < 380 ? 36 : 50,
        height: Dimensions.get("window").width < 380 ? 36 : 50,
        borderRadius: 10,
        backgroundColor: "#EBF2FF",
        marginRight: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    dateActive: {
        width: Dimensions.get("window").width < 380 ? 46 : 64,
        height: Dimensions.get("window").width < 380 ? 46 : 64,
        borderRadius: 10,
        backgroundColor: "#2196F3",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    dayText: {
        fontSize: 10,
        color: "#2196F3",
        fontFamily: "Inter",
    },
    dateNumber: {
        fontFamily: "Inter",
        fontSize: Dimensions.get("window").width < 380 ? 11 : 14,
        fontWeight: "600",
        color: "#2196F3",
    },
    activeDateText: {
        color: "#ffffff",
    },
    statsContainer: {
        marginBottom: 20,
    },
    statRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    statMood: {
        fontSize: 20,
        width: 40,
        fontFamily: "Rufina",
        color: "#2196F3",
    },
    statBar: {
        height: 10,
        backgroundColor: "#9ca3af",
        borderRadius: 5,
        marginRight: 8,
    },
    statCount: {
        fontSize: 14,
        color: "#374151",
        fontFamily: "Inter",
    },
});
