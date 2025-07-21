const mongoose = require("mongoose");

// ==================================
// MOOD MODEL
// defines the structure for moods in the database
// ==================================
const moodSchema = new mongoose.Schema({
    mood: {
        type: String,
        required: true,
    },
    note: {
        type: String,
        required: false,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Mood", moodSchema);
