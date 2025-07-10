const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        completed: { type: Boolean, default: false },

        type: { type: String },
        target: { type: Number },
        unit: { type: String },
        lastCompleted: { type: Date },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Habit", habitSchema);
