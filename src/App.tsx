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
import { 
  BookOpen, UserCheck, ShieldAlert, GraduationCap, Scale, ChevronRight, 
  Users, LogOut, CheckCircle, Info, Shield, HelpCircle, Wrench 
} from 'lucide-react';
import { loadLessonsFromStorage, saveLessonsToStorage, getLessonsByOwner } from './lib/storage/lessonStorage';

// Import các trang mới tạo của Batch 04
import LandingPage from './app/(marketing)/page';
import RegisterPage from './app/(auth)/register/page';
import LoginPage from './app/(auth)/login/page';
import TermsPage from './app/(legal)/terms/page';
import PrivacyPage from './app/(legal)/privacy/page';
import TeacherLayout from './app/(teacher)/layout';
import PlansPage from './app/(teacher)/plans/page';

import { 
  getCurrentSession, 
  setCurrentSession, 
  logoutUser, 
  getRegisteredUsers, 
  UserAccount 
} from './lib/auth/authService';

export default function App() {
  // Quản lý thông tin phiên làm việc và định tuyến Client-side
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    return getCurrentSession();
  });

  const [showDevPanel, setShowDevPanel] = useState<boolean>(false);

  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'register' | 'terms' | 'privacy' | 'workspace' | 'plans'>(() => {
    const session = getCurrentSession();
    return session ? 'workspace' : 'landing';
  });

  const [activeTab, setActiveTab] = useState<'teacher' | 'admin' | 'legal'>(() => {
    const session = getCurrentSession();
    if (session && session.role === 'admin') {
      return 'admin';
    }
    return (localStorage.getItem('nhip_giang_active_tab') as any) || 'teacher';
  });

  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Tải dữ liệu bằng Local Persistence Service
  useEffect(() => {
    const plans = loadLessonsFromStorage(SEED_LESSON_PLANS);
    setLessonPlans(plans);
  }, []);

  // Đồng bộ trạng thái tab xuống LocalStorage
  useEffect(() => {
    localStorage.setItem('nhip_giang_active_tab', activeTab);
  }, [activeTab]);

  // Hiển thị thông báo Toast
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Đồng bộ lưu trữ khi danh sách thay đổi qua Local Storage Service
  const saveToStorage = (plans: LessonPlan[]) => {
    setLessonPlans(plans);
    saveLessonsToStorage(plans);
  };

  // Handler khi đăng ký hoặc đăng nhập thành công
  const handleAuthSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('teacher');
    }
    setCurrentView('workspace');
  };

  // Đăng xuất tài khoản
  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setCurrentView('landing');
    showToast('Đăng xuất phiên làm việc thành công!', 'success');
  };

  // Handler chuyển đổi nhanh phiên làm việc phục vụ Chế độ Nhà phát triển (Developer Matcher)
  const handleDeveloperSessionChange = (userId: string) => {
    const registeredUsers = getRegisteredUsers();
    const foundUser = registeredUsers.find(u => u.userId === userId);
    if (foundUser) {
      setCurrentSession(foundUser);
      setCurrentUser(foundUser);
      if (foundUser.role === 'admin') {
        setActiveTab('admin');
      } else {
        setActiveTab('teacher');
      }
      showToast(`Chuyển đổi nhanh sang: ${foundUser.displayName}`, 'info');
    }
  };

  // Thêm giáo án mới
  const handleAddPlan = (newPlan: LessonPlan) => {
    // Đảm bảo ownerId luôn trùng khớp chính xác với userId trong phiên làm việc hiện tại
    const validatedPlan: LessonPlan = {
      ...newPlan,
      ownerId: currentUser ? currentUser.userId : 'teacher_01'
    };
    const updated = [validatedPlan, ...lessonPlans];
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

  // Lấy danh sách giáo án của phiên hiện tại tuân thủ nghiêm ngặt Owner Isolation
  const activeSessionId = currentUser ? currentUser.userId : 'teacher_01';
  const visibleLessonPlans = getLessonsByOwner(activeSessionId, lessonPlans);

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans antialiased text-slate-800 relative" id="app-root-container">
      
      {/* Toast Alert Notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4.5 py-3 rounded-xl shadow-lg border text-xs font-bold animate-slide-in ${
          toast.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : toast.type === 'error'
            ? 'bg-rose-50 text-rose-800 border-rose-200'
            : 'bg-blue-50 text-blue-800 border-blue-200'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 animate-pulse" />
          ) : (
            <Shield className="w-4 h-4 text-emerald-600" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header chính có phân biệt trạng thái Đăng nhập */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 shadow-xs animate-fade-in" id="app-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center py-4 md:h-20 gap-4">
            
            {/* Logo & Brand Identity */}
            <div 
              className="flex items-center space-x-3.5 self-start md:self-auto cursor-pointer"
              onClick={() => setCurrentView(currentUser ? 'workspace' : 'landing')}
            >
              <div className="bg-gradient-to-tr from-emerald-600 to-teal-500 text-white p-2.5 rounded-xl flex items-center justify-center shrink-0 shadow-sm shadow-emerald-600/20">
                <GraduationCap className="w-6.5 h-6.5" />
              </div>
              <div>
                <h1 className="font-display font-extrabold tracking-tight text-slate-900 text-lg sm:text-xl leading-none flex items-center gap-1.5">
                  Nhịp Giảng
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-1.5 py-0.5 rounded-full font-mono font-semibold">
                    v1.5
                  </span>
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Hệ thống hỗ trợ soạn giảng & thẩm định theo Công văn 5512
                </p>
              </div>
            </div>

            {/* Điều hướng và thông tin người dùng */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full md:w-auto">
              
              {currentUser ? (
                /* Giao diện Header khi ĐÃ ĐĂNG NHẬP */
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  {/* Tabs nghiệp vụ (Route Guard Tab-bar) */}
                  <nav className="flex space-x-1 bg-slate-100/80 border border-slate-200/50 p-1 rounded-xl w-full sm:w-auto">
                    <button
                      onClick={() => {
                        setActiveTab('teacher');
                        setCurrentView('workspace');
                      }}
                      className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        activeTab === 'teacher' && currentView === 'workspace'
                          ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/50 font-extrabold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                      }`}
                      id="tab-teacher-workspace"
                    >
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                      Soạn bài
                    </button>

                    {/* Chỉ Admin mới được click tab thẩm định */}
                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => {
                          setActiveTab('admin');
                          setCurrentView('workspace');
                        }}
                        className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          activeTab === 'admin' && currentView === 'workspace'
                            ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/50 font-extrabold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                        }`}
                        id="tab-admin-panel"
                      >
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        Thẩm định
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setActiveTab('legal');
                        setCurrentView('workspace');
                      }}
                      className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        activeTab === 'legal' && currentView === 'workspace'
                          ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/50 font-extrabold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                      }`}
                      id="tab-legal-portal"
                    >
                      <Scale className="w-4 h-4 text-emerald-600" />
                      Pháp lý
                    </button>
                  </nav>

                  {/* Profile info & Đăng xuất */}
                  <div className="flex items-center gap-2.5 bg-slate-100/60 border border-slate-200/50 px-3 py-1.5 rounded-xl w-full sm:w-auto justify-between">
                    <div className="text-left">
                      <p className="text-[10px] font-extrabold text-slate-800 leading-none">{currentUser.displayName}</p>
                      <p className="text-[8px] text-slate-500 font-bold tracking-wider mt-0.5 uppercase">{currentUser.role === 'admin' ? 'Cán bộ thẩm định' : 'Giáo viên'}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-1.5 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                      title="Đăng xuất khỏi hệ thống"
                      id="btn-logout"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Giao diện Header khi CHƯA ĐĂNG NHẬP */
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setCurrentView('login')}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => setCurrentView('register')}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 cursor-pointer shadow-xs transition-colors"
                  >
                    Đăng ký tài khoản
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </header>

      {/* Main Container điều hướng thông minh */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6" id="app-main">
        
        {/* VIEW LANDING PAGE */}
        {currentView === 'landing' && (
          <LandingPage onNavigate={setCurrentView} />
        )}

        {/* VIEW REGISTER PAGE */}
        {currentView === 'register' && (
          <RegisterPage 
            onNavigate={setCurrentView} 
            onRegisterSuccess={handleAuthSuccess}
            showToast={showToast}
          />
        )}

        {/* VIEW LOGIN PAGE */}
        {currentView === 'login' && (
          <LoginPage 
            onNavigate={setCurrentView} 
            onLoginSuccess={handleAuthSuccess}
            showToast={showToast}
          />
        )}

        {/* VIEW TERMS STATIC PAGE */}
        {currentView === 'terms' && (
          <TermsPage onBack={() => setCurrentView(currentUser ? 'workspace' : 'landing')} />
        )}

        {/* VIEW PRIVACY STATIC PAGE */}
        {currentView === 'privacy' && (
          <PrivacyPage onBack={() => setCurrentView(currentUser ? 'workspace' : 'landing')} />
        )}

        {/* VIEW PLANS STATIC PAGE */}
        {currentView === 'plans' && (
          <PlansPage 
            onBack={() => {
              setCurrentUser(getCurrentSession());
              setCurrentView('workspace');
            }} 
            showToast={showToast} 
          />
        )}

        {/* VIEW WORKSPACE (CHỈ CHO PHÉP KHI ĐÃ ĐĂNG NHẬP) */}
        {currentView === 'workspace' && (
          <TeacherLayout onRedirect={setCurrentView}>
            {activeTab === 'teacher' && (
              <TeacherWorkspace
                lessonPlans={visibleLessonPlans}
                onAddPlan={handleAddPlan}
                onUpdatePlan={handleUpdatePlan}
                activeTeacherId={activeSessionId}
                onNavigateToPlans={() => setCurrentView('plans')}
                currentUser={currentUser}
                onRefreshUser={() => setCurrentUser(getCurrentSession())}
              />
            )}

            {activeTab === 'admin' && (
              <AdminPanel
                lessonPlans={visibleLessonPlans}
                onUpdateStatus={handleUpdateStatus}
                onDeletePlan={handleDeletePlan}
                activeSession={activeSessionId}
              />
            )}

            {activeTab === 'legal' && (
              <LegalViewer />
            )}
          </TeacherLayout>
        )}

      </main>

      {/* Chân trang ứng dụng */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-12" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700">Nhịp Giảng</span>
            <span>| © 2026 Toàn bộ quyền được bảo lưu.</span>
          </div>
          
          <div className="flex space-x-5">
            <button 
              onClick={() => setCurrentView('terms')} 
              className="hover:text-emerald-600 font-semibold transition-colors cursor-pointer"
            >
              Điều khoản sử dụng
            </button>
            <button 
              onClick={() => setCurrentView('privacy')} 
              className="hover:text-emerald-600 font-semibold transition-colors cursor-pointer"
            >
              Chính sách bảo mật
            </button>
            <span className="font-mono text-slate-400">Phiên bản: P1.5-Batch04</span>
          </div>
        </div>
      </footer>

      {/* Floating Developer Sandbox Panel / Switcher */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end" id="developer-sandbox-widget">
        {showDevPanel && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-4.5 mb-2 w-72 space-y-3 animate-slide-in text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                <Wrench className="w-4 h-4 text-emerald-600" />
                Môi trường Thử nghiệm
              </span>
              <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[9px] font-mono font-bold">
                Local
              </span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Bạn có thể thay đổi nhanh tài khoản thử nghiệm bên dưới để kiểm tra trải nghiệm của cả Giáo viên và Cán bộ thẩm định:
            </p>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-600 uppercase">Chọn tài khoản:</label>
              <select
                value={activeSessionId}
                onChange={(e) => handleDeveloperSessionChange(e.target.value)}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-2 focus:outline-emerald-600 cursor-pointer shadow-3xs"
                id="role-switcher"
              >
                <option value="teacher_01">Giáo viên A (teacher_01)</option>
                <option value="teacher_02">Giáo viên B (teacher_02)</option>
                <option value="admin">Cán bộ thẩm định (admin)</option>
              </select>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
              <span>Vai trò hiện tại:</span>
              <span className="font-bold text-emerald-700 uppercase">{currentUser?.role === 'admin' ? 'Cán bộ thẩm định' : 'Giáo viên'}</span>
            </div>
          </div>
        )}
        <button
          onClick={() => setShowDevPanel(!showDevPanel)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg border text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer ${
            showDevPanel
              ? 'bg-slate-900 border-slate-800 text-white'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
          title="Mở bảng điều khiển thử nghiệm nhanh"
        >
          <Wrench className={`w-4 h-4 ${showDevPanel ? 'text-emerald-400 animate-spin-slow' : 'text-slate-500'}`} />
          {showDevPanel ? 'Đóng Công cụ' : 'Thử nghiệm'}
        </button>
      </div>
    </div>
  );
}
