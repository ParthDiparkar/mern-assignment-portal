import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API_URL from "../services/api";

import "./MySubmissions.css";

function MySubmissions() {
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(
        `${API_URL}/submissions/my`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Unable to load your submissions."
        );

        setLoading(false);
        return;
      }

      setSubmissions(data);
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to server.");
    }

    setLoading(false);
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
      <div className="my-submissions-page">
        <div className="my-submissions-loading">
          Loading your submissions...
        </div>
      </div>
    );
  }

  return (
    <div className="my-submissions-page">

      {/* Navbar */}
      <nav className="my-submissions-navbar">

        <div className="my-submissions-brand">

          <div className="my-submissions-brand-icon">
            🎓
          </div>

          <h2>
            Assignment Portal
          </h2>

        </div>

        <button
          className="my-submissions-back-button"
          onClick={() =>
            navigate("/student-dashboard")
          }
        >
          ← Back to Dashboard
        </button>

      </nav>

      {/* Main */}
      <main className="my-submissions-main">

        {/* Page Header */}
        <div className="my-submissions-heading">

          <div>

            <span className="my-submissions-badge">
              Student Portal
            </span>

            <h1>
              My Submissions
            </h1>

            <p>
              Track your submitted assignments and
              faculty grades.
            </p>

          </div>

          <div className="submission-total">

            <div className="submission-total-icon">
              📚
            </div>

            <div>
              <strong>
                {submissions.length}
              </strong>

              <span>
                Total Submissions
              </span>
            </div>

          </div>

        </div>

        {/* Message */}
        {message && (
          <div className="my-submissions-message">
            {message}
          </div>
        )}

        {/* Empty State */}
        {submissions.length === 0 ? (

          <div className="no-student-submissions">

            <div className="empty-icon">
              📭
            </div>

            <h2>
              No submissions yet
            </h2>

            <p>
              You haven't submitted any assignments
              yet.
            </p>

            <button
              onClick={() =>
                navigate("/student-dashboard")
              }
            >
              Browse Assignments
            </button>

          </div>

        ) : (

          <div className="student-submissions-list">

            {submissions.map((submission) => {

              const assignment =
                submission.assignment;

              const isGraded =
                submission.status === "graded";

              return (
                <section
                  className="student-submission-card"
                  key={submission._id}
                >

                  {/* Submission Header */}
                  <div className="student-submission-header">

                    <div className="student-assignment-icon">
                      📄
                    </div>

                    <div className="student-assignment-title">

                      <span className="subject-label">
                        {assignment?.subject ||
                          "Assignment"}
                      </span>

                      <h2>
                        {assignment?.title ||
                          "Assignment"}
                      </h2>

                    </div>

                    <span
                      className={`student-submission-status ${
                        isGraded
                          ? "graded"
                          : "submitted"
                      }`}
                    >
                      {isGraded
                        ? "✓ Graded"
                        : "Submitted"}
                    </span>

                  </div>

                  {/* Submission Details */}
                  <div className="student-submission-details">

                    <div className="student-detail">

                      <span>
                        Submitted On
                      </span>

                      <strong>
                        {new Date(
                          submission.submittedAt
                        ).toLocaleString()}
                      </strong>

                    </div>

                    <div className="student-detail">

                      <span>
                        File
                      </span>

                      <strong>
                        {submission.fileName}
                      </strong>

                    </div>

                    <div className="student-detail">

                      <span>
                        File Size
                      </span>

                      <strong>
                        {(
                          submission.fileSize /
                          (1024 * 1024)
                        ).toFixed(2)}{" "}
                        MB
                      </strong>

                    </div>

                    <div className="student-detail result-detail">

                      <span>
                        Result
                      </span>

                      <strong>
                        {submission.marks !== null &&
                        submission.marks !== undefined
                          ? `${submission.marks} / ${
                              assignment?.maxMarks || "-"
                            }`
                          : "Not graded"}
                      </strong>

                    </div>

                  </div>

                  {/* Submitted File */}
                  <div className="student-file-section">

                    <div className="student-file-info">

                      <div className="student-file-icon">
                        📄
                      </div>

                      <div>

                        <strong>
                          {submission.fileName}
                        </strong>

                        <span>
                          Your submitted assignment
                        </span>

                      </div>

                    </div>

                    <a
                      href={getFileUrl(
                        submission.filePath
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="student-view-file"
                    >
                      View File →
                    </a>

                  </div>

                  {/* Work Notes */}
                  <div className="student-work-notes">

                    <span>
                      📝 Your Work Notes
                    </span>

                    <p>
                      {submission.workNotes}
                    </p>

                  </div>

                  {/* Grade */}
                  {isGraded && (

                    <div className="student-grade-box">

                      <div className="grade-result">

                        <span>
                          Marks Obtained
                        </span>

                        <strong>
                          {submission.marks}

                          <small>
                            {" "}
                            /{" "}
                            {assignment?.maxMarks}
                          </small>
                        </strong>

                      </div>

                      <div className="grade-remarks">

                        <span>
                          Faculty Remarks
                        </span>

                        <p>
                          {submission.remarks ||
                            "No remarks provided."}
                        </p>

                      </div>

                    </div>

                  )}

                  {/* Pending Grade */}
                  {!isGraded && (

                    <div className="student-pending-box">

                      <span className="pending-icon">
                        ⏳
                      </span>

                      <div>

                        <strong>
                          Awaiting Faculty Review
                        </strong>

                        <p>
                          Your submission has been
                          received and is waiting
                          for grading.
                        </p>

                      </div>

                    </div>

                  )}

                </section>
              );
            })}

          </div>

        )}

      </main>

    </div>
  );
}

export default MySubmissions;