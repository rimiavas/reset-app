import { useState, useCallback } from "react";
import { Platform, Alert } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { API_URL } from "../constants/constants";

// ==================================
// useTaskHabitData Hook
// This hook manages tasks and habits data
// It fetches data from the API, handles refresh, delete, and update operations
// It provides functions for components to use
// ==================================
export default function useTaskHabitData() {
    // Arrays to store tasks and habits data from the API
    const [tasks, setTasks] = useState([]);
    const [habits, setHabits] = useState([]);
    // Controls the pull-to-refresh loading state
    const [refreshing, setRefreshing] = useState(false);

    // Fetch tasks and habits data from the API
    const fetchData = useCallback(() => {
        return Promise.all([
            fetch(`${API_URL}/api/tasks`)
                .then((res) => res.json())
                .then((data) => setTasks(data.filter((task) => !task.completed)))
                .catch((err) => console.error("Error fetching tasks:", err)),
            fetch(`${API_URL}/api/habits`)
                .then((res) => res.json())
                .then(setHabits)
                .catch((err) => console.error("Error fetching habits:", err)),
        ]);
    }, []);

    // Refresh data when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    // Handle pull-to-refresh functionality
    const handleRefresh = () => {
        setRefreshing(true);
        fetchData().finally(() => setRefreshing(false));
    };

    // Handle delete action for tasks and habits
    const handleDelete = async (id, type = "task") => {
        const route = type === "habit" || type === "habits" ? "habits" : "tasks";
        if (Platform.OS === "web") {
            const confirm = window.confirm(
                `Are you sure you want to delete this ${route.slice(0, -1)}?`
            );
            if (!confirm) return;
            try {
                await fetch(`${API_URL}/api/${route}/${id}`, { method: "DELETE" });
                if (route === "tasks") {
                    setTasks((prev) => prev.filter((t) => t._id !== id));
                } else {
                    setHabits((prev) => prev.filter((h) => h._id !== id));
                }
            } catch (err) {
                console.error(`Error deleting ${route.slice(0, -1)}:`, err);
            }
        } else {
            Alert.alert(
                "Delete Entry",
                `Are you sure you want to delete this ${route.slice(0, -1)}?`,
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Yes",
                        style: "destructive",
                        onPress: async () => {
                            try {
                                await fetch(`${API_URL}/api/${route}/${id}`, {
                                    method: "DELETE",
                                });
                                if (route === "tasks") {
                                    setTasks((prev) => prev.filter((t) => t._id !== id));
                                } else {
                                    setHabits((prev) => prev.filter((h) => h._id !== id));
                                }
                            } catch (err) {
                                console.error(`Error deleting ${route.slice(0, -1)}:`, err);
                            }
                        },
                    },
                ],
                { cancelable: true }
            );
        }
    };

    // Handle marking a task as done
    const handleMarkDone = async (id) => {
        try {
            await fetch(`${API_URL}/api/tasks/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ completed: true }),
            });
            setTasks((prev) => prev.filter((task) => task._id !== id));
        } catch (err) {
            console.error("Error marking task done:", err);
        }
    };

    // Update habit log by incrementing or decrementing the amount
    const updateHabit = async (id, delta) => {
        try {
            const res = await fetch(`${API_URL}/api/habits/log/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: delta }),
            });
            const updated = await res.json();
            setHabits((prev) => prev.map((h) => (h._id === id ? updated : h)));
        } catch (err) {
            console.error("Failed to update habit log:", err);
        }
    };

    const router = useRouter();

    const handleEdit = (item, type = "task") => {
        const params = {
            mode: "edit",
            type,
            id: item._id,
            title: item.title,
            description: item.description || "",
            dueDate: item.dueDate,
            reminder: item.reminder ? new Date(item.reminder).toISOString() : "",
            tags: Array.isArray(item.tags) ? item.tags.join(",") : "",
            priority: item.priority || "Medium",
            target: item.target?.toString() || "",
            unit: item.unit || "",
            habitType: item.type || "",
        };
        router.push({ pathname: "/create-entry", params });
    };

    // Return all the data and functions for use in components
    // This allows components to access tasks, habits, and utility functions
    return {
        tasks,
        habits,
        refreshing,
        handleRefresh,
        handleDelete,
        handleMarkDone,
        updateHabit,
        handleEdit,
    };
}
