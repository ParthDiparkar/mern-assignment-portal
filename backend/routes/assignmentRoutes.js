const express = require("express");

const Assignment = require("../models/Assignment");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ========================================
// GET ALL ASSIGNMENTS
// ========================================

router.get("/", authMiddleware, async (req, res) => {
    try {
        const assignments = await Assignment.find()
            .populate("createdBy", "name email")
            .sort({ dueDate: 1 });

        res.json(assignments);
    } catch (error) {
        console.error("Get assignments error:", error);

        res.status(500).json({
            message: "Server error while fetching assignments"
        });
    }
});

// ========================================
// CREATE ASSIGNMENT
// FACULTY ONLY
// ========================================

router.post("/", authMiddleware, async (req, res) => {
    try {

        // Check faculty role
        if (req.user.role !== "faculty") {
            return res.status(403).json({
                message: "Only faculty can create assignments"
            });
        }

        const {
            title,
            subject,
            description,
            dueDate,
            maxMarks
        } = req.body;

        // Check required fields
        if (
            !title ||
            !subject ||
            !description ||
            !dueDate ||
            !maxMarks
        ) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Create assignment
        const assignment = await Assignment.create({
            title,
            subject,
            description,
            dueDate,
            maxMarks,
            createdBy: req.user.userId
        });

        res.status(201).json({
            message: "Assignment created successfully",
            assignment
        });

    } catch (error) {

        console.error("Create assignment error:", error);

        res.status(500).json({
            message: "Server error while creating assignment"
        });
    }
});

// ========================================
// GET SINGLE ASSIGNMENT
// ========================================

router.get("/:id", authMiddleware, async (req, res) => {
    try {

        const assignment = await Assignment.findById(req.params.id)
            .populate("createdBy", "name email");

        if (!assignment) {
            return res.status(404).json({
                message: "Assignment not found"
            });
        }

        res.json(assignment);

    } catch (error) {

        console.error("Get assignment error:", error);

        res.status(500).json({
            message: "Server error while fetching assignment"
        });
    }
});

module.exports = router;