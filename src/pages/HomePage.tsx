import { ArrowRight, BookOpen, Clock, Eye, Layers, Sparkles, ShieldCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ActivityCard } from '../components/ActivityCard';
import { SafeImage } from '../components/SafeImage';
import { useLibrary } from '../context/LibraryContext';
import { ACTIVITY_GROUPS, STUDENT_EXPRESSIONS } from '../data/taxonomy';

export function HomePage() {
  const { activities, loading } = useLibrary();

  const publishedCount = activities.length;
  const featuredActivities = activities.slice(0, 6);

  const countByGroup = (groupId: string) =>
    activities.filter((a) => a.group === groupId).length;

  return (
    <div>
      {/* 1. Hero Section */}
      <section className="bg-white border-b border-[#DCE6E3]">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <div className="lg:col-span-7 flex flex-col justify-center">
              <p className="text-sm font-semibold text-[#7563B8] mb-3">
                Thư viện học liệu & hoạt động lớp học THCS
              </p>

              <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-[#263B3A] leading-[1.18] mb-4">
                Thư viện hoạt động hỗ trợ tái tập trung
              </h1>

              <p className="text-lg sm:text-xl font-semibold text-[#176B5B] mb-4">
                “Nhận diện biểu hiện – Lựa chọn hoạt động – Quay lại nhiệm vụ học tập”
              </p>

              <p className="text-base leading-relaxed text-[#526867] max-w-2xl mb-8">
                Hỗ trợ giáo viên THCS nhanh chóng chọn đúng hoạt động ngắn từ 2 đến 5 phút khi học
                sinh mệt mỏi, xao nhãng hoặc chậm nhịp, giúp lớp học lấy lại sự tỉnh táo và quay về
                bài giảng một cách nhẹ nhàng.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/hoat-dong"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#176B5B] text-white text-sm sm:text-base font-semibold hover:bg-[#125649] transition-colors whitespace-nowrap shrink-0"
                >
                  Khám phá thư viện ({publishedCount})
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/hoc-lieu"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#263B3A] text-white text-sm sm:text-base font-semibold hover:bg-[#1a2928] transition-colors whitespace-nowrap shrink-0 shadow-2xs"
                >
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  Kho Học liệu (Video, Slide, Word)
                </Link>

                <Link
                  to="/nhan-dien"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#DDF3EA] text-[#176B5B] text-sm sm:text-base font-semibold hover:bg-[#cdebd0] transition-colors whitespace-nowrap shrink-0"
                >
                  Chọn theo biểu hiện lớp học
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 flex">
              <div className="w-full rounded-2xl overflow-hidden border border-[#DCE6E3] bg-[#DDF3EA] shadow-sm">
                <SafeImage
                  src="/src/assets/images/hero_classroom_refocus_1794556735156.jpg"
                  alt="Giáo viên THCS hướng dẫn học sinh thực hiện hoạt động giãn cơ ngắn tại lớp học"
                  fallbackTitle="Lớp học THCS cùng thực hiện hoạt động tái tập trung"
                  className="w-full h-64 sm:h-80 lg:h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* 3-Step Workflow Strip below Hero Split */}
          <div className="mt-10 pt-8 border-t border-[#DCE6E3] grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3.5">
              <span className="w-8 h-8 rounded-lg bg-[#DDF3EA] text-[#176B5B] font-bold text-sm flex items-center justify-center shrink-0 tabular-nums">
                01
              </span>
              <div>
                <h2 className="text-sm font-bold text-[#263B3A] mb-1">Nhận diện biểu hiện</h2>
                <p className="text-sm text-[#526867] leading-relaxed">
                  Quan sát nhanh nhịp lớp: mệt mỏi, nhìn ra ngoài, nói chuyện riêng hay phản hồi chậm.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <span className="w-8 h-8 rounded-lg bg-[#EFECFB] text-[#7563B8] font-bold text-sm flex items-center justify-center shrink-0 tabular-nums">
                02
              </span>
              <div>
                <h2 className="text-sm font-bold text-[#263B3A] mb-1">Lựa chọn hoạt động 2–5 phút</h2>
                <p className="text-sm text-[#526867] leading-relaxed">
                  Tra cứu ngay trong 6 nhóm hoạt động, ưu tiên không cần học cụ và có thể trình chiếu.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <span className="w-8 h-8 rounded-lg bg-[#FDF3E1] text-[#9A5E08] font-bold text-sm flex items-center justify-center shrink-0 tabular-nums">
                03
              </span>
              <div>
                <h2 className="text-sm font-bold text-[#263B3A] mb-1">Quay lại nhiệm vụ học tập</h2>
                <p className="text-sm text-[#526867] leading-relaxed">
                  Mỗi hoạt động đều kèm câu dẫn chuyển tiếp giúp lớp học bắt nhịp lại bài giảng ngay.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Quick Expression Selector */}
      <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold text-[#7563B8] mb-1.5">Tra cứu theo tình huống</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#263B3A]">
              Khi quan sát thấy học sinh có biểu hiện
            </h2>
          </div>
          <Link
            to="/nhan-dien"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#176B5B] hover:underline whitespace-nowrap shrink-0"
          >
            Xem hướng dẫn nhận diện chi tiết <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {STUDENT_EXPRESSIONS.map((exp) => (
            <Link
              key={exp.id}
              to={`/nhan-dien?chon=${exp.id}`}
              className="group bg-white rounded-2xl border border-[#DCE6E3] p-5 hover:border-[#176B5B] hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-xs font-semibold text-[#7563B8] tabular-nums">
                  Biểu hiện {exp.order}
                </span>
                <ArrowRight className="w-4 h-4 text-[#526867] group-hover:text-[#176B5B] group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="text-base font-bold text-[#263B3A] group-hover:text-[#176B5B] mb-2">
                {exp.label}
              </h3>
              <p className="text-sm text-[#526867] line-clamp-2 leading-relaxed">
                {exp.classroomCues[0]}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Six Activity Groups Overview */}
      <section className="bg-white border-y border-[#DCE6E3] py-14">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs font-semibold text-[#176B5B] mb-1.5">Cấu trúc thư viện</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#263B3A]">
                Sáu nhóm hoạt động hỗ trợ tái tập trung
              </h2>
            </div>
            <Link
              to="/nhom-hoat-dong"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#176B5B] hover:underline whitespace-nowrap shrink-0"
            >
              Tìm hiểu vai trò từng nhóm <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ACTIVITY_GROUPS.map((group) => {
              const count = countByGroup(group.id);
              return (
                <Link
                  key={group.id}
                  to={`/hoat-dong?nhom=${group.id}`}
                  className="group rounded-2xl border border-[#DCE6E3] bg-[#F6F9F8] hover:bg-white p-6 transition-all hover:shadow-sm hover:border-[#176B5B]/50 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <span
                        className="text-xs font-bold tracking-wide"
                        style={{ color: group.accentColor }}
                      >
                        {group.order}. {group.name}
                      </span>
                      <span className="text-xs font-medium text-[#526867] tabular-nums">
                        {count} hoạt động
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#263B3A] mb-2 leading-snug">
                      {group.tagline}
                    </h3>
                    <p className="text-sm text-[#526867] leading-relaxed mb-4">
                      {group.description}
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#176B5B]">
                    Mở nhóm {group.shortTitle.toLowerCase()}
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Featured Activities */}
      <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold text-[#176B5B] mb-1.5">Sẵn sàng áp dụng ngay</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#263B3A]">
              Hoạt động tiêu biểu cho lớp học THCS
            </h2>
          </div>
          <Link
            to="/hoat-dong"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#176B5B] hover:underline whitespace-nowrap shrink-0"
          >
            Xem toàn bộ {publishedCount} hoạt động <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-56 rounded-2xl bg-white border border-[#DCE6E3] animate-pulse p-6"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredActivities.map((act) => (
              <ActivityCard key={act.id} activity={act} />
            ))}
          </div>
        )}
      </section>

      {/* 5. Pedagogical Scope & Classroom Projector Ready */}
      <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pb-6">
        <div className="rounded-3xl bg-[#DDF3EA] border border-[#B8E2D1] p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#176B5B]">
              <ShieldCheck className="w-4 h-4" />
              Định hướng sư phạm rõ ràng
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#263B3A]">
              Thư viện học liệu hỗ trợ giáo viên — không chấm điểm, không chẩn đoán tâm lý
            </h2>
            <p className="text-sm sm:text-base text-[#263B3A]/85 leading-relaxed">
              Mọi hoạt động được thiết kế để tổ chức trực tiếp trong lớp học THCS trong 2–5 phút,
              hỗ trợ trình chiếu trên màn hình lớn với đồng hồ đếm ngược tích hợp. Học sinh không cần
              điện thoại hay tài khoản cá nhân.
            </p>
          </div>
          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
            <Link
              to="/huong-dan"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#176B5B] text-white text-sm font-semibold hover:bg-[#125649] transition-colors whitespace-nowrap"
            >
              <BookOpen className="w-4 h-4" /> Xem hướng dẫn sử dụng
            </Link>
            <Link
              to="/hoat-dong"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-[#176B5B] border border-[#B8E2D1] text-sm font-semibold hover:bg-[#F6F9F8] transition-colors whitespace-nowrap"
            >
              <Clock className="w-4 h-4" /> Lọc hoạt động theo thời lượng
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
