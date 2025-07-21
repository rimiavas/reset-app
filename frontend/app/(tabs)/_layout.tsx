import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import CustomTabBar from "@/components/CustomTabBar";

import { Colors } from "@/constants/Colors";

// ==================================
// TAB LAYOUT
// This layout defines the structure of the tab navigation in the app
// It includes three main tabs: Home, Calendar, and Mood
// Each tab has its own icon and title
// ==================================
export default function TabLayout() {
    return (
        <Tabs
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                tabBarActiveTintColor: Colors.light.tint,
                headerShown: false,
                tabBarButton: HapticTab,
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
