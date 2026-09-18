import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import ProtectedRoute from './ProtectedRoute';

// Lazy-load all pages for performance
const LandingPage = lazy(() => import('../pages/LandingPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const DashboardRedirect = lazy(() => import('../pages/DashboardRedirect'));
const StudentDashboard = lazy(() => import('../pages/StudentDashboard'));
const StudentCourseDetails = lazy(() => import('../pages/StudentCourseDetails'));
const MentorDashboard = lazy(() => import('../pages/MentorDashboard'));
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
const AdminRoleManagement = lazy(() => import('../pages/AdminRoleManagement'));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage'));
const OAuth2RedirectHandler = lazy(() => import('../pages/OAuth2RedirectHandler'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const MyProfile = lazy(() => import('../pages/MyProfile'));
const EditProfile = lazy(() => import('../pages/EditProfile'));
const Settings = lazy(() => import('../pages/Settings'));

// Simple loading fallback (keeps bundle clean)
function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#F0FDF4' }}>
      <div style={{ width: 50, height: 50, border: '3px solid #BBF7D0', borderTopColor: '#10B981', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path={ROUTES.HOME} element={<LandingPage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

        {/* Dashboard redirect — determines correct dashboard based on role */}
        <Route
          path={ROUTES.DASHBOARD}
          element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.STUDENT_COURSE_DETAILS}
          element={
            <ProtectedRoute>
              <StudentCourseDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.STUDENT_DASHBOARD}
          element={
            <ProtectedRoute requiredRole="STUDENT">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.MENTOR_DASHBOARD}
          element={
            <ProtectedRoute requiredRole="MENTOR">
              <MentorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.ADMIN_DASHBOARD}
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.ADMIN_ROLE_MANAGEMENT}
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminRoleManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.PROFILE}
          element={<Navigate to={ROUTES.MY_PROFILE} replace />}
        />

        <Route
          path={ROUTES.MY_PROFILE}
          element={
            <ProtectedRoute>
              <MyProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.EDIT_PROFILE}
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.SETTINGS}
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </Suspense>
  );
}
