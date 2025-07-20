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
    Pressable,
    Platform,
} from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    interpolate,
} from "react-native-reanimated";
import calendarStyles from "../constants/StyleSheet/calendarStyles";
import { useFocusEffect } from "expo-router";
import { format, addDays, isSameDay } from "date-fns";
import { API_URL } from "../constants/constants";
import MoodEntriesList from "../components/Lists/MoodList";
import { moods, countMoods } from "../constants/utility/moodUtils";

export default function MoodTrackerScreen() {
    const [selectedMood, setSelectedMood] = useState("");
    const [note, setNote] = useState("");
    const [entries, setEntries] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [refreshing, setRefreshing] = useState(false);
    const [viewAll, setViewAll] = useState(false);
    const [tabWidth, setTabWidth] = useState(0);
    const tabTranslate = useSharedValue(0);
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

    useEffect(() => {
        tabTranslate.value = withTiming(viewAll ? 1 : 0, { duration: 300 });
    }, [viewAll]);

    const animatedBgStyle = useAnimatedStyle(() => {
        const translateX = interpolate(tabTranslate.value, [0, 1], [0, tabWidth]);
        return { transform: [{ translateX }] };
    });

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

    const moodScales = moods.map(() => useSharedValue(1));
    const moodRotations = moods.map(() => useSharedValue(0));
    const moodAnimatedStyles = moods.map((_, i) =>
        useAnimatedStyle(() => ({
            transform: [{ scale: moodScales[i].value }, { rotate: `${moodRotations[i].value}deg` }],
        }))
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
        fetchEntries();
    };

    const goToToday = () => {
        const today = new Date();
        setSelectedDate(today);
        const todayIndex = getDates().findIndex((date) => isSameDay(date, today));
        if (scrollRef.current && todayIndex > -1) {
            scrollRef.current.scrollTo({
                x: Math.max(0, (todayIndex - 4) * 50),
                animated: true,
            });
        }
    };

    return (
        <View style={styles.container}>
            {/* Fixed Top Section */}
            <View>
                {/* Date Picker Row */}
                <View style={styles.calendarContainer}>
                    <View style={styles.monthRow}>
                        <View style={styles.topRow}>
                            <Text style={styles.monthLabel}>
                                {format(selectedDate, "MMMM yyyy")}
                            </Text>
                            <TouchableOpacity onPress={goToToday} style={styles.todayButton}>
                                <Text style={styles.todayButtonText}>Go to Today</Text>
                            </TouchableOpacity>
                        </View>
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

                <Text style={styles.heading}>How are you feeling today?</Text>

                <View style={styles.moodRow}>
                    {moods.map((m, i) => {
                        const scale = moodScales[i];
                        const rotation = moodRotations[i];
                        const animatedStyle = moodAnimatedStyles[i];

                        const handleSelect = () => {
                            rotation.value = withTiming(15, { duration: 100 }, () => {
                                rotation.value = withTiming(0);
                            });
                            scale.value = withSpring(1.4, { damping: 5 }, () => {
                                scale.value = withSpring(1);
                            });
                            setSelectedMood(m);
                        };

                        const handleHoverIn = () => {
                            if (Platform.OS === "web") {
                                scale.value = withTiming(1.2);
                            }
                        };

                        const handleHoverOut = () => {
                            if (Platform.OS === "web") {
                                scale.value = withTiming(1);
                            }
                        };

                        return (
                            <Pressable
                                key={i}
                                onPress={handleSelect}
                                onHoverIn={handleHoverIn}
                                onHoverOut={handleHoverOut}>
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
                            </Pressable>
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

                <TouchableOpacity
                    style={[styles.submit, !selectedMood && { opacity: 0.5 }]}
                    onPress={handleSubmit}
                    disabled={!selectedMood}>
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
                <View style={styles.statsHeader}>
                    <Text style={[styles.subheading, { marginTop: 0, marginBottom: 0 }]}>
                        Mood Stats
                    </Text>
                    <View
                        style={[styles.toggleRow]}
                        onLayout={(e) => setTabWidth(e.nativeEvent.layout.width / 2)}>
                        <Animated.View style={[styles.animatedBg, animatedBgStyle]} />
                        <TouchableOpacity
                            style={styles.tabTouchable}
                            onPress={() => setViewAll(false)}>
                            <Text style={[styles.tabText, !viewAll && styles.activeTabText]}>
                                Selected Date
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.tabTouchable}
                            onPress={() => setViewAll(true)}>
                            <Text style={[styles.tabText, viewAll && styles.activeTabText]}>
                                All Time
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.statsContainer}>
                    {Object.entries(
                        countMoods(
                            entries.filter((e) =>
                                viewAll ? true : isSameDay(new Date(e.date), selectedDate)
                            )
                        )
                    ).map(([mood, count], i) => (
                        <View key={i} style={styles.statRow}>
                            <Text style={styles.statMood}>{mood}</Text>
                            <View style={[styles.statBar, { width: count * 20 || 4 }]} />
                            <Text style={styles.statCount}>{count}</Text>
                        </View>
                    ))}
                </View>

                <Text style={styles.subheading}>Past Entries</Text>
                <MoodEntriesList entries={entries} selectedDate={selectedDate} viewAll={viewAll} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    ...calendarStyles,

    container: {
        paddingTop: 20,
        paddingHorizontal: 20,
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    heading: {
        fontFamily: "Poppins-SemiBold",
        fontSize: 20,
        marginBottom: 12,
        color: "#2196F3",
        textAlign: "center",
    },
    subheading: {
        fontSize: 16,
        fontWeight: "500",
        marginTop: 24,
        marginBottom: 8,
        color: "#2196F3",
        fontFamily: "Inter",
    },

    moodRow: {
        flexDirection: "row",
        marginBottom: 16,
        flexWrap: "wrap",
        justifyContent: "center",
    },
    moodButton: {
        padding: 10,
        margin: 6,
        borderRadius: 8,
        backgroundColor: "#EBF2FF",
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
        backgroundColor: "#2196F3",
        borderRadius: 5,
        marginRight: 8,
    },
    statCount: {
        fontSize: 14,
        color: "#374151",
        fontFamily: "Inter",
    },
    statsHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 24,
        marginBottom: 8,
    },
    toggleRow: {
        flexDirection: "row",
        backgroundColor: "#ffffff",
        borderRadius: 10,
        marginBottom: 20,
        alignSelf: "center",
        padding: 0,
        width: "80%",
        height: 40,
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
});
