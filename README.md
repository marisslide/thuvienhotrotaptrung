# Thư viện Hoạt động Hỗ trợ Tái tập trung

> **"Nhận diện biểu hiện – Lựa chọn hoạt động – Quay lại nhiệm vụ học tập"**

Nền tảng thư viện số hỗ trợ giáo viên THCS tra cứu nhanh, lựa chọn và trình chiếu các hoạt động ngắn (2–5 phút) khi quan sát thấy học sinh có biểu hiện mệt mỏi, xao nhãng hoặc chậm nhịp trong giờ học.

## Kiến trúc công nghệ
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, React Router, Lucide Icons
- **Backend**: Node.js + Express (`server.ts`)
- **Database & Auth**: Firebase Firestore & Firebase Authentication (Google Sign-In)
- **Deployment**: Sẵn sàng đồng bộ GitHub và triển khai trên Vercel (`vercel.json`) hoặc Node.js server

## Cấu trúc các trang
1. `/` — Trang chủ
2. `/nhan-dien` — Nhận diện 6 biểu hiện lớp học
3. `/nhom-hoat-dong` — Sáu nhóm hoạt động (Vận động, Quan sát, Ghi nhớ, Phản xạ, Tương tác, Thư giãn)
4. `/hoat-dong` — Danh sách và bộ lọc hoạt động công khai
5. `/hoat-dong/:id` — Chi tiết hoạt động, đồng hồ đếm ngược & Chế độ trình chiếu lớp học
6. `/huong-dan` — Hướng dẫn sử dụng cho giáo viên
7. `/dang-nhap` — Cổng đăng nhập Giáo viên
8. `/quan-tri` — Khu vực Quản trị Giáo viên (thêm, sửa, ẩn/hiện, xóa hoạt động, phân quyền giáo viên)

## Chạy cục bộ
```bash
npm install
npm run dev
```

## Triển khai Vercel
1. Đẩy mã nguồn lên GitHub.
2. Kết nối repository trên Vercel (Framework Preset: Vite, Build Command: `npm run build`, Output Directory: `dist`).
3. File `vercel.json` đã cấu hình sẵn SPA rewrite cho toàn bộ đường dẫn React Router.
