import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Edit2,
  GraduationCap,
  LogOut,
  Menu,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getStudentProfile,
  logStudentActivity,
  syncStudentSessionDuration,
} from '../lib/googleSyncService';
import { StudentProfile } from '../types/material';
import { StudentWelcomeModal } from './StudentWelcomeModal';

const NAV_ITEMS = [
  { to: '/', label: 'Trang chủ' },
  { to: '/nhan-dien', label: 'Nhận diện' },
  { to: '/nhom-hoat-dong', label: '6 Nhóm' },
  { to: '/hoat-dong', label: 'Thư viện' },
  { to: '/hoc-lieu', label: 'Học liệu' },
  { to: '/huong-dan', label: 'Hướng dẫn' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, teacherSession, isAuthorizedTeacher, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Quản lý thông tin học sinh
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(() =>
    getStudentProfile()
  );
  const [showStudentModal, setShowStudentModal] = useState(false);

  useEffect(() => {
    // Nếu chưa có thông tin học sinh và chưa đăng nhập giáo viên thì mở modal
    if (!isAuthorizedTeacher && !studentProfile) {
      setShowStudentModal(true);
    }
  }, [isAuthorizedTeacher, studentProfile]);

  // Ghi nhận nhật ký chuyển trang của học sinh
  useEffect(() => {
    if (!isAuthorizedTeacher && studentProfile) {
      const pageNames: Record<string, string> = {
        '/': 'Trang chủ',
        '/nhan-dien': 'Nhận diện biểu hiện',
        '/nhom-hoat-dong': 'Sáu nhóm hoạt động',
        '/hoat-dong': 'Danh sách hoạt động',
        '/hoc-lieu': 'Kho học liệu & Drive',
        '/huong-dan': 'Hướng dẫn sư phạm',
      };
      const title = pageNames[location.pathname] || location.pathname;
      logStudentActivity('TRUY CẬP TRANG', title);
    }
  }, [location.pathname, isAuthorizedTeacher, studentProfile]);

  // Tự động tính thời lượng truy cập của học viên và đồng bộ vào Sheet "DanhSach_HocVien"
  useEffect(() => {
    if (isAuthorizedTeacher || !studentProfile) return;

    // Gửi tín hiệu bắt đầu phiên
    syncStudentSessionDuration(0, true, 'Đang học tập');

    // Cứ mỗi 60 giây (1 phút) đồng bộ +1 phút thời lượng vào Sheet DanhSach_HocVien
    const interval = setInterval(() => {
      syncStudentSessionDuration(1, false, 'Đang học tập');
    }, 60000);

    const handleBeforeUnload = () => {
      syncStudentSessionDuration(0, false, 'Đã hoàn thành');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isAuthorizedTeacher, studentProfile]);

  const teacherName = teacherSession?.displayName || user?.displayName || 'Cô Diệu Hiền';

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F9F8] text-[#263B3A]">
      {/* Modal đăng ký / chỉnh sửa thông tin học sinh */}
      <StudentWelcomeModal
        isOpen={showStudentModal}
        onSuccess={(profile) => {
          setStudentProfile(profile);
          setShowStudentModal(false);
        }}
        canCloseWithoutSave={!!studentProfile}
        onClose={() => setShowStudentModal(false)}
      />

      {/* Top Bar (Tối ưu chiều ngang tối đa cho màn hình lớn và máy chiếu) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#DCE6E3] shadow-2xs">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 h-16 sm:h-18 flex items-center justify-between gap-4 lg:gap-8">
          {/* Zone 1: Brand wordmark */}
          <Link
            to="/"
            className="flex items-center gap-2.5 text-base sm:text-lg font-extrabold tracking-tight text-[#176B5B] whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 rounded-xl bg-[#176B5B] text-white flex items-center justify-center font-black text-sm shadow-xs">
              TT
            </div>
            <span>Thư viện Tái tập trung</span>
          </Link>

          {/* Zone 2: Navigation Links */}
          <nav
            className="hidden md:flex items-center gap-5 lg:gap-7 text-sm font-semibold text-[#526867]"
            aria-label="Điều hướng chính"
          >
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `whitespace-nowrap shrink-0 py-1 border-b-2 transition-all ${
                    isActive
                      ? 'text-[#176B5B] border-[#176B5B] font-bold'
                      : 'border-transparent hover:text-[#176B5B] hover:border-[#DDF3EA]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Zone 3: Student Badge / Teacher Role & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Nếu là giáo viên quản trị */}
            {isAuthorizedTeacher ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/hoc-lieu"
                  className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#DDF3EA] border border-[#B8E2D1] text-xs font-bold text-[#176B5B]"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{teacherName}</span>
                </Link>

                <Link
                  to="/quan-tri"
                  className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#176B5B] text-white hover:bg-[#125649] transition-colors whitespace-nowrap shadow-2xs"
                >
                  Quản trị
                </Link>

                <button
                  type="button"
                  onClick={logout}
                  className="p-2 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Đăng xuất giáo viên"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Nếu là học sinh: Hiển thị badge học sinh và nút sửa thông tin */
              <div className="flex items-center gap-2">
                {studentProfile ? (
                  <button
                    type="button"
                    onClick={() => setShowStudentModal(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#EBF7F2] border border-[#B8E2D1] text-xs font-semibold text-[#176B5B] hover:bg-[#DDF3EA] transition-colors"
                    title="Bấm để chỉnh sửa thông tin học sinh"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-[#176B5B] shrink-0" />
                    <span className="hidden sm:inline font-bold">{studentProfile.fullName}</span>
                    <span className="px-1.5 py-0.5 rounded-md bg-[#176B5B] text-white text-[10px] font-bold">
                      {studentProfile.className}
                    </span>
                    <Edit2 className="w-3 h-3 text-[#176B5B]/70 ml-0.5 hidden sm:inline" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowStudentModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-[#176B5B]/10 text-[#176B5B] text-xs font-bold hover:bg-[#176B5B]/20 transition-colors"
                  >
                    Điền thông tin học sinh
                  </button>
                )}

                <Link
                  to="/dang-nhap"
                  className="inline-flex items-center justify-center px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#263B3A] text-white hover:bg-[#182625] transition-colors whitespace-nowrap shadow-2xs"
                >
                  Giáo viên
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
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
                  `block px-3 py-2.5 rounded-xl text-sm font-semibold ${
                    isActive
                      ? 'bg-[#DDF3EA] text-[#176B5B] font-bold'
                      : 'text-[#263B3A] hover:bg-[#F6F9F8]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="pt-2 border-t border-[#DCE6E3] space-y-2">
              {studentProfile && (
                <div className="p-2.5 rounded-xl bg-[#F6F9F8] text-xs text-[#526867] flex items-center justify-between">
                  <span>Học sinh: <strong>{studentProfile.fullName}</strong> ({studentProfile.className})</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      setShowStudentModal(true);
                    }}
                    className="text-[#176B5B] font-bold hover:underline"
                  >
                    Đổi
                  </button>
                </div>
              )}
              <Link
                to={isAuthorizedTeacher ? '/quan-tri' : '/dang-nhap'}
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#176B5B] text-white"
              >
                {isAuthorizedTeacher ? 'Khu vực Quản trị' : 'Đăng nhập Giáo viên'}
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content (Tối ưu không gian ngang rộng rãi) */}
      <main className="flex-1 w-full">{children}</main>

      {/* Pedagogical Footer */}
      <footer className="bg-white border-t border-[#DCE6E3] mt-16">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-[#DCE6E3]">
            <div className="md:col-span-5 space-y-3">
              <p className="text-base font-bold text-[#176B5B]">
                THƯ VIỆN HOẠT ĐỘNG HỖ TRỢ TÁI TẬP TRUNG
              </p>
              <p className="text-sm font-semibold text-[#263B3A]">
                “Nhận diện biểu hiện – Lựa chọn hoạt động – Quay lại nhiệm vụ học tập”
              </p>
              <p className="text-xs leading-relaxed text-[#526867] max-w-lg">
                Website thư viện học liệu hỗ trợ giáo viên THCS tổ chức các hoạt động ngắn 2–5 phút
                trong lớp học. Đồng bộ dữ liệu học sinh và học liệu trực tiếp với Google Sheet và Google Drive.
              </p>
            </div>

            <div className="md:col-span-3 space-y-2.5">
              <p className="text-xs font-bold text-[#263B3A] uppercase">Điều hướng nhanh</p>
              <ul className="space-y-2 text-sm text-[#526867] font-medium">
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
                    Danh sách 60 hoạt động
                  </Link>
                </li>
                <li>
                  <Link to="/hoc-lieu" className="hover:text-[#176B5B] transition-colors text-[#176B5B] font-bold">
                    Kho Học liệu (Video, Slide, Word)
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
              <p className="text-xs font-bold text-[#263B3A] uppercase">Nguyên tắc lớp học THCS</p>
              <ul className="space-y-1.5 text-xs leading-relaxed text-[#526867]">
                <li>· Nội dung công khai cho giáo viên, học sinh và phụ huynh.</li>
                <li>· Học sinh ghi danh Họ tên, Lớp, Trường để lưu tiến trình rèn luyện trên Google Sheet.</li>
                <li>· Tối ưu diện tích trình chiếu trên màn hình lớp học, tiện lợi cho giáo viên giảng dạy.</li>
                <li>· Học liệu được bảo quản an toàn trên Google Drive và quản trị bởi giáo viên.</li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#526867]">
            <p>© {new Date().getFullYear()} Thư viện Hoạt động Hỗ trợ Tái tập trung THCS. Quản trị: Cô Diệu Hiền.</p>
            <Link to="/dang-nhap" className="hover:text-[#176B5B] font-semibold transition-colors">
              Cổng quản trị dành cho Giáo viên
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
