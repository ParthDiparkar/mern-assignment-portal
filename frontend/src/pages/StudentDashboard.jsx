import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API_URL, {
  logoutUser,
} from "../services/api";

import "./StudentDashboard.css";

function StudentDashboard() {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userData = localStorage.getItem("user");

  let user = null;

  try {
    user = userData ? JSON.parse(userData) : null;
  } catch (error) {
    user = null;
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // Fetch assignments
      const assignmentsResponse = await fetch(
        `${API_URL}/assignments`,
        {
          headers,
        }
      );

      const assignmentsData =
        await assignmentsResponse.json();

      if (!assignmentsResponse.ok) {
        throw new Error(
          assignmentsData.message ||
            "Failed to fetch assignments"
        );
      }

      // Fetch student's submissions
      const submissionsResponse = await fetch(
        `${API_URL}/submissions/my`,
        {
          headers,
        }
      );

      const submissionsData =
        await submissionsResponse.json();

      if (!submissionsResponse.ok) {
        throw new Error(
          submissionsData.message ||
            "Failed to fetch submissions"
        );
      }

      setAssignments(assignmentsData);
      setSubmissions(submissionsData);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };


  /* =========================================
     Logout
  ========================================= */

  const handleLogout = () => {
    logoutUser();

    navigate("/login");
  };


  /* =========================================
     Check Whether Assignment Was Submitted
  ========================================= */

  const isSubmitted = (assignmentId) => {
    return submissions.some(
      (submission) =>
        submission.assignment?._id === assignmentId ||
        submission.assignment === assignmentId
    );
  };


  /* =========================================
     Get Assignment Status
  ========================================= */

  const getAssignmentStatus = (assignment) => {

    // Submitted comes first
    if (isSubmitted(assignment._id)) {
      return {
        label: "Submitted",
        className: "status-submitted",
      };
    }

    const now = new Date();

    const dueDate = new Date(
      assignment.dueDate
    );

    // Deadline passed
    if (now > dueDate) {
      return {
        label: "Deadline Passed",
        className: "status-expired",
      };
    }

    // Calculate remaining time
    const difference =
      dueDate - now;

    const hoursRemaining =
      difference /
      (1000 * 60 * 60);

    // Due within 48 hours
    if (hoursRemaining <= 48) {
      return {
        label: "Due Soon",
        className: "status-soon",
      };
    }

    // Normal open assignment
    return {
      label: "Open",
      className: "status-open",
    };
  };


  /* =========================================
     Format Date
  ========================================= */

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };


  /* =========================================
     Statistics
  ========================================= */

  const submittedCount =
    assignments.filter((assignment) =>
      isSubmitted(assignment._id)
    ).length;

  const dueSoonCount =
    assignments.filter((assignment) => {

      if (isSubmitted(assignment._id)) {
        return false;
      }

      const now = new Date();

      const dueDate =
        new Date(assignment.dueDate);

      const difference =
        dueDate - now;

      const hoursRemaining =
        difference /
        (1000 * 60 * 60);

      return (
        hoursRemaining > 0 &&
        hoursRemaining <= 48
      );

    }).length;


  return (
    <div className="student-dashboard">

      {/* =========================================
          Navbar
      ========================================= */}

      <nav className="student-navbar">

        <div className="student-brand">

          <span className="brand-icon">
            🎓
          </span>

          <div>

            <h2>
              Assignment Portal
            </h2>

            <p>
              Student Portal
            </p>

          </div>

        </div>


        <div className="student-nav-right">

          <div className="student-user">

            <div className="student-avatar">
              {user?.name
                ?.charAt(0)
                ?.toUpperCase() || "S"}
            </div>

            <div>

              <strong>
                {user?.name || "Student"}
              </strong>

              <span>
                Student
              </span>

            </div>

          </div>


          <button
            className="student-submissions-button"
            onClick={() =>
              navigate("/my-submissions")
            }
          >
            📄 My Submissions
          </button>


          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </nav>


      {/* =========================================
          Main
      ========================================= */}

      <main className="student-main">


        {/* Welcome */}
        <section className="welcome-section">

          <div>

            <p className="welcome-small">
              Student Dashboard
            </p>

            <h1>
              Welcome back,{" "}
              {user?.name || "Student"} 👋
            </h1>

            <p>
              View your assignments, submit your
              work, and track your academic progress.
            </p>

          </div>

        </section>


        {/* =========================================
            Statistics
        ========================================= */}

        <section className="student-stats">

          {/* Total */}
          <div className="stat-card">

            <div className="stat-icon">
              📚
            </div>

            <div>

              <span>
                Total Assignments
              </span>

              <strong>
                {assignments.length}
              </strong>

            </div>

          </div>


          {/* Due Soon */}
          <div className="stat-card">

            <div className="stat-icon">
              ⏰
            </div>

            <div>

              <span>
                Due Soon
              </span>

              <strong>
                {dueSoonCount}
              </strong>

            </div>

          </div>


          {/* Submitted */}
          <div className="stat-card">

            <div className="stat-icon">
              📄
            </div>

            <div>

              <span>
                Submitted
              </span>

              <strong>
                {submittedCount}
              </strong>

            </div>

          </div>

        </section>


        {/* =========================================
            Assignment Section
        ========================================= */}

        <section className="assignments-section">

          <div className="section-heading">

            <div>

              <p className="section-label">
                Academic Work
              </p>

              <h2>
                Available Assignments
              </h2>

              <p>
                Select an assignment to view details
                and submit your work.
              </p>

            </div>

          </div>


          {/* Loading */}
          {loading && (

            <div className="dashboard-message">

              <div className="loading-spinner"></div>

              <p>
                Loading assignments...
              </p>

            </div>

          )}


          {/* Error */}
          {error && (

            <div className="dashboard-message error-message">

              <strong>
                Unable to load dashboard
              </strong>

              <p>
                {error}
              </p>

              <button
                onClick={fetchDashboardData}
                className="retry-button"
              >
                Try Again
              </button>

            </div>

          )}


          {/* Empty */}
          {!loading &&
            !error &&
            assignments.length === 0 && (

              <div className="dashboard-message empty-message">

                <div className="empty-icon">
                  📭
                </div>

                <h3>
                  No assignments available
                </h3>

                <p>
                  Your faculty has not created any
                  assignments yet.
                </p>

              </div>

            )}


          {/* Assignment Cards */}
          {!loading &&
            !error &&
            assignments.length > 0 && (

              <div className="assignment-grid">

                {assignments.map(
                  (assignment) => {

                    const status =
                      getAssignmentStatus(
                        assignment
                      );

                    const submitted =
                      isSubmitted(
                        assignment._id
                      );

                    return (

                      <div
                        className="assignment-card"
                        key={assignment._id}
                      >

                        {/* Header */}
                        <div className="assignment-card-header">

                          <span className="subject-badge">
                            {assignment.subject}
                          </span>

                          <span
                            className={`assignment-status ${status.className}`}
                          >
                            {status.label}
                          </span>

                        </div>


                        {/* Title */}
                        <h3>
                          {assignment.title}
                        </h3>


                        {/* Description */}
                        <p className="assignment-description">
                          {assignment.description}
                        </p>


                        {/* Information */}
                        <div className="assignment-info">

                          <div className="assignment-info-item">

                            <span>
                              📅
                            </span>

                            <div>

                              <small>
                                Due Date
                              </small>

                              <strong>
                                {formatDate(
                                  assignment.dueDate
                                )}
                              </strong>

                            </div>

                          </div>


                          <div className="assignment-info-item">

                            <span>
                              🏆
                            </span>

                            <div>

                              <small>
                                Maximum Marks
                              </small>

                              <strong>
                                {assignment.maxMarks}
                              </strong>

                            </div>

                          </div>

                        </div>


                        {/* Footer */}
                        <div className="assignment-card-footer">

                          {status.className ===
                            "status-expired" &&
                            !submitted ? (

                            <button
                              className="view-assignment-button disabled-button"
                              disabled
                            >
                              Deadline Passed
                            </button>

                          ) : submitted ? (

                            <button
                              className="view-assignment-button submitted-button"
                              onClick={() =>
                                navigate(
                                  "/my-submissions"
                                )
                              }
                            >
                              View Submission →
                            </button>

                          ) : (

                            <button
                              className="view-assignment-button"
                              onClick={() =>
                                navigate(
                                  `/assignments/${assignment._id}`
                                )
                              }
                            >
                              View & Submit →
                            </button>

                          )}

                        </div>

                      </div>

                    );

                  }
                )}

              </div>

            )}

        </section>

      </main>

    </div>
  );
}

export default StudentDashboard;