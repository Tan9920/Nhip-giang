# Lộ trình Phát triển - Nhịp Giảng (ROADMAP.md)

Lộ trình này thể hiện sự trưởng thành từng bước của nền tảng **Nhịp Giảng**, đi từ không gian làm việc cá nhân chuẩn hóa (P0) đến hệ sinh thái số hóa toàn diện của giáo viên Việt Nam (P8).

---

## Các Cột Mốc và Cổng Phê Duyệt (Gates)

Các tính năng nâng cao (AI, Cộng đồng công khai, Giao dịch thương mại) bắt buộc phải nằm ở trạng thái **LATER** (Chờ thực hiện) hoặc **CONDITIONAL** (Phụ thuộc điều kiện phê duyệt pháp lý). Không tiến hành viết mã khung (scaffold) ngầm cho các tính năng này khi chưa vượt qua cổng kiểm duyệt tương ứng.

| Giai đoạn | Tên Giai Đoạn | Mục Tiêu & Trọng Tâm | Trạng Thái |
| :--- | :--- | :--- | :--- |
| **P0** | **Khởi Tạo Cốt Lõi** | Thiết lập khung ứng dụng không AI, biểu mẫu soạn giáo án 8 phần chuẩn Bộ GD&ĐT Việt Nam, công cụ xuất bản Word giả lập và bộ tài liệu pháp lý cơ sở. | **HOÀN THÀNH** |
| **P1** | **Lưu Trữ Cá Nhân** | Tích hợp công cụ lưu trữ dữ liệu tại máy (`localStorage`) của giáo viên, bổ sung bộ lọc bài học theo phân môn "Công nghệ", kiểm tra rule-based tự động về tính hợp lệ của bài soạn. | **TIẾP THEO** |
| **P2** | **Đồng Bộ Đám Mây** | Triển khai xác thực người dùng (Auth) và cơ sở dữ liệu Firestore an toàn áp dụng nguyên lý cô lập chủ sở hữu (`Owner Isolation`). | LATER |
| **P3** | **Kiểm Duyệt Nội Bộ** | Xây dựng quy trình phản hồi giáo án (Reviewer Flow) giữa giáo viên và tổ trưởng chuyên môn để nâng nhãn trạng thái từ `reviewed` lên `verified`. | LATER |
| **P4** | **Trợ Lý Soạn Bài (AI Beta)** | *CONDITIONAL (Có điều kiện)*: Thử nghiệm hỗ trợ gợi ý cấu trúc bài giảng dựa trên prompt định sẵn bằng Gemini API. Tuyệt đối không thay thế khâu biên soạn của giáo viên. | CONDITIONAL |
| **P5** | **Cộng Đồng Chia Sẻ** | Cho phép giáo viên chia sẻ giáo án tự soạn lên thư viện chung. Chuyển đổi nhãn trạng thái dữ liệu sang `community` sau khi qua bộ lọc từ khóa nghiêm ngặt. | LATER |
| **P6** | **Thẩm Định Giáo Án** | Tích hợp quy trình phê duyệt trực tuyến cấp trường/sở để nâng nhãn dữ liệu lên mức tối đa `approved_for_release`. | LATER |
| **P7** | **Học Liệu Số (Marketplace)** | *CONDITIONAL (Có điều kiện)*: Không gian trao đổi học liệu số có bản quyền, áp dụng cơ chế xác minh giấy phép và kiểm tra quyền sở hữu trí tuệ nghiêm ngặt. | CONDITIONAL |
| **P8** | **Quỹ Sáng Tạo Nhịp Giảng** | Hệ thống ghi nhận đóng góp chuyên môn xuất sắc của giáo viên và tài trợ các sáng kiến giảng dạy đổi mới thực tế. | LATER |

---

## Quy tắc Phát triển & Cương lĩnh Tuân thủ

1. **Gatekeeping Nghiêm Ngặt:**
   - Tuyệt đối không import bất kỳ thư viện sinh chữ tự động (AI SDK) hay cài đặt API của bên thứ ba vào luồng nghiệp vụ P0-P3.
   - Các cảnh báo pháp lý về nguồn học liệu mẫu phải xuất hiện cố định ở mọi chế độ xem có liên quan để bảo vệ người dùng cuối (giáo viên).

2. **Chuẩn hóa Thuật ngữ:**
   - Môn học bắt buộc gọi là **"Công nghệ"** theo Chương trình GDPT 2018. 
   - Không được dùng từ "kĩ thuật" để gọi tên môn học này trong bất cứ tình huống nào (chỉ sử dụng "kĩ thuật dạy học" để mô tả phương pháp sư phạm).
