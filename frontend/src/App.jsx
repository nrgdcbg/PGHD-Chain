import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import ProtectedRoute from "./components/ProtectedRoutes";
import useAuth from "./hooks/useAuth";

function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

function RegisterAndLogout() {
  localStorage.clear();
  return <Register />;
}

function App() {
  const { userType, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or use a spinner/loading indicator
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<RegisterAndLogout />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              {userType === 1 ? (
                <Navigate to="/doctor-dashboard" />
              ) : userType === 2 ? (
                <Navigate to="/patient-dashboard" />
              ) : (
                <Navigate to="/login" /> 
              )}
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor-dashboard"
          element={
            <ProtectedRoute>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/patient-dashboard"
          element={
            <ProtectedRoute>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
