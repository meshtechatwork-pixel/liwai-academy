import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AcademyProvider } from './context/AcademyContext';
import { AuthProvider } from './context/AuthContext';
import AboutPage from './pages/AboutPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import CertificatesPage from './pages/CertificatesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import CoursesPage from './pages/CoursesPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import MyLearningPage from './pages/MyLearningPage';
import MyProfilePage from './pages/MyProfilePage';
import PromptGeneratorPage from './pages/PromptGeneratorPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboardPage from './pages/StudentDashboardPage';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AcademyProvider>
          <BrowserRouter>
            <div className="flex min-h-screen flex-col bg-[#100B20] text-white">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  {/* 1. Home */}
                  <Route path="/" element={<HomePage />} />
                  {/* 2. About Us */}
                  <Route path="/about" element={<AboutPage />} />
                  {/* 3. All Courses */}
                  <Route path="/courses" element={<CoursesPage />} />
                  {/* 4. Course Details */}
                  <Route path="/courses/:courseId" element={<CourseDetailPage />} />
                  {/* 5. AI Prompt Generator */}
                  <Route path="/prompt-generator" element={<PromptGeneratorPage />} />
                  {/* 6. Login */}
                  <Route path="/login" element={<LoginPage />} />
                  {/* 7. Register */}
                  <Route path="/register" element={<RegisterPage />} />
                  {/* 8. Student Dashboard */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <StudentDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  {/* 9. My Learning */}
                  <Route
                    path="/my-learning"
                    element={
                      <ProtectedRoute>
                        <MyLearningPage />
                      </ProtectedRoute>
                    }
                  />
                  {/* 10. My Profile */}
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <MyProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  {/* 11. Certificates */}
                  <Route
                    path="/certificates"
                    element={
                      <ProtectedRoute>
                        <CertificatesPage />
                      </ProtectedRoute>
                    }
                  />
                  {/* 12. Admin Dashboard */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requireAdmin>
                        <AdminDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </AcademyProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
