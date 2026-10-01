import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import API_URL from "../services/api";

import "./AssignmentSubmission.css";

function AssignmentSubmission() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    assignmentFile: null,
    workNotes: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(`${API_URL}/assignments`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Unable to load assignment."
        );
        setLoading(false);
        return;
      }

      const selectedAssignment = data.find(
        (item) => item._id === id
      );

      if (!selectedAssignment) {
        setMessage("Assignment not found.");
        setLoading(false);
        return;
      }

      setAssignment(selectedAssignment);
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to server.");
    }

    setLoading(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setFormData({
        ...formData,
        assignmentFile: null,
      });
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const allowedExtensions = [
      ".pdf",
      ".doc",
      ".docx",
    ];

    const fileName = file.name.toLowerCase();

    const hasValidExtension = allowedExtensions.some(
      (extension) => fileName.endsWith(extension)
    );

    if (
      !allowedTypes.includes(file.type) &&
      !hasValidExtension
    ) {
      setMessage(
        "Only PDF, DOC, and DOCX files are allowed."
      );

      e.target.value = "";

      setFormData({
        ...formData,
        assignmentFile: null,
      });

      return;
    }

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      setMessage(
        "File size must be 10 MB or less."
      );

      e.target.value = "";

      setFormData({
        ...formData,
        assignmentFile: null,
      });

      return;
    }

    setMessage("");

    setFormData({
      ...formData,
      assignmentFile: file,
    });
  };

  const handleNotesChange = (e) => {
    setFormData({
      ...formData,
      workNotes: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    if (!formData.assignmentFile) {
      setMessage(
        "Please select your assignment file."
      );
      return;
    }

    if (!formData.workNotes.trim()) {
      setMessage(
        "Please enter your work notes."
      );
      return;
    }

    setSubmitting(true);

    try {
      const submissionData = new FormData();

      submissionData.append(
        "assignmentId",
        id
      );

      submissionData.append(
        "assignmentFile",
        formData.assignmentFile
      );

      submissionData.append(
        "workNotes",
        formData.workNotes
      );

      const response = await fetch(
        `${API_URL}/submissions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: submissionData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Submission failed."
        );

        setSubmitting(false);
        return;
      }

      setMessage(
        "Assignment submitted successfully!"
      );

      setFormData({
        assignmentFile: null,
        workNotes: "",
      });

      const fileInput =
        document.getElementById(
          "assignmentFile"
        );

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      console.error(error);
      setMessage(
        "Unable to connect to server."
      );
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="submission-page">
        <div className="submission-loading">
          Loading assignment...
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="submission-page">
        <nav className="submission-navbar">
          <div className="submission-brand">
            <div className="submission-brand-icon">
              🎓
            </div>

            <h2>
              Assignment Portal
            </h2>
          </div>

          <button
            className="submission-back-button"
            onClick={() =>
              navigate("/student-dashboard")
            }
          >
            ← Back to Dashboard
          </button>
        </nav>

        <main className="submission-main">
          <div className="submission-message error-message">
            <strong>
              Unable to load assignment
            </strong>

            <p>
              {message ||
                "The assignment could not be loaded."}
            </p>

            <button
              type="button"
              className="submission-back-button"
              onClick={fetchAssignment}
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="submission-page">
      {/* Navbar */}
      <nav className="submission-navbar">
        <div className="submission-brand">
          <div className="submission-brand-icon">
            🎓
          </div>

          <h2>
            Assignment Portal
          </h2>
        </div>

        <button
          className="submission-back-button"
          onClick={() =>
            navigate("/student-dashboard")
          }
        >
          ← Back to Dashboard
        </button>
      </nav>

      {/* Main Content */}
      <main className="submission-main">
        {message && (
          <div
            className={`submission-message ${
              message.includes("successfully")
                ? "success-message"
                : "error-message"
            }`}
          >
            {message}
          </div>
        )}

        <div className="submission-layout">
          {/* Assignment Details */}
          <section className="assignment-details-card">
            <div className="assignment-details-header">
              <span className="assignment-available-badge">
                Available
              </span>

              <h1>
                {assignment.title}
              </h1>

              <p className="assignment-subject">
                {assignment.subject}
              </p>
            </div>

            <div className="assignment-info">
              <div className="assignment-info-item">
                <span className="info-label">
                  Description
                </span>

                <p>
                  {assignment.description}
                </p>
              </div>

              <div className="assignment-info-item">
                <span className="info-label">
                  Due Date
                </span>

                <p>
                  {new Date(
                    assignment.dueDate
                  ).toLocaleDateString()}
                </p>
              </div>

              <div className="assignment-info-item">
                <span className="info-label">
                  Maximum Marks
                </span>

                <p>
                  {assignment.maxMarks}
                </p>
              </div>
            </div>
          </section>

          {/* Submission Form */}
          <section className="submission-form-card">
            <h2>
              Submit Your Work
            </h2>

            <p className="submission-form-subtitle">
              Upload your completed assignment below.
            </p>

            <form onSubmit={handleSubmit}>
              {/* File Upload */}
              <div className="submission-form-group">
                <label htmlFor="assignmentFile">
                  Assignment File
                </label>

                <div className="file-upload-box">
                  <div className="file-upload-icon">
                    📄
                  </div>

                  <div className="file-upload-content">
                    <input
                      id="assignmentFile"
                      type="file"
                      name="assignmentFile"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      required
                    />

                    <p className="file-upload-text">
                      Select your assignment file
                    </p>

                    <small>
                      Supported formats: PDF, DOC, DOCX
                      <br />
                      Maximum file size: 10 MB
                    </small>
                  </div>
                </div>

                {formData.assignmentFile && (
                  <div className="selected-file">
                    <span>
                      📎
                    </span>

                    <div>
                      <strong>
                        {formData.assignmentFile.name}
                      </strong>

                      <small>
                        {(
                          formData.assignmentFile.size /
                          (1024 * 1024)
                        ).toFixed(2)}{" "}
                        MB
                      </small>
                    </div>
                  </div>
                )}
              </div>

              {/* Work Notes */}
              <div className="submission-form-group">
                <label htmlFor="workNotes">
                  Work Notes
                </label>

                <textarea
                  id="workNotes"
                  name="workNotes"
                  value={formData.workNotes}
                  onChange={handleNotesChange}
                  placeholder="Describe the work you completed..."
                  rows="6"
                  required
                />

                <small>
                  Briefly explain what you worked on.
                </small>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="submission-submit-button"
                disabled={submitting}
              >
                {submitting
                  ? "Uploading & Submitting..."
                  : "Submit Assignment"}
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

export default AssignmentSubmission;