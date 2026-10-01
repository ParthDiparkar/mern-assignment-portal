import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../services/api";
import "./CreateAssignment.css";

function CreateAssignment() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    description: "",
    dueDate: "",
    maxMarks: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/assignments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          subject: formData.subject,
          description: formData.description,
          dueDate: formData.dueDate,
          maxMarks: Number(formData.maxMarks),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to create assignment.");
        setLoading(false);
        return;
      }

      setMessage("Assignment created successfully!");

      setFormData({
        title: "",
        subject: "",
        description: "",
        dueDate: "",
        maxMarks: "",
      });
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to server.");
    }

    setLoading(false);
  };

  return (
    <div className="create-assignment-page">

      {/* NAVBAR */}
      <nav className="create-assignment-navbar">

        <div className="create-assignment-brand">
          <div className="create-assignment-brand-icon">
            🎓
          </div>

          <div>
            <h2>Assignment Portal</h2>
            <span>Faculty Panel</span>
          </div>
        </div>

        <button
          className="create-assignment-back-button"
          onClick={() => navigate("/faculty-dashboard")}
        >
          ← Back to Dashboard
        </button>

      </nav>

      {/* MAIN CONTENT */}
      <main className="create-assignment-main">

        <div className="create-assignment-card">

          {/* HEADER */}
          <div className="create-assignment-header">

            <div className="create-assignment-header-icon">
              +
            </div>

            <div>
              <h1>Create Assignment</h1>
              <p>
                Create and publish a new assignment for your students.
              </p>
            </div>

          </div>

          {/* MESSAGE */}
          {message && (
            <div
              className={`create-assignment-message ${
                message.includes("successfully")
                  ? "success"
                  : "error"
              }`}
            >
              {message}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit}>

            <div className="create-assignment-form-group">
              <label htmlFor="title">
                Assignment Title
              </label>

              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Example: Data Mining Assignment 1"
                required
              />
            </div>

            <div className="create-assignment-form-group">
              <label htmlFor="subject">
                Subject
              </label>

              <input
                id="subject"
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Example: Data Mining and Warehousing"
                required
              />
            </div>

            <div className="create-assignment-form-group">
              <label htmlFor="description">
                Assignment Description
              </label>

              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter the assignment questions, instructions, or requirements..."
                rows="6"
                required
              />
            </div>

            <div className="create-assignment-form-row">

              <div className="create-assignment-form-group">
                <label htmlFor="dueDate">
                  Due Date
                </label>

                <input
                  id="dueDate"
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="create-assignment-form-group">
                <label htmlFor="maxMarks">
                  Maximum Marks
                </label>

                <input
                  id="maxMarks"
                  type="number"
                  name="maxMarks"
                  value={formData.maxMarks}
                  onChange={handleChange}
                  placeholder="Example: 20"
                  min="1"
                  required
                />
              </div>

            </div>

            {/* ACTIONS */}
            <div className="create-assignment-actions">

              <button
                type="button"
                className="create-assignment-cancel-button"
                onClick={() => navigate("/faculty-dashboard")}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="create-assignment-submit-button"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Assignment"}
              </button>

            </div>

          </form>

        </div>

      </main>

    </div>
  );
}

export default CreateAssignment;