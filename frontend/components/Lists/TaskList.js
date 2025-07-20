import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    TouchableOpacity,
    Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import taskCardStyles from "@/constants/StyleSheet/taskCardStyles";
import menuStyles from "@/constants/StyleSheet/menuStyles";
import { sortTasks, getPriorityStyle } from "@/constants/utility/taskUtils";

export default function TaskList({
    tasks = [],
    sortMode = "dueDate",
    onEdit,
    onDelete,
    onMarkDone,
    markDoneLabel = "✅ Mark as Done",
    refreshing = false,
    onRefresh,
    ListEmptyComponent,
    showEdit = true,
}) {
    // Track which task has its 3-dot menu open
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const router = useRouter();

    const buildEditParams = (item) => ({
        mode: "edit",
        type: "task",
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
    });

    const handleEdit = (item) => {
        setSelectedTaskId(null);
        if (onEdit) {
            onEdit(item);
        } else {
            router.push({ pathname: "/create-entry", params: buildEditParams(item) });
        }
    };

    return (
        <FlatList
            style={{ flex: 1 }}
            data={sortTasks(tasks, sortMode)}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
                <View style={{ position: "relative" }}>
                    {selectedTaskId === item._id && (
                        <Pressable
                            onPress={() => setSelectedTaskId(null)}
                            style={StyleSheet.absoluteFillObject}
                        />
                    )}

                    {/* Task Card */}
                    <View style={styles.taskCard}>
                        <View style={styles.taskHeader}>
                            <View style={styles.titleRow}>
                                {/* Priority Badge */}
                                <View
                                    style={[
                                        styles.priorityBadge,
                                        styles[`priority${item.priority}`],
                                    ]}>
                                    <Text style={styles.priorityBadgeText}>
                                        {item.priority?.[0] || "M"}
                                    </Text>
                                </View>
                                {/* Task Title */}
                                <Text style={styles.taskTitle}>{item.title}</Text>
                            </View>

                            {/* Three-dot Menu Button */}
                            <TouchableOpacity onPress={() => setSelectedTaskId(item._id)}>
                                <Text style={styles.dots}>⋯</Text>
                            </TouchableOpacity>
                        </View>
                        {/* Dropdown Menu (Mark Done, Edit, Delete) */}
                        {selectedTaskId === item._id && (
                            <View style={styles.menu}>
                                {onMarkDone && (
                                    <TouchableOpacity onPress={() => onMarkDone(item._id)}>
                                        <Text style={styles.menuItem}>{markDoneLabel}</Text>
                                    </TouchableOpacity>
                                )}
                                {showEdit && (
                                    <TouchableOpacity onPress={() => handleEdit(item)}>
                                        <Text style={styles.menuItem}>✏️ Edit</Text>
                                    </TouchableOpacity>
                                )}
                                {onDelete && (
                                    <TouchableOpacity onPress={() => onDelete(item._id)}>
                                        <Text style={styles.menuItem}>🗑️ Delete</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        {/* Task Description */}
                        <Text style={styles.taskDescription}>{item.description}</Text>

                        {/* Task Footer: Tags and Timeline */}
                        <View style={styles.taskFooter}>
                            <View style={styles.tagContainer}>
                                {item.tags?.length > 0 &&
                                    item.tags.map((tag, index) => (
                                        <Text key={index} style={styles.tag}>
                                            #{tag}
                                        </Text>
                                    ))}
                            </View>
                            {/* Timeline (Created Date → Due Date) */}
                            <Text style={[styles.taskTimeline, getPriorityStyle(item.priority)]}>
                                {new Date(item.createdAt).toLocaleDateString()} →{" "}
                                {new Date(item.dueDate).toLocaleDateString()}
                            </Text>
                        </View>
                    </View>
                </View>
            )}
            /* Pull-to-refresh functionality */
            refreshControl={
                onRefresh ? (
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                ) : undefined
            }
            ListEmptyComponent={ListEmptyComponent}
            /* Add bottom padding for navigation and scrolling */
            contentContainerStyle={{ paddingBottom: 80, flexGrow: 1 }}
        />
    );
}

const styles = StyleSheet.create({
    ...taskCardStyles,
    ...menuStyles,
});
