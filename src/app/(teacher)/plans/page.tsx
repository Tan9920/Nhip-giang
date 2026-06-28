/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, Check, Sparkles, ArrowLeft, Zap, Star } from 'lucide-react';
import { getCurrentSession, setCurrentSession } from '../../../lib/auth/authService';
import { upgradeToProEarly } from '../../../lib/quota/usageLedger';

interface PlansPageProps {
  onBack: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function PlansPage({ onBack, showToast }: PlansPageProps) {
  const currentUser = getCurrentSession();
  const [currentPlan, setCurrentPlan] = useState<string>(() => {
    return currentUser?.planType || 'free';
  });

  const handleUpgrade = () => {
    if (!currentUser) {
      showToast('Vui lòng đăng nhập để nâng cấp tài khoản!', 'error');
      return;
    }

    if (currentPlan === 'pro_early') {
      showToast('Tài khoản của thầy/cô đã ở gói Pro Early rồi!', 'info');
      return;
    }

    const success = upgradeToProEarly(currentUser.userId);
    if (success) {
      setCurrentPlan('pro_early');
      showToast('Chúc mừng thầy/cô đã kích hoạt thành công gói trải nghiệm sớm Pro Early!', 'success');
      // Delay slightly and go back
      setTimeout(() => {
        onBack();
      }, 1500);
    } else {
      showToast('Nâng cấp thất bại, vui lòng thử lại!', 'error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in py-4" id="plans-comparison-container">
      {/* Back navigation */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer bg-white border border-slate-200 px-4 py-2.5 rounded-full shadow-3xs"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại Không gian làm việc
      </button>

      {/* Header section */}
      <div className="text-center space-y-2.5 max-w-2xl mx-auto">
        <span className="px-3.5 py-1 text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200/50 rounded-full font-bold uppercase tracking-widest inline-flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 fill-emerald-500 text-emerald-600" />
          Nâng Tầm Giáo Án Công Nghệ
        </span>
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
          Chọn Gói Hội Viên Phù Hợp
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          Đảm bảo đầy đủ điều kiện sư phạm, tối ưu hóa thời gian soạn bài theo Công văn 5512 cùng hệ thống Nhịp Giảng.
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch pt-4">
        {/* FREE PLAN CARD */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-3xs flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-xs">
          {currentPlan === 'free' && (
            <div className="absolute top-4 right-4 bg-slate-100 text-slate-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Gói hiện tại
            </div>
          )}
          
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hội viên</span>
              <h3 className="font-display font-extrabold text-2xl text-slate-800">Cơ bản (Free)</h3>
              <p className="text-xs text-slate-500 font-medium">
                Dành cho giáo viên trải nghiệm soạn bài cơ bản và định hướng cấu trúc.
              </p>
            </div>

            <div className="flex items-baseline gap-1 py-2">
              <span className="text-3xl font-extrabold text-slate-900">0đ</span>
              <span className="text-xs text-slate-400 font-medium">/ vĩnh viễn</span>
            </div>

            {/* Features */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Quyền lợi bao gồm:</p>
              
              <div className="flex items-start gap-3 text-xs text-slate-600">
                <Check className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>Khởi tạo và chỉnh sửa đầy đủ 8 phần kế hoạch bài dạy</span>
              </div>
              
              <div className="flex items-start gap-3 text-xs text-slate-600">
                <Check className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>Tự động kiểm định và thông báo tương thích ma trận Công nghệ</span>
              </div>
              
              <div className="flex items-start gap-3 text-xs text-slate-600">
                <Check className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span className="text-slate-500 line-through">Xuất bản hồ sơ sạch đẹp 100% (Không đóng dấu watermark)</span>
              </div>
              
              <div className="flex items-start gap-3 text-xs text-slate-600">
                <Check className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span className="font-semibold text-slate-800">Giới hạn xuất bản tối đa 3 lượt / tuần</span>
              </div>
              
              <div className="flex items-start gap-3 text-xs text-slate-500 italic">
                <Check className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>Xuất file Word tự động đóng dấu tác quyền miễn phí ở chân trang</span>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <button
              disabled={currentPlan === 'free'}
              className="w-full py-3.5 rounded-2xl font-bold text-xs transition-all border border-slate-200 text-slate-500 bg-slate-50/50"
            >
              {currentPlan === 'free' ? 'Đang sử dụng gói này' : 'Gói miễn phí'}
            </button>
          </div>
        </div>

        {/* PRO EARLY PLAN CARD */}
        <div className="bg-white rounded-3xl border-2 border-emerald-500 p-8 shadow-md flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-lg">
          <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-extrabold px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-white text-emerald-500" /> RECOMMENDED
          </div>
          
          {currentPlan === 'pro_early' && (
            <div className="absolute top-4 left-4 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-200">
              Gói hiện tại
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Hội viên đặc quyền</span>
                <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-100">Ưu Đãi Sớm</span>
              </div>
              <h3 className="font-display font-extrabold text-2xl text-slate-900 flex items-center gap-2">
                Pro Early (Trải nghiệm sớm)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Dành cho giáo viên chuyên nghiệp cần xuất bản hồ sơ sạch đẹp nộp Tổ bộ môn & Nhà trường.
              </p>
            </div>

            <div className="flex items-baseline gap-1 py-2">
              <span className="text-3xl font-extrabold text-emerald-600">0đ</span>
              <span className="text-xs text-emerald-500 font-bold bg-emerald-50 px-2 py-0.5 rounded ml-1.5 uppercase">Tài trợ Thử nghiệm</span>
            </div>

            {/* Features */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <p className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-2">Quyền lợi đặc quyền:</p>
              
              <div className="flex items-start gap-3 text-xs text-slate-800">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Không giới hạn tính năng soạn giảng & thiết lập lớp học</span>
              </div>
              
              <div className="flex items-start gap-3 text-xs text-slate-800">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Quản lý lịch sử phiên bản giáo án cũ & sao lưu đám mây</span>
              </div>
              
              <div className="flex items-start gap-3 text-xs text-slate-800">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-bold text-emerald-900 bg-emerald-50/70 px-1.5 py-0.5 rounded">Xuất bản giáo án SẠCH ĐẸP 100% (Không logo watermark)</span>
              </div>
              
              <div className="flex items-start gap-3 text-xs text-slate-800">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-bold text-emerald-900">Hạn ngạch cực lớn: 50 lượt tải file / tuần</span>
              </div>
              
              <div className="flex items-start gap-3 text-xs text-slate-800">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Ưu tiên cập nhật bài soạn mẫu & Ma trận tích hợp mới nhất</span>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <button
              onClick={handleUpgrade}
              disabled={currentPlan === 'pro_early'}
              className={`w-full py-3.5 rounded-2xl font-bold text-xs transition-all shadow-md cursor-pointer ${
                currentPlan === 'pro_early'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/10 hover:shadow-lg hover:scale-[1.01]'
              }`}
            >
              {currentPlan === 'pro_early' ? '✓ Đã kích hoạt Pro Early thành công' : 'Trải nghiệm Pro Early miễn phí ngay'}
            </button>
          </div>
        </div>
      </div>

      {/* Feature comparison table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-3xs space-y-5">
        <h4 className="font-display font-bold text-slate-800 text-base">Bảng so sánh quyền lợi chi tiết</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4 w-1/2">Tính năng hệ thống</th>
                <th className="py-3 px-4 w-1/4">Gói Cơ bản (Free)</th>
                <th className="py-3 px-4 w-1/4 text-emerald-700">Gói Pro Early</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-800">Soạn giảng chuẩn Công văn 5512</td>
                <td className="py-3.5 px-4">Đầy đủ 8 phần</td>
                <td className="py-3.5 px-4 text-emerald-700">Đầy đủ 8 phần</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-800">Ma trận tương thích môn Công nghệ</td>
                <td className="py-3.5 px-4">Tự động đối chiếu</td>
                <td className="py-3.5 px-4 text-emerald-700">Tự động đối chiếu</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-800">Hạn ngạch xuất Word (.doc) hàng tuần</td>
                <td className="py-3.5 px-4 font-mono font-bold">3 lượt / tuần</td>
                <td className="py-3.5 px-4 text-emerald-700 font-mono font-bold">50 lượt / tuần</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-800">Đóng dấu Watermark ở chân trang</td>
                <td className="py-3.5 px-4 text-rose-500 font-semibold">Có đóng dấu watermark</td>
                <td className="py-3.5 px-4 text-emerald-700 font-bold">KHÔNG ĐÓNG DẤU (Sạch 100%)</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-800">Sao lưu & Quản lý phiên bản</td>
                <td className="py-3.5 px-4">Chỉ bản nháp hiện tại</td>
                <td className="py-3.5 px-4 text-emerald-700">Lưu nhiều phiên bản lịch sử</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-800">Quản lý lịch sử tải xuống (Sổ cái)</td>
                <td className="py-3.5 px-4">Không hỗ trợ</td>
                <td className="py-3.5 px-4 text-emerald-700">Sổ cái chi tiết, chống lỗi tải</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
