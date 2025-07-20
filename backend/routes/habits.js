const express = require("express");
const router = express.Router();
const Habit = require("../models/Habit");

// ==================================
// HABIT ROUTES
// for creating, updating and logging habits
// ==================================

// GET all habits
router.get("/", async (req, res) => {
    try {
        const habits = await Habit.find();
        res.json(habits);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new habit
router.post("/", async (req, res) => {
    const habit = new Habit({
        title: req.body.title,
        type: req.body.type,
        target: req.body.target,
        unit: req.body.unit,
    });

    try {
        const newHabit = await habit.save();
        res.status(201).json(newHabit);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PATCH to log progress
router.patch("/log/:id", async (req, res) => {
    const { id } = req.params;
    const { amount } = req.body;
    const today = new Date().toISOString().split("T")[0];

    try {
        const habit = await Habit.findById(id);
        if (!habit) return res.status(404).json({ message: "Habit not found" });

        const current = habit.log.get(today) || 0;
        habit.log.set(today, current + amount);
        await habit.save();

        res.json(habit);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PATCH update habit
router.patch("/:id", async (req, res) => {
    try {
        const updatedHabit = await Habit.findByIdAndUpdate(
            req.params.id,
            {
                title: req.body.title,
                type: req.body.type,
                target: req.body.target,
                unit: req.body.unit,
            },
            { new: true }
        );
        res.json(updatedHabit);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await Habit.findByIdAndDelete(id);
        res.status(200).json({ message: "Habit deleted" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete habit" });
    }
});

module.exports = router;
