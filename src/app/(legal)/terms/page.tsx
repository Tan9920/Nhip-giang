/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Scale, FileText, ChevronLeft, AlertTriangle } from 'lucide-react';

interface TermsPageProps {
  onBack: () => void;
}

export default function TermsPage({ onBack }: TermsPageProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 font-sans text-slate-800 text-left" id="terms-page-container">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-xs font-bold mb-8 cursor-pointer transition-colors"
        id="btn-terms-back"
      >
        <ChevronLeft className="w-4 h-4" /> Quay lại
      </button>

      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-8 rounded-2xl mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
        <div className="space-y-1">
          <h1 className="font-display font-extrabold text-2xl text-slate-100 flex items-center gap-2.5">
            <Scale className="w-6.5 h-6.5 text-emerald-500" />
            Điều khoản Sử dụng Nhịp Giảng
          </h1>
          <p className="text-xs text-slate-400">
            Quy định pháp lý, tác quyền giáo án và quy chế sử dụng học liệu số Việt Nam.
          </p>
        </div>
        <span className="text-[10px] bg-slate-800 border border-slate-700 px-2.5 py-1 rounded font-bold font-mono">CẬP NHẬT: 2026</span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-10 shadow-3xs space-y-8" id="terms-content">
        
        {/* Warning Block */}
        <div className="p-4 bg-yellow-50 text-yellow-900 border border-yellow-200 rounded-xl text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-bold">Cảnh báo pháp lý bắt buộc về thuật ngữ môn học:</strong> 
            <p className="leading-relaxed">
              Môn học chính thức theo chương trình giáo dục phổ thông mới của Bộ GD&ĐT Việt Nam bắt buộc sử dụng đúng tên gọi chính thức là <strong>"Công nghệ"</strong>. Tuyệt đối không dùng từ "Kĩ thuật" thay thế cho tên môn học. Cụm từ "kĩ thuật dạy học" chỉ được dùng khi mô tả kỹ năng, phương pháp sư phạm.
            </p>
          </div>
        </div>

        {/* Section 1 */}
        <div className="space-y-3">
          <h2 className="font-display font-extrabold text-slate-900 text-base flex items-center gap-2">
            <span className="w-1.5 h-4 bg-emerald-600 rounded-full"></span>
            1. Quyền nghĩa vụ tác quyền giáo án (Copyright & Ownership)
          </h2>
          <p className="text-slate-650 text-xs sm:text-sm leading-relaxed">
            - Mọi kế hoạch bài dạy (giáo án), phân phối chương trình, câu hỏi ôn tập do người dùng trực tiếp soạn thảo trên thiết bị khách bằng Nhịp Giảng hoàn toàn thuộc quyền sở hữu trí tuệ và tác quyền cá nhân của chính giáo viên đó.
            <br />
            - Nhịp Giảng cam kết không thu thập bản quyền tác giả hoặc tuyên bố bất kỳ quyền sở hữu nào đối với nội dung tự tạo này của thầy cô.
            <br />
            - Đối với các tài liệu mẫu hệ thống mang nhãn <code>seed</code> hoặc <code>scaffold</code>, hệ thống cấp giấy phép sử dụng phi thương mại, phi độc quyền cho giáo viên Việt Nam phục vụ mục đích giảng dạy và học tập thực tế.
          </p>
        </div>

        {/* Section 2 */}
        <div className="space-y-3">
          <h2 className="font-display font-extrabold text-slate-900 text-base flex items-center gap-2">
            <span className="w-1.5 h-4 bg-emerald-600 rounded-full"></span>
            2. Giới hạn trách nhiệm dữ liệu tham khảo (Disclaimer)
          </h2>
          <p className="text-slate-650 text-xs sm:text-sm leading-relaxed">
            - Toàn bộ dữ liệu gợi ý, phân phối chương trình môn Công nghệ, và ma trận tương thích được xây dựng dựa trên thông tư và các hướng dẫn hiện hành của Bộ GD&ĐT chỉ với mục đích tham khảo.
            <br />
            - Người dùng tự chịu trách nhiệm hoàn toàn về tính chính xác, tính sư phạm cũng như độ an toàn của tài liệu khi đem vào ứng dụng thực tế tại lớp học.
            <br />
            - Nhịp Giảng được miễn trừ 100% trách nhiệm pháp lý đối với bất kỳ thiệt hại trực tiếp hoặc gián tiếp nào phát sinh từ các lỗi kiến thức, tranh chấp bản quyền tác giả ngoài đời thực hoặc các điều chỉnh phân phối chương trình của địa phương.
          </p>
        </div>

        {/* Section 3 */}
        <div className="space-y-3">
          <h2 className="font-display font-extrabold text-slate-900 text-base flex items-center gap-2">
            <span className="w-1.5 h-4 bg-emerald-600 rounded-full"></span>
            3. Trách nhiệm người dùng
          </h2>
          <p className="text-slate-650 text-xs sm:text-sm leading-relaxed">
            - Không được sử dụng Nhịp Giảng để phát tán, lưu trữ hoặc tạo ra các văn bản mang tính chất kích động, bạo lực, vi phạm thuần phong mỹ tục hoặc vi phạm hiến pháp pháp luật nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.
            <br />
            - Không sử dụng các công cụ can thiệp phá hoại cấu trúc an toàn, bảo vệ dữ liệu của máy chủ hoặc máy khách khác.
          </p>
        </div>

      </div>
    </div>
  );
}
