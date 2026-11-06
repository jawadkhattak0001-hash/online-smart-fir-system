import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import { useAuth } from "./contexts/AuthContext";
import Layout from "./components/layout/Layout";
import Login from "./pages/Login";

// Existing pages
import Dashboard from "./pages/Dashboard";
import FIRManagement from "./pages/FIRManagement";
import Alerts from "./pages/Alerts";
import Reports from "./pages/Reports";
import Suspect from "./pages/Suspect";
import ManageOfficers from "./pages/ManageOfficers";
import CameraManagement from "./pages/CameraManagement";
import Settings from "./pages/Settings";
import SuspectDetails from './pages/SuspectDetails';

// NEW ROLE-BASED DASHBOARDS
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import DSPDashboard from "./pages/DSPDashboard";
import SHODashboard from "./pages/SHODashboard";
import SIDashboard from "./pages/SIDashboard";

// Role-based route protection component
function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚫</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }
  
  return children;
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">SmartFIR System</h2>
        </div>
      </div>
    );
  }

  // If NOT logged in - show Landing Page and Login routes
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // If logged in - show Dashboard with Layout
  return (
    <Layout>
      <Routes>
        {/* Home page - shows role-specific dashboard */}
        <Route path="/" element={<Dashboard />} />
        
        {/* Shared pages - all roles can access */}
        <Route path="/firs" element={<FIRManagement />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/suspect" element={<Suspect />} />
        <Route path="/suspects" element={
          <ProtectedRoute allowedRoles={['super_admin', 'dsp', 'sho', 'si']}>
            <Suspect />
          </ProtectedRoute>
        } />
        <Route path="/suspects/:id" element={
          <ProtectedRoute allowedRoles={['super_admin', 'dsp', 'sho', 'si']}>
            <SuspectDetails />
          </ProtectedRoute>
        } />
        
        {/* Reports - only Super Admin, DSP, and SHO can access */}
        <Route path="/reports" element={
          <ProtectedRoute allowedRoles={['super_admin', 'dsp', 'sho']}>
            <Reports />
          </ProtectedRoute>
        } />
        
        {/* Camera Management - only Super Admin and SHO (Station Admin) */}
        <Route path="/cameras" element={
          <ProtectedRoute allowedRoles={['super_admin', 'sho']}>
            <CameraManagement />
          </ProtectedRoute>
        } />
        
        {/* Settings - only Super Admin */}
        <Route path="/settings" element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <Settings />
          </ProtectedRoute>
        } />

        {/* ROLE-SPECIFIC DASHBOARDS */}
        <Route path="/super-admin" element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/dsp" element={
          <ProtectedRoute allowedRoles={['dsp']}>
            <DSPDashboard />
          </ProtectedRoute>
        } />
        <Route path="/sho" element={
          <ProtectedRoute allowedRoles={['sho']}>
            <SHODashboard />
          </ProtectedRoute>
        } />
        <Route path="/si" element={
          <ProtectedRoute allowedRoles={['si']}>
            <SIDashboard />
          </ProtectedRoute>
        } />
        
        {/* Manage Officers - only SHO (creates SIs) */}
        <Route path="/officers" element={
          <ProtectedRoute allowedRoles={['sho']}>
            <ManageOfficers />
          </ProtectedRoute>
        } />

        {/* Catch all route - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;