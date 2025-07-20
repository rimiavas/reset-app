const express = require("express");
const router = express.Router();

// ==================================
// QUOTE ROUTES
// provides random motivational quotes
// ==================================

const quotes = [
    "You are doing better than you think.",
    "Small steps every day.",
    "Just like a phone needs a reboot, so too does your mind deserve a fresh start.",
    "You are not alone in this.",
    "Every day is a new chance to improve.",
    "Your effort is what counts.",
    "In the journey of self-discovery, every reset is a step towards clarity.",
    "Resetting is not failing, it’s learning.",
    "Your past does not define your future.",
    "Embrace the process, not just the outcome.",
    "You are stronger than your challenges.",
    "Every setback is a setup for a comeback.",
    "Believe in the power of starting over.",
    "Your journey is unique, and so is your progress.",
    "Resetting your mind is the first step to resetting your life.",
    "You have the power to change your story.",
    "Resetting is a sign of strength, not weakness.",
    "Every reset is a new beginning.",
    "You are capable of more than you know.",
    "Your mindset is your most powerful tool.",
    "Resetting allows you to refocus on what truly matters.",
    "You are not defined by your mistakes, but by how you rise from them.",
    "Resetting is a chance to realign with your goals.",
    "Your potential is limitless.",
    "Every reset is an opportunity to grow.",
    "You are worthy of a fresh start.",
    "Resetting your mind can lead to breakthroughs.",
    "You have the strength to overcome any obstacle.",
    "Resetting is a journey, not a destination.",
    "Your mindset shapes your reality.",
];

// GET random quote
router.get("/", (req, res) => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    res.json({ quote: quotes[randomIndex] });
});

module.exports = router;
