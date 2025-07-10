import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ScrollView,
    RefreshControl,
    TextInput,
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
                <View style={styles.dateRow}>
                    {Array.from({ length: 11 }, (_, i) => addDays(new Date(), i - 5)).map(
                        (date, idx) => (
                            <TouchableOpacity
                                key={idx}
                                onPress={() => setSelectedDate(date)}
                                style={[
                                    styles.dateButton,
                                    isSameDay(date, selectedDate) && styles.dateActive,
                                ]}>
                                <Text style={styles.dateText}>{format(date, "dd MMM")}</Text>
                            </TouchableOpacity>
                        )
                    )}
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
                                    <Text style={styles.moodText}>{m}</Text>
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
        paddingTop: 60,
        paddingHorizontal: 16,
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    heading: {
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 12,
    },
    subheading: {
        fontSize: 16,
        fontWeight: "500",
        marginTop: 24,
        marginBottom: 8,
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
        backgroundColor: "#d1d5db",
    },
    moodText: {
        fontSize: 24,
    },
    input: {
        borderColor: "#d1d5db",
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        minHeight: 60,
        textAlignVertical: "top",
    },
    submit: {
        backgroundColor: "#111827",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 20,
    },
    submitText: {
        color: "#fff",
        fontWeight: "600",
    },
    entry: {
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
        elevation: 1,
    },
    entryMood: {
        fontSize: 22,
    },
    entryNote: {
        marginTop: 4,
        fontSize: 14,
        color: "#374151",
    },
    entryDate: {
        fontSize: 12,
        color: "#6b7280",
        marginTop: 6,
    },
    dateRow: {
        flexDirection: "row",
        marginBottom: 12,
        flexWrap: "nowrap",
    },
    dateButton: {
        backgroundColor: "#e5e7eb",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        marginRight: 8,
    },
    dateActive: {
        backgroundColor: "#d1d5db",
    },
    dateText: {
        fontSize: 14,
        color: "#111827",
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
    },
});
