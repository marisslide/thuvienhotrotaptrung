import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  KeyRound,
  LogIn,
  LogOut,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function TeacherLoginPage() {
  const navigate = useNavigate();
  const {
    user,
    teacherSession,
    loading,
    isAuthorizedTeacher,
    authError,
    loginWithCredentials,
    logout,
  } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const ok = loginWithCredentials(username, password);
    if (ok) {
      navigate('/hoc-lieu');
    } else {
      setLoginError('Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.');
    }
  };

  const currentTeacherName =
    teacherSession?.displayName || user?.displayName || 'Cô Diệu Hiền (Quản trị)';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="bg-white rounded-3xl border border-[#DCE6E3] p-6 sm:p-10 shadow-xs space-y-8">
        <div className="space-y-2 border-b border-[#DCE6E3] pb-6 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#176B5B] uppercase tracking-wide">
            <ShieldCheck className="w-4 h-4" />
            Cổng quản trị dành riêng cho Giáo viên
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#263B3A]">
            Đăng nhập Giáo viên
          </h1>
          <p className="text-sm sm:text-base text-[#526867] leading-relaxed">
            Học sinh chỉ cần điền Họ tên, Lớp, Trường để tham gia học tập.
            Chỉ Giáo viên đăng nhập mới có quyền <strong>thêm, chỉnh sửa, xóa và tải học liệu (Video, Word, PPTX, hình ảnh) lên Google Drive</strong>.
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-[#526867]">
            Đang kiểm tra phiên đăng nhập...
          </div>
        ) : isAuthorizedTeacher ? (
          <div className="space-y-6">
            <div className="rounded-2xl bg-[#DDF3EA] border border-[#B8E2D1] p-6 flex items-start gap-4">
              <UserCheck className="w-7 h-7 text-[#176B5B] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-lg font-bold text-[#176B5B]">
                  Xin chào, {currentTeacherName}
                </p>
                <p className="text-sm text-[#263B3A]/85">
                  Tài khoản của bạn đang có toàn quyền quản trị: thêm, sửa, xóa học liệu và đồng bộ tự động với Google Sheet / Google Drive.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/hoc-lieu')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#176B5B] text-white text-sm font-semibold hover:bg-[#125649] transition-colors shadow-xs"
              >
                <BookOpen className="w-4 h-4" /> Quản lý Học liệu & Drive <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/quan-tri')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#263B3A] text-white text-sm font-semibold hover:bg-[#1b2b2a] transition-colors"
              >
                Quản trị 60 Hoạt động
              </button>

              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-[#F6F9F8] border border-[#DCE6E3] text-sm font-medium text-[#263B3A] hover:bg-[#E7EFEC] transition-colors"
              >
                <LogOut className="w-4 h-4" /> Đăng xuất
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto w-full">
            <div className="bg-[#F8FAF9] rounded-2xl border border-[#DCE6E3] p-6 sm:p-8 space-y-6 shadow-2xs">
              <div className="flex items-center gap-2.5 text-[#176B5B] border-b border-[#E7EFEC] pb-4">
                <div className="w-9 h-9 rounded-xl bg-[#DDF3EA] flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-[#176B5B]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#263B3A]">
                    Xác thực Giáo viên
                  </h2>
                  <p className="text-xs text-[#526867]">
                    Nhập thông tin tài khoản được cấp quyền
                  </p>
                </div>
              </div>

              {(loginError || authError) && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-700 font-medium">
                  {loginError || authError}
                </div>
              )}

              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#263B3A] mb-1.5">
                    Tên đăng nhập
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nhập tên đăng nhập..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#DCE6E3] bg-white text-sm text-[#263B3A] focus:outline-none focus:border-[#176B5B] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#263B3A] mb-1.5">
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#DCE6E3] bg-white text-sm text-[#263B3A] focus:outline-none focus:border-[#176B5B] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#176B5B] text-white text-sm font-bold hover:bg-[#125649] transition-colors shadow-xs cursor-pointer"
                >
                  <LogIn className="w-4 h-4" /> Đăng nhập
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
