import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { LearningProvider } from './context/LearningContext';

const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const CoursesPage = lazy(() => import('./pages/CoursesPage'));
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage'));
const PromptGeneratorPage = lazy(() => import('./pages/PromptGeneratorPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const StudentDashboardPage = lazy(() => import('./pages/StudentDashboardPage'));
const MyLearningPage = lazy(() => import('./pages/MyLearningPage'));
const MyProfilePage = lazy(() => import('./pages/MyProfilePage'));
const CertificatesPage = lazy(() => import('./pages/CertificatesPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));

function PageLoader() {
  return (
    <div className="mx-auto max-w-[1280px] px-6 py-16">
      <div className="h-48 animate-pulse rounded-2xl border border-white/10 bg-[#17112B]/80" />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LearningProvider>
          <BrowserRouter>
            <div className="flex min-h-screen flex-col bg-[#100B20] text-white">
              <Navbar />
              <main className="flex-1">
                <Suspense fallback={<PageLoader />}>
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
                    {/* 6. Student Registration */}
                    <Route path="/register" element={<RegisterPage />} />
                    {/* 7. Student Login */}
                    <Route path="/login" element={<LoginPage />} />
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
                    {/* 13. Contact Us */}
                    <Route path="/contact" element={<ContactPage />} />
                    {/* 14. FAQ */}
                    <Route path="/faq" element={<FaqPage />} />
                    {/* 15. Privacy Policy */}
                    <Route path="/privacy" element={<PrivacyPolicyPage />} />
                    {/* 16. Terms and Conditions */}
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </LearningProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
