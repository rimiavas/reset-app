export const moods = ["😊", "😐", "😢", "😠", "😌", "😴"];

export const countMoods = (entriesForDay) => {
    const counts = {};
    moods.forEach((mood) => {
        counts[mood] = entriesForDay.filter((e) => e.mood === mood).length;
    });
    return counts;
};
