import { StyleSheet } from "react-native";

const tabStyles = StyleSheet.create({
    // Tab switcher styles
    tabRow: {
        flexDirection: "row",
        backgroundColor: "#ffffff",
        borderRadius: 10,
        marginBottom: 20,
        alignSelf: "center",
        width: "100%",
        height: 40,
        position: "relative",
        overflow: "hidden",
    },
    tabTouchable: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1,
    },
    animatedBg: {
        position: "absolute",
        height: "100%",
        width: "50%",
        backgroundColor: "#2196F3",
        borderRadius: 10,
        top: 0,
        left: 0,
        zIndex: 0,
    },
    tabText: {
        fontFamily: "Inter",
        fontSize: 15,
        fontWeight: "500",
        letterSpacing: 0.6,
        textTransform: "capitalize",
        color: "#90A5B4",
    },
    activeTabText: {
        fontFamily: "Inter",
        color: "#ffffff",
    },
});

export default tabStyles;
