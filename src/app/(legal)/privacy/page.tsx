/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, ChevronLeft, Lock } from 'lucide-react';

interface PrivacyPageProps {
  onBack: () => void;
}

export default function PrivacyPage({ onBack }: PrivacyPageProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 font-sans text-slate-800 text-left" id="privacy-page-container">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-xs font-bold mb-8 cursor-pointer transition-colors"
        id="btn-privacy-back"
      >
        <ChevronLeft className="w-4 h-4" /> Quay lại
      </button>

      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-8 rounded-2xl mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
        <div className="space-y-1">
          <h1 className="font-display font-extrabold text-2xl text-slate-100 flex items-center gap-2.5">
            <ShieldCheck className="w-6.5 h-6.5 text-emerald-500" />
            Chính sách Bảo mật Nhịp Giảng
          </h1>
          <p className="text-xs text-slate-400">
            Cam kết an toàn thông tin, bảo mật dữ liệu giáo án và cô lập chủ sở hữu tuyệt đối.
          </p>
        </div>
        <span className="text-[10px] bg-slate-800 border border-slate-700 px-2.5 py-1 rounded font-bold font-mono">CẬP NHẬT: 2026</span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-10 shadow-3xs space-y-8" id="privacy-content">
        
        {/* Warning Block */}
        <div className="p-4 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs flex items-start gap-2.5">
          <Lock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-bold">Chính sách cô lập dữ liệu tuyệt đối (Owner Isolation Principle):</strong> 
            <p className="leading-relaxed">
              Nhịp Giảng áp dụng cơ chế phân mảnh và cô lập dữ liệu người dùng tối đa. Mọi thông tin kế hoạch giảng dạy được bảo vệ nghiêm ngặt trên trình duyệt máy khách, ngăn chặn rò rỉ hoặc truy cập chéo giữa các giáo viên khác nhau.
            </p>
          </div>
        </div>

        {/* Section 1 */}
        <div className="space-y-3">
          <h2 className="font-display font-extrabold text-slate-900 text-base flex items-center gap-2">
            <span className="w-1.5 h-4 bg-emerald-600 rounded-full"></span>
            1. Mục đích thu thập địa chỉ Email
          </h2>
          <p className="text-slate-650 text-xs sm:text-sm leading-relaxed">
            - Nhịp Giảng tiến hành thu thập địa chỉ email khi giáo viên đăng ký tài khoản hệ thống.
            <br />
            - Mục đích duy nhất của việc thu thập email là phục vụ quy trình xác thực, đăng nhập và bảo mật tài khoản cho chính giáo viên, đồng thời cá nhân hóa tên hiển thị trong giao diện làm việc số.
            <br />
            - Ngoài ra, chúng tôi có thể gửi các thông báo quan trọng liên quan đến nâng cấp chức năng hoặc điều chỉnh pháp lý bắt buộc liên quan đến Công văn 5512.
          </p>
        </div>

        {/* Section 2 */}
        <div className="space-y-3">
          <h2 className="font-display font-extrabold text-slate-900 text-base flex items-center gap-2">
            <span className="w-1.5 h-4 bg-emerald-600 rounded-full"></span>
            2. Cam kết bảo mật dữ liệu & Tuyệt đối không chia sẻ cho bên thứ ba
          </h2>
          <p className="text-slate-650 text-xs sm:text-sm leading-relaxed">
            - <strong>Không chia sẻ dữ liệu:</strong> Nhịp Giảng long trọng cam kết tuyệt đối không bao giờ chia sẻ, trao đổi, thương mại hóa hoặc cung cấp địa chỉ email hay thông tin cá nhân của người dùng cho bất kỳ tổ chức, cá nhân hoặc bên thứ ba nào vì mục đích quảng cáo hoặc tiếp thị.
            <br />
            - <strong>Không khai thác AI vô căn cứ:</strong> Hệ thống vận hành phi AI trong các phân hệ cốt lõi để đảm bảo không rò rỉ dữ liệu lên các máy chủ LLM nước ngoài hoặc huấn luyện các mô hình AI phi thực tế.
            <br />
            - <strong>Lưu trữ an toàn:</strong> Toàn bộ dữ liệu mật khẩu được mã hóa an toàn cục bộ. Giáo án cá nhân lưu tại Sandbox `localStorage` riêng tư bảo vệ nghiêm ngặt.
          </p>
        </div>

        {/* Section 3 */}
        <div className="space-y-3">
          <h2 className="font-display font-extrabold text-slate-900 text-base flex items-center gap-2">
            <span className="w-1.5 h-4 bg-emerald-600 rounded-full"></span>
            3. Quyền hạn của người dùng đối với dữ liệu
          </h2>
          <p className="text-slate-650 text-xs sm:text-sm leading-relaxed">
            - Người dùng có toàn quyền kiểm soát, rà soát, chỉnh sửa, nhân bản hoặc xóa bỏ toàn bộ lịch sử soạn giảng, dữ liệu bản nháp và thông tin cá nhân lưu trong hệ thống cục bộ bất cứ lúc nào.
            <br />
            - Khi người dùng xóa phiên làm việc hoặc dọn dẹp bộ nhớ cache trình duyệt, mọi bản ghi cũ sẽ lập tức bị hủy bỏ vĩnh viễn khỏi thiết bị để bảo mật tối đa.
          </p>
        </div>

      </div>
    </div>
  );
}
