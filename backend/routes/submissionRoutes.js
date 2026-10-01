const express = require("express");
const multer = require("multer");
const path = require("path");

const Submission = require("../models/Submission");
const Assignment = require("../models/Assignment");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ========================================
// MULTER FILE UPLOAD CONFIGURATION
// ========================================

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },

    filename: function (req, file, cb) {
        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1E9) +
            path.extname(file.originalname);

        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,

    limits: {
        fileSize: 10 * 1024 * 1024
    },

    fileFilter: function (req, file, cb) {

        const allowedTypes = [
            ".pdf",
            ".doc",
            ".docx"
        ];

        const extension = path.extname(file.originalname).toLowerCase();

        if (allowedTypes.includes(extension)) {
            cb(null, true);
        } else {
            cb(
                new Error("Only PDF, DOC and DOCX files are allowed")
            );
        }
    }
});

// ========================================
// STUDENT SUBMITS ASSIGNMENT
// ========================================

router.post(
    "/",
    authMiddleware,
    upload.single("assignmentFile"),
    async (req, res) => {

        try {

            // Only students can submit
            if (req.user.role !== "student") {
                return res.status(403).json({
                    message: "Only students can submit assignments"
                });
            }

            const {
                assignmentId,
                workNotes
            } = req.body;

            // Check required fields
            if (!assignmentId || !workNotes || !req.file) {
                return res.status(400).json({
                    message: "Assignment, assignment file and work notes are required"
                });
            }

            // Find assignment
            const assignment = await Assignment.findById(assignmentId);

            if (!assignment) {
                return res.status(404).json({
                    message: "Assignment not found"
                });
            }

            // Check deadline
            const currentDate = new Date();

            if (currentDate > assignment.dueDate) {
                return res.status(400).json({
                    message: "Submission deadline has passed"
                });
            }

            // Check if already submitted
            const existingSubmission = await Submission.findOne({
                assignment: assignmentId,
                student: req.user.userId
            });

            if (existingSubmission) {
                return res.status(400).json({
                    message: "You have already submitted this assignment"
                });
            }

            // Create submission
            const submission = await Submission.create({

                assignment: assignmentId,

                student: req.user.userId,

                fileName: req.file.originalname,

                filePath: req.file.path,

                fileType: req.file.mimetype,

                fileSize: req.file.size,

                workNotes: workNotes
            });

            res.status(201).json({
                message: "Assignment submitted successfully",
                submission
            });

        } catch (error) {

            console.error("Submission error:", error);

            res.status(500).json({
                message: error.message ||
                    "Server error while submitting assignment"
            });
        }
    }
);

// ========================================
// STUDENT VIEW OWN SUBMISSIONS
// ========================================

router.get("/my", authMiddleware, async (req, res) => {

    try {

        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Only students can view their submissions"
            });
        }

        const submissions = await Submission.find({
            student: req.user.userId
        })
            .populate("assignment")
            .sort({ submittedAt: -1 });

        res.json(submissions);

    } catch (error) {

        console.error("Get submissions error:", error);

        res.status(500).json({
            message: "Server error while fetching submissions"
        });
    }
});

// ========================================
// FACULTY VIEW ASSIGNMENT SUBMISSIONS
// ========================================

router.get(
    "/assignment/:assignmentId",
    authMiddleware,
    async (req, res) => {

        try {

            if (req.user.role !== "faculty") {
                return res.status(403).json({
                    message: "Only faculty can view submissions"
                });
            }

            const assignment = await Assignment.findById(
                req.params.assignmentId
            );

            if (!assignment) {
                return res.status(404).json({
                    message: "Assignment not found"
                });
            }

            if (
                assignment.createdBy.toString() !==
                req.user.userId
            ) {
                return res.status(403).json({
                    message:
                        "You can only view submissions for your assignments"
                });
            }

            const submissions = await Submission.find({
                assignment: req.params.assignmentId
            })
                .populate("student", "name email")
                .sort({ submittedAt: -1 });

            res.json(submissions);

        } catch (error) {

            console.error("Faculty submissions error:", error);

            res.status(500).json({
                message:
                    "Server error while fetching submissions"
            });
        }
    }
);

// ========================================
// FACULTY GRADE SUBMISSION
// ========================================

router.put(
    "/:id/grade",
    authMiddleware,
    async (req, res) => {

        try {

            if (req.user.role !== "faculty") {
                return res.status(403).json({
                    message: "Only faculty can grade submissions"
                });
            }

            const { marks, remarks } = req.body;

            if (marks === undefined || marks === null) {
                return res.status(400).json({
                    message: "Marks are required"
                });
            }

            const submission = await Submission.findById(
                req.params.id
            ).populate("assignment");

            if (!submission) {
                return res.status(404).json({
                    message: "Submission not found"
                });
            }

            if (
                submission.assignment.createdBy.toString() !==
                req.user.userId
            ) {
                return res.status(403).json({
                    message:
                        "You can only grade submissions for your assignments"
                });
            }

            if (
                marks < 0 ||
                marks > submission.assignment.maxMarks
            ) {
                return res.status(400).json({
                    message:
                        `Marks must be between 0 and ${submission.assignment.maxMarks}`
                });
            }

            submission.marks = marks;

            submission.remarks = remarks || "";

            submission.status = "graded";

            await submission.save();

            res.json({
                message: "Submission graded successfully",
                submission
            });

        } catch (error) {

            console.error("Grade submission error:", error);

            res.status(500).json({
                message:
                    "Server error while grading submission"
            });
        }
    }
);

module.exports = router;