import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  Copy,
  KeyRound,
  LogIn,
  LogOut,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchMyTeacherRequest, submitTeacherAccessRequest } from '../lib/teacherService';
import { TeacherAccessRequest } from '../types/activity';

export function TeacherLoginPage() {
  const navigate = useNavigate();
  const {
    user,
    teacherSession,
    loading,
    isAuthorizedTeacher,
    authError,
    loginWithCredentials,
    signInWithGoogle,
    logout,
  } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const [requestData, setRequestData] = useState<TeacherAccessRequest | null>(null);
  const [reqLoading, setReqLoading] = useState(false);
  const [schoolName, setSchoolName] = useState('');
  const [note, setNote] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);
  const [submitErr, setSubmitErr] = useState<string | null>(null);
  const [copiedUid, setCopiedUid] = useState(false);

  useEffect(() => {
    if (user && !isAuthorizedTeacher) {
      setDisplayName(user.displayName || '');
      fetchMyTeacherRequest(user.uid)
        .then((res) => setRequestData(res))
        .catch(() => setRequestData(null));
    }
  }, [user, isAuthorizedTeacher]);

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

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitErr(null);
    setSubmitMsg(null);

    if (displayName.trim().length < 2 || schoolName.trim().length < 2) {
      setSubmitErr('Vui lòng nhập đầy đủ họ tên giáo viên và tên trường THCS.');
      return;
    }

    setReqLoading(true);
    try {
      await submitTeacherAccessRequest(displayName, schoolName, note);
      const updated = await fetchMyTeacherRequest(user!.uid);
      setRequestData(updated);
      setSubmitMsg('Đã gửi yêu cầu cấp quyền thành công. Quản trị viên sẽ xét duyệt sớm.');
    } catch (err) {
      console.error(err);
      setSubmitErr('Không thể gửi yêu cầu lúc này. Vui lòng thử lại.');
    } finally {
      setReqLoading(false);
    }
  };

  const copyUid = async () => {
    if (!user) return;
    await navigator.clipboard.writeText(user.uid);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  const currentTeacherName = teacherSession?.displayName || user?.displayName || user?.email || 'Giáo viên';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="bg-white rounded-3xl border border-[#DCE6E3] p-6 sm:p-10 shadow-xs space-y-8">
        <div className="space-y-2 border-b border-[#DCE6E3] pb-6">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#176B5B] uppercase tracking-wide">
            <ShieldCheck className="w-4 h-4" />
            Cổng quản trị dành riêng cho Giáo viên
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#263B3A]">
            Đăng nhập Giáo viên & Quản trị Học liệu
          </h1>
          <p className="text-sm sm:text-base text-[#526867] leading-relaxed">
            Học sinh chỉ cần điền Họ tên, Lớp, Trường để tra cứu và học tập.
            Chỉ Giáo viên đăng nhập mới có quyền <strong>thêm, chỉnh sửa, xóa và tải học liệu (Video, Word, PPTX, hình ảnh) lên Google Drive</strong>.
          </p>
        </div>

        {loading ? (
          <div className="py-8 text-center text-sm text-[#526867]">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Phương thức 1: Đăng nhập tài khoản mặc định Dieuhien / 2026 */}
            <div className="bg-[#F8FAF9] rounded-2xl border border-[#DCE6E3] p-6 space-y-5">
              <div className="flex items-center gap-2 text-[#176B5B]">
                <KeyRound className="w-5 h-5" />
                <h2 className="text-base font-bold text-[#263B3A]">
                  Đăng nhập tài khoản Giáo viên
                </h2>
              </div>

              {(loginError || authError) && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                  {loginError || authError}
                </div>
              )}

              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#526867] mb-1.5">
                    Tên đăng nhập
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nhập tên đăng nhập..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE6E3] bg-white text-sm text-[#263B3A] focus:outline-none focus:border-[#176B5B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#526867] mb-1.5">
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE6E3] bg-white text-sm text-[#263B3A] focus:outline-none focus:border-[#176B5B]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#176B5B] text-white text-sm font-semibold hover:bg-[#125649] transition-colors shadow-xs"
                >
                  <LogIn className="w-4 h-4" /> Đăng nhập
                </button>
              </form>
            </div>

            {/* Phương thức 2: Đăng nhập bằng Google */}
            <div className="bg-[#F8FAF9] rounded-2xl border border-[#DCE6E3] p-6 space-y-5 flex flex-col justify-between h-full">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#176B5B]">
                  <ShieldCheck className="w-5 h-5" />
                  <h2 className="text-base font-bold text-[#263B3A]">
                    Đăng nhập bằng tài khoản Google
                  </h2>
                </div>
                <p className="text-xs text-[#526867] leading-relaxed">
                  Dành cho giáo viên đã được thêm email vào danh sách quản trị viên hệ thống qua Firebase.
                </p>
              </div>

              <div className="space-y-4 pt-4">
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  className="w-full inline-flex items-center justify-center gap-3 px-5 py-3 rounded-xl bg-white border border-[#DCE6E3] text-[#263B3A] text-sm font-semibold hover:bg-[#F0F4F2] transition-colors shadow-2xs"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  Đăng nhập với Google
                </button>

                <p className="text-[11px] text-[#526867] text-center">
                  Tài khoản Google sau khi đăng nhập sẽ tự động đối chiếu quyền hạn quản trị.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Nếu đã đăng nhập Google nhưng chưa được duyệt */}
        {user && !isAuthorizedTeacher && (
          <div className="mt-8 pt-8 border-t border-[#DCE6E3] space-y-6">
            <div className="rounded-2xl bg-[#FDF3E1] border border-[#F3D69F] p-5 space-y-2">
              <p className="text-sm font-bold text-[#263B3A]">
                Tài khoản Google: {user.displayName || user.email}
              </p>
              <p className="text-xs text-[#526867]">
                Tài khoản này chưa có trong danh sách quản trị viên. Bạn có thể sử dụng form bên dưới để gửi yêu cầu cấp quyền.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[#526867]">
                <span>UID Firebase:</span>
                <code className="px-2 py-0.5 rounded bg-white border border-[#DCE6E3] font-mono text-[#263B3A]">
                  {user.uid}
                </code>
                <button
                  type="button"
                  onClick={copyUid}
                  className="px-2 py-0.5 rounded bg-white border border-[#DCE6E3] hover:bg-[#F6F9F8] text-[#176B5B] font-medium inline-flex items-center gap-1"
                >
                  {copiedUid ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copiedUid ? 'Đã sao chép' : 'Sao chép UID'}
                </button>
              </div>
            </div>

            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <h3 className="text-sm font-bold text-[#263B3A]">Gửi thông tin đăng ký Giáo viên THCS</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#526867] mb-1">Họ tên giáo viên</label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#DCE6E3] bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#526867] mb-1">Trường THCS</label>
                  <input
                    type="text"
                    required
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="VD: THCS Nguyễn Du"
                    className="w-full px-3 py-2 rounded-xl border border-[#DCE6E3] bg-white text-sm"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={reqLoading}
                className="px-5 py-2.5 rounded-xl bg-[#176B5B] text-white text-sm font-semibold hover:bg-[#125649]"
              >
                {reqLoading ? 'Đang gửi...' : 'Gửi yêu cầu xét duyệt'}
              </button>
              {submitMsg && <p className="text-xs text-emerald-600 font-semibold">{submitMsg}</p>}
              {submitErr && <p className="text-xs text-red-600 font-semibold">{submitErr}</p>}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
