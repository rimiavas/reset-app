export const getLoggedValue = (habit, date = new Date()) => {
    if (!habit || !habit.log) return 0;
    const dateStr = date.toISOString().split("T")[0];
    return habit.log[dateStr] || 0;
};
