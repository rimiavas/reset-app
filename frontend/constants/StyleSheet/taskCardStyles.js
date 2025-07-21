import { StyleSheet } from "react-native";

const taskCardStyles = StyleSheet.create({
    // Task card styles
    taskCard: {
        width: "100%",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "rgba(0, 110, 233, 0.06)",
        backgroundColor: "#FFF",
        padding: 16,
        marginBottom: 12,
        shadowColor: "#006EE9",
        shadowOpacity: 0.02,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 20,
        flexShrink: 1,
        position: "relative",
    },
    taskHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 4,
    },
    taskTitle: {
        color: "#2196F3",
        fontFamily: "Inter",
        fontSize: 15,
        fontWeight: "500",
        letterSpacing: 0.6,
        textTransform: "capitalize",
        width: "100%",
    },
    taskDescription: {
        fontFamily: "Poppins",
        fontSize: 10,
        fontWeight: "400",
        color: "#4A4646",
        textTransform: "lowercase",
        marginBottom: 8,
        flexWrap: "wrap",
    },
    taskFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
    },
    // Tag styles
    tagContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 4,
    },
    tag: {
        fontFamily: "SpaceMono",
        fontSize: 10,
        fontWeight: "400",
        color: "#2196F3",
        backgroundColor: "#E0F2FE",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: 4,
        marginBottom: 4,
    },
    taskTimeline: {
        fontFamily: "Poppins",
        fontSize: 10,
        fontWeight: "400",
        color: "#0668E5",
        textAlign: "right",
    },

    // Priority badge styles
    priorityBadge: {
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: "center",
        alignItems: "center",
    },
    priorityBadgeText: {
        fontFamily: "Inter",
        fontSize: 10,
        color: "#fff",
        fontWeight: "bold",
    },
    priorityHigh: {
        backgroundColor: "#EF4444",
    },
    priorityMedium: {
        backgroundColor: "#F97316",
    },
    priorityLow: {
        backgroundColor: "#0EA5E9",
    },
    highPriority: {
        color: "#EF4444",
    },
    mediumPriority: {
        color: "#F97316",
    },
    lowPriority: {
        color: "#0EA5E9",
    },
});

export default taskCardStyles;
