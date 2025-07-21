const mongoose = require("mongoose");

// ==================================
// TASK MODEL
// defines the structure for tasks in the database
// ==================================
const taskSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        dueDate: { type: Date },
        completed: { type: Boolean, default: false },
        reminder: { type: Date },
        tags: [{ type: String }],
        priority: {
            type: String,
            enum: ["Low", "Medium", "High"],
            default: "Medium",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
