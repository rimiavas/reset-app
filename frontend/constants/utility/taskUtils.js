import taskCardStyles from "../StyleSheet/taskCardStyles";

// Sort tasks by due date or priority
export const sortTasks = (data, sortMode = "dueDate") => {
    if (!Array.isArray(data)) return data || [];
    if (sortMode === "dueDate") {
        return [...data].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    }
    if (sortMode === "priority") {
        const order = { High: 0, Medium: 1, Low: 2 };
        return [...data].sort(
            (a, b) => order[a.priority || "Medium"] - order[b.priority || "Medium"]
        );
    }
    return data;
};

// Helper function to get the appropriate style object based on priority level
export const getPriorityStyle = (priority) => {
    switch (priority) {
        case "High":
            return taskCardStyles.highPriority;
        case "Medium":
            return taskCardStyles.mediumPriority;
        case "Low":
            return taskCardStyles.lowPriority;
        default:
            return taskCardStyles.lowPriority;
    }
};
