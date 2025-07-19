import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";

export default function RootLayout() {
    const colorScheme = useColorScheme();

    const [fontsLoaded] = useFonts({
        Rufina: require("../assets/fonts/Rufina-Regular.ttf"),
        "Rufina-Bold": require("../assets/fonts/Rufina-Bold.ttf"),
        SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
        Inter: require("../assets/fonts/Inter-VariableFont_opsz,wght.ttf"),
        "Inter-Italic": require("../assets/fonts/Inter-Italic-VariableFont_opsz,wght.ttf"),
        "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    });

    if (!fontsLoaded) return null;

    return (
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="completed-tasks" options={{ headerShown: false }} />
                <Stack.Screen name="create-entry" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
        </ThemeProvider>
    );
}
