/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LessonPlan, DataStatusLabels } from '../types';

export function exportLessonToWord(plan: LessonPlan, planType: 'free' | 'pro_early' = 'free'): void {
  const dataStatusInfo = DataStatusLabels[plan.status];
  
  const content = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>${plan.title}</title>
      <style>
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 12pt;
          line-height: 1.5;
          color: #000000;
        }
        .header-table {
          width: 100%;
          border: none;
          margin-bottom: 20px;
        }
        .header-left {
          text-align: center;
          font-size: 11pt;
          width: 45%;
        }
        .header-right {
          text-align: center;
          font-size: 11pt;
          font-weight: bold;
          width: 55%;
        }
        .app-branding {
          color: #16a34a;
          font-weight: bold;
          font-size: 10pt;
          text-align: left;
          margin-bottom: 15px;
          border-bottom: 1px solid #16a34a;
          padding-bottom: 5px;
        }
        .warning-banner {
          background-color: #fef08a;
          border: 1px solid #eab308;
          color: #854d0e;
          padding: 10px;
          margin-bottom: 20px;
          font-size: 10pt;
          font-style: italic;
          text-align: center;
          font-weight: bold;
        }
        .metadata-section {
          border: 1px solid #cbd5e1;
          padding: 10px;
          margin-bottom: 25px;
          background-color: #f8fafc;
          font-size: 10pt;
        }
        h1 {
          font-size: 16pt;
          text-align: center;
          font-weight: bold;
          margin-top: 10px;
          margin-bottom: 5px;
          text-transform: uppercase;
        }
        h2 {
          font-size: 13pt;
          font-weight: bold;
          margin-top: 20px;
          margin-bottom: 8px;
          border-bottom: 1px solid #000000;
          padding-bottom: 2px;
        }
        h3 {
          font-size: 12pt;
          font-weight: bold;
          margin-top: 12px;
          margin-bottom: 5px;
          font-style: italic;
        }
        .section-content {
          margin-left: 20px;
          margin-bottom: 15px;
          text-align: justify;
          white-space: pre-line;
        }
        .activity-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          margin-bottom: 15px;
        }
        .activity-table th, .activity-table td {
          border: 1px solid #000000;
          padding: 6px;
          font-size: 11pt;
          vertical-align: top;
        }
        .activity-table th {
          background-color: #f3f4f6;
          font-weight: bold;
          text-align: center;
        }
        .footer-disclaimer {
          margin-top: 40px;
          border-top: 2px solid #16a34a;
          padding-top: 10px;
          font-size: 9pt;
          color: #475569;
          text-align: center;
        }
        .watermark-free {
          margin-top: 20px;
          border: 1px dashed #ef4444;
          background-color: #fef2f2;
          padding: 10px;
          font-size: 10pt;
          color: #b91c1c;
          text-align: center;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <!-- Nhãn thương hiệu số Nhịp Giảng -->
      <div class="app-branding">
        NHỊP GIẢNG – KHÔNG GIAN LÀM VIỆC SỐ DÀNH CHO GIÁO VIÊN | www.nhipgiang.vn
      </div>

      <!-- Cảnh báo mềm cố định theo yêu cầu pháp lý giáo dục -->
      <div class="warning-banner">
        CẢNH BÁO PHÁP LÝ: Nội dung này là dữ liệu mẫu/tham khảo, giáo viên cần kiểm tra trước khi dùng chính thức.
      </div>

      <!-- Khung tiêu đề Bộ Giáo Dục & Đào Tạo theo đúng quốc thư Việt Nam -->
      <table class="header-table">
        <tr>
          <td class="header-left">
            TRƯỜNG: ...........................................<br>
            TỔ BỘ MÔN: .......................................
          </td>
          <td class="header-right">
            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM<br>
            Độc lập - Tự do - Hạnh phúc<br>
            -------------------------------------
          </td>
        </tr>
      </table>

      <!-- Nhãn trạng thái và thuộc tính hệ thống -->
      <div class="metadata-section">
        <strong>THÔNG TIN HỆ THỐNG NHỊP GIẢNG:</strong><br>
        • Trạng thái dữ liệu hệ thống: <strong>${dataStatusInfo.label.toUpperCase()}</strong> (${dataStatusInfo.desc})<br>
        • Loại hình bài dạy: ${plan.classification === 'official_lesson' ? 'Bài học chính thức' : 'Chuyên đề / Hoạt động bổ trợ'}<br>
        • Mã định danh bài soạn: ${plan.id}<br>
        • Tuân thủ cách gọi môn học: <strong>MÔN CÔNG NGHỆ</strong> (Chương trình GDPT 2018)<br>
        • Cơ chế bảo mật: Đã cô lập quyền truy cập tài khoản (Owner Isolation) - Mã số giáo viên: ${plan.ownerId}
      </div>

      <h1>KẾ HOẠCH BÀI DẠY (GIÁO ÁN)</h1>
      <div style="text-align: center; font-size: 12pt; font-weight: bold; margin-bottom: 25px;">
        MÔN HỌC: ${plan.part1.subjectName.toUpperCase()} - Khối lớp: ${plan.grade}<br>
        TÊN BÀI DẠY: ${plan.part1.lessonTitle}<br>
        Thời lượng thực hiện: ${plan.part1.duration}
      </div>

      <!-- I. THÔNG TIN CHUNG -->
      <h2>I. THÔNG TIN CHUNG</h2>
      <div class="section-content">
        • <strong>Tên lớp học áp dụng:</strong> ${plan.part1.className}<br>
        • <strong>Tên môn học chuẩn chương trình mới:</strong> ${plan.part1.subjectName}<br>
        • <strong>Tiêu đề bài học:</strong> ${plan.part1.lessonTitle}<br>
        • <strong>Thời lượng:</strong> ${plan.part1.duration}
      </div>

      <!-- II. YÊU CẦU CẦN ĐẠT -->
      <h2>II. YÊU CẦU CẦN ĐẠT</h2>
      <div class="section-content">
        <strong>1. Kiến thức, kĩ năng:</strong><br>
        ${plan.part2.knowledgeAndSkills.replace(/\n/g, '<br>')}
        <br><br>
        <strong>2. Năng lực chung:</strong><br>
        ${plan.part2.generalCapacity.replace(/\n/g, '<br>')}
        <br><br>
        <strong>3. Năng lực đặc thù:</strong><br>
        ${plan.part2.specificCapacity.replace(/\n/g, '<br>')}
        <br><br>
        <strong>4. Phẩm chất:</strong><br>
        ${plan.part2.qualities.replace(/\n/g, '<br>')}
        <br><br>
        <strong>5. Minh chứng đánh giá:</strong><br>
        ${plan.part2.evaluationEvidence.replace(/\n/g, '<br>')}
      </div>

      <!-- III. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU -->
      <h2>III. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU</h2>
      <div class="section-content">
        • <strong>Thiết bị và học liệu dành cho Giáo viên:</strong><br>
        ${plan.part3.teacherEquipment.replace(/\n/g, '<br>')}
        <br><br>
        • <strong>Thiết bị và học liệu dành cho Học sinh:</strong><br>
        ${plan.part3.studentEquipment.replace(/\n/g, '<br>')}
        <br><br>
        • <strong>Nguồn học liệu (Bắt buộc):</strong> ${plan.part3.sources}<br>
        • <strong>Giấy phép bản quyền / License:</strong> ${plan.part3.copyrightLicense}
      </div>

      <!-- IV. PHƯƠNG PHÁP VÀ KĨ THUẬT DẠY HỌC -->
      <h2>IV. PHƯƠNG PHÁP VÀ KĨ THUẬT DẠY HỌC</h2>
      <div class="section-content">
        • <strong>Phương pháp dạy học chủ đạo:</strong> ${plan.part4.methods}<br>
        • <strong>Kĩ thuật dạy học sư phạm:</strong> ${plan.part4.techniques}
      </div>

      <!-- V. TIẾN TRÌNH DẠY HỌC -->
      <h2>V. TIẾN TRÌNH DẠY HỌC</h2>
      <div class="section-content">
        Mô tả tiến trình dạy học gồm 4 hoạt động bắt buộc, chia nhỏ theo cấu trúc 4 bước (Chuyển giao -> Thực hiện -> Báo cáo -> Kết luận):
      </div>

      <!-- Hoạt động 1 -->
      <h3>1. Hoạt động 1: Khởi động (Mở đầu / Xác định nhiệm vụ)</h3>
      <table class="activity-table">
        <tr>
          <th style="width: 20%;">Mục tiêu</th>
          <td style="width: 80%;">${plan.part5.warmup.target}</td>
        </tr>
        <tr>
          <th>Nội dung</th>
          <td>${plan.part5.warmup.content}</td>
        </tr>
        <tr>
          <th>Sản phẩm</th>
          <td>${plan.part5.warmup.product}</td>
        </tr>
        <tr>
          <th>Tổ chức thực hiện</th>
          <td>
            • <strong>Chuyển giao nhiệm vụ:</strong> ${plan.part5.warmup.execution.transfer}<br>
            • <strong>Thực hiện nhiệm vụ:</strong> ${plan.part5.warmup.execution.perform}<br>
            • <strong>Báo cáo, thảo luận:</strong> ${plan.part5.warmup.execution.report}<br>
            • <strong>Kết luận, nhận định:</strong> ${plan.part5.warmup.execution.conclude}
          </td>
        </tr>
      </table>

      <!-- Hoạt động 2 -->
      <h3>2. Hoạt động 2: Hình thành kiến thức mới (Giải quyết nhiệm vụ)</h3>
      <table class="activity-table">
        <tr>
          <th style="width: 20%;">Mục tiêu</th>
          <td style="width: 80%;">${plan.part5.exploration.target}</td>
        </tr>
        <tr>
          <th>Nội dung</th>
          <td>${plan.part5.exploration.content}</td>
        </tr>
        <tr>
          <th>Sản phẩm</th>
          <td>${plan.part5.exploration.product}</td>
        </tr>
        <tr>
          <th>Tổ chức thực hiện</th>
          <td>
            • <strong>Chuyển giao nhiệm vụ:</strong> ${plan.part5.exploration.execution.transfer}<br>
            • <strong>Thực hiện nhiệm vụ:</strong> ${plan.part5.exploration.execution.perform}<br>
            • <strong>Báo cáo, thảo luận:</strong> ${plan.part5.exploration.execution.report}<br>
            • <strong>Kết luận, nhận định:</strong> ${plan.part5.exploration.execution.conclude}
          </td>
        </tr>
      </table>

      <!-- Hoạt động 3 -->
      <h3>3. Hoạt động 3: Luyện tập</h3>
      <table class="activity-table">
        <tr>
          <th style="width: 20%;">Mục tiêu</th>
          <td style="width: 80%;">${plan.part5.practice.target}</td>
        </tr>
        <tr>
          <th>Nội dung</th>
          <td>${plan.part5.practice.content}</td>
        </tr>
        <tr>
          <th>Sản phẩm</th>
          <td>${plan.part5.practice.product}</td>
        </tr>
        <tr>
          <th>Tổ chức thực hiện</th>
          <td>
            • <strong>Chuyển giao nhiệm vụ:</strong> ${plan.part5.practice.execution.transfer}<br>
            • <strong>Thực hiện nhiệm vụ:</strong> ${plan.part5.practice.execution.perform}<br>
            • <strong>Báo cáo, thảo luận:</strong> ${plan.part5.practice.execution.report}<br>
            • <strong>Kết luận, nhận định:</strong> ${plan.part5.practice.execution.conclude}
          </td>
        </tr>
      </table>

      <!-- Hoạt động 4 -->
      <h3>4. Hoạt động 4: Vận dụng</h3>
      <table class="activity-table">
        <tr>
          <th style="width: 20%;">Mục tiêu</th>
          <td style="width: 80%;">${plan.part5.application.target}</td>
        </tr>
        <tr>
          <th>Nội dung</th>
          <td>${plan.part5.application.content}</td>
        </tr>
        <tr>
          <th>Sản phẩm</th>
          <td>${plan.part5.application.product}</td>
        </tr>
        <tr>
          <th>Tổ chức thực hiện</th>
          <td>
            • <strong>Chuyển giao nhiệm vụ:</strong> ${plan.part5.application.execution.transfer}<br>
            • <strong>Thực hiện nhiệm vụ:</strong> ${plan.part5.application.execution.perform}<br>
            • <strong>Báo cáo, thảo luận:</strong> ${plan.part5.application.execution.report}<br>
            • <strong>Kết luận, nhận định:</strong> ${plan.part5.application.execution.conclude}
          </td>
        </tr>
      </table>

      <!-- VI. KIỂM TRA, ĐÁNH GIÁ -->
      <h2>VI. KIỂM TRA, ĐÁNH GIÁ</h2>
      <div class="section-content">
        • <strong>Phương án đánh giá chẩn đoán / Đánh giá thường xuyên:</strong><br>
        ${plan.part6.diagnostic.replace(/\n/g, '<br>')}
        <br><br>
        • <strong>Phương án đánh giá định kỳ:</strong><br>
        ${plan.part6.formative.replace(/\n/g, '<br>')}
      </div>

      <!-- VII. PHÂN HÓA ĐỐI TƯỢNG HỌC SINH -->
      <h2>VII. PHÂN HÓA ĐỐI TƯỢNG HỌC SINH</h2>
      <div class="section-content">
        • <strong>Giải pháp hỗ trợ học sinh cần lưu ý (Yếu/Kém/Khó khăn):</strong><br>
        ${plan.part7.remedial.replace(/\n/g, '<br>')}
        <br><br>
        • <strong>Giải pháp bồi dưỡng và phát triển học sinh khá giỏi:</strong><br>
        ${plan.part7.enrichment.replace(/\n/g, '<br>')}
      </div>

      <!-- VIII. GHI CHÚ / ĐIỀU CHỈNH SAU TIẾT DẠY -->
      <h2>VIII. GHI CHÚ / ĐIỀU CHỈNH SAU TIẾT DẠY</h2>
      <div class="section-content">
        ${plan.part8.notes.replace(/\n/g, '<br>')}
      </div>

      <!-- Phụ lục cảnh báo pháp lý chân trang -->
      <div class="footer-disclaimer">
        <strong>PHỤ LỤC CAM KẾT PHÁP LÝ & BẢO QUYỀN HỌC LIỆU SỐ</strong><br>
        Nội dung này được biên soạn độc lập bởi giáo viên sử dụng công nghệ tạo khung Nhịp Giảng.<br>
        Bản quyền thuộc về tác giả soạn thảo (Mã định danh: ${plan.ownerId}).<br>
        Cảnh báo: Giáo án chỉ mang tính chất tham khảo chuẩn sư phạm. Giáo viên chịu trách nhiệm kiểm tra kỹ lưỡng nội dung học liệu thực tế trước khi lên lớp.<br>
        Hệ thống được vận hành bởi Nhịp Giảng Việt Nam.
      </div>

      ${planType === 'free' ? `
      <!-- Dấu mờ Tác quyền Gói Miễn phí -->
      <div class="watermark-free">
        Tài liệu được khởi tạo từ khung cấu trúc tham khảo Nhịp Giảng - Gói thành viên Miễn phí.
      </div>
      ` : ''}
    </body>
    </html>
  `;

  // Tạo blob tải xuống dưới dạng file Word (.doc)
  const blob = new Blob(['\ufeff' + content], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Giao_An_Nhip_Giang_${plan.part1.lessonTitle.replace(/[^a-zA-Z0-9]/g, '_')}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
