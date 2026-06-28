# Kiến trúc Kỹ thuật - Nhịp Giảng (ARCHITECTURE.md)

Chào mừng bạn đến với tài liệu Kiến trúc Kỹ thuật của **Nhịp Giảng – Không gian làm việc số dành cho giáo viên**. Tài liệu này mô tả các nguyên tắc thiết kế hệ thống, phân vùng dữ liệu và các tiêu chuẩn bảo mật trong giai đoạn P0 (Khởi tạo & Tuân thủ pháp lý).

---

## 1. Triết lý Kiến trúc: Thực tế & An toàn Pháp lý (Non-AI Core)

Trong giai đoạn đầu phát triển (P0 - P2), Nhịp Giảng áp dụng triết lý **"Không lấy AI làm lõi" (No AI Core)**. Mọi quyết định thiết kế đều hướng tới sự ổn định, chính xác tuyệt đối của tài liệu học liệu và tính tuân thủ pháp lý cao nhất trong giáo dục.

### Đặc điểm thiết kế cốt lõi:
- **Rule-Based Engine (Động cơ dựa trên quy tắc):** Hệ thống sử dụng các bộ template mẫu tĩnh chuẩn hóa và quy trình kiểm tra tự động bằng mã lệnh (rule-based validation) thay vì các mô hình xác suất AI. Điều này giúp loại bỏ hoàn toàn hiện tượng "ảo giác thông tin" (hallucination) thường gặp ở AI, đảm bảo mọi thông tin trong giáo án là chính xác và tuân thủ chương trình Giáo dục Phổ thông (GDPT) mới của Bộ GD&ĐT Việt Nam.
- **Strict Typing & Data Schema (Ràng buộc kiểu dữ liệu mạnh):** Toàn bộ dữ liệu giáo án, thông tin môn học, tiến trình học tập được định nghĩa thông qua các TypeScript types và enums nghiêm ngặt, đảm bảo tính toàn vẹn của dữ liệu từ tầng logic đến tầng giao diện.

---

## 2. Phân vùng Các Tầng Dữ Liệu (Data Layer Partitioning)

Hệ thống được tổ chức thành các tầng độc lập để dễ dàng bảo trì và mở rộng trong tương lai:

```
+-------------------------------------------------------------+
|                     Tầng Giao Diện (UI)                      |
| (React, Tailwind CSS, Motion - Sắp xếp theo mô-đun an toàn)   |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|             Tầng Nghiệp Vụ & Xác Thực (Services)            |
|     (Template Engine không AI, Hệ thống Rule-Based Match)   |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                     Tầng Dữ Liệu (Data)                     |
|     (LocalStorage cho bản nháp, Mock Data cho Seed/Demo)     |
+-------------------------------------------------------------+
```

### Các trạng thái dữ liệu chính thức (6 Nhãn bắt buộc):
Để duy trì tính minh bạch về nguồn gốc dữ liệu, mỗi bản ghi học liệu hoặc giáo án đều phải mang một trong các nhãn trạng thái dữ liệu sau:
1. `seed`: Dữ liệu gốc do hệ thống khởi tạo tự động.
2. `scaffold`: Giáo án khung được sinh ra từ template engine chuẩn hóa.
3. `community`: Nội dung do cộng đồng giáo viên đóng góp (chưa được kiểm duyệt).
4. `reviewed`: Giáo án đã được rà soát nội bộ hoặc bởi các nhóm chuyên môn.
5. `verified`: Nội dung đã được kiểm tra tính tương thích kỹ thuật và cú pháp.
6. `approved_for_release`: Giáo án chính thức đã được hội đồng chuyên môn phê duyệt, đủ điều kiện đưa vào giảng dạy.

---

## 3. Nguyên tắc Cô lập Chủ sở hữu (Owner Isolation Principle)

Bảo mật và cô lập dữ liệu người dùng là ưu tiên hàng đầu để bảo vệ quyền tác giả và tài liệu giảng dạy của từng giáo viên. 

### Quy tắc cô lập bắt buộc:
- **Owner ID Binding:** Mọi bản ghi giáo án (`LessonPlan`) hoặc tài liệu giảng dạy tự soạn bắt buộc phải có thuộc tính `ownerId` gắn liền với mã định danh của tài khoản giáo viên tạo ra nó.
- **Client-Side Sandbox (P0-P1):** Trong giai đoạn chạy offline/local, dữ liệu được lưu trữ trong `localStorage` dưới định dạng không gian riêng biệt (namespaced keys), ngăn chặn việc truy cập chéo giữa các phiên làm việc hoặc chia sẻ dữ liệu ngoài ý muốn.
- **Server-Side Enforcement (P2 trở đi):** Khi tích hợp database (Firestore/Cloud SQL), các bộ quy tắc bảo mật (Security Rules) hoặc các câu lệnh SQL bắt buộc phải áp dụng điều kiện lọc `WHERE owner_id = current_user_id` để ngăn chặn rò rỉ dữ liệu giữa các giáo viên khác nhau.

---

## 4. Phân vùng Phân quyền (Role Isolation)

Nhịp Giảng tách biệt rõ ràng hai không gian làm việc chính để đảm bảo tính an toàn hệ thống:
1. **Không gian Giáo viên (`Teacher Workspace`):** Nhóm các tính năng quản lý tiến trình giảng dạy hằng tuần, lịch dạy cá nhân, và trình soạn giáo án 8 phần.
2. **Không gian Quản trị (`Admin Panel`):** Tách biệt hoàn toàn khỏi không gian giáo viên, chỉ dành cho kiểm duyệt viên và ban quản trị để giám sát các mẫu giáo án hệ thống, cấu hình môn học (đặc biệt là môn Công nghệ), rà soát báo cáo vi phạm bản quyền và cập nhật chính sách pháp lý.
