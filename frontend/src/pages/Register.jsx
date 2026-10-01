import { useState } from "react";
import { useNavigate } from "react-router-dom";

import API_URL from "../services/api";

import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
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
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Registration failed");
        setLoading(false);
        return;
      }

      setMessage("Registration successful! Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to server.");
    }

    setLoading(false);
  };

  return (
    <div className="register-page">
      <div className="register-brand-section">
        <div className="register-brand-content">
          <div className="register-brand-icon">🎓</div>

          <span className="register-brand-label">
            GET STARTED TODAY
          </span>

          <h1>Join Assignment Portal</h1>

          <p>
            Create your account and manage your academic
            assignments, submissions and results in one place.
          </p>

          <div className="register-benefits">
            <div className="register-benefit">
              <span>✓</span>
              <span>Easy assignment management</span>
            </div>

            <div className="register-benefit">
              <span>✓</span>
              <span>Online project submission</span>
            </div>

            <div className="register-benefit">
              <span>✓</span>
              <span>Track grades and remarks</span>
            </div>
          </div>
        </div>
      </div>

      <div className="register-form-section">
        <div className="register-card">
          <div className="register-card-top">
            <span className="register-welcome">
              CREATE ACCOUNT
            </span>

            <div className="register-mini-icon">✨</div>
          </div>

          <h2>Get started</h2>

          <p className="register-subtitle">
            Fill in your details to create your Assignment Portal account.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="register-form-group">
              <label htmlFor="register-name">Full Name</label>

              <input
                id="register-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
                required
              />
            </div>

            <div className="register-form-group">
              <label htmlFor="register-email">Email Address</label>

              <input
                id="register-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                autoComplete="email"
                required
              />
            </div>

            <div className="register-form-group">
              <label htmlFor="register-password">Password</label>

              <input
                id="register-password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                autoComplete="new-password"
                required
              />
            </div>

            <div className="register-form-group">
              <label htmlFor="register-role">Account Type</label>

              <select
                id="register-role"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
              </select>

              <p className="role-description">
                Select Student if you submit assignments or Faculty
                if you create and grade assignments.
              </p>
            </div>

            <button
              type="submit"
              className="register-submit-button"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account →"}
            </button>
          </form>

          {message && (
            <div className="register-message">
              {message}
            </div>
          )}

          <div className="register-divider">
            <span>Already registered?</span>
          </div>

          <div className="register-login-text">
            Already have an account?

            <button
              type="button"
              className="register-login-button"
              onClick={() => navigate("/login")}
            >
              Sign in
            </button>
          </div>

          <div className="register-footer">
            Assignment Portal • Secure academic workflow
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;