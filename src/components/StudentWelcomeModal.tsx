import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle,
  GraduationCap,
  Lock,
  School,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  getStudentProfile,
  getUserRole,
  logTeacherActivity,
  saveStudentProfile,
  setUserRole,
  UserRole,
} from '../lib/googleSyncService';
import { StudentProfile } from '../types/material';

interface StudentWelcomeModalProps {
  isOpen: boolean;
  onSuccess: (role: 'teacher' | 'student', profile?: StudentProfile) => void;
  canCloseWithoutSave?: boolean;
  onClose?: () => void;
  initialView?: 'choose-role' | 'student-form';
}

export function StudentWelcomeModal({
  isOpen,
  onSuccess,
  canCloseWithoutSave = false,
  onClose,
  initialView = 'choose-role',
}: StudentWelcomeModalProps) {
  const [view, setView] = useState<'choose-role' | 'student-form'>(initialView);
  const [fullName, setFullName] = useState('');
  const [className, setClassName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const existing = getStudentProfile();
    if (existing) {
      setFullName(existing.fullName || '');
      setClassName(existing.className || '');
      setSchoolName(existing.schoolName || '');
    }
    if (isOpen) {
      setView(initialView);
    }
  }, [isOpen, initialView]);

  if (!isOpen) return null;

  const handleSelectTeacher = () => {
    setUserRole('teacher');
    logTeacherActivity('TRUY CẬP GIÁO VIÊN', 'Giáo viên mở ứng dụng thư viện');
    onSuccess('teacher');
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (fullName.trim().length < 2) {
      setError('Vui lòng nhập họ và tên của em.');
      return;
    }
    if (className.trim().length < 1) {
      setError('Vui lòng nhập lớp học (ví dụ: 6A, 7A1, 8B, 9C).');
      return;
    }
    if (schoolName.trim().length < 2) {
      setError('Vui lòng nhập tên trường THCS của em.');
      return;
    }

    const profile: StudentProfile = {
      fullName: fullName.trim(),
      className: className.trim().toUpperCase(),
      schoolName: schoolName.trim(),
      registeredAt: new Date().toISOString(),
    };

    saveStudentProfile(profile);
    onSuccess('student', profile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-[#DCE6E3] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Banner Header */}
        <div className="bg-linear-to-r from-[#176B5B] via-[#1A5C4F] to-[#263B3A] text-white p-6 sm:p-7 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-6 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-xs text-white">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Chào mừng đến với Thư viện Tái tập trung
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Thư viện Hoạt động Hỗ trợ Tái tập trung
            </h2>
            <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
              {view === 'choose-role'
                ? 'Vui lòng chọn vai trò để bắt đầu trải nghiệm ứng dụng phù hợp nhất với bạn:'
                : 'Em hãy điền thông tin học sinh để hệ thống lưu tiến trình và tính thời lượng học tập:'}
            </p>
          </div>
        </div>

        {/* View 1: Chọn vai trò Giáo viên / Học sinh */}
        {view === 'choose-role' ? (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1: Giáo viên */}
              <button
                type="button"
                onClick={handleSelectTeacher}
                className="group p-5 rounded-2xl border-2 border-[#DCE6E3] hover:border-[#176B5B] bg-[#F8FAF9] hover:bg-white transition-all text-left flex flex-col justify-between space-y-4 hover:shadow-md cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#DDF3EA] text-[#176B5B] flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform">
                    👨‍🏫
                  </div>
                  <h3 className="text-base font-bold text-[#263B3A] group-hover:text-[#176B5B] transition-colors">
                    Tôi là Giáo viên
                  </h3>
                  <p className="text-xs text-[#526867] leading-relaxed">
                    Tra cứu 60 hoạt động tái tập trung, trình chiếu trên lớp và khai thác kho học liệu.
                    <span className="block mt-1 font-semibold text-[#176B5B]">
                      ✓ Không yêu cầu điền thông tin cá nhân.
                    </span>
                  </p>
                </div>
                <div className="pt-2 text-xs font-bold text-[#176B5B] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Vào thư viện ngay &rarr;
                </div>
              </button>

              {/* Card 2: Học sinh */}
              <button
                type="button"
                onClick={() => setView('student-form')}
                className="group p-5 rounded-2xl border-2 border-[#DCE6E3] hover:border-[#0284C7] bg-[#F8FAF9] hover:bg-white transition-all text-left flex flex-col justify-between space-y-4 hover:shadow-md cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform">
                    🎒
                  </div>
                  <h3 className="text-base font-bold text-[#263B3A] group-hover:text-[#0284C7] transition-colors">
                    Tôi là Học sinh
                  </h3>
                  <p className="text-xs text-[#526867] leading-relaxed">
                    Thực hiện các bài tập rèn luyện tập trung, xem video hướng dẫn và tự động tích lũy thời lượng học tập.
                    <span className="block mt-1 font-semibold text-[#0284C7]">
                      ✓ Điền tên, lớp, trường để ghi danh.
                    </span>
                  </p>
                </div>
                <div className="pt-2 text-xs font-bold text-[#0284C7] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Nhập thông tin học sinh &rarr;
                </div>
              </button>
            </div>

            {/* Chân modal: Link cho Quản trị viên (Admin) */}
            <div className="pt-4 border-t border-[#F0F4F2] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#526867]">
              <span>
                🔐 Bạn là <strong>Quản trị viên (Admin)</strong> đăng tải học liệu lên Drive?
              </span>
              <Link
                to="/dang-nhap"
                onClick={onClose}
                className="font-bold text-[#176B5B] hover:underline whitespace-nowrap inline-flex items-center gap-1"
              >
                <Lock className="w-3.5 h-3.5" /> Đăng nhập Admin
              </Link>
            </div>

            {canCloseWithoutSave && onClose && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-gray-500 hover:underline"
                >
                  Đóng cửa sổ
                </button>
              </div>
            )}
          </div>
        ) : (
          /* View 2: Form Học sinh */
          <form onSubmit={handleStudentSubmit} className="p-6 sm:p-7 space-y-5">
            <button
              type="button"
              onClick={() => setView('choose-role')}
              className="text-xs font-bold text-[#176B5B] inline-flex items-center gap-1.5 hover:underline mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại chọn vai trò
            </button>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#263B3A] mb-1.5">
                  <span className="text-[#176B5B]">1.</span> Họ và tên học sinh <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#526867] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn An"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DCE6E3] bg-[#F6F9F8] focus:bg-white focus:outline-none focus:border-[#176B5B] text-sm text-[#263B3A] font-medium transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#263B3A] mb-1.5">
                    <span className="text-[#176B5B]">2.</span> Lớp <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-[#526867] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      placeholder="VD: 7A1, 8B"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DCE6E3] bg-[#F6F9F8] focus:bg-white focus:outline-none focus:border-[#176B5B] text-sm text-[#263B3A] font-medium transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#263B3A] mb-1.5">
                    <span className="text-[#176B5B]">3.</span> Trường THCS <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <School className="w-4 h-4 text-[#526867] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="VD: THCS Nguyễn Du"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DCE6E3] bg-[#F6F9F8] focus:bg-white focus:outline-none focus:border-[#176B5B] text-sm text-[#263B3A] font-medium transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-[#EBF7F2] p-3 text-xs text-[#176B5B] flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#176B5B]" />
              <span>
                Thông tin của em sẽ được tự động đồng bộ vào bảng theo dõi của trường và tính thời lượng học tập.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setView('choose-role')}
                className="px-4 py-2.5 rounded-xl border border-[#DCE6E3] text-sm font-semibold text-[#526867] hover:bg-[#F6F9F8]"
              >
                Quay lại
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#176B5B] text-white text-sm font-bold hover:bg-[#125649] transition-colors shadow-xs inline-flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4" /> Bắt đầu vào Thư viện
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
