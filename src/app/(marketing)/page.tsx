/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GraduationCap, BookOpen, Download, ShieldCheck, ArrowRight, CheckCircle } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: 'login' | 'register') => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans" id="marketing-landing-page">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 py-20 lg:py-32" id="hero-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left side text */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-150 text-emerald-800 text-xs font-semibold">
                <CheckCircle className="w-3.5 h-3.5" />
                Phiên bản an toàn phi thương mại
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-slate-900 tracking-tight leading-none">
                Nhịp Giảng
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl font-normal">
                Nền tảng soạn giáo án, quản lý học liệu và xuất Word/PDF chuyên nghiệp dành cho giáo viên Việt Nam.
              </p>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
                <button
                  onClick={() => onNavigate('login')}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-600/15 hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                  id="cta-start-now"
                >
                  Bắt đầu soạn bài ngay
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="px-8 py-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-all cursor-pointer border border-slate-250 flex items-center justify-center"
                >
                  Đăng ký tài khoản mới
                </button>
              </div>

              {/* No AI Disclaimer Banner */}
              <div className="p-4 bg-amber-50 text-amber-900 border border-amber-200 rounded-2xl text-xs max-w-xl">
                <p className="leading-relaxed font-medium">
                  <strong>Cam kết Quy tắc Sư phạm:</strong> Nhịp Giảng vận hành hoàn toàn dựa trên cấu trúc quy định thuần túy của Bộ GD&ĐT Việt Nam (Công văn 5512), không sử dụng công nghệ tạo văn bản AI tự phát sinh kiến thức, đảm bảo giáo án tuyệt đối không bị ảo giác nội dung.
                </p>
              </div>
            </div>

            {/* Right side graphical showcase */}
            <div className="lg:col-span-5 relative" id="hero-showcase">
              <div className="aspect-square bg-slate-100 rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900">Bài 1: Công nghệ và đời sống</h4>
                      <p className="text-[10px] text-slate-500 font-bold font-mono">Công văn 5512 • Khung Lớp 3</p>
                    </div>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-bold font-mono">KHUNG BÀI SOẠN</span>
                </div>

                <div className="space-y-3 flex-1 py-4 text-left">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Yêu cầu cần đạt (Môn Công nghệ)</span>
                    <div className="h-2 bg-slate-200 rounded-full w-4/5"></div>
                    <div className="h-2 bg-slate-200 rounded-full w-2/3"></div>
                  </div>
                  <div className="space-y-1 pt-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Hoạt động tiến trình dạy học</span>
                    <div className="flex gap-2 items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <div className="h-2 bg-slate-200 rounded-full w-1/2"></div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <div className="h-2 bg-slate-200 rounded-full w-2/3"></div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200/80 pt-4 flex justify-between items-center text-xs text-slate-500">
                  <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5 text-emerald-600" /> Môn Công nghệ</span>
                  <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5 text-emerald-600" /> Xuất Word (.docx)</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section className="py-16 bg-slate-50" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
              Tính năng cốt lõi cho soạn giảng an toàn
            </h2>
            <p className="text-sm text-slate-600">
              Mọi công cụ được thiết kế phục vụ tối đa hiệu suất làm việc hàng ngày của giáo viên Việt Nam, cam kết tính chuẩn xác và bảo mật.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs hover:shadow-xs transition-shadow flex flex-col justify-between text-left">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900">Ma trận tương thích Công nghệ</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Thiết lập tự động bài học theo phân môn Công nghệ và mạch kiến thức phân phối của Chương trình GDPT 2018.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs hover:shadow-xs transition-shadow flex flex-col justify-between text-left">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Download className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900">Xuất tài liệu Word / PDF chuẩn</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Xuất dữ liệu giáo án trực tiếp ra định dạng Microsoft Word (.docx) đúng theo tiêu chuẩn trình bày văn bản hành chính Việt Nam.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs hover:shadow-xs transition-shadow flex flex-col justify-between text-left">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900">Mã hóa & Cô lập chủ sở hữu</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tuân thủ nghiêm ngặt nguyên lý Owner Isolation. Dữ liệu bài soạn của bạn được lưu trữ hoàn toàn cô lập, an toàn tại thiết bị của bạn.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
