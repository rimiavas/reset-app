// This is a shim for web and Android where the tab bar is generally opaque.
import { BlurView } from "expo-blur";
import { StyleSheet, View, Platform } from "react-native";

export default function TabBarBackground() {
    if (Platform.OS === "web") {
        return <View style={[StyleSheet.absoluteFill, styles.container]} />;
    }
    return (
        <BlurView tint="light" intensity={50} style={[StyleSheet.absoluteFill, styles.container]} />
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#fbfbfb",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: "hidden",
    },
});

export function useBottomTabOverflow() {
    return 0;
}
