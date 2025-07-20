import { View, Text, StyleSheet } from "react-native";
import { format, isSameDay } from "date-fns";

// ==================================
// MOOD LIST COMPONENT
// shows mood entries for a selected date or all time
// ==================================

export default function MoodEntriesList({ entries, selectedDate, viewAll }) {
    // ==================
    // MAIN RENDER
    // ==================
    return (
        <View>
            {entries
                .filter((e) => (viewAll ? true : isSameDay(new Date(e.date), selectedDate)))
                .reverse()
                .map((item) => (
                    <View key={item._id} style={styles.entry}>
                        <Text style={styles.entryMood}>{item.mood}</Text>
                        <Text style={styles.entryNote}>{item.note}</Text>
                        <Text style={styles.entryDate}>
                            {format(new Date(item.date), "dd MMM yyyy, HH:mm")}
                        </Text>
                    </View>
                ))}
        </View>
    );
}

const styles = StyleSheet.create({
    entry: {
        backgroundColor: "#FFF",
        padding: 16,
        borderRadius: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "rgba(0, 110, 233, 0.06)",
        shadowColor: "#006EE9",
        shadowOpacity: 0.02,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 20,
    },
    entryMood: {
        fontSize: 22,
        color: "#2196F3",
        fontFamily: "Rufina",
    },
    entryNote: {
        marginTop: 4,
        fontSize: 14,
        color: "#4A4646",
        fontFamily: "Inter",
    },
    entryDate: {
        fontSize: 12,
        color: "#6b7280",
        marginTop: 6,
        fontFamily: "SpaceMono",
    },
});
