import React, { useState } from "react";
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
import { useRouter } from "expo-router";
import { API_URL } from "../constants/constants";

export default function CreateEntryScreen() {
    const [type, setType] = useState("task"); // 'task' or 'habit'
    const [title, setTitle] = useState("");
    const [dueDate, setDueDate] = useState(new Date());
    const [reminder, setReminder] = useState(null);
    const [showDueDatePicker, setShowDueDatePicker] = useState(false);
    const [showReminderPicker, setShowReminderPicker] = useState(false);
    const [tags, setTags] = useState("");
    const [priority, setPriority] = useState("Medium");

    // Habit-specific
    const [habitTarget, setHabitTarget] = useState("");
    const [habitUnit, setHabitUnit] = useState("");
    const [habitType, setHabitType] = useState("");

    const router = useRouter();

    const handleSubmit = async () => {
        const taskPayload = {
            title,
            dueDate,
            reminder,
            tags: tags.split(",").map((t) => t.trim()),
            priority,
        };

        const habitPayload = {
            title,
            type: habitType,
            target: parseInt(habitTarget),
            unit: habitUnit,
        };

        const url = type === "task" ? `${API_URL}/api/tasks` : `${API_URL}/api/habits`;

        const payload = type === "task" ? taskPayload : habitPayload;

        try {
            await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            router.replace("/calendar");
        } catch (err) {
            console.error("Failed to submit entry", err);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.heading}>Create New {type === "task" ? "Task" : "Habit"}</Text>

            {/* Toggle Type */}
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

            {/* Shared */}
            <TextInput
                style={styles.input}
                placeholder="Title"
                value={title}
                onChangeText={setTitle}
            />

            {/* Task-specific fields */}
            {type === "task" && (
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
                                if (Platform.OS === "android") setShowDueDatePicker(false);
                                if (selectedDate) setDueDate(selectedDate);
                            }}
                        />
                    )}

                    <TouchableOpacity
                        onPress={() => {
                            if (Platform.OS === "android") {
                                DateTimePickerAndroid.open({
                                    value: reminder || new Date(),
                                    mode: "date",
                                    is24Hour: true,
                                    onChange: (event, selectedDate) => {
                                        if (selectedDate) {
                                            setReminder((prev) => {
                                                const time = prev || new Date();
                                                const combined = new Date(selectedDate);
                                                combined.setHours(time.getHours());
                                                combined.setMinutes(time.getMinutes());
                                                return combined;
                                            });
                                        }
                                    },
                                });
                            } else {
                                setShowReminderPicker(true); // fallback for iOS/web
                            }
                        }}
                        style={styles.dateButton}>
                        <Text style={styles.dateButtonText}>Pick Reminder Date</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            if (Platform.OS === "android") {
                                DateTimePickerAndroid.open({
                                    value: reminder || new Date(),
                                    mode: "time",
                                    is24Hour: true,
                                    onChange: (event, selectedTime) => {
                                        if (selectedTime) {
                                            setReminder((prev) => {
                                                const date = prev || new Date();
                                                const combined = new Date(date);
                                                combined.setHours(selectedTime.getHours());
                                                combined.setMinutes(selectedTime.getMinutes());
                                                return combined;
                                            });
                                        }
                                    },
                                });
                            }
                        }}
                        style={styles.dateButton}>
                        <Text style={styles.dateButtonText}>Pick Reminder Time</Text>
                    </TouchableOpacity>

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

            {/* Habit-specific fields */}
            {type === "habit" && (
                <>
                    <TextInput
                        style={styles.input}
                        placeholder="Habit Type (e.g. Water, Shower)"
                        value={habitType}
                        onChangeText={setHabitType}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Target Number (e.g. 8)"
                        keyboardType="numeric"
                        value={habitTarget}
                        onChangeText={setHabitTarget}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Unit (e.g. cups, kcal, times)"
                        value={habitUnit}
                        onChangeText={setHabitUnit}
                    />
                </>
            )}

            <Button title="Create" onPress={handleSubmit} disabled={!title.trim()} />
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
});
