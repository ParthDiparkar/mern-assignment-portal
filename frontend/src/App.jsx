import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import AssignmentSubmission from "./pages/AssignmentSubmission";
import FacultyDashboard from "./pages/FacultyDashboard";
import CreateAssignment from "./pages/CreateAssignment";
import FacultySubmissions from "./pages/FacultySubmissions";
import MySubmissions from "./pages/MySubmissions";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student Routes */}
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/assignments/:id"
          element={
            <ProtectedRoute allowedRole="student">
              <AssignmentSubmission />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-submissions"
          element={
            <ProtectedRoute allowedRole="student">
              <MySubmissions />
            </ProtectedRoute>
          }
        />

        {/* Faculty Routes */}
        <Route
          path="/faculty-dashboard"
          element={
            <ProtectedRoute allowedRole="faculty">
              <FacultyDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-assignment"
          element={
            <ProtectedRoute allowedRole="faculty">
              <CreateAssignment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/assignments/:id/submissions"
          element={
            <ProtectedRoute allowedRole="faculty">
              <FacultySubmissions />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;