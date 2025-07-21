import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Pressable, Dimensions } from "react-native";
import { isSameDay } from "date-fns";
import habitStyles from "../../constants/StyleSheet/habitStyles";
import menuStyles from "../../constants/StyleSheet/menuStyles";
import { getLoggedValue } from "../../constants/utility/habitUtils";
import DefaultEmpty from "./ListEmptyComponent";

// ==================================
// HABIT GRID COMPONENT
// displays habits in a responsive grid
// ==================================

export default function HabitGrid({
    habits = [],
    onDelete,
    onUpdate,
    onEdit,
    date = new Date(),
    ListEmptyComponent,
}) {
    // ==================
    // SETUP & STATE
    // ==================
    // Track which task has its 3-dot menu open
    const [selectedHabitId, setSelectedHabitId] = useState(null);

    const EmptyComponent = ListEmptyComponent || (() => <DefaultEmpty type="habit" />);
    const windowWidth = Dimensions.get("window").width;
    const numColumns = windowWidth < 600 ? 2 : windowWidth < 900 ? 3 : 4;

    // helpers for logging date
    const isToday = isSameDay(date, new Date());
    // ==================
    // MAIN RENDER
    // ==================
    return (
        //Habits grid
        <View style={styles.habitGrid}>
            {selectedHabitId && (
                <Pressable
                    pointerEvents="box-none"
                    style={[StyleSheet.absoluteFillObject, { zIndex: 10 }]}
                    onPress={() => setSelectedHabitId(null)}
                />
            )}
            {/* If no habits, show empty component */}
            {/* Otherwise, render habits in a grid */}
            {habits.length === 0 ? (
                <EmptyComponent />
            ) : (
                Array.from({ length: Math.ceil(habits.length / numColumns) }).map((_, rowIndex) => (
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
                                                onPress={() => setSelectedHabitId(habit._id)}
                                                hitSlop={{
                                                    top: 12,
                                                    bottom: 12,
                                                    left: 12,
                                                    right: 12,
                                                }}>
                                                <Text style={styles.dots}>⋯</Text>
                                            </TouchableOpacity>
                                        </View>
                                        {selectedHabitId === habit._id && (
                                            <>
                                                <View style={[styles.menu, styles.habitMenu]}>
                                                    <TouchableOpacity
                                                        onPress={async () => {
                                                            if (onEdit) {
                                                                await onEdit(habit, "habit");
                                                            }
                                                            setSelectedHabitId(null);
                                                        }}>
                                                        <Text style={styles.menuItem}>✏️ Edit</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        onPress={async () => {
                                                            if (onDelete) {
                                                                await onDelete(habit._id);
                                                            }
                                                            setSelectedHabitId(null);
                                                        }}>
                                                        <Text style={styles.menuItem}>
                                                            🗑️ Delete
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </>
                                        )}
                                        {/* Habit Counter */}
                                        {/* Display the logged value and target */}
                                        <View style={styles.counterRow}>
                                            <TouchableOpacity
                                                style={[
                                                    styles.counterBtn,
                                                    (!isToday || loggedValue <= 0) && {
                                                        opacity: 0.3,
                                                    },
                                                ]}
                                                onPress={() =>
                                                    isToday &&
                                                    loggedValue > 0 &&
                                                    onUpdate &&
                                                    onUpdate(habit._id, -1)
                                                }
                                                disabled={!isToday || loggedValue <= 0}>
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
                                            <Text style={styles.habitTag}>
                                                {habit.type || "habit"}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                    </View>
                ))
            )}
        </View>
    );
}

// ==================
// STYLES
// ==================
const styles = StyleSheet.create({
    ...habitStyles,
    ...menuStyles,

    habitMenu: {
        top: 20,
    },
});
