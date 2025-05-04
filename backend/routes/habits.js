const express = require("express");
const router = express.Router();
const Habit = require("../models/Habit");

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
    });

    try {
        const newHabit = await habit.save();
        res.status(201).json(newHabit);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
