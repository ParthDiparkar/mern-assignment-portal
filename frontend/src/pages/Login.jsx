import { useState } from "react";
import { useNavigate } from "react-router-dom";

import API_URL from "../services/api";

import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (message) {
      setMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "student") {
        navigate("/student-dashboard");
      } else if (data.user.role === "faculty") {
        navigate("/faculty-dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to server.");
    }

    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-brand-section">
        <div className="brand-content">
          <div className="brand-icon">🎓</div>

          <span className="brand-label">ACADEMIC MANAGEMENT</span>

          <h1>Assignment Portal</h1>

          <p>
            A simple and efficient platform for managing
            assignments, submissions, grades and academic work.
          </p>

          <div className="brand-features">
            <div className="brand-feature">
              <span>✓</span>
              <span>Manage assignments easily</span>
            </div>

            <div className="brand-feature">
              <span>✓</span>
              <span>Submit projects and work online</span>
            </div>

            <div className="brand-feature">
              <span>✓</span>
              <span>Track marks and faculty remarks</span>
            </div>
          </div>
        </div>
      </div>

      <div className="login-form-section">
        <div className="login-card">
          <div className="login-card-top">
            <span className="login-welcome">WELCOME BACK</span>
            <div className="login-mini-icon">🔐</div>
          </div>

          <h2>Sign in to your account</h2>

          <p className="login-subtitle">
            Enter your details to continue to the Assignment Portal.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="login-form-group">
              <label htmlFor="login-email">Email Address</label>

              <input
                id="login-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                autoComplete="email"
                required
              />
            </div>

            <div className="login-form-group">
              <label htmlFor="login-password">Password</label>

              <input
                id="login-password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              className="login-submit-button"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          {message && (
            <div className="login-message">
              {message}
            </div>
          )}

          <div className="login-divider">
            <span>New to the portal?</span>
          </div>

          <div className="login-register-text">
            Don't have an account?

            <button
              type="button"
              className="login-register-button"
              onClick={() => navigate("/register")}
            >
              Create an account
            </button>
          </div>

          <div className="login-footer">
            Assignment Portal • Student & Faculty Management
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;