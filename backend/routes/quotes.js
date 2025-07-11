const express = require("express");
const router = express.Router();

const quotes = [
    "You are doing better than you think.",
    "Small steps every day.",
    "Your pace is perfect.",
    "Progress is not always visible but it’s there.",
    "You are not alone in this.",
];

// GET random quote
router.get("/", (req, res) => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    res.json({ quote: quotes[randomIndex] });
});

module.exports = router;
