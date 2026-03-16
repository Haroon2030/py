import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ArchiveListPage from './pages/ArchiveListPage';
import UploadPage from './pages/UploadPage';
import DocumentDetailPage from './pages/DocumentDetailPage';
import BranchesPage from './pages/BranchesPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-primary">
        <div className="w-14 h-14 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" /> : children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: 'Tajawal, sans-serif',
              direction: 'rtl',
              borderRadius: '12px',
            },
          }}
        />
        <Routes>
          <Route path="/login" element={
            <PublicRoute><LoginPage /></PublicRoute>
          } />
          <Route element={
            <ProtectedRoute><Layout /></ProtectedRoute>
          }>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/archive" element={<ArchiveListPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/archive/:id" element={<DocumentDetailPage />} />
            <Route path="/branches" element={<BranchesPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
