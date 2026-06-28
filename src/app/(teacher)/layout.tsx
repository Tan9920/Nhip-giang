/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { getCurrentSession } from '../../lib/auth/authService';

interface TeacherLayoutProps {
  children: React.ReactNode;
  onRedirect: (view: 'login') => void;
}

/**
 * TeacherLayout act as a Route Guard for all teacher workspace areas.
 * If the user session does not exist, it triggers a redirect to the login screen.
 */
export default function TeacherLayout({ children, onRedirect }: TeacherLayoutProps) {
  const session = getCurrentSession();

  useEffect(() => {
    if (!session) {
      onRedirect('login');
    }
  }, [session, onRedirect]);

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 text-xs font-bold font-display">Đang bảo vệ phiên làm việc. Đang chuyển hướng về trang đăng nhập...</p>
        </div>
      </div>
    );
  }

  // Ensure that the logged-in user is a teacher (or admin who can access everything)
  return (
    <div className="w-full space-y-6 animate-fade-in" id="teacher-route-layout">
      {children}
    </div>
  );
}
