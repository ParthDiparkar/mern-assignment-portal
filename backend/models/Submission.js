const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
    {
        assignment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Assignment",
            required: true
        },

        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // Uploaded assignment file
        fileName: {
            type: String,
            required: true,
            trim: true
        },

        filePath: {
            type: String,
            required: true,
            trim: true
        },

        fileType: {
            type: String,
            required: true,
            trim: true
        },

        fileSize: {
            type: Number,
            required: true
        },

        workNotes: {
            type: String,
            required: true,
            trim: true
        },

        submittedAt: {
            type: Date,
            default: Date.now
        },

        marks: {
            type: Number,
            default: null,
            min: 0
        },

        remarks: {
            type: String,
            default: "",
            trim: true
        },

        status: {
            type: String,
            enum: ["submitted", "graded"],
            default: "submitted"
        }
    },

    {
        timestamps: true
    }
);

// One student can submit only once for one assignment
submissionSchema.index(
    { assignment: 1, student: 1 },
    { unique: true }
);

module.exports = mongoose.model("Submission", submissionSchema);