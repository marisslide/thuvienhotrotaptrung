import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/', label: 'Trang chủ' },
  { to: '/nhan-dien', label: 'Nhận diện' },
  { to: '/nhom-hoat-dong', label: '6 Nhóm' },
  { to: '/hoat-dong', label: 'Thư viện' },
  { to: '/huong-dan', label: 'Hướng dẫn' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, isAuthorizedTeacher } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F9F8] text-[#263B3A]">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#DCE6E3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand wordmark */}
          <Link
            to="/"
            className="text-base sm:text-lg font-bold tracking-tight text-[#176B5B] whitespace-nowrap shrink-0"
          >
            Thư viện Tái tập trung
          </Link>

          {/* Zone 2: 5 concise single-line text links */}
          <nav
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#526867]"
            aria-label="Điều hướng chính"
          >
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                    isActive
                      ? 'text-[#176B5B] border-[#176B5B] font-semibold'
                      : 'border-transparent hover:text-[#176B5B] hover:border-[#DDF3EA]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Zone 3: 1 primary action + mobile menu toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to={user && isAuthorizedTeacher ? '/quan-tri' : '/dang-nhap'}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold bg-[#176B5B] text-white hover:bg-[#125649] transition-colors whitespace-nowrap shrink-0"
            >
              {user && isAuthorizedTeacher ? 'Quản trị' : 'Giáo viên'}
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden p-2 rounded-xl text-[#263B3A] hover:bg-[#F6F9F8] transition-colors"
              aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-[#DCE6E3] px-4 py-4 space-y-2">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded-xl text-sm font-medium ${
                    isActive
                      ? 'bg-[#DDF3EA] text-[#176B5B] font-semibold'
                      : 'text-[#263B3A] hover:bg-[#F6F9F8]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="pt-2 border-t border-[#DCE6E3]">
              <Link
                to={user && isAuthorizedTeacher ? '/quan-tri' : '/dang-nhap'}
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#176B5B] text-white"
              >
                {user && isAuthorizedTeacher ? 'Khu vực Quản trị' : 'Đăng nhập Giáo viên'}
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Quiet Pedagogical Footer */}
      <footer className="bg-white border-t border-[#DCE6E3] mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-[#DCE6E3]">
            <div className="md:col-span-5 space-y-3">
              <p className="text-base font-bold text-[#176B5B]">
                THƯ VIỆN HOẠT ĐỘNG HỖ TRỢ TÁI TẬP TRUNG
              </p>
              <p className="text-sm font-medium text-[#263B3A]">
                “Nhận diện biểu hiện – Lựa chọn hoạt động – Quay lại nhiệm vụ học tập”
              </p>
              <p className="text-xs leading-relaxed text-[#526867] max-w-md">
                Website thư viện học liệu hỗ trợ giáo viên THCS tổ chức các hoạt động ngắn 2–5 phút
                trong lớp học. Đây không phải nền tảng kiểm tra, chấm điểm hay chẩn đoán tâm lý học sinh.
              </p>
            </div>

            <div className="md:col-span-3 space-y-2.5">
              <p className="text-xs font-semibold text-[#263B3A]">Điều hướng nhanh</p>
              <ul className="space-y-2 text-sm text-[#526867]">
                <li>
                  <Link to="/nhan-dien" className="hover:text-[#176B5B] transition-colors">
                    Nhận diện biểu hiện
                  </Link>
                </li>
                <li>
                  <Link to="/nhom-hoat-dong" className="hover:text-[#176B5B] transition-colors">
                    Sáu nhóm hoạt động
                  </Link>
                </li>
                <li>
                  <Link to="/hoat-dong" className="hover:text-[#176B5B] transition-colors">
                    Danh sách hoạt động
                  </Link>
                </li>
                <li>
                  <Link to="/huong-dan" className="hover:text-[#176B5B] transition-colors">
                    Hướng dẫn sử dụng
                  </Link>
                </li>
              </ul>
            </div>

            <div className="md:col-span-4 space-y-2.5">
              <p className="text-xs font-semibold text-[#263B3A]">Nguyên tắc lớp học THCS</p>
              <ul className="space-y-1.5 text-xs leading-relaxed text-[#526867]">
                <li>· Nội dung công khai cho giáo viên, học sinh và phụ huynh không cần đăng nhập.</li>
                <li>· Không thu thập dữ liệu cá nhân hay đánh giá tâm lý học sinh.</li>
                <li>· Tối ưu trình chiếu trên màn hình lớp học, không yêu cầu học sinh dùng thiết bị riêng.</li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#526867]">
            <p>© {new Date().getFullYear()} Thư viện Hoạt động Hỗ trợ Tái tập trung THCS.</p>
            <Link to="/dang-nhap" className="hover:text-[#176B5B] font-medium transition-colors">
              Cổng quản trị dành cho Giáo viên được cấp quyền
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
