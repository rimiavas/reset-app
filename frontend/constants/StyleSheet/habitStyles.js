import { StyleSheet } from "react-native";

const habitStyles = StyleSheet.create({
    // Habit tracker styles
    habitGrid: {
        width: "100%",
        position: "relative",
    },
    habitRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    habitCard: {
        flex: 1,
        marginHorizontal: 4,
        padding: 12,
        backgroundColor: "#ffffff",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E0F2FE",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        alignItems: "center",
    },
    habitHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        marginBottom: 10,
    },
    habitTitle: {
        color: "#2196F3",
        fontFamily: "Inter",
        fontSize: 15,
        fontWeight: "500",
        letterSpacing: 0.6,
        textTransform: "capitalize",
        width: "100%",
    },
    counterRow: {
        flexDirection: "row",
        alignItems: "center",
        margin: 10,
    },
    counterBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#E0F2FE",
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 8,
    },
    counterText: {
        fontFamily: "Poppins",
        fontSize: 16,
        fontWeight: "bold",
        color: "#2196F3",
    },
    counterValue: {
        fontFamily: "Poppins",
        fontSize: 12,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
    },
    unitText: {
        fontFamily: "Poppins",
        fontSize: 10,
        color: "#666",
        textAlign: "center",
    },
    habitTagContainer: {
        alignItems: "flex-start",
        width: "100%",
        marginTop: 10,
    },
    habitTag: {
        fontFamily: "SpaceMono",
        fontSize: 10,
        fontWeight: "bold",
        color: "#2196F3",
        backgroundColor: "#E0F2FE",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginBottom: 6,
    },
});

export default habitStyles;
