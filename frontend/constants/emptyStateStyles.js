import { StyleSheet } from "react-native";

const emptyStateStyles = StyleSheet.create({
    // Menu styles (3-dot dropdown)
    menu: {
        position: "absolute",
        top: -10,
        right: 10,
        backgroundColor: "#ffffff",
        borderRadius: 8,
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 8,
        elevation: 5,
        zIndex: 20,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    menuItem: {
        fontFamily: "Inter",
        fontSize: 12,
        paddingVertical: 6,
        paddingHorizontal: 10,
        color: "#111827",
    },

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
