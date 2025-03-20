import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { useAuthStore } from './store/authStore';

// Lazy load pages
const Home = React.lazy(() => import('./pages/Home'));
const Schedule = React.lazy(() => import('./pages/Schedule'));
const Patients = React.lazy(() => import('./pages/Patients'));
const PatientProfile = React.lazy(() => import('./pages/Patients/Profile'));
const Charts = React.lazy(() => import('./pages/Charts'));
const Billing = React.lazy(() => import('./pages/Billing'));
const Telehealth = React.lazy(() => import('./pages/Telehealth'));
const PatientDashboard = React.lazy(() => import('./pages/patient/Dashboard'));
const PatientRecords = React.lazy(() => import('./pages/patient/Records'));
const PatientAppointments = React.lazy(() => import('./pages/patient/Appointments'));
const Profile = React.lazy(() => import('./pages/patient/Profile')); // New import

function App() {
  const { user } = useAuthStore();
  const isPatient = user?.role === 'patient';

  return (
    <Router>
      {!user ? (
        <Navigate to="/login" replace />
      ) : (
        <Routes>
          <Route path="/" element={<Layout />}>
            {isPatient ? (
              // Patient Routes
              <>
                <Route index element={
                  <React.Suspense fallback={<div>Loading...</div>}>
                    <PatientDashboard />
                  </React.Suspense>
                } />
                <Route
                  path="records"
                  element={
                    <React.Suspense fallback={<div>Loading...</div>}>
                      <PatientRecords />
                    </React.Suspense>
                  }
                />
                <Route
                  path="appointments"
                  element={
                    <React.Suspense fallback={<div>Loading...</div>}>
                      <PatientAppointments />
                    </React.Suspense>
                  }
                />
                <Route
                  path="profile"
                  element={
                    <React.Suspense fallback={<div>Loading...</div>}>
                      <Profile />
                    </React.Suspense>
                  }
                />
              </>
            ) : (
              // Medical Staff Routes
              <>
                <Route index element={
                  <React.Suspense fallback={<div>Loading...</div>}>
                    <Home />
                  </React.Suspense>
                } />
                <Route
                  path="schedule"
                  element={
                    <React.Suspense fallback={<div>Loading...</div>}>
                      <Schedule />
                    </React.Suspense>
                  }
                />
                <Route
                  path="patients"
                  element={
                    <React.Suspense fallback={<div>Loading...</div>}>
                      <Patients />
                    </React.Suspense>
                  }
                />
                <Route
                  path="patients/:id"
                  element={
                    <React.Suspense fallback={<div>Loading...</div>}>
                      <PatientProfile />
                    </React.Suspense>
                  }
                />
                <Route
                  path="charts"
                  element={
                    <React.Suspense fallback={<div>Loading...</div>}>
                      <Charts />
                    </React.Suspense>
                  }
                />
                <Route
                  path="billing"
                  element={
                    <React.Suspense fallback={<div>Loading...</div>}>
                      <Billing />
                    </React.Suspense>
                  }
                />
                <Route
                  path="telehealth"
                  element={
                    <React.Suspense fallback={<div>Loading...</div>}>
                      <Telehealth />
                    </React.Suspense>
                  }
                />
              </>
            )}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      )}
    </Router>
  );
}

export default App;