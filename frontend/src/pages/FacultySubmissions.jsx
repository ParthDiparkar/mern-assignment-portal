import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import API_URL from "../services/api";

import "./FacultySubmissions.css";

function FacultySubmissions() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [assignment, setAssignment] = useState(null);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [gradingId, setGradingId] = useState(null);

  const [grades, setGrades] = useState({});

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const assignmentResponse = await fetch(
        `${API_URL}/assignments`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const assignmentsData =
        await assignmentResponse.json();

      if (!assignmentResponse.ok) {
        setMessage(
          assignmentsData.message ||
            "Unable to load assignment."
        );
        setLoading(false);
        return;
      }

      const selectedAssignment =
        assignmentsData.find(
          (item) => item._id === id
        );

      if (!selectedAssignment) {
        setMessage("Assignment not found.");
        setLoading(false);
        return;
      }

      setAssignment(selectedAssignment);

      const submissionsResponse = await fetch(
        `${API_URL}/submissions/assignment/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const submissionsData =
        await submissionsResponse.json();

      if (!submissionsResponse.ok) {
        setMessage(
          submissionsData.message ||
            "Unable to load submissions."
        );
        setLoading(false);
        return;
      }

      setSubmissions(submissionsData);

      const initialGrades = {};

      submissionsData.forEach((submission) => {
        initialGrades[submission._id] = {
          marks:
            submission.marks !== null &&
            submission.marks !== undefined
              ? submission.marks
              : "",
          remarks: submission.remarks || "",
        };
      });

      setGrades(initialGrades);
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to server.");
    }

    setLoading(false);
  };

  const handleGradeChange = (
    submissionId,
    field,
    value
  ) => {
    setGrades((previous) => ({
      ...previous,

      [submissionId]: {
        ...previous[submissionId],
        [field]: value,
      },
    }));
  };

  const handleGrade = async (submissionId) => {
    const grade = grades[submissionId];

    if (!grade || grade.marks === "") {
      setMessage("Please enter marks.");
      return;
    }

    const marks = Number(grade.marks);

    if (Number.isNaN(marks)) {
      setMessage("Marks must be a valid number.");
      return;
    }

    if (marks < 0 || marks > assignment.maxMarks) {
      setMessage(
        `Marks must be between 0 and ${assignment.maxMarks}.`
      );
      return;
    }

    setGradingId(submissionId);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/submissions/${submissionId}/grade`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            marks,
            remarks: grade.remarks,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Unable to grade submission."
        );

        setGradingId(null);
        return;
      }

      setMessage("Submission graded successfully.");

      setSubmissions((previous) =>
        previous.map((submission) =>
          submission._id === submissionId
            ? {
                ...submission,
                marks,
                remarks: grade.remarks,
                status: "graded",
              }
            : submission
        )
      );
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to server.");
    }

    setGradingId(null);
  };

  const getFileUrl = (filePath) => {
    if (!filePath) {
      return "#";
    }

    const backendUrl = API_URL.replace("/api", "");

    const fileName = filePath
      .split(/[/\\]/)
      .pop();

    return `${backendUrl}/uploads/${encodeURIComponent(
      fileName
    )}`;
  };

  if (loading) {
    return (
      <div className="faculty-submissions-page">
        <div className="faculty-submissions-loading">
          Loading submissions...
        </div>
      </div>
    );
  }

  return (
    <div className="faculty-submissions-page">

      {/* Navbar */}
      <nav className="faculty-submissions-navbar">

        <div className="faculty-submissions-brand">
          <div className="faculty-submissions-brand-icon">
            🎓
          </div>

          <h2>Assignment Portal</h2>
        </div>

        <button
          className="faculty-back-button"
          onClick={() =>
            navigate("/faculty-dashboard")
          }
        >
          ← Back to Dashboard
        </button>

      </nav>

      {/* Main */}
      <main className="faculty-submissions-main">

        {message && (
          <div className="faculty-submissions-message">
            {message}
          </div>
        )}

        {assignment && (
          <div className="faculty-assignment-header">

            <div>
              <span className="faculty-page-badge">
                Faculty Review
              </span>

              <h1>{assignment.title}</h1>

              <p>
                {assignment.subject}
              </p>
            </div>

            <div className="faculty-assignment-marks">
              <span>Maximum Marks</span>
              <strong>
                {assignment.maxMarks}
              </strong>
            </div>

          </div>
        )}

        <div className="submission-count">
          {submissions.length}{" "}
          {submissions.length === 1
            ? "Submission"
            : "Submissions"}
        </div>

        {submissions.length === 0 ? (
          <div className="no-submissions-card">
            <div className="no-submissions-icon">
              📭
            </div>

            <h2>No submissions yet</h2>

            <p>
              Students have not submitted this
              assignment yet.
            </p>
          </div>
        ) : (
          <div className="faculty-submissions-list">

            {submissions.map((submission) => {

              const grade =
                grades[submission._id] || {
                  marks: "",
                  remarks: "",
                };

              return (
                <section
                  className="faculty-submission-card"
                  key={submission._id}
                >

                  {/* Student Header */}
                  <div className="submission-student-header">

                    <div className="student-avatar">
                      {submission.student?.name
                        ?.charAt(0)
                        ?.toUpperCase() || "S"}
                    </div>

                    <div>
                      <h2>
                        {submission.student?.name ||
                          "Student"}
                      </h2>

                      <p>
                        {submission.student?.email ||
                          "No email available"}
                      </p>
                    </div>

                    <span
                      className={`submission-status ${
                        submission.status === "graded"
                          ? "graded"
                          : "submitted"
                      }`}
                    >
                      {submission.status === "graded"
                        ? "Graded"
                        : "Submitted"}
                    </span>

                  </div>

                  {/* Submission Information */}
                  <div className="submission-details-grid">

                    <div className="submission-detail-item">

                      <span className="detail-label">
                        Submitted File
                      </span>

                      <div className="submission-file">

                        <span className="file-icon">
                          📄
                        </span>

                        <div>
                          <strong>
                            {submission.fileName}
                          </strong>

                          <small>
                            {(
                              submission.fileSize /
                              (1024 * 1024)
                            ).toFixed(2)}{" "}
                            MB
                          </small>
                        </div>

                      </div>

                      <a
                        className="view-file-button"
                        href={getFileUrl(
                          submission.filePath
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View / Download File
                      </a>

                    </div>

                    <div className="submission-detail-item">

                      <span className="detail-label">
                        Submitted On
                      </span>

                      <p>
                        {new Date(
                          submission.submittedAt
                        ).toLocaleString()}
                      </p>

                    </div>

                  </div>

                  {/* Work Notes */}
                  <div className="work-notes-box">

                    <span className="detail-label">
                      Work Notes
                    </span>

                    <p>
                      {submission.workNotes}
                    </p>

                  </div>

                  {/* Grading */}
                  <div className="grading-section">

                    <div className="grading-title">
                      <div>
                        <h3>
                          Grade Submission
                        </h3>

                        <p>
                          Enter marks and feedback
                          for the student.
                        </p>
                      </div>
                    </div>

                    <div className="grading-fields">

                      <div className="marks-field">

                        <label>
                          Marks /{" "}
                          {assignment.maxMarks}
                        </label>

                        <input
                          type="number"
                          min="0"
                          max={assignment.maxMarks}
                          value={grade.marks}
                          onChange={(e) =>
                            handleGradeChange(
                              submission._id,
                              "marks",
                              e.target.value
                            )
                          }
                          placeholder="Enter marks"
                        />

                      </div>

                      <div className="remarks-field">

                        <label>
                          Remarks
                        </label>

                        <input
                          type="text"
                          value={grade.remarks}
                          onChange={(e) =>
                            handleGradeChange(
                              submission._id,
                              "remarks",
                              e.target.value
                            )
                          }
                          placeholder="Enter feedback for student"
                        />

                      </div>

                      <button
                        className="grade-button"
                        onClick={() =>
                          handleGrade(
                            submission._id
                          )
                        }
                        disabled={
                          gradingId ===
                          submission._id
                        }
                      >
                        {gradingId ===
                        submission._id
                          ? "Saving..."
                          : submission.status ===
                            "graded"
                          ? "Update Grade"
                          : "Grade Submission"}
                      </button>

                    </div>

                  </div>

                </section>
              );
            })}

          </div>
        )}

      </main>
    </div>
  );
}

export default FacultySubmissions;