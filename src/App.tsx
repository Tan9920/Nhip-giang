/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LessonPlan, DataStatus } from './types';
import { SEED_LESSON_PLANS } from './lib/templates';
import TeacherWorkspace from './components/TeacherWorkspace';
import AdminPanel from './components/AdminPanel';
import LegalViewer from './components/LegalViewer';
import { BookOpen, UserCheck, ShieldAlert, GraduationCap, Scale, ChevronRight, Users } from 'lucide-react';
import { loadLessonsFromStorage, saveLessonsToStorage, getLessonsByOwner } from './lib/storage/lessonStorage';

export default function App() {
  // Quản lý phiên làm việc giả lập và phân quyền (Mock Session & Role Switcher)
  const [activeSession, setActiveSession] = useState<'teacher_01' | 'teacher_02' | 'admin'>(() => {
    return (localStorage.getItem('nhip_giang_active_session') as any) || 'teacher_01';
  });

  const [activeTab, setActiveTab] = useState<'teacher' | 'admin' | 'legal'>(() => {
    return (localStorage.getItem('nhip_giang_active_tab') as any) || 'teacher';
  });

  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);

  // Tải dữ liệu bằng Local Persistence Service
  useEffect(() => {
    const plans = loadLessonsFromStorage(SEED_LESSON_PLANS);
    setLessonPlans(plans);
  }, []);

  // Đồng bộ lưu trữ khi danh sách thay đổi qua Local Storage Service
  const saveToStorage = (plans: LessonPlan[]) => {
    setLessonPlans(plans);
    saveLessonsToStorage(plans);
  };

  // Đồng bộ trạng thái tab và session xuống LocalStorage
  useEffect(() => {
    localStorage.setItem('nhip_giang_active_session', activeSession);
  }, [activeSession]);

  useEffect(() => {
    localStorage.setItem('nhip_giang_active_tab', activeTab);
  }, [activeTab]);

  // Handler chuyển đổi nhanh session từ Navbar
  const handleSessionChange = (newSession: 'teacher_01' | 'teacher_02' | 'admin') => {
    setActiveSession(newSession);
    if (newSession === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('teacher');
    }
  };

  // Thêm giáo án mới
  const handleAddPlan = (newPlan: LessonPlan) => {
    const updated = [newPlan, ...lessonPlans];
    saveToStorage(updated);
  };

  // Cập nhật giáo án
  const handleUpdatePlan = (updatedPlan: LessonPlan) => {
    const updated = lessonPlans.map(p => p.id === updatedPlan.id ? updatedPlan : p);
    saveToStorage(updated);
  };

  // Cập nhật nhãn trạng thái dữ liệu (Dành cho Admin/Kiểm duyệt viên)
  const handleUpdateStatus = (id: string, newStatus: DataStatus) => {
    const updated = lessonPlans.map(p => p.id === id ? { ...p, status: newStatus, updatedAt: new Date().toISOString() } : p);
    saveToStorage(updated);
  };

  // Xóa giáo án
  const handleDeletePlan = (id: string) => {
    const updated = lessonPlans.filter(p => p.id !== id);
    saveToStorage(updated);
  };

  // Lấy các giáo án đã lọc dựa theo Owner Isolation
  const visibleLessonPlans = getLessonsByOwner(activeSession, lessonPlans);

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans antialiased text-slate-800" id="app-root-container">
      {/* Modern Glassmorphic Top Navigation Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 shadow-xs" id="app-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center py-4 md:h-20 gap-4">
            
            {/* Logo & Brand Identity */}
            <div className="flex items-center space-x-3.5 self-start md:self-auto">
              <div className="bg-gradient-to-tr from-emerald-600 to-teal-500 text-white p-2.5 rounded-xl flex items-center justify-center shrink-0 shadow-sm shadow-emerald-600/20">
                <GraduationCap className="w-6.5 h-6.5" />
              </div>
              <div>
                <h1 className="font-display font-extrabold tracking-tight text-slate-900 text-lg sm:text-xl leading-none flex items-center gap-1.5">
                  Nhịp Giảng
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-1.5 py-0.5 rounded-full font-mono font-semibold">
                    v1.2
                  </span>
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Hệ sinh thái soạn giảng & kiểm duyệt Công văn 5512
                </p>
              </div>
            </div>

            {/* Session Switcher & Premium Tab Navigation */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full md:w-auto">
              {/* Giả lập phiên làm việc (Mock Session Switcher with Custom Select Frame) */}
              <div className="flex items-center gap-2 bg-slate-100/80 border border-slate-200/60 rounded-xl p-1 w-full sm:w-auto justify-between sm:justify-start">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 pl-2.5 flex items-center gap-1.5 select-none">
                  <Users className="w-4 h-4 text-slate-400" /> Vai:
                </span>
                <select
                  value={activeSession}
                  onChange={(e) => handleSessionChange(e.target.value as any)}
                  className="bg-white border border-slate-200/80 text-xs font-bold text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 cursor-pointer shadow-3xs"
                  id="role-switcher"
                >
                  <option value="teacher_01">Giáo viên A (Mã: 01)</option>
                  <option value="teacher_02">Giáo viên B (Mã: 02)</option>
                  <option value="admin">Cán bộ thẩm định (Admin)</option>
                </select>
              </div>

              {/* Menu chuyển đổi các Tab nghiệp vụ */}
              <nav className="flex space-x-1 bg-slate-100/80 border border-slate-200/50 p-1 rounded-xl w-full sm:w-auto">
                <button
                  onClick={() => setActiveTab('teacher')}
                  className={`flex-1 sm:flex-none px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'teacher'
                      ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/50 font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                  }`}
                  id="tab-teacher-workspace"
                >
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  Soạn bài
                </button>

                <button
                  onClick={() => setActiveTab('admin')}
                  className={`flex-1 sm:flex-none px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'admin'
                      ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/50 font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                  }`}
                  id="tab-admin-panel"
                >
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  Thẩm định
                </button>

                <button
                  onClick={() => setActiveTab('legal')}
                  className={`flex-1 sm:flex-none px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'legal'
                      ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/50 font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                  }`}
                  id="tab-legal-portal"
                >
                  <Scale className="w-4 h-4 text-emerald-600" />
                  Pháp lý
                </button>
              </nav>
            </div>

          </div>
        </div>
      </header>

      {/* Thân ứng dụng (Main Workspace Canvas) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6" id="app-main">
        {activeTab === 'teacher' && (
          <TeacherWorkspace
            lessonPlans={visibleLessonPlans}
            onAddPlan={handleAddPlan}
            onUpdatePlan={handleUpdatePlan}
            activeTeacherId={activeSession}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPanel
            lessonPlans={visibleLessonPlans}
            onUpdateStatus={handleUpdateStatus}
            onDeletePlan={handleDeletePlan}
            activeSession={activeSession}
          />
        )}

        {activeTab === 'legal' && (
          <LegalViewer />
        )}
      </main>

      {/* Chân trang ứng dụng */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700">Nhịp Giảng</span>
            <span>| © 2026 Toàn bộ quyền được bảo lưu.</span>
          </div>
          
          <div className="flex space-x-4">
            <button onClick={() => setActiveTab('legal')} className="hover:text-emerald-600 transition-colors cursor-pointer">Điều khoản sử dụng</button>
            <button onClick={() => setActiveTab('legal')} className="hover:text-emerald-600 transition-colors cursor-pointer">Chính sách bảo mật</button>
            <span>Phiên bản: P0.3-Standard</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
