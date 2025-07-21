import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-reanimated";

// ==================================
//  LAYOUT
// This is the main layout for the app
// It sets up the theme and font loading
// It includes the navigation and other screens
// ==================================
export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        Rufina: require("../assets/fonts/Rufina-Regular.ttf"),
        "Rufina-Bold": require("../assets/fonts/Rufina-Bold.ttf"),
        SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
        Inter: require("../assets/fonts/Inter.ttf"),
        "Inter-Italic": require("../assets/fonts/Inter-Italic.ttf"),
        Poppins: require("../assets/fonts/Poppins-Regular.ttf"),
        "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
        "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    });

    if (!fontsLoaded) return null;

    return (
        <SafeAreaProvider>
            <ThemeProvider value={DefaultTheme}>
                <Stack>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="completed-tasks" options={{ headerShown: false }} />
                    <Stack.Screen name="create-entry" options={{ headerShown: false }} />
                    <Stack.Screen name="+not-found" />
                </Stack>
                <StatusBar style="auto" />
            </ThemeProvider>
        </SafeAreaProvider>
    );
}
