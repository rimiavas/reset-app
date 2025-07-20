import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Platform,
    ScrollView,
} from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate,
} from "react-native-reanimated";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { API_URL } from "../constants/constants";
import buttonStyles from "../constants/StyleSheet/buttonStyles";
import tabStyles from "../constants/StyleSheet/tabStyles";

// =================
// FORMATS DATE+INPUT
// ================
const formatDate = (date) =>
    date
        ? `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(
              2,
              "0"
          )}/${date.getFullYear()}`
        : "";

const formatTime = (date) =>
    date
        ? `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(
              2,
              "0"
          )}`
        : "";

const formatDateInput = (text) => {
    const digits = text.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

const formatTimeInput = (text) => {
    const digits = text.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}:${digits.slice(2)}`;
};

export default function CreateEntryScreen() {
    // ================
    // PARAMETERS & STATE
    // ================
    const {
        mode,
        id,
        type: initialType,
        title: initialTitle,
        description: initialDescription,
        dueDate: initialDueDate,
        reminder: initialReminder,
        tags: initialTags,
        priority: initialPriority,
        target: initialTarget,
        unit: initialUnit,
        habitType: initialHabitType,
    } = useLocalSearchParams();

    const isEditing = mode === "edit";
    const [type, setType] = useState(initialType || "task");
    const [title, setTitle] = useState(initialTitle || "");
    const [description, setDescription] = useState(initialDescription || "");
    const [dueDate, setDueDate] = useState(initialDueDate ? new Date(initialDueDate) : new Date());
    const [reminder, setReminder] = useState(initialReminder ? new Date(initialReminder) : null);
    const [tags, setTags] = useState(initialTags || "");
    const [priority, setPriority] = useState(initialPriority || "Medium");

    // Habits Field
    const [habitTarget, setHabitTarget] = useState(initialTarget || "");
    const [habitUnit, setHabitUnit] = useState(initialUnit || "");
    const [habitType, setHabitType] = useState(initialHabitType || "");

    // Input & animation
    const [tabWidth, setTabWidth] = useState(0);
    const [priorityWidth, setPriorityWidth] = useState(0);
    const typeTranslate = useSharedValue(type === "task" ? 0 : 1);
    const priorityTranslate = useSharedValue(
        priority === "Low" ? 0 : priority === "Medium" ? 1 : 2
    );

    // Inputs for date/time fields (for web)
    const [dueDateInput, setDueDateInput] = useState(formatDate(dueDate));
    const [reminderDateInput, setReminderDateInput] = useState(
        reminder ? formatDate(reminder) : ""
    );
    const [reminderTimeInput, setReminderTimeInput] = useState(
        reminder ? formatTime(reminder) : ""
    );

    // Other
    const [showDueDatePicker, setShowDueDatePicker] = useState(false);
    const [errors, setErrors] = useState({});
    const router = useRouter();

    // ================
    // EFFECTS
    // ================
    useEffect(() => {
        if (reminder) {
            setReminderDateInput(formatDate(reminder));
            setReminderTimeInput(formatTime(reminder));
        }
    }, [reminder]);

    useEffect(() => {
        if (mode === "edit" && initialType) {
            setType(initialType);
        }
    }, [mode, initialType]);

    useEffect(() => {
        typeTranslate.value = withTiming(type === "task" ? 0 : 1, { duration: 300 });
    }, [type]);

    useEffect(() => {
        const index = priority === "Low" ? 0 : priority === "Medium" ? 1 : 2;
        priorityTranslate.value = withTiming(index, { duration: 300 });
    }, [priority]);

    // ================
    // HELPERS
    // ================
    const parseDate = (str) => {
        const [dd, mm, yyyy] = str.split("/").map(Number);
        return new Date(yyyy, mm - 1, dd);
    };

    const parseTime = (str) => {
        const [hh, mm] = str.split(":").map(Number);
        return { hh, mm };
    };

    // ================
    // ANIMATED STYLES
    // ================
    const typeBgStyle = useAnimatedStyle(() => {
        const translateX = interpolate(typeTranslate.value, [0, 1], [0, tabWidth]);
        return { transform: [{ translateX }] };
    });

    const priorityBgStyle = useAnimatedStyle(() => {
        const translateX = interpolate(
            priorityTranslate.value,
            [0, 1, 2],
            [0, priorityWidth, priorityWidth * 2]
        );
        let bgColor = "#E0F2FE";
        if (priorityTranslate.value === 0) bgColor = "#0EA5E9"; // Low: blue
        if (priorityTranslate.value === 1) bgColor = "#F97316"; // Medium: orange
        if (priorityTranslate.value === 2) bgColor = "#EF4444"; // High: red
        return { transform: [{ translateX }], backgroundColor: bgColor };
    });

    // ================
    // VALIDATION
    // ================
    const validate = () => {
        const err = {};
        if (!title.trim()) err.title = "Title is required";
        if (type === "habit" && !habitTarget.trim()) err.habitTarget = "Target is required";
        setErrors(err);
        return Object.keys(err).length === 0;
    };

    // ================
    // SUBMIT HANDLER
    // ================
    const handleSubmit = async () => {
        if (!validate()) return;

        let parsedDueDate = dueDate;
        let parsedReminder = reminder;

        if (Platform.OS === "web") {
            try {
                if (dueDateInput) parsedDueDate = parseDate(dueDateInput);
                if (reminderDateInput) {
                    parsedReminder = parseDate(reminderDateInput);
                    if (reminderTimeInput) {
                        const { hh, mm } = parseTime(reminderTimeInput);
                        parsedReminder.setHours(hh);
                        parsedReminder.setMinutes(mm);
                    }
                }
            } catch (e) {
                console.warn("Date parse error:", e);
            }
        }

        const taskPayload = {
            title,
            description,
            dueDate: parsedDueDate,
            reminder: parsedReminder,
            tags: tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
            priority,
        };

        const habitPayload = {
            title,
            type: habitType,
            target: parseInt(habitTarget),
            unit: habitUnit,
        };

        const url = `${API_URL}/api/${type === "task" ? "tasks" : "habits"}${
            isEditing ? `/${id}` : ""
        }`;
        const payload = type === "task" ? taskPayload : habitPayload;

        try {
            await fetch(url, {
                method: isEditing ? "PATCH" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            router.back();
        } catch (err) {
            console.error("Failed to submit entry", err);
        }
    };

    // ================
    // MAIN RENDER
    // ================
    return (
        <ScrollView style={styles.container}>
            {/* ==== Header ==== */}
            <View style={styles.headerRow}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.heading}>
                    {isEditing
                        ? `Edit ${type === "task" ? "Task" : "Habit"}`
                        : `Create New ${type === "task" ? "Task" : "Habit"}`}
                </Text>
                <View style={{ width: 72 }} />
            </View>

            {/* ==== Type Toggle ==== */}
            {!isEditing && (
                <View
                    style={styles.tabRow}
                    onLayout={(e) => setTabWidth(e.nativeEvent.layout.width / 2)}>
                    <Animated.View style={[styles.animatedBg, typeBgStyle]} />
                    <TouchableOpacity style={styles.tabTouchable} onPress={() => setType("task")}>
                        <Text style={[styles.tabText, type === "task" && styles.activeTabText]}>
                            Task
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tabTouchable} onPress={() => setType("habit")}>
                        <Text style={[styles.tabText, type === "habit" && styles.activeTabText]}>
                            Habit
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* ==== Title ==== */}
            <TextInput
                style={[
                    styles.input,
                    errors.title && styles.errorInput,
                    { borderColor: errors.title ? "#EF4444" : "#2196F3" },
                ]}
                placeholder={`Title* (e.g. ${type === "task" ? "Finish Project" : "Drink Water"})`}
                value={title}
                onChangeText={setTitle}
                autoFocus
            />
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

            {/* ==== Task Fields ==== */}
            {type === "task" && (
                <>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Description (optional, e.g. details for your task)"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                    />

                    {/* Dates - Web vs Mobile */}
                    {Platform.OS === "web" ? (
                        <>
                            <TextInput
                                style={styles.input}
                                placeholder="Due Date* (DD/MM/YYYY)"
                                value={dueDateInput}
                                onChangeText={(text) => setDueDateInput(formatDateInput(text))}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Reminder Date (DD/MM/YYYY)"
                                value={reminderDateInput}
                                onChangeText={(text) => setReminderDateInput(formatDateInput(text))}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Reminder Time (HH:mm)"
                                value={reminderTimeInput}
                                onChangeText={(text) => setReminderTimeInput(formatTimeInput(text))}
                            />
                        </>
                    ) : (
                        <>
                            <TouchableOpacity
                                onPress={() => setShowDueDatePicker(true)}
                                style={styles.dateButton}>
                                <Text style={styles.dateButtonText}>Pick Due Date</Text>
                            </TouchableOpacity>
                            {showDueDatePicker && (
                                <DateTimePicker
                                    value={dueDate}
                                    mode="date"
                                    display="default"
                                    onChange={(e, selectedDate) => {
                                        setShowDueDatePicker(false);
                                        if (selectedDate) setDueDate(selectedDate);
                                    }}
                                />
                            )}
                        </>
                    )}

                    <TextInput
                        style={styles.input}
                        placeholder="Tags (comma separated, e.g. uni, urgent)"
                        value={tags}
                        onChangeText={setTags}
                    />

                    {/* ==== Priority Toggle ==== */}
                    <View
                        style={styles.priorityRow}
                        onLayout={(e) => setPriorityWidth(e.nativeEvent.layout.width / 3)}>
                        <Animated.View style={[styles.priorityBg, priorityBgStyle]} />
                        {["Low", "Medium", "High"].map((level) => (
                            <TouchableOpacity
                                key={level}
                                style={styles.priorityTouchable}
                                onPress={() => setPriority(level)}>
                                <Text
                                    style={[
                                        styles.priorityText,
                                        priority === level && styles.activePriorityText,
                                    ]}>
                                    {level}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </>
            )}

            {/* ==== Habit Fields ==== */}
            {type === "habit" && (
                <>
                    <TextInput
                        style={styles.input}
                        placeholder="Habit Type (optional, e.g. hydration, sleep)"
                        value={habitType}
                        onChangeText={setHabitType}
                    />
                    <TextInput
                        style={[
                            styles.input,
                            errors.habitTarget && styles.errorInput,
                            { borderColor: errors.habitTarget ? "#EF4444" : "#2196F3" },
                        ]}
                        placeholder="Target* (e.g. 8)"
                        keyboardType="numeric"
                        value={habitTarget}
                        onChangeText={setHabitTarget}
                    />
                    {errors.habitTarget && (
                        <Text style={styles.errorText}>{errors.habitTarget}</Text>
                    )}
                    <TextInput
                        style={styles.input}
                        placeholder="Unit (e.g. cups, hours, steps)"
                        value={habitUnit}
                        onChangeText={setHabitUnit}
                    />
                </>
            )}

            {/* ==== Submit Button ==== */}
            <TouchableOpacity
                style={[
                    styles.submitBtn,
                    (!title.trim() || (type === "habit" && !habitTarget.trim())) && {
                        opacity: 0.5,
                    },
                ]}
                onPress={handleSubmit}
                disabled={!title.trim() || (type === "habit" && !habitTarget.trim())}>
                <Text style={styles.submitText}>{isEditing ? "Save Changes" : "Create"}</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

// ================
// STYLES
// ================
const styles = StyleSheet.create({
    ...buttonStyles,
    ...tabStyles,

    // Main container styles
    container: {
        flex: 1,
        paddingTop: 20,
        paddingHorizontal: 20,
        backgroundColor: "#f9fafb",
    },

    // Header
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    heading: {
        fontSize: 20,
        color: "#2196F3",
        fontFamily: "Poppins-SemiBold",
        flex: 1,
        textAlign: "center",
    },

    // Inputs
    input: {
        padding: 12,
        borderColor: "#2196F3",
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 16,
        fontFamily: "Inter",
        fontSize: 14,
        backgroundColor: "#fff",
    },
    textArea: {
        fontFamily: "Inter",
        minHeight: 80,
        textAlignVertical: "top",
    },
    errorInput: {
        borderColor: "#EF4444",
    },
    errorText: {
        fontFamily: "Inter",
        color: "#EF4444",
        fontSize: 12,
        marginTop: -12,
        marginBottom: 8,
        marginLeft: 4,
    },
    dateButton: {
        marginBottom: 16,
        backgroundColor: "#e5e7eb",
        padding: 10,
        borderRadius: 8,
    },
    dateButtonText: {
        fontFamily: "Inter",
        textAlign: "center",
        color: "#111827",
    },

    // Priority row
    priorityRow: {
        flexDirection: "row",
        backgroundColor: "#ffffff",
        borderRadius: 10,
        marginBottom: 20,
        alignSelf: "center",
        width: "100%",
        height: 40,
        position: "relative",
        overflow: "hidden",
    },
    priorityTouchable: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2,
    },
    priorityBg: {
        position: "absolute",
        height: "100%",
        width: "33.33%",
        backgroundColor: "#2196F3",
        borderRadius: 10,
        top: 0,
        left: 0,
        zIndex: 1,
    },
    priorityText: {
        fontFamily: "Inter",
        fontSize: 15,
        fontWeight: "500",
        letterSpacing: 0.6,
        textTransform: "capitalize",
        color: "#565c61ff",
        textShadowColor: "rgba(0, 0, 0, 0.12)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
        zIndex: 3,
    },
    activePriorityText: {
        color: "#fff",
        fontWeight: "700",
        textShadowColor: "rgba(0, 0, 0, 0.15)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
        backgroundColor: "transparent",
        zIndex: 4,
    },

    // Submit button
    submitBtn: {
        backgroundColor: "#2196F3",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
        marginBottom: 40,
    },
    submitText: {
        fontFamily: "Inter",
        color: "#fff",
        fontWeight: "600",
        fontSize: 15,
    },
});
