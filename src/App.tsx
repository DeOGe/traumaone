
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Admissions from './pages/Admissions';
import AdmissionDetails from './pages/AdmissionDetails';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients"
        element={
          <ProtectedRoute>
            <Patients />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admissions"
        element={
          <ProtectedRoute>
            <Admissions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admission/:id"
        element={
          <ProtectedRoute>
            <AdmissionDetails />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;