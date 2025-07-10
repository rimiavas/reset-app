import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { API_URL } from "../constants/constants";

export default function HabitScreen() {
    const [habits, setHabits] = useState([]);

    useEffect(() => {
        fetch(`${API_URL}/api/habits`)
            .then((res) => res.json())
            .then((data) => setHabits(data))
            .catch((err) => console.error("Error fetching habits:", err));
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>My Habits</Text>
            <FlatList
                data={habits}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.status}>
                            {item.completed ? "✅ Completed" : "⏳ In Progress"}
                        </Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 60,
        paddingHorizontal: 20,
        flex: 1,
        backgroundColor: "#f3f4f6",
    },
    heading: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        elevation: 2,
    },
    title: {
        fontSize: 18,
        fontWeight: "500",
    },
    status: {
        marginTop: 4,
        color: "#6b7280",
    },
});
