import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import emptyStateStyles from "../constants/StyleSheet/emptyStateStyles";

export default function EmptyState({ label, onPress }) {
    return (
        <View style={styles.EmptyContainer}>
            <Text style={styles.EmptyText}>No {label.toLowerCase()} yet.</Text>
            <TouchableOpacity onPress={onPress} style={styles.EmptyButton}>
                <Text style={styles.EmptyButtonText}>+ Create {label}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    ...emptyStateStyles,
});
