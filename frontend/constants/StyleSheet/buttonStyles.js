import { StyleSheet } from "react-native";

const buttonStyles = StyleSheet.create({
    // Control button styles
    viewCompletedBtn: {
        position: "absolute",
        bottom: 10,
        left: 20,
        backgroundColor: "#E0F2FE",
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 8,
        zIndex: 5,
    },
    viewCompletedText: {
        color: "#2196F3",
        fontSize: 12,
        fontWeight: "500",
    },
    sortButton: {
        alignSelf: "flex-end",
        marginBottom: 8,
        backgroundColor: "#E0F2FE",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    sortButtonText: {
        fontFamily: "Inter",
        color: "#2196F3",
        fontSize: 12,
        fontWeight: "500",
    },

    // Back button styles
    backBtn: {
        marginBottom: 20,
        marginTop: 10,
        alignSelf: "flex-start",
        backgroundColor: "#E0F2FE",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
    },
    backText: {
        fontFamily: "Inter",
        fontSize: 14,
        fontWeight: "500",
        color: "#2196F3",
    },
});

export default buttonStyles;
