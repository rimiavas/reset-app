const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.send("Reset App API is working! 🎉");
});

// MongoDB connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error("❌ MongoDB error:", err));

// Routes
const habitsRouter = require("./routes/habits");
const tasksRouter = require("./routes/tasks");
const moodsRouter = require("./routes/moods");
const quotesRouter = require("./routes/quotes");

app.use("/api/habits", habitsRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/moods", moodsRouter);
app.use("/api/quotes", quotesRouter);

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
