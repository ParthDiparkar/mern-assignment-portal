const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const submissionRoutes = require("./routes/submissionRoutes");

const app = express();

// ==========================
// MIDDLEWARE
// ==========================
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==========================
// AUTHENTICATION ROUTES
// ==========================
app.use("/api/auth", authRoutes);

// ==========================
// ASSIGNMENT ROUTES
// ==========================
app.use("/api/assignments", assignmentRoutes);

// ==========================
// SUBMISSION ROUTES
// ==========================
app.use("/api/submissions", submissionRoutes);

// ==========================
// TEST ROUTE
// ==========================
app.get("/", (req, res) => {
    res.send("Assignment Portal API is running!");
});

// ==========================
// SERVER PORT
// ==========================
const PORT = process.env.PORT || 5000;

// ==========================
// MONGODB CONNECTION
// ==========================
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error.message);
    });