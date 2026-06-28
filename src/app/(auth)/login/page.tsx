/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GraduationCap, AlertCircle, Info } from 'lucide-react';
import { loginUser } from '../../../lib/auth/authService';

interface LoginPageProps {
  onNavigate: (view: 'register' | 'landing') => void;
  onLoginSuccess: (user: any) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function LoginPage({ onNavigate, onLoginSuccess, showToast }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !email.includes('@')) {
      showToast('Vui lòng nhập Email hợp lệ!', 'error');
      return;
    }
    if (!password) {
      showToast('Vui lòng nhập Mật khẩu!', 'error');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = loginUser(email, password);
      setIsLoading(false);

      if (res.success && res.user) {
        showToast(res.message, 'success');
        onLoginSuccess(res.user);
      } else {
        showToast(res.message || 'Đăng nhập thất bại!', 'error');
      }
    }, 700);
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans" id="login-page-container">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center cursor-pointer" onClick={() => onNavigate('landing')}>
          <div className="bg-gradient-to-tr from-emerald-600 to-teal-500 text-white p-3 rounded-2xl flex items-center justify-center shadow-sm">
            <GraduationCap className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-display font-extrabold text-slate-900 tracking-tight">
          Đăng nhập Nhịp Giảng
        </h2>
        <p className="mt-2 text-center text-xs text-slate-500 font-medium">
          Truy cập hệ sinh thái soạn giảng và kiểm duyệt giáo án Công văn 5512.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md" id="login-card">
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-200/80 rounded-2xl sm:px-10">
          
          <div className="p-3 bg-blue-50 text-blue-900 border border-blue-200 rounded-xl text-xs flex items-start gap-2 mb-5">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-950">Mẹo kiểm tra nhanh tài khoản hệ thống:</p>
              <ul className="list-disc list-inside mt-0.5 text-[11px] space-y-0.5 text-blue-900/90">
                <li>Giáo viên A: <span className="font-mono bg-white px-1 py-0.5 rounded border border-blue-150">gv_a@nhipgiang.edu.vn</span> (mật khẩu bất kỳ)</li>
                <li>Giáo viên B: <span className="font-mono bg-white px-1 py-0.5 rounded border border-blue-150">gv_b@nhipgiang.edu.vn</span> (mật khẩu bất kỳ)</li>
                <li>Admin: <span className="font-mono bg-white px-1 py-0.5 rounded border border-blue-150">admin@nhipgiang.edu.vn</span> (mật khẩu bất kỳ)</li>
              </ul>
            </div>
          </div>

          <form className="space-y-5 text-left" onSubmit={handleSubmit}>
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
                Mật khẩu
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
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-xs text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 transition-all cursor-pointer shadow-md shadow-emerald-600/15"
                id="btn-login-submit"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang đăng nhập...
                  </div>
                ) : (
                  'Đăng nhập'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-200/80 pt-5 text-center">
            <span className="text-xs text-slate-500">Chưa có tài khoản Nhịp Giảng? </span>
            <button
              onClick={() => onNavigate('register')}
              className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              Đăng ký ngay tại đây
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
