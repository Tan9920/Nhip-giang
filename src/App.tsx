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
import { BookOpen, UserCheck, ShieldAlert, GraduationCap, Scale, ChevronRight } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'nhip_giang_lessons_v1';
const ACTIVE_TEACHER_ID = 'gv_nguyen_van_a_101'; // Tuân thủ nguyên tắc Owner Isolation

export default function App() {
  const [activeTab, setActiveTab] = useState<'teacher' | 'admin' | 'legal'>('teacher');
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);

  // Tải dữ liệu lúc khởi chạy ứng dụng (localStorage + fallback Seed)
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        setLessonPlans(JSON.parse(saved));
      } catch (err) {
        console.error('Lỗi phân tích dữ liệu cũ, khôi phục seed:', err);
        setLessonPlans(SEED_LESSON_PLANS);
      }
    } else {
      // Nếu chưa có, nạp bộ dữ liệu Seed mẫu
      setLessonPlans(SEED_LESSON_PLANS);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SEED_LESSON_PLANS));
    }
  }, []);

  // Đồng bộ lưu trữ khi danh sách thay đổi
  const saveToStorage = (plans: LessonPlan[]) => {
    setLessonPlans(plans);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(plans));
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" id="app-root-container">
      {/* Thanh điều hướng chính (Responsive Navigation) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-2xs" id="app-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo & Brand */}
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-600 text-white p-2 rounded-lg flex items-center justify-center shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-display font-bold text-slate-900 text-base sm:text-lg leading-tight flex items-center gap-1.5">
                  Nhịp Giảng
                </h1>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium">
                  Không gian làm việc số dành cho giáo viên
                </p>
              </div>
            </div>

            {/* Menu chuyển đổi các Tab nghiệp vụ */}
            <nav className="flex space-x-1 sm:space-x-2">
              <button
                onClick={() => setActiveTab('teacher')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'teacher'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                id="tab-teacher-workspace"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Không gian</span> Giáo viên
              </button>

              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                id="tab-admin-panel"
              >
                <UserCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Thẩm định</span> Admin
              </button>

              <button
                onClick={() => setActiveTab('legal')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'legal'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                id="tab-legal-portal"
              >
                <Scale className="w-4 h-4" />
                <span className="hidden sm:inline">Cổng</span> Pháp lý
              </button>
            </nav>

          </div>
        </div>
      </header>

      {/* Thân ứng dụng (Main Workspace Canvas) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6" id="app-main">
        {activeTab === 'teacher' && (
          <TeacherWorkspace
            lessonPlans={lessonPlans}
            onAddPlan={handleAddPlan}
            onUpdatePlan={handleUpdatePlan}
            activeTeacherId={ACTIVE_TEACHER_ID}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPanel
            lessonPlans={lessonPlans}
            onUpdateStatus={handleUpdateStatus}
            onDeletePlan={handleDeletePlan}
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
