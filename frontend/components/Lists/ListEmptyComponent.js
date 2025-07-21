import React from "react";
import { useRouter } from "expo-router";
import EmptyState from "../EmptyState";

// ==================================
// LIST EMPTY COMPONENT
// This component displays an empty state for lists
// It is used for both tasks and habits
// ==================================
export default function ListEmptyComponent({ type = "task" }) {
    const router = useRouter();
    return (
        <EmptyState
            label={type === "habit" ? "Habit" : "Task"}
            onPress={() =>
                router.push({
                    pathname: "/create-entry",
                    params: { mode: "create", type },
                })
            }
        />
    );
}
