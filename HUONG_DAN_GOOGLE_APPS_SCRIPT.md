# HƯỚNG DẪN KẾT NỐI GOOGLE SHEET & GOOGLE DRIVE QUA APPS SCRIPT
Dành cho: **Thư viện Hoạt động Hỗ trợ Tái tập trung (Cô Diệu Hiền)**

---

### Bước 1: Tạo Google Spreadsheet mới
1. Truy cập vào [Google Sheets](https://sheets.new) để tạo 1 bảng tính mới.
2. Đổi tên bảng tính thành: **`Thư Viện Tái Tập Trung - Nhật Ký & Học Liệu`**.

---

### Bước 2: Dán mã Google Apps Script
1. Trên thanh menu của Google Sheet, chọn: **Tiện ích mở rộng** (Extensions) ➔ **Apps Script**.
2. Xóa hết mã mặc định trong tệp `Code.gs`.
3. Mở tệp [google-apps-script/Code.gs](file:///d:/8-TẢI%20VỀ/2026/THÁNG%2011/DIỆU%20HIỀN/thuvienhotrotaptrung/google-apps-script/Code.gs) trong dự án, sao chép toàn bộ nội dung và dán vào Apps Script.
4. Nhấn biểu tượng đĩa mềm hoặc bấm `Ctrl + S` để lưu.

---

### Bước 3: Triển khai (Deploy) làm Ứng dụng Web
1. Ở góc trên bên phải của màn hình Apps Script, bấm nút **Triển khai** (Deploy) ➔ Chọn **Tùy chọn triển khai mới** (New deployment).
2. Nhấn vào biểu tượng bánh răng ⚙️ bên cạnh "Chọn loại", chọn **Ứng dụng web** (Web app).
3. Điền các trường cấu hình:
   - **Mô tả (Description)**: `API Thư viện Tái tập trung`
   - **Thực thi dưới dạng (Execute as)**: **`Tôi (email của bạn)`** (Me)
   - **Ai có quyền truy cập (Who has access)**: **`Bất kỳ ai`** (Anyone) *(Bắt buộc chọn Bất kỳ ai để ứng dụng web của học sinh và giáo viên có thể ghi dữ liệu mà không cần bắt buộc đăng nhập tài khoản Google)*.
4. Nhấn nút **Triển khai** (Deploy).
5. Google sẽ hiện cửa sổ yêu cầu **Ủy quyền truy cập** (Authorize access):
   - Chọn tài khoản Google của bạn.
   - Bấm **Nâng cao** (Advanced) ➔ Chọn **Đi tới Untitled project (không an toàn)**.
   - Bấm **Cho phép** (Allow).
6. Sao chép đường link **URL ứng dụng web** (có dạng: `https://script.google.com/macros/s/.../exec`).

---

### Bước 4: Nhập link vào ứng dụng Thư viện
1. Đăng nhập tài khoản Giáo viên trên ứng dụng (`Dieuhien` / `2026`).
2. Vào mục **Học liệu** ➔ Nhấn nút **⚙️ Cấu hình Google Sheet & Drive**.
3. Dán đường link URL vừa sao chép vào ô và bấm **Lưu cấu hình**.

---

### Kết quả tự động:
- **Tab `HocSinh_LichSu`**: Tự động lưu họ tên, lớp, trường của học sinh khi đăng ký và mọi hoạt động học tập, thời lượng sử dụng, học liệu đã xem.
- **Tab `GiaoVien_LichSu`**: Tự động ghi nhận lịch sử giáo viên tải học liệu, chỉnh sửa, xóa học liệu và duyệt hoạt động.
- **Thư mục Google Drive `HocLieu_TaiTapTrung`**: Mọi video, word, powerpoint, hình ảnh giáo viên tải lên sẽ được tự động lưu vào Google Drive, cấp quyền xem công khai và hiển thị trực tiếp cho học sinh!
