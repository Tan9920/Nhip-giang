# Quy trình Kiểm tra - Nhịp Giảng (VERIFY.md)

Tài liệu này hướng dẫn các kiểm định viên (reviewers) và hệ thống CI/CD cách chạy các quy trình kiểm tra tự động và kiểm thử chấp nhận đối với mã nguồn **Nhịp Giảng**.

---

## 1. Các Lệnh Kiểm Tra Tự Động (Automated Checks)

Mọi thay đổi trên mã nguồn (commits/pull requests) bắt buộc phải vượt qua các lệnh kiểm tra sau để đảm bảo không phát sinh lỗi biên dịch hoặc xung đột kiểu dữ liệu:

### A. Kiểm tra cú pháp và kiểu dữ liệu (Typecheck)
Sử dụng TypeScript compiler để kiểm tra toàn bộ mã nguồn mà không sinh ra file biên dịch:
```bash
npm run lint
```
*(Lệnh này tương đương với `tsc --noEmit` được cấu hình trong `package.json` để kiểm tra tĩnh toàn bộ hệ thống).*

### B. Kiểm tra quy trình đóng gói (Build)
Đảm bảo mã nguồn có thể được đóng gói thành sản phẩm tĩnh chạy trên môi trường production mà không gặp bất kỳ lỗi nào:
```bash
npm run build
```
*(Đầu ra sẽ nằm trong thư mục `/dist` để sẵn sàng cho việc triển khai trên dịch vụ lưu trữ).*

---

## 2. Quy trình Thử nghiệm Khói (Smoke Testing Flow)

Khi khởi chạy môi trường phát triển cục bộ bằng lệnh:
```bash
npm run dev
```

Kiểm định viên thực hiện quy trình kiểm tra nhanh (Smoke Test) qua 5 bước trực quan sau:

1. **Khởi động Trang chủ (Teacher Dashboard):**
   - Đảm bảo thanh điều hướng "Nhịp Giảng" hiển thị đầy đủ tiêu đề thương hiệu và khẩu hiệu "Không gian làm việc số dành cho giáo viên".
   - Kiểm tra xem bảng Lịch tuần cá nhân và danh sách bài dạy mẫu có hiển thị hay không.

2. **Kiểm tra Nhãn dữ liệu (Data Status Badges):**
   - Tìm kiếm các nhãn trạng thái dữ liệu (ví dụ: `seed`, `scaffold`, `community`, `reviewed`, `verified`, `approved_for_release`) trên thẻ danh sách bài học.
   - Các nhãn phải có màu sắc phân biệt rõ ràng, hiển thị đúng cấu trúc enum được quy định.

3. **Mở Trình soạn giáo án (Lesson Planner Mockup):**
   - Click nút **"Soạn giáo án mới"**.
   - Kiểm tra xem biểu mẫu 8 phần có chia nhỏ thành các mục (accordion hoặc tabs) rõ ràng không, thay vì hiển thị một ô nhập văn bản lớn.
   - Đảm bảo các trường nhập liệu cụ thể như "Nguồn", "Bản quyền/License", và "Tiến trình dạy học (4 hoạt động)" hiển thị đúng cấu trúc Chuyển giao -> Thực hiện -> Báo cáo -> Kết luận.

4. **Xác minh Cảnh báo Pháp lý cố định:**
   - Đảm bảo dòng chữ cảnh báo sau hiển thị rõ ràng trên UI soạn bài và UI file mẫu: 
     > *"Nội dung này là dữ liệu mẫu/tham khảo, giáo viên cần kiểm tra trước khi dùng chính thức."*
   - Cảnh báo phải được định dạng màu sắc dễ nhận biết (ví dụ: nền vàng nhạt, chữ cam sậm hoặc viền đỏ) để gây sự chú ý thích hợp.

5. **Xử lý Xuất tệp tin (Export Word/PDF Mock):**
   - Click nút **"Xuất giáo án (Word)"**.
   - Trình duyệt sẽ tự động tải xuống file giáo án thô `.doc` hoặc `.txt` chứa đầy đủ thông tin giáo án đã biên soạn, kèm theo toàn bộ nhãn dữ liệu và phần phụ lục cảnh báo nguồn gốc ở cuối tệp.
