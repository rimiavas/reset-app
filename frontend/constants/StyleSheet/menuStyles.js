import { StyleSheet } from "react-native";

const menuStyles = StyleSheet.create({
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
    dots: {
        fontSize: 20,
        color: "#ABCEF5",
        lineHeight: 5,
    },
});

export default menuStyles;
