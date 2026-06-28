/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldAlert, BookOpen, GraduationCap, ArrowRight, CheckCircle, Info } from 'lucide-react';
import { registerUser } from '../../../lib/auth/authService';

interface RegisterPageProps {
  onNavigate: (view: 'login' | 'terms' | 'privacy' | 'landing') => void;
  onRegisterSuccess: (user: any) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function RegisterPage({ onNavigate, onRegisterSuccess, showToast }: RegisterPageProps) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToLegal, setAgreedToLegal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName.trim()) {
      showToast('Vui lòng nhập Họ tên hiển thị!', 'error');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      showToast('Vui lòng nhập Email hợp lệ!', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Mật khẩu phải chứa ít nhất 6 ký tự!', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Mật khẩu xác nhận không khớp!', 'error');
      return;
    }
    if (!agreedToLegal) {
      showToast('Bạn phải đồng ý với Điều khoản sử dụng và Chính sách bảo mật!', 'error');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Vì là xử lý Client-side local storage an toàn
      const res = registerUser(displayName, email, password);
      setIsLoading(false);

      if (res.success && res.user) {
        showToast(res.message, 'success');
        onRegisterSuccess(res.user);
      } else {
        showToast(res.message || 'Đăng ký thất bại!', 'error');
      }
    }, 800);
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans" id="register-page-container">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center cursor-pointer" onClick={() => onNavigate('landing')}>
          <div className="bg-gradient-to-tr from-emerald-600 to-teal-500 text-white p-3 rounded-2xl flex items-center justify-center shadow-sm">
            <GraduationCap className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-display font-extrabold text-slate-900 tracking-tight">
          Đăng ký tài khoản Nhịp Giảng
        </h2>
        <p className="mt-2 text-center text-xs text-slate-500 font-medium">
          Nền tảng soạn giáo án và quản lý học liệu chuyên nghiệp cho giáo viên.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md" id="register-card">
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-200/80 rounded-2xl sm:px-10">
          <form className="space-y-5 text-left" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="displayName" className="block text-xs font-semibold text-slate-700">
                Họ và tên hiển thị
              </label>
              <div className="mt-1">
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="appearance-none block w-full px-3.5 py-2.5 border border-slate-250 rounded-xl placeholder-slate-400 focus:outline-emerald-600 text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700">
                Địa chỉ Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="name@school.edu.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3.5 py-2.5 border border-slate-250 rounded-xl placeholder-slate-400 focus:outline-emerald-600 text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
                Mật khẩu (Tối thiểu 6 ký tự)
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3.5 py-2.5 border border-slate-250 rounded-xl placeholder-slate-400 focus:outline-emerald-600 text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-700">
                Xác nhận mật khẩu
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3.5 py-2.5 border border-slate-250 rounded-xl placeholder-slate-400 focus:outline-emerald-600 text-sm"
                />
              </div>
            </div>

            {/* Legal Gate Panel */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="legal-gate-checkbox"
                    name="legal-gate-checkbox"
                    type="checkbox"
                    checked={agreedToLegal}
                    onChange={(e) => setAgreedToLegal(e.target.checked)}
                    className="h-4.5 w-4.5 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded cursor-pointer"
                  />
                </div>
                <div className="ml-2.5 text-slate-600 leading-normal">
                  <label htmlFor="legal-gate-checkbox" className="font-medium cursor-pointer">
                    Tôi đã đọc và đồng ý với{' '}
                  </label>
                  <button
                    type="button"
                    onClick={() => onNavigate('terms')}
                    className="font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    Điều khoản sử dụng
                  </button>
                  <span> và </span>
                  <button
                    type="button"
                    onClick={() => onNavigate('privacy')}
                    className="font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    Chính sách bảo mật
                  </button>
                  <span> của Nhịp Giảng.</span>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={!agreedToLegal || isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-xs text-xs font-bold text-white transition-all ${
                  agreedToLegal && !isLoading
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 cursor-pointer shadow-md shadow-emerald-600/15'
                    : 'bg-slate-300 cursor-not-allowed text-slate-500'
                }`}
                id="btn-register-submit"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang xử lý đăng ký...
                  </div>
                ) : (
                  'Đăng ký ngay'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-200/80 pt-5 text-center">
            <span className="text-xs text-slate-500">Đã có tài khoản Nhịp Giảng? </span>
            <button
              onClick={() => onNavigate('login')}
              className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              Đăng nhập tại đây
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
