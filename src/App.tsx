
import { Routes, Route } from 'react-router-dom';
import Login from './features/login';
import Dashboard from './features/dashboard';
import Patients from './features/patients';
import Admissions from './features/admissions';
import AdmissionDetails from './features/admissions/AdmissionDetails';
import UpdateAdmission from './features/admissions/UpdateAdmission';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
      <Routes>
        <Route path="/" element={<Login />} />
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
          path="/admission/new"
          element={
            <ProtectedRoute>
              <UpdateAdmission />
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
        <Route
          path="/admission/:id/update"
          element={
            <ProtectedRoute>
              <UpdateAdmission />
            </ProtectedRoute>
          }
        />
      </Routes>
  );
}

export default App;