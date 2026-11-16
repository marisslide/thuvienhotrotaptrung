import React, { useEffect, useState } from 'react';
import { Award, BookOpen, CheckCircle, GraduationCap, School, Sparkles, User } from 'lucide-react';
import { getStudentProfile, saveStudentProfile } from '../lib/googleSyncService';
import { StudentProfile } from '../types/material';

interface StudentWelcomeModalProps {
  isOpen: boolean;
  onSuccess: (profile: StudentProfile) => void;
  canCloseWithoutSave?: boolean;
  onClose?: () => void;
}

export function StudentWelcomeModal({
  isOpen,
  onSuccess,
  canCloseWithoutSave = false,
  onClose,
}: StudentWelcomeModalProps) {
  const [fullName, setFullName] = useState('');
  const [className, setClassName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const existing = getStudentProfile();
    if (existing) {
      setFullName(existing.fullName);
      setClassName(existing.className);
      setSchoolName(existing.schoolName);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
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
    onSuccess(profile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-[#DCE6E3] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Banner Header */}
        <div className="bg-linear-to-r from-[#176B5B] to-[#263B3A] text-white p-6 sm:p-7 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-xs text-white">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Chào mừng em đến với Thư viện
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Thư viện Hoạt động Hỗ trợ Tái tập trung
            </h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              Vui lòng cung cấp thông tin học sinh để hệ thống đồng bộ nhật ký tham gia hoạt động và lưu lại tiến trình học tập của em.
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5">
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
              Thông tin của em sẽ được lưu trữ tự động trên bảng theo dõi của nhà trường nhằm hỗ trợ rèn luyện khả năng tập trung tốt nhất.
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            {canCloseWithoutSave && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-[#DCE6E3] text-sm font-semibold text-[#526867] hover:bg-[#F6F9F8] transition-colors"
              >
                Để sau
              </button>
            )}

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#176B5B] text-white text-sm font-bold hover:bg-[#125649] transition-colors shadow-xs inline-flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" /> Bắt đầu vào Thư viện
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
