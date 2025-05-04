import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

export default function TaskScreen() {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        fetch("http://localhost:3000/api/tasks") // Replace with your IP if needed
            .then((res) => res.json())
            .then((data) => setTasks(data))
            .catch((err) => console.error("Error fetching tasks:", err));
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>My Tasks</Text>
            <FlatList
                data={tasks}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.date}>
                            Due: {new Date(item.dueDate).toLocaleDateString()}
                        </Text>
                        <Text style={styles.status}>
                            {item.completed ? "✅ Done" : "🕒 Pending"}
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
    date: {
        fontSize: 14,
        color: "#6b7280",
    },
    status: {
        marginTop: 4,
        fontSize: 14,
        color: "#9ca3af",
    },
});
