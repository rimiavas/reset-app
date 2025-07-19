import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
                headerShown: false,
                tabBarButton: HapticTab,
                tabBarBackground: TabBarBackground,
                tabBarStyle: {
                    backgroundColor: "#fbfbfb",
                    height: 70,
                    borderTopWidth: 0,
                    position: "absolute",
                },
                tabBarLabelStyle: {
                    fontFamily: "Poppins-Medium",
                    fontSize: 12,
                },
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={28} name="house.fill" color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="calendar"
                options={{
                    title: "Calendar",
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={28} name="calendar" color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="mood"
                options={{
                    title: "Mood",
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={28} name="face.smiling" color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
