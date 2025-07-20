const express = require("express");
const router = express.Router();
const Mood = require("../models/Mood");

// ==================================
// MOOD ROUTES
// for logging and retrieving mood entries
// ==================================

// GET all mood entries
router.get("/", async (req, res) => {
    try {
        const moods = await Mood.find().sort({ date: -1 });
        res.json(moods);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new mood entry
router.post("/", async (req, res) => {
    const mood = new Mood({
        mood: req.body.mood,
        note: req.body.note,
    });

    try {
        const newMood = await mood.save();
        res.status(201).json(newMood);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
