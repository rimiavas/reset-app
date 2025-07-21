import React from "react";
import { useRouter } from "expo-router";
import EmptyState from "../EmptyState";

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
