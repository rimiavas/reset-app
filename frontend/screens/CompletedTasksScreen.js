import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import TaskList from "../components/Lists/TaskList";
import { useFocusEffect, useRouter } from "expo-router";
import { API_URL } from "../constants/constants";
import taskCardStyles from "../constants/StyleSheet/taskCardStyles";
import menuStyles from "../constants/StyleSheet/menuStyles";
import emptyStateStyles from "../constants/StyleSheet/emptyStateStyles";
import buttonStyles from "../constants/StyleSheet/buttonStyles";

//============================
// COMPLETED SCREEN COMPONENT
// This screen displays a list of completed tasks.
// Users can undo the completion of tasks.
//============================

export default function CompletedTasksScreen() {
    // =================
    // STATE MANAGEMENT
    // =================

    // Array to store completed tasks data from the API
    const [tasks, setTasks] = useState([]);

    // Controls the pull-to-refresh loading state
    const [refreshing, setRefreshing] = useState(false);

    // Router instance for navigation
    const router = useRouter();

    // =================
    // DATA FETCHING
    // =================

    // Fetch completed tasks from API
    const fetchTasks = useCallback(() => {
        return fetch(`${API_URL}/api/tasks/completed`)
            .then((res) => res.json())
            .then(setTasks)
            .catch((err) => console.error("Error fetching completed tasks:", err));
    }, []);

    // Refresh data when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchTasks();
        }, [fetchTasks])
    );

    // =================
    // EVENT HANDLERS
    // =================

    // Handle pull-to-refresh functionality
    const handleRefresh = () => {
        setRefreshing(true);
        fetchTasks().finally(() => setRefreshing(false));
    };

    // Mark a completed task as incomplete (undo completion)
    const handleUndo = async (id) => {
        try {
            await fetch(`${API_URL}/api/tasks/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ completed: false }),
            });

            // Refresh the list to remove the undone task
            fetchTasks();
        } catch (err) {
            console.error("Error undoing completion:", err);
        }
    };

    // =================
    // MAIN RENDER
    // =================

    return (
        <SafeAreaView style={styles.container}>
            {/* =================
                NAVIGATION + HEADER
                ================= */}
            <View style={styles.headerRow}>
                {/* Back Button */}
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                {/* Header */}
                <Text style={styles.heading}>Completed Tasks</Text>
            </View>

            {/* =================
                COMPLETED TASKS LIST 
                ================= */}
            <TaskList
                tasks={tasks}
                onMarkDone={handleUndo}
                markDoneLabel="↩️ Undo Complete"
                refreshing={refreshing}
                onRefresh={handleRefresh}
                showEdit={false}
                /* Show empty state when no completed tasks exist */
                ListEmptyComponent={<Text style={styles.empty}>No completed tasks yet.</Text>}
                /* Add bottom padding for navigation and scrolling */
                contentContainerStyle={{ paddingBottom: 60 }}
            />
        </SafeAreaView>
    );
}

// =================
// STYLES
// =================

const styles = StyleSheet.create({
    ...taskCardStyles,
    ...menuStyles,
    ...emptyStateStyles,
    ...buttonStyles,

    // Main container styles
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
        paddingTop: 20,
        paddingHorizontal: 20,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        gap: 8,
    },
    heading: {
        fontFamily: "Poppins-SemiBold",
        flex: 1,
        fontSize: 20,
        color: "#2196F3",
        marginBottom: 20,
        textAlign: "center",
    },
});
