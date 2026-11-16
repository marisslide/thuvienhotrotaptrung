import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Copy,
  Maximize2,
  Printer,
  Sparkles,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { ActivityCard } from '../components/ActivityCard';
import { ClassroomTimer } from '../components/ClassroomTimer';
import { ProjectorModal } from '../components/ProjectorModal';
import { useLibrary } from '../context/LibraryContext';
import { EXPRESSION_MAP, GROUP_MAP } from '../data/taxonomy';
import { fetchActivityById } from '../lib/activityService';
import { Activity } from '../types/activity';

export function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { activities } = useLibrary();

  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [projectorOpen, setProjectorOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      // Try from context first for instant render, then confirm from Firestore
      const localMatch = activities.find((a) => a.id === id);
      if (localMatch && active) {
        setActivity(localMatch);
      }
      try {
        const fetched = await fetchActivityById(id);
        if (active && fetched) {
          setActivity(fetched);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [id, activities]);

  if (loading && !activity) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-8 w-48 bg-white rounded-xl animate-pulse mb-6" />
        <div className="h-96 bg-white rounded-3xl border border-[#DCE6E3] animate-pulse" />
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-[#263B3A] mb-3">
          Không tìm thấy hoạt động này
        </h1>
        <p className="text-base text-[#526867] mb-6">
          Hoạt động có thể đang được giáo viên tạm ẩn hoặc đường dẫn không chính xác.
        </p>
        <Link
          to="/hoat-dong"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#176B5B] text-white text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách hoạt động
        </Link>
      </div>
    );
  }

  const groupMeta = GROUP_MAP[activity.group];
  const related = activities
    .filter((a) => a.group === activity.group && a.id !== activity.id)
    .slice(0, 3);

  const handleCopySummary = async () => {
    const text = [
      `HOẠT ĐỘNG: ${activity.title} (${activity.durationMinutes} phút · ${activity.scale})`,
      `Nhóm: ${groupMeta?.name}`,
      `Chuẩn bị: ${activity.materials}`,
      `Các bước:`,
      ...activity.steps.map((s, i) => `${i + 1}. ${s}`),
      `Câu chuyển tiếp quay lại bài học: ${activity.transitionBackTip}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback ignored
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8 sm:py-12">
      {/* Breadcrumb & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 no-print">
        <Link
          to="/hoat-dong"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#526867] hover:text-[#176B5B] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách hoạt động
        </Link>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#DCE6E3] text-sm font-medium text-[#263B3A] hover:bg-[#F6F9F8] transition-colors whitespace-nowrap shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[#176B5B]" /> Đã sao chép
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Sao chép giáo án nhanh
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#DCE6E3] text-sm font-medium text-[#263B3A] hover:bg-[#F6F9F8] transition-colors whitespace-nowrap shrink-0"
          >
            <Printer className="w-4 h-4" /> In hướng dẫn
          </button>

          <button
            type="button"
            onClick={() => setProjectorOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#176B5B] text-white text-sm font-semibold hover:bg-[#125649] transition-colors whitespace-nowrap shrink-0"
          >
            <Maximize2 className="w-4 h-4" /> Trình chiếu lớp học
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Main Guide */}
        <article className="lg:col-span-8 bg-white rounded-3xl border border-[#DCE6E3] p-6 sm:p-10 shadow-xs space-y-8">
          <header className="pb-6 border-b border-[#DCE6E3]">
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-semibold mb-3">
              <Link
                to={`/hoat-dong?nhom=${activity.group}`}
                style={{ color: groupMeta?.accentColor || '#176B5B' }}
                className="hover:underline"
              >
                Nhóm {groupMeta?.name}
              </Link>
              <span className="text-[#526867]/50" aria-hidden="true">
                ·
              </span>
              <span className="text-[#526867] tabular-nums">{activity.durationMinutes} phút</span>
              <span className="text-[#526867]/50" aria-hidden="true">
                ·
              </span>
              <span className="text-[#526867]">{activity.scale}</span>
              <span className="text-[#526867]/50" aria-hidden="true">
                ·
              </span>
              <span className="text-[#526867]">{activity.gradeRange}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold text-[#263B3A] leading-tight mb-4">
              {activity.title}
            </h1>

            <p className="text-base sm:text-lg text-[#526867] leading-relaxed">
              {activity.shortDescription}
            </p>
          </header>

          {/* Goal */}
          <section>
            <h2 className="text-base font-bold text-[#176B5B] mb-2">Mục tiêu hỗ trợ lớp học</h2>
            <p className="text-[15px] sm:text-base text-[#263B3A] leading-relaxed">
              {activity.goal}
            </p>
          </section>

          {/* Steps */}
          <section>
            <h2 className="text-lg font-bold text-[#263B3A] mb-4">
              Các bước tổ chức thực hiện
            </h2>
            <ol className="space-y-4">
              {activity.steps.map((step, index) => (
                <li
                  key={index}
                  className="flex items-start gap-4 rounded-2xl bg-[#F6F9F8] border border-[#DCE6E3] p-4 sm:p-5"
                >
                  <span className="w-8 h-8 rounded-xl bg-[#176B5B] text-white font-bold text-sm flex items-center justify-center shrink-0 tabular-nums">
                    {index + 1}
                  </span>
                  <p className="text-base text-[#263B3A] leading-relaxed pt-0.5">{step}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* Transition Back Tip */}
          <section className="rounded-2xl bg-[#DDF3EA] border border-[#B8E2D1] p-6">
            <h2 className="text-sm font-bold text-[#176B5B] mb-2">
              Gợi ý câu dẫn quay lại nhiệm vụ học tập
            </h2>
            <p className="text-base sm:text-lg font-medium text-[#263B3A] leading-relaxed">
              {activity.transitionBackTip}
            </p>
          </section>

          {/* Teacher Notes */}
          {activity.teacherNotes && (
            <section className="pt-2 border-t border-[#DCE6E3]">
              <h2 className="text-sm font-bold text-[#7563B8] mb-2">
                Lưu ý thêm dành cho giáo viên
              </h2>
              <p className="text-[15px] text-[#526867] leading-relaxed">
                {activity.teacherNotes}
              </p>
            </section>
          )}
        </article>

        {/* Right Utility Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Interactive Classroom Timer */}
          <div className="bg-white rounded-3xl border border-[#DCE6E3] p-6 shadow-xs space-y-4 no-print">
            <div>
              <h2 className="text-base font-bold text-[#263B3A] mb-1">Điều phối trực tiếp</h2>
              <p className="text-xs text-[#526867]">
                Chạy đồng hồ đếm ngược ngay trên máy tính giáo viên hoặc bật chế độ trình chiếu lớn.
              </p>
            </div>

            <ClassroomTimer initialMinutes={activity.durationMinutes} />

            <button
              type="button"
              onClick={() => setProjectorOpen(true)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#176B5B] text-white text-sm font-semibold hover:bg-[#125649] transition-colors"
            >
              <Maximize2 className="w-4 h-4" /> Mở màn hình trình chiếu lớp học
            </button>
          </div>

          {/* Quick Spec Card */}
          <div className="bg-white rounded-3xl border border-[#DCE6E3] p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#263B3A]">Thông tin tổ chức</h2>

            <dl className="divide-y divide-[#DCE6E3] text-sm">
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-[#526867]">Thời lượng</dt>
                <dd className="font-semibold text-[#263B3A] tabular-nums">
                  {activity.durationMinutes} phút
                </dd>
              </div>
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-[#526867]">Quy mô</dt>
                <dd className="font-semibold text-[#263B3A]">{activity.scale}</dd>
              </div>
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-[#526867]">Thời điểm phù hợp</dt>
                <dd className="font-semibold text-[#263B3A]">{activity.suitableTiming}</dd>
              </div>
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-[#526867]">Học cụ</dt>
                <dd className="font-semibold text-[#263B3A] text-right">{activity.materials}</dd>
              </div>
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-[#526867]">Khối lớp</dt>
                <dd className="font-semibold text-[#263B3A]">{activity.gradeRange}</dd>
              </div>
            </dl>

            <div className="pt-2">
              <p className="text-xs font-semibold text-[#7563B8] mb-2">
                Phù hợp khi quan sát biểu hiện
              </p>
              <div className="space-y-1.5">
                {activity.expressions.map((expId) => {
                  const exp = EXPRESSION_MAP[expId];
                  if (!exp) return null;
                  return (
                    <Link
                      key={expId}
                      to={`/hoat-dong?bieuHien=${expId}`}
                      className="block text-sm font-medium text-[#263B3A] hover:text-[#176B5B] hover:underline"
                    >
                      · {exp.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Related Activities */}
      {related.length > 0 && (
        <section className="mt-14 pt-10 border-t border-[#DCE6E3] no-print">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-[#263B3A]">
              Hoạt động khác cùng nhóm {groupMeta?.shortTitle}
            </h2>
            <Link
              to={`/hoat-dong?nhom=${activity.group}`}
              className="text-sm font-semibold text-[#176B5B] hover:underline"
            >
              Xem thêm
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((item) => (
              <ActivityCard key={item.id} activity={item} />
            ))}
          </div>
        </section>
      )}

      <ProjectorModal
        open={projectorOpen}
        activity={activity}
        onClose={() => setProjectorOpen(false)}
      />
    </div>
  );
}
