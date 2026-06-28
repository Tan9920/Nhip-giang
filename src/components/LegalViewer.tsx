/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, BookOpen, AlertTriangle, FileText, Check } from 'lucide-react';

export default function LegalViewer() {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden" id="legal-viewer-container">
      {/* Banner đầu trang */}
      <div className="bg-slate-900 text-white p-6">
        <h3 className="font-display font-semibold text-lg text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          Cổng Pháp Lý Giáo Dục - Nhịp Giảng
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Hệ thống lưu trữ chính sách pháp lý, quy chế sử dụng học liệu số và cam kết bảo vệ dữ liệu giáo viên.
        </p>
      </div>

      {/* Tabs chọn tài liệu */}
      <div className="flex border-b border-slate-200 bg-slate-50">
        <button
          onClick={() => setActiveTab('terms')}
          className={`px-5 py-3 text-xs font-semibold border-b-2 transition-all block ${
            activeTab === 'terms'
              ? 'border-emerald-600 text-emerald-800 bg-white font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Điều khoản Sử dụng (Terms of Use)
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`px-5 py-3 text-xs font-semibold border-b-2 transition-all block ${
            activeTab === 'privacy'
              ? 'border-emerald-600 text-emerald-800 bg-white font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Chính sách Bảo mật (Privacy Policy)
        </button>
      </div>

      {/* Nội dung tài liệu */}
      <div className="p-6 max-w-4xl mx-auto space-y-6 text-slate-800 text-sm leading-relaxed" id="legal-content-container">
        {activeTab === 'terms' ? (
          <div className="space-y-4">
            <h4 className="font-display font-bold text-slate-900 text-base flex items-center gap-2 pb-2 border-b border-slate-100">
              <FileText className="w-5 h-5 text-emerald-600" />
              ĐIỀU KHOẢN SỬ DỤNG HỆ THỐNG (MÔN CÔNG NGHỆ CHUẨN)
            </h4>
            
            <div className="p-3.5 bg-yellow-50 text-yellow-900 border border-yellow-200 rounded-lg text-xs flex items-start gap-2">
              <AlertTriangle className="w-4.5 h-4.5 text-yellow-600 shrink-0 mt-0.5" />
              <div>
                <strong>Cảnh báo thuật ngữ pháp lý bắt buộc:</strong> 
                Môn học chính thức theo chương trình giáo dục phổ thông mới của Bộ GD&ĐT Việt Nam bắt buộc sử dụng đúng tên gọi chính thức là <strong>"Công nghệ"</strong>. Tuyệt đối không dùng từ "Kĩ thuật" thay thế cho tên môn học. Cụm từ "kĩ thuật dạy học" chỉ được dùng khi mô tả kỹ năng sư phạm.
              </div>
            </div>

            <div className="space-y-3 pl-1">
              <div>
                <h5 className="font-semibold text-slate-900 text-sm">1. Tuân Thủ Quy Định Sư Phạm</h5>
                <p className="text-slate-600 text-xs mt-1">
                  Nhịp Giảng hướng tới mô phỏng cấu trúc kế hoạch bài dạy chuẩn hóa theo Công văn 5512/BGDĐT-GDTrH. Giáo viên sử dụng nền tảng phải tự chịu trách nhiệm về tính sư phạm và độ chính xác của học liệu thực hành giảng dạy trên lớp.
                </p>
              </div>

              <div>
                <h5 className="font-semibold text-slate-900 text-sm">2. Quyền Tác Giả & Sở Hữu Trí Tuệ</h5>
                <p className="text-slate-600 text-xs mt-1">
                  Giáo án tự soạn trên máy khách thuộc quyền tác giả riêng tư của giáo viên đó. Nền tảng Nhịp Giảng cấp phép sử dụng miễn phí các giáo án khung hệ thống (gắn nhãn <code>seed</code> hoặc <code>scaffold</code>) phục vụ mục đích phi thương mại.
                </p>
              </div>

              <div>
                <h5 className="font-semibold text-slate-900 text-sm">3. Miễn Trừ Trách Nhiệm</h5>
                <p className="text-slate-600 text-xs mt-1">
                  Mọi tài liệu cung cấp sẵn trên hệ thống chỉ mang tính chất tham khảo chuẩn khung. Chúng tôi không can thiệp, không chịu trách nhiệm đối với bất kỳ tranh chấp tác quyền hoặc sai lỗi kiến thức phát sinh trong tiết học thực tế.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h4 className="font-display font-bold text-slate-900 text-base flex items-center gap-2 pb-2 border-b border-slate-100">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              CHÍNH SÁCH BẢO MẬT & CÔ LẬP CHỦ SỞ HỮU (OWNER ISOLATION)
            </h4>

            <div className="p-3.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg text-xs flex items-start gap-2">
              <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>Tiêu chuẩn P0 - Cô lập dữ liệu tuyệt đối:</strong> 
                Nhịp Giảng áp dụng cơ chế <strong>Owner Isolation (Cô lập Chủ sở hữu)</strong>. Toàn bộ dữ liệu bài soạn của bạn được lưu trữ cô lập ở cấp độ trình duyệt của máy khách, đảm bảo tài khoản khác không thể truy cập trái phép.
              </div>
            </div>

            <div className="space-y-3 pl-1">
              <div>
                <h5 className="font-semibold text-slate-900 text-sm">1. Thu Thập Dữ Liệu</h5>
                <p className="text-slate-600 text-xs mt-1">
                  Chúng tôi chỉ lưu trữ thông tin giáo án (8 phần), tên lớp, môn học Công nghệ và phân phối lịch học tại bộ nhớ trình duyệt (localStorage). Không tiến hành tải ngầm hoặc phân tích dữ liệu ngoài mục đích biên soạn của người dùng.
                </p>
              </div>

              <div>
                <h5 className="font-semibold text-slate-900 text-sm">2. Cam Kết Không Có Sự Can Thiệp Của AI Ngoài Tầm Kiểm Soát</h5>
                <p className="text-slate-600 text-xs mt-1">
                  Trong giai đoạn khởi tạo, Nhịp Giảng hoạt động hoàn toàn bằng rule-based engine tĩnh và template chuẩn Việt Nam. Không có việc truyền thông tin giáo án của thầy cô lên các mô hình ngôn ngữ lớn hay máy chủ trung gian để huấn luyện AI.
                </p>
              </div>

              <div>
                <h5 className="font-semibold text-slate-900 text-sm">3. Quyền Yêu Cầu Xóa Dữ Liệu</h5>
                <p className="text-slate-600 text-xs mt-1">
                  Người dùng có quyền xóa bỏ toàn bộ dữ liệu lưu trữ tại máy bất cứ lúc nào thông qua chức năng dọn dẹp trình duyệt hoặc lệnh dọn dẹp tích hợp sẵn trong hệ thống.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
