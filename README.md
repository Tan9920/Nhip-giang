# Nhịp Giảng — Không gian làm việc số dành cho giáo viên Việt Nam

**Nhịp Giảng** (`du-an-soan`) là nền tảng số hóa, soạn thảo giáo án chuẩn 8 phần và quản lý học liệu sư phạm độc lập dành riêng cho giáo viên Việt Nam. Hệ thống tập trung tối đa vào trải nghiệm người dùng tinh tế, bảo mật dữ liệu tuyệt đối (offline-first) và tuân thủ chặt chẽ Chương trình Giáo dục Phổ thông (GDPT) mới của Bộ GD&ĐT Việt Nam.

---

## 🌟 Tuyên ngôn phát triển: Non-AI & Rule-Based Core

Hệ thống hoạt động trên nguyên tắc **an toàn thông tin tuyệt đối và không phụ thuộc vào AI xác suất**:
- **Không AI Core:** Mọi tính năng soạn thảo, rà soát và tạo khung giáo án đều dựa trên các tập luật sư phạm được chuẩn hóa (rule-based validation engine). Thiết kế này loại bỏ hoàn toàn các hiện tượng "ảo giác thông tin" (hallucination) từ mô hình ngôn ngữ lớn, bảo đảm tính pháp lý cao nhất cho giáo viên.
- **Bảo mật dữ liệu tuyệt đối (Offline-First):** Toàn bộ dữ liệu giáo lý, thông tin tài khoản và nhật ký sử dụng được lưu giữ an toàn trực tiếp tại Local Storage trên máy của giáo viên. Không đồng bộ hay truyền tải thông tin nhạy cảm về máy chủ khi chưa có sự cho phép rõ ràng của người dùng.

---

## 🛠 Phân hệ năng lực hệ thống

### 1. Batch 04: Hạ tầng P1 & Legal Gate
- **Mặt tiền chuyên nghiệp (Landing Page):** Giới thiệu truyền thông trực quan, thân thiện, tương thích hoàn hảo từ thiết bị di động (Mobile) đến máy tính để bàn (Desktop).
- **Hành lang pháp lý (Legal Gate):** Trang tĩnh công bố Điều khoản dịch vụ và Chính sách bảo mật, tích hợp bộ khóa đồng thuận (Terms Consent Gate) bắt buộc khi đăng ký tài khoản.
- **Không gian soạn thảo thông minh:** Trình biên soạn giáo án 8 phần tương thích chuẩn GDPT 2018 (đặc biệt hỗ trợ sâu phân môn môn **Công nghệ**, kiên quyết loại bỏ thuật ngữ cũ "Kĩ thuật" ra khỏi hệ thống).

### 2. Batch 05: Plan & Quota Foundation (P3 Nâng cao)
- **Sổ cái hạn ngạch (Usage Ledger Service):**
  - Quản lý đọc/ghi và trừ hạn ngạch người dùng bằng TypeScript thông qua hệ thống sổ cái giao dịch cục bộ tại `/lib/quota/usageLedger.ts`.
  - Hỗ trợ cơ chế khóa bất đồng bộ (`isDeducting`) bảo đảm chống trừ trùng lặp (anti-double deduction) khi giáo viên click xuất file liên tục.
- **Quota Guard Validation (`useQuotaGuard`):**
  - Hook React tùy biến điều phối toàn bộ vòng đời kiểm tra và trừ lượt tải.
  - Tự động hiển thị **Hộp thoại cảnh báo mềm (Soft Alert Dialog)** khi tài khoản cạn kiệt hạn ngạch, điều hướng tinh tế giáo viên đến bảng so sánh quyền lợi.
- **Nhãn phân cấp thành viên (Membership Tiers):**
  - **Gói Miễn phí (Free):** 3 lượt xuất bản giáo án Word mỗi tuần. File tải xuống tự động đính kèm watermark chân trang: *"Tài liệu được khởi tạo từ khung cấu trúc tham khảo Nhịp Giảng - Gói thành viên Miễn phí."* để bảo vệ bản quyền hệ thống.
  - **Gói Pro Early (Thành viên sớm):** Mở rộng hạn ngạch lên 50 lượt/tuần, xuất file định dạng Word sạch 100% không chứa watermark, hỗ trợ tối đa thầy cô hoạt động giảng dạy cao độ.
- **Bảng so sánh & Kích hoạt gói (`/plans`):**
  - Trang so sánh trực quan quyền lợi giữa các gói thành viên.
  - Nút **"Trải nghiệm Pro Early"** giả lập quy trình nâng cấp an toàn qua Local Storage, làm mới hạn ngạch ngay lập tức mà không tích hợp cổng thanh toán tiền thật hay phát sinh chi phí.
- **Chỉ báo hạn ngạch trực quan (Dashboard Progress Indicator):**
  - Widget thanh tiến trình (progress bar) hiển thị trực tiếp trên thanh tác vụ của giáo viên: *"Hạn ngạch tuần: 2/3 lượt"*.
  - Thay đổi màu sắc linh hoạt (Xanh lá -> Vàng -> Đỏ) báo hiệu mức độ tiêu thụ tài nguyên thời gian thực.

---

## 📐 Kiến trúc dữ liệu và Quy chuẩn an toàn

```
                  +-----------------------------------------+
                  |           Giao diện Giáo viên           |
                  |     - Quota Progress bar Indicator      |
                  |     - Soft Alert Quota Modal            |
                  +-----------------------------------------+
                                       |
                                       v
                  +-----------------------------------------+
                  |         useQuotaGuard (React Hook)      |
                  |     - Điều phối kiểm tra & trừ lượt      |
                  +-----------------------------------------+
                                       |
                                       v
                  +-----------------------------------------+
                  |        Usage Ledger (Sổ cái cục bộ)     |
                  |     - Local Storage / JSON Transaction  |
                  |     - Cơ chế chống trừ trùng lặp       |
                  +-----------------------------------------+
```

1. **Owner Isolation Binding:** Mọi bài soạn giáo án đều được ràng buộc chặt chẽ với mã định danh người dùng (`ownerId`). Giáo viên này tuyệt đối không thể truy cập chéo sang dữ liệu của giáo viên khác.
2. **Phân quyền chức năng tách biệt (Role Isolation):**
   - **Teacher Workspace:** Dành riêng cho giáo viên soạn bài và theo dõi lịch tuần dạy học.
   - **Admin Panel:** Không gian khép kín cho điều phối viên cập nhật cấu hình hệ thống, quản lý giáo án mẫu chuẩn, rà soát các báo cáo tác quyền và pháp lý.

---

## 🚀 Khởi chạy và Phát triển dự án

### Cài đặt và Khởi chạy máy chủ phát triển:
```bash
# Cài đặt toàn bộ thư viện liên quan
npm install

# Khởi chạy dev server cục bộ
npm run dev
```

### Kiểm tra chất lượng mã nguồn & Biên dịch:
```bash
# Chạy bộ rà soát lỗi cú pháp TypeScript & Linter
npm run lint

# Tạo bản build tối ưu hóa cho sản phẩm đầu ra
npm run build
```

---

## ⚖ Bản quyền và Tuyên bố miễn trừ trách nhiệm
Hệ thống được phát triển hoàn toàn độc lập và bảo vệ bản quyền offline-first. Mọi dữ liệu học liệu và tài liệu sư phạm xuất bản từ Nhịp Giảng mang tính chất tham khảo học thuật; Giáo viên tự chịu trách nhiệm kiểm duyệt cuối cùng trước khi phân phối giảng dạy thực tế tại trường học.
