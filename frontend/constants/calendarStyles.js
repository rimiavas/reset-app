import { StyleSheet, Dimensions } from "react-native";

const calendarStyles = StyleSheet.create({
    // Calendar section styles
    topSection: {
        marginBottom: 12,
    },
    calendarContainer: {
        width: "100%",
        height: 144,
        flexShrink: 0,
        marginBottom: 12,
    },
    topRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
        width: "100%",
        gap: 8,
    },
    monthLabel: {
        fontSize: Dimensions.get("window").width < 380 ? 18 : 24,
        fontFamily: "Poppins-SemiBold",
        color: "#111827",
        flexShrink: 1,
    },
    monthRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    todayButton: {
        backgroundColor: "#E0F2FE",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    todayButtonText: {
        color: "#2196F3",
        fontSize: Dimensions.get("window").width < 380 ? 11 : 14,
        fontFamily: "Inter",
        fontWeight: "500",
        textAlign: "center",
    },
    dateRow: {
        flexDirection: "row",
        marginTop: 12,
        marginBottom: 8,
        height: 64,
    },
    dateRowContent: {
        paddingHorizontal: 4,
    },
    dateButton: {
        width: Dimensions.get("window").width < 380 ? 36 : 50,
        height: Dimensions.get("window").width < 380 ? 36 : 50,
        borderRadius: 10,
        backgroundColor: "#EBF2FF",
        marginRight: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    activeDate: {
        width: Dimensions.get("window").width < 380 ? 46 : 64,
        height: Dimensions.get("window").width < 380 ? 46 : 64,
        borderRadius: 10,
        backgroundColor: "#2196F3",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    dayText: {
        fontFamily: "Poppins",
        fontSize: 10,
        color: "#2196F3",
    },
    dateNumber: {
        fontFamily: "Poppins-SemiBold",
        fontSize: Dimensions.get("window").width < 380 ? 11 : 14,
        fontWeight: "600",
        color: "#2196F3",
    },
    activeDateText: {
        color: "#ffffff",
    },
});

export default calendarStyles;
