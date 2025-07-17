import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    TouchableOpacity,
    Platform,
    ScrollView,
} from "react-native";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { API_URL } from "../constants/constants";

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

    const [dueDateInput, setDueDateInput] = useState(formatDate(dueDate));
    const [reminderDateInput, setReminderDateInput] = useState(
        reminder ? formatDate(reminder) : ""
    );
    const [reminderTimeInput, setReminderTimeInput] = useState(
        reminder ? formatTime(reminder) : ""
    );

    // Habit fields
    const [habitTarget, setHabitTarget] = useState(initialTarget || "");
    const [habitUnit, setHabitUnit] = useState(initialUnit || "");
    const [habitType, setHabitType] = useState(initialHabitType || "");

    const [showDueDatePicker, setShowDueDatePicker] = useState(false);
    const [showReminderPicker, setShowReminderPicker] = useState(false);
    const router = useRouter();

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

    const parseDate = (str) => {
        const [dd, mm, yyyy] = str.split("/").map(Number);
        return new Date(yyyy, mm - 1, dd);
    };

    const parseTime = (str) => {
        const [hh, mm] = str.split(":").map(Number);
        return { hh, mm };
    };

    const handleSubmit = async () => {
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
            tags: tags.split(",").map((t) => t.trim()),
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

    return (
        <ScrollView style={styles.container}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.heading}>
                {isEditing
                    ? `Edit ${type === "task" ? "Task" : "Habit"}`
                    : `Create New ${type === "task" ? "Task" : "Habit"}`}
            </Text>

            {!isEditing && (
                <View style={styles.toggleRow}>
                    <TouchableOpacity
                        style={[styles.toggleButton, type === "task" && styles.activeToggle]}
                        onPress={() => setType("task")}>
                        <Text style={styles.toggleText}>Task</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleButton, type === "habit" && styles.activeToggle]}
                        onPress={() => setType("habit")}>
                        <Text style={styles.toggleText}>Habit</Text>
                    </TouchableOpacity>
                </View>
            )}

            <TextInput
                style={styles.input}
                placeholder="Title"
                value={title}
                onChangeText={setTitle}
            />

            {type === "task" && (
                <>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Description (optional)"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                    />

                    {Platform.OS === "web" ? (
                        <>
                            <TextInput
                                style={styles.input}
                                placeholder="Due Date (DD/MM/YYYY)"
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
                        placeholder="Tags (comma separated)"
                        value={tags}
                        onChangeText={setTags}
                    />
                    <View style={styles.toggleRow}>
                        {["Low", "Medium", "High"].map((level) => (
                            <TouchableOpacity
                                key={level}
                                style={[
                                    styles.toggleButton,
                                    priority === level && styles.activeToggle,
                                ]}
                                onPress={() => setPriority(level)}>
                                <Text style={styles.toggleText}>{level}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </>
            )}

            {type === "habit" && (
                <>
                    <TextInput
                        style={styles.input}
                        placeholder="Habit Type"
                        value={habitType}
                        onChangeText={setHabitType}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Target (e.g. 8)"
                        keyboardType="numeric"
                        value={habitTarget}
                        onChangeText={setHabitTarget}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Unit (e.g. cups)"
                        value={habitUnit}
                        onChangeText={setHabitUnit}
                    />
                </>
            )}

            <Button
                title={isEditing ? "Save Changes" : "Create"}
                onPress={handleSubmit}
                disabled={!title.trim()}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingTop: 60,
        backgroundColor: "#f9fafb",
    },
    heading: {
        fontSize: 22,
        fontWeight: "600",
        marginBottom: 20,
        textAlign: "center",
    },
    toggleRow: {
        flexDirection: "row",
        marginBottom: 16,
    },
    toggleButton: {
        flex: 1,
        padding: 12,
        marginHorizontal: 5,
        backgroundColor: "#e5e7eb",
        borderRadius: 8,
    },
    activeToggle: {
        backgroundColor: "#d1d5db",
    },
    toggleText: {
        textAlign: "center",
        fontWeight: "500",
    },
    input: {
        padding: 12,
        borderColor: "#d1d5db",
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 16,
    },
    dateButton: {
        marginBottom: 16,
        backgroundColor: "#e5e7eb",
        padding: 10,
        borderRadius: 8,
    },
    dateButtonText: {
        textAlign: "center",
        color: "#111827",
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: "top",
    },
    backBtn: {
        marginBottom: 20,
        marginTop: 10,
        alignSelf: "flex-start",
        backgroundColor: "#E0F2FE",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
    },

    backText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#2196F3",
    },
});
