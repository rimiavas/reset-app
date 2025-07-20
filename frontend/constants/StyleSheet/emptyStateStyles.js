import { StyleSheet } from "react-native";

const emptyStateStyles = StyleSheet.create({
    // Empty state styles
    EmptyContainer: {
        alignItems: "center",
        marginTop: 40,
    },
    EmptyText: {
        fontFamily: "Inter",
        color: "#94a3b8",
        fontSize: 14,
        marginBottom: 14,
    },
    EmptyButton: {
        backgroundColor: "#2196F3",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    EmptyButtonText: {
        fontFamily: "Inter",
        color: "#fff",
        fontWeight: "600",
        fontSize: 15,
    },
});

export default emptyStateStyles;
