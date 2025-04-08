import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import RoleRoute from './components/common/RoleRoute';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import PatientDashboard from './pages/patient/Dashboard';
import DoctorDashboard from './pages/doctor/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import DoctorList from './components/patient/DoctorList';
import DoctorProfile from './components/patient/DoctorProfile';
import AppointmentForm from './components/patient/AppointmentForm';
import MyAppointments from './components/patient/MyAppointments';
import AvailabilityForm from './components/doctor/AvailabilityForm';
import DoctorAppointments from './components/doctor/DoctorAppointments';
import DoctorApproval from './components/admin/DoctorApproval';
import UserManagement from './components/admin/UserManagement';
import AllAppointments from './components/admin/AllAppointments';
import NotFound from './components/common/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Header />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Patient Routes */}
              <Route
                path="/patient"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles={['patient']}>
                      <PatientDashboard />
                    </RoleRoute>
                  </PrivateRoute>
                }
              >
                <Route index element={<DoctorList />} />
                <Route path="doctors" element={<DoctorList />} />
                <Route path="doctors/:id" element={<DoctorProfile />} />
                <Route path="doctors/:id/book" element={<AppointmentForm />} />
                <Route path="appointments" element={<MyAppointments />} />
              </Route>

              {/* Doctor Routes */}
              <Route
                path="/doctor"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles={['doctor']}>
                      <DoctorDashboard />
                    </RoleRoute>
                  </PrivateRoute>
                }
              >
                <Route index element={<DoctorAppointments />} />
                <Route path="appointments" element={<DoctorAppointments />} />
                <Route path="availability" element={<AvailabilityForm />} />
              </Route>

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </RoleRoute>
                  </PrivateRoute>
                }
              >
                <Route index element={<DoctorApproval />} />
                <Route path="approvals" element={<DoctorApproval />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="appointments" element={<AllAppointments />} />
              </Route>

              {/* 404 Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;