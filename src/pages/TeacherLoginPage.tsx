import React, { useEffect, useState } from 'react';
import { ArrowRight, Check, Copy, LogIn, LogOut, ShieldCheck, UserCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchMyTeacherRequest, submitTeacherAccessRequest } from '../lib/teacherService';
import { TeacherAccessRequest } from '../types/activity';

export function TeacherLoginPage() {
  const navigate = useNavigate();
  const {
    user,
    loading,
    isAuthorizedTeacher,
    authError,
    signInWithGoogle,
    logout,
    refreshAuthRole,
  } = useAuth();

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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="bg-white rounded-3xl border border-[#DCE6E3] p-6 sm:p-10 shadow-xs space-y-6">
        <div className="space-y-2 border-b border-[#DCE6E3] pb-6">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#176B5B]">
            <ShieldCheck className="w-4 h-4" />
            Khu vực dành riêng cho Giáo viên quản trị học liệu
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#263B3A]">
            Đăng nhập Giáo viên
          </h1>
          <p className="text-sm sm:text-base text-[#526867] leading-relaxed">
            Học sinh, phụ huynh và người xem thông thường không cần đăng nhập để tra cứu thư viện.
            Chỉ giáo viên được cấp quyền mới đăng nhập để thêm, chỉnh sửa, ẩn hoặc xóa hoạt động.
          </p>
        </div>

        {loading ? (
          <div className="py-8 text-center text-sm text-[#526867]">
            Đang kiểm tra trạng thái đăng nhập...
          </div>
        ) : !user ? (
          <div className="space-y-5">
            {authError && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {authError}
              </div>
            )}

            <button
              type="button"
              onClick={signInWithGoogle}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-[#176B5B] text-white text-base font-semibold hover:bg-[#125649] transition-colors"
            >
              <LogIn className="w-5 h-5" />
              Đăng nhập bằng tài khoản Google
            </button>

            <p className="text-xs text-[#526867]">
              Xác thực an toàn thông qua Firebase Authentication. Sau khi đăng nhập, hệ thống sẽ tự
              động kiểm tra quyền biên tập thư viện của thầy cô.
            </p>
          </div>
        ) : isAuthorizedTeacher ? (
          <div className="space-y-6">
            <div className="rounded-2xl bg-[#DDF3EA] border border-[#B8E2D1] p-5 flex items-start gap-3.5">
              <UserCheck className="w-6 h-6 text-[#176B5B] shrink-0 mt-0.5" />
              <div>
                <p className="text-base font-bold text-[#263B3A]">
                  Xin chào, {user.displayName || user.email}
                </p>
                <p className="text-sm text-[#263B3A]/80 mt-0.5">
                  Tài khoản của thầy cô đã được cấp quyền quản trị Thư viện Hoạt động.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/quan-tri')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#176B5B] text-white text-sm font-semibold hover:bg-[#125649] transition-colors"
              >
                Vào Khu vực Quản trị <ArrowRight className="w-4 h-4" />
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
          <div className="space-y-6">
            <div className="rounded-2xl bg-[#FDF3E1] border border-[#F3D69F] p-5 space-y-2">
              <p className="text-sm font-bold text-[#263B3A]">
                Tài khoản đang đăng nhập: {user.displayName || user.email}
              </p>
              <p className="text-sm text-[#526867]">
                Tài khoản này chưa nằm trong danh sách giáo viên được cấp quyền biên tập thư viện.
                Thầy cô vẫn có thể xem toàn bộ nội dung công khai hoặc gửi yêu cầu cấp quyền bên dưới.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[#526867]">
                <span>Mã định danh (UID):</span>
                <code className="px-2 py-1 rounded bg-white border border-[#DCE6E3] font-mono text-[#263B3A]">
                  {user.uid}
                </code>
                <button
                  type="button"
                  onClick={copyUid}
                  className="inline-flex items-center gap-1 text-[#176B5B] font-semibold hover:underline"
                >
                  {copiedUid ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedUid ? 'Đã chép' : 'Sao chép UID'}
                </button>
              </div>
            </div>

            {requestData?.status === 'pending' ? (
              <div className="rounded-2xl bg-[#F6F9F8] border border-[#DCE6E3] p-5 space-y-2">
                <p className="text-sm font-bold text-[#7563B8]">
                  Yêu cầu cấp quyền đang chờ duyệt
                </p>
                <p className="text-sm text-[#526867]">
                  Trường: <strong className="text-[#263B3A]">{requestData.schoolName}</strong> ·
                  Họ tên: <strong className="text-[#263B3A]">{requestData.displayName}</strong>
                </p>
                <button
                  type="button"
                  onClick={refreshAuthRole}
                  className="mt-2 px-4 py-2 rounded-xl bg-white border border-[#DCE6E3] text-xs font-semibold text-[#176B5B] hover:bg-[#DDF3EA]"
                >
                  Kiểm tra lại trạng thái quyền
                </button>
              </div>
            ) : (
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                <h2 className="text-base font-bold text-[#263B3A]">
                  Gửi yêu cầu cấp quyền Giáo viên biên tập
                </h2>

                {submitErr && (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {submitErr}
                  </div>
                )}
                {submitMsg && (
                  <div className="rounded-xl bg-[#DDF3EA] border border-[#B8E2D1] px-4 py-3 text-sm text-[#176B5B]">
                    {submitMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#263B3A] mb-1.5">
                      Họ và tên giáo viên *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={100}
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="VD: Cô Nguyễn Minh Anh"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE6E3] bg-[#F6F9F8] focus:bg-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#263B3A] mb-1.5">
                      Đơn vị công tác (Trường THCS) *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={140}
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="VD: Trường THCS Chu Văn An"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE6E3] bg-[#F6F9F8] focus:bg-white text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#263B3A] mb-1.5">
                    Môn giảng dạy / Ghi chú
                  </label>
                  <textarea
                    rows={2}
                    maxLength={300}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="VD: Giáo viên Ngữ văn khối 7–8, mong muốn đóng góp hoạt động tương tác."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE6E3] bg-[#F6F9F8] focus:bg-white text-sm"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="submit"
                    disabled={reqLoading}
                    className="px-5 py-2.5 rounded-xl bg-[#176B5B] text-white text-sm font-semibold hover:bg-[#125649] disabled:opacity-60"
                  >
                    {reqLoading ? 'Đang gửi...' : 'Gửi yêu cầu cấp quyền'}
                  </button>

                  <div className="flex items-center gap-3">
                    <Link
                      to="/hoat-dong"
                      className="text-sm font-medium text-[#176B5B] hover:underline"
                    >
                      Quay lại Thư viện
                    </Link>
                    <button
                      type="button"
                      onClick={logout}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-[#526867] hover:text-[#263B3A]"
                    >
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
