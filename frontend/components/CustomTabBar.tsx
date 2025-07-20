import React from "react";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { Colors } from "@/constants/Colors";

// ==================================
// CUSTOM TAB BAR
// renders navigation bar with icons and labels
// ==================================

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const activeColor = Colors.light.tint;
    const inactiveColor = Colors.light.tabIconDefault;

    // ==================
    // MAIN RENDER
    // ==================
    return (
        <View style={styles.container}>
            <View style={styles.menuList}>
                {state.routes.map((route, index) => {
                    const isFocused = state.index === index;
                    const { options } = descriptors[route.key];
                    const label = options.title ?? route.name;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: "tabPress",
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    const icon = options.tabBarIcon ? (
                        options.tabBarIcon({
                            focused: isFocused,
                            color: isFocused ? activeColor : inactiveColor,
                            size: 28,
                        })
                    ) : (
                        <MaterialIcons
                            name="circle"
                            size={28}
                            color={isFocused ? activeColor : inactiveColor}
                        />
                    );

                    return (
                        <TouchableOpacity
                            key={route.key}
                            accessibilityRole="button"
                            onPress={onPress}
                            style={styles.tab}>
                            {icon}
                            {isFocused && (
                                <Text style={[styles.label, { color: activeColor }]}>{label}</Text>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

// ==================
// STYLES
// ==================
const styles = StyleSheet.create({
    container: {
        height: 70,
        backgroundColor: "#2196f3",
        justifyContent: "flex-end",
    },
    menuList: {
        height: 63,
        flexDirection: "row",
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "space-between",
    },
    tab: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    label: {
        marginTop: 4,
        fontFamily: "Poppins-Medium",
        fontSize: 12,
    },
});
