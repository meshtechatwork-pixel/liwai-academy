import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) {
  const { user, authReady, isAdmin } = useAuth();
  const location = useLocation();

  if (!authReady) {
    return (
      <div className="mx-auto max-w-[1280px] px-6 py-20">
        <div className="h-40 animate-pulse rounded-xl border border-white/10 bg-[#17112B]" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <div className="rounded-2xl border border-white/10 bg-[#17112B] p-10">
          <h1 className="font-display text-2xl font-bold text-white">Administrator Access Required</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Your account does not currently have administrator privileges. Sign in with an authorized
            administrator account to manage courses, students, and certificates.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
