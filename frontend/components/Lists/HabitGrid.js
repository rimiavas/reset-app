import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Pressable, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { isSameDay } from "date-fns";
import habitStyles from "../../constants/StyleSheet/habitStyles";
import menuStyles from "../../constants/StyleSheet/menuStyles";
import taskCardStyles from "../../constants/StyleSheet/taskCardStyles";
import { getLoggedValue } from "../../constants/utility/habitUtils";

// ==================================
// HABIT GRID COMPONENT
// displays habits in a responsive grid
// ==================================

export default function HabitGrid({ habits = [], onDelete, onUpdate, date = new Date() }) {
    // ==================
    // SETUP & STATE
    // ==================
    // Track which task has its 3-dot menu open
    const [selectedHabitId, setSelectedHabitId] = useState(null);
    const router = useRouter();
    const numColumns =
        Dimensions.get("window").width < 600 ? 2 : Dimensions.get("window").width < 900 ? 3 : 4;
    // helpers for logging date
    const isToday = isSameDay(date, new Date());
    // ==================
    // MAIN RENDER
    // ==================
    return (
        //Habits grid
        <View style={styles.habitGrid}>
            {Array.from({ length: Math.ceil(habits.length / numColumns) }).map((_, rowIndex) => (
                <View key={rowIndex} style={styles.habitRow}>
                    {habits
                        .slice(rowIndex * numColumns, rowIndex * numColumns + numColumns)
                        .map((habit) => {
                            const loggedValue = getLoggedValue(habit, date);
                            return (
                                <View
                                    key={habit._id}
                                    style={[styles.habitCard, { position: "relative" }]}>
                                    <View style={styles.habitHeader}>
                                        {/* Habit Title */}
                                        <Text style={styles.habitTitle}>{habit.title}</Text>
                                        {/* Three-dot Menu Button */}
                                        <TouchableOpacity
                                            onPress={() => setSelectedHabitId(habit._id)}>
                                            <Text style={styles.dots}>⋯</Text>
                                        </TouchableOpacity>
                                    </View>
                                    {selectedHabitId === habit._id && (
                                        <>
                                            <Pressable
                                                onPress={() => setSelectedHabitId(null)}
                                                style={StyleSheet.absoluteFillObject}
                                            />
                                            <View style={styles.menu}>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        setSelectedHabitId(null);
                                                        router.push({
                                                            pathname: "/create-entry",
                                                            params: {
                                                                mode: "edit",
                                                                type: "habit",
                                                                id: habit._id,
                                                                title: habit.title,
                                                                target:
                                                                    habit.target?.toString() || "",
                                                                unit: habit.unit || "",
                                                                habitType: habit.type || "",
                                                            },
                                                        });
                                                    }}>
                                                    <Text style={styles.menuItem}>✏️ Edit</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        setSelectedHabitId(null);
                                                        onDelete && onDelete(habit._id);
                                                    }}>
                                                    <Text style={styles.menuItem}>🗑️ Delete</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </>
                                    )}
                                    <View style={styles.counterRow}>
                                        <TouchableOpacity
                                            style={[
                                                styles.counterBtn,
                                                !isToday && { opacity: 0.3 },
                                            ]}
                                            onPress={() =>
                                                isToday && onUpdate && onUpdate(habit._id, -1)
                                            }
                                            disabled={!isToday}>
                                            <Text style={styles.counterText}>−</Text>
                                        </TouchableOpacity>
                                        <View>
                                            <Text style={styles.counterValue}>
                                                {loggedValue} / {habit.target || 0}
                                            </Text>
                                            <Text style={styles.unitText}>{habit.unit}</Text>
                                        </View>
                                        <TouchableOpacity
                                            style={[
                                                styles.counterBtn,
                                                !isToday && { opacity: 0.3 },
                                            ]}
                                            onPress={() =>
                                                isToday && onUpdate && onUpdate(habit._id, 1)
                                            }
                                            disabled={!isToday}>
                                            <Text style={styles.counterText}>＋</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.habitTagContainer}>
                                        <Text style={styles.habitTag}>{habit.type || "habit"}</Text>
                                    </View>
                                </View>
                            );
                        })}
                </View>
            ))}
        </View>
    );
}

// ==================
// STYLES
// ==================
const styles = StyleSheet.create({
    ...habitStyles,
    ...menuStyles,
    dots: taskCardStyles.dots,
});
