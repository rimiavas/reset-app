const mongoose = require("mongoose");

// ==================================
// HABIT MODEL
// defines the structure for habits in the database
// ==================================
const habitSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        type: { type: String },
        target: { type: Number },
        unit: { type: String },
        lastCompleted: { type: Date },
        log: {
            type: Map,
            of: Number,
            default: {},
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Habit", habitSchema);
