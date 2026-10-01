import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API_URL, { logoutUser } from "../services/api";

import "./FacultyDashboard.css";

function FacultyDashboard() {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [submissionCounts, setSubmissionCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
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
        setMessage(data.message || "Unable to load assignments.");
        setLoading(false);
        return;
      }

      setAssignments(data);

      // Store submission progress for every assignment
      const counts = {};

      await Promise.all(
        data.map(async (assignment) => {
          try {
            const submissionResponse = await fetch(
              `${API_URL}/submissions/assignment/${assignment._id}`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const submissionData =
              await submissionResponse.json();

            if (submissionResponse.ok) {
              const total = submissionData.length;

              const graded = submissionData.filter(
                (submission) =>
                  submission.status === "graded"
              ).length;

              const pending = total - graded;

              counts[assignment._id] = {
                total,
                graded,
                pending,
              };
            } else {
              counts[assignment._id] = {
                total: 0,
                graded: 0,
                pending: 0,
              };
            }
          } catch (error) {
            console.error(
              `Failed to fetch submissions for ${assignment.title}`,
              error
            );

            counts[assignment._id] = {
              total: 0,
              graded: 0,
              pending: 0,
            };
          }
        })
      );

      setSubmissionCounts(counts);
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to server.");
    }

    setLoading(false);
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  // Determine assignment status
  const getAssignmentStatus = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);

    if (now > due) {
      return {
        label: "Deadline Passed",
        className: "faculty-status-expired",
      };
    }

    const difference = due - now;

    const hoursRemaining =
      difference / (1000 * 60 * 60);

    if (hoursRemaining <= 48) {
      return {
        label: "Due Soon",
        className: "faculty-status-soon",
      };
    }

    return {
      label: "Active",
      className: "faculty-status-active",
    };
  };

  return (
    <div className="faculty-dashboard">

      {/* Navbar */}
      <nav className="faculty-navbar">

        <div className="faculty-brand">

          <div className="faculty-brand-icon">
            🎓
          </div>

          <h2>
            Assignment Portal
          </h2>

        </div>

        <div className="faculty-nav-right">

          <div className="faculty-user-info">

            <span className="faculty-user-name">
              {user?.name}
            </span>

            <span className="faculty-user-role">
              Faculty
            </span>

          </div>

          <button
            className="faculty-logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </nav>

      {/* Main Content */}
      <main className="faculty-main">

        {/* Welcome */}
        <section className="faculty-welcome">

          <div>

            <h1>
              Welcome back, {user?.name} 👋
            </h1>

            <p>
              Manage assignments and review student submissions.
            </p>

          </div>

          <button
            className="faculty-create-button"
            onClick={() =>
              navigate("/create-assignment")
            }
          >
            + Create Assignment
          </button>

        </section>

        {/* Statistics */}
        <section className="faculty-stats">

          <div className="faculty-stat-card">

            <div className="faculty-stat-icon">
              📚
            </div>

            <div>

              <h3>
                Total Assignments
              </h3>

              <strong>
                {assignments.length}
              </strong>

            </div>

          </div>

          <div className="faculty-stat-card">

            <div className="faculty-stat-icon">
              👨‍🎓
            </div>

            <div>

              <h3>
                Account Type
              </h3>

              <strong>
                Faculty
              </strong>

            </div>

          </div>

          <div className="faculty-stat-card">

            <div className="faculty-stat-icon">
              ✓
            </div>

            <div>

              <h3>
                Portal Status
              </h3>

              <strong>
                Active
              </strong>

            </div>

          </div>

        </section>

        {/* Assignments */}
        <section>

          <div className="faculty-section-header">

            <div>

              <h2>
                Your Assignments
              </h2>

              <p>
                Assignments available in the portal
              </p>

            </div>

          </div>

          {loading && (
            <div className="faculty-loading">
              Loading assignments...
            </div>
          )}

          {message && (
            <div className="faculty-message">
              {message}
            </div>
          )}

          {!loading &&
            !message &&
            assignments.length === 0 && (

              <div className="faculty-empty">

                <div className="faculty-empty-icon">
                  📚
                </div>

                <h3>
                  No assignments yet
                </h3>

                <p>
                  Create your first assignment to get started.
                </p>

                <button
                  className="faculty-empty-button"
                  onClick={() =>
                    navigate("/create-assignment")
                  }
                >
                  Create Assignment
                </button>

              </div>

            )}

          {!loading &&
            !message &&
            assignments.length > 0 && (

              <div className="faculty-assignment-grid">

                {assignments.map((assignment) => {

                  const status =
                    getAssignmentStatus(
                      assignment.dueDate
                    );

                  const progress =
                    submissionCounts[
                      assignment._id
                    ] || {
                      total: 0,
                      graded: 0,
                      pending: 0,
                    };

                  return (
                    <div
                      className="faculty-assignment-card"
                      key={assignment._id}
                    >

                      <div className="faculty-assignment-header">

                        <h3>
                          {assignment.title}
                        </h3>

                        <span
                          className={`faculty-status-badge ${status.className}`}
                        >
                          {status.label}
                        </span>

                      </div>

                      <p className="faculty-subject">
                        {assignment.subject}
                      </p>

                      <p className="faculty-description">
                        {assignment.description}
                      </p>

                      <div className="faculty-due-date">

                        <span>
                          Due Date
                        </span>

                        <strong>
                          {new Date(
                            assignment.dueDate
                          ).toLocaleDateString()}
                        </strong>

                      </div>

                      {/* Submission Progress */}
                      <div className="faculty-submission-progress">

                        <div className="progress-item">

                          <span className="progress-icon">
                            📄
                          </span>

                          <div>

                            <strong>
                              {progress.total}
                            </strong>

                            <span>
                              {progress.total === 1
                                ? "Student Submitted"
                                : "Students Submitted"}
                            </span>

                          </div>

                        </div>

                        <div className="progress-item">

                          <span className="progress-icon">
                            ✓
                          </span>

                          <div>

                            <strong>
                              {progress.graded}
                            </strong>

                            <span>
                              Graded
                            </span>

                          </div>

                        </div>

                        <div className="progress-item">

                          <span className="progress-icon">
                            ⏳
                          </span>

                          <div>

                            <strong>
                              {progress.pending}
                            </strong>

                            <span>
                              Pending Review
                            </span>

                          </div>

                        </div>

                      </div>

                      <button
                        className="faculty-submissions-button"
                        onClick={() =>
                          navigate(
                            `/assignments/${assignment._id}/submissions`
                          )
                        }
                      >
                        View Submissions →
                      </button>

                    </div>
                  );
                })}

              </div>

            )}

        </section>

      </main>

    </div>
  );
}

export default FacultyDashboard;