import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { Navbar } from './components/common/Navbar';
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Customer } from './pages/dashboard/Customer';
import { ShopOwnerDashboard } from './pages/dashboard/ShopOwnerDashboard';
import { ShopRepairManagement } from './components/shop/ShopRepairManagement';
import { NewRequest } from './pages/repair/NewRequest';
import { RequestDetails } from './pages/repair/RequestDetails';
import { ROLES } from './utils/constants';
import { ShopRegistration } from './pages/shop/ShopRegistration';
import  ShopList  from './pages/shop/ShopList';
import { RepairRequestList } from './components/shop/RepairRequestList'; 
import { Profile } from './pages/nav/Profile';
import { Settings } from './pages/nav/Settings';
import { EmailVerification } from './components/auth/EmailVerification';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { ShopDetailView } from './pages/shop/ShopDetailView';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AdminDashboard } from './components/admin/AdminDashboard';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<MainLayout />}>
        {/* Root Route */}
        <Route
          path="/"
          element={
            user?.role === ROLES.SHOP_OWNER ? (
              <Navigate to="/shop-dashboard" replace />
            ) : user?.role === ROLES.ADMIN ? (
              <Navigate to="/admin-dashboard" replace />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Profile and Settings Routes - Available to all authenticated users */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Customer Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
              <Customer />
            </ProtectedRoute>
          }
        />
        
        {/* Add routes for repair requests */}
        <Route
          path="/repair-requests"
          element={
            <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
              <RepairRequestList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/repair-requests/new"
          element={
            <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
              <NewRequest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/repair-requests/:requestId"
          element={
            <ProtectedRoute>
              <RequestDetails />
            </ProtectedRoute>
          }
        />

        {/* Add route for shops list */}
        <Route
          path="/shops"
          element={
            <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
              <ShopList />
            </ProtectedRoute>
          }
        />

        {/* Shop Owner Routes */}
        <Route
          path="/shop-dashboard"
          element={
            <ProtectedRoute allowedRoles={[ROLES.SHOP_OWNER]}>
              <ShopOwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shop/repairs"
          element={
            <ProtectedRoute allowedRoles={[ROLES.SHOP_OWNER]}>
              <ShopRepairManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shop-registration"
          element={
            <ProtectedRoute allowedRoles={[ROLES.SHOP_OWNER]}>
              <ShopRegistration />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shop-profile"
          element={
            <ProtectedRoute allowedRoles={[ROLES.SHOP_OWNER]}>
              <ShopOwnerDashboard activeTab="profile" />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route
        path="/shops/:shopId"
        element={<ShopDetailView />}
      />

      {/* 404 Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <AppRoutes />
          <ToastContainer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;