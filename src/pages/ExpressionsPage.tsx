import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Eye, Info } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { ActivityCard } from '../components/ActivityCard';
import { useLibrary } from '../context/LibraryContext';
import { GROUP_MAP, STUDENT_EXPRESSIONS } from '../data/taxonomy';
import { ExpressionId } from '../types/activity';

export function ExpressionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { activities, loading } = useLibrary();

  const initialParam = searchParams.get('chon') as ExpressionId | null;
  const validInitial = STUDENT_EXPRESSIONS.some((e) => e.id === initialParam)
    ? (initialParam as ExpressionId)
    : STUDENT_EXPRESSIONS[0].id;

  const [selectedId, setSelectedId] = useState<ExpressionId>(validInitial);

  useEffect(() => {
    if (initialParam && STUDENT_EXPRESSIONS.some((e) => e.id === initialParam)) {
      setSelectedId(initialParam);
    }
  }, [initialParam]);

  const handleSelect = (id: ExpressionId) => {
    setSelectedId(id);
    setSearchParams({ chon: id });
  };

  const activeExp =
    STUDENT_EXPRESSIONS.find((e) => e.id === selectedId) || STUDENT_EXPRESSIONS[0];

  const matchingActivities = activities.filter((a) => a.expressions.includes(activeExp.id));

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-10 sm:py-12">
      {/* Header */}
      <div className="max-w-3xl mb-10">
        <p className="text-xs font-semibold text-[#7563B8] mb-2">Bước 01 · Quan sát lớp học</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#263B3A] mb-3">
          Nhận diện biểu hiện lớp học
        </h1>
        <p className="text-base text-[#526867] leading-relaxed">
          Chọn một biểu hiện mà thầy cô đang quan sát thấy ở học sinh để xem gợi ý nhóm hoạt động phù
          hợp và các hoạt động 2–5 phút có thể áp dụng ngay.
        </p>
      </div>

      {/* Expression Selector Tabs + Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
        {/* Left List of 6 Expressions */}
        <div className="lg:col-span-4 space-y-2.5" role="tablist" aria-label="6 biểu hiện lớp học">
          {STUDENT_EXPRESSIONS.map((exp) => {
            const isSelected = exp.id === activeExp.id;
            const matchCount = activities.filter((a) => a.expressions.includes(exp.id)).length;
            return (
              <button
                key={exp.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => handleSelect(exp.id)}
                className={`w-full text-left rounded-2xl border p-4 transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-[#176B5B] text-white border-[#176B5B] shadow-sm'
                    : 'bg-white text-[#263B3A] border-[#DCE6E3] hover:border-[#176B5B]/50'
                }`}
              >
                <div className="min-w-0">
                  <span
                    className={`block text-xs font-semibold mb-0.5 tabular-nums ${
                      isSelected ? 'text-[#DDF3EA]' : 'text-[#7563B8]'
                    }`}
                  >
                    Biểu hiện {exp.order}
                  </span>
                  <span className="block text-base font-bold truncate">{exp.label}</span>
                </div>
                <span
                  className={`text-xs font-medium shrink-0 tabular-nums ${
                    isSelected ? 'text-[#DDF3EA]' : 'text-[#526867]'
                  }`}
                >
                  {matchCount} bài
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Detail Card */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-[#DCE6E3] p-6 sm:p-8 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#DCE6E3] mb-6">
            <div>
              <p className="text-xs font-semibold text-[#7563B8] mb-1">
                Biểu hiện {activeExp.order}
              </p>
              <h2 className="text-2xl font-bold text-[#263B3A]">{activeExp.label}</h2>
            </div>

            <Link
              to={`/hoat-dong?bieuHien=${activeExp.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#DDF3EA] text-[#176B5B] text-sm font-semibold hover:bg-[#cdebd0] transition-colors whitespace-nowrap shrink-0"
            >
              Mở trong thư viện <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-[#263B3A] mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#176B5B]" />
                Dấu hiệu quan sát thường gặp tại lớp
              </h3>
              <ul className="space-y-2.5">
                {activeExp.classroomCues.map((cue, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-[15px] text-[#526867]">
                    <CheckCircle2 className="w-4 h-4 text-[#176B5B] shrink-0 mt-1" />
                    <span>{cue}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div className="rounded-2xl bg-[#F6F9F8] p-5 border border-[#DCE6E3]">
                <h3 className="text-xs font-bold text-[#176B5B] mb-2">Bối cảnh thường gặp</h3>
                <p className="text-sm text-[#526867] leading-relaxed">{activeExp.contextNote}</p>
              </div>

              <div className="rounded-2xl bg-[#F6F9F8] p-5 border border-[#DCE6E3]">
                <h3 className="text-xs font-bold text-[#7563B8] mb-2">Gợi ý điều phối nhanh</h3>
                <p className="text-sm text-[#526867] leading-relaxed">{activeExp.facilitationTip}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#263B3A] mb-3">
                Nhóm hoạt động nên ưu tiên
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {activeExp.recommendedGroups.map((groupId) => {
                  const g = GROUP_MAP[groupId];
                  if (!g) return null;
                  return (
                    <Link
                      key={groupId}
                      to={`/hoat-dong?nhom=${groupId}&bieuHien=${activeExp.id}`}
                      className="rounded-xl border border-[#DCE6E3] p-4 hover:border-[#176B5B] bg-[#F6F9F8] hover:bg-white transition-all"
                    >
                      <p className="text-xs font-bold mb-1" style={{ color: g.accentColor }}>
                        {g.order}. {g.name}
                      </p>
                      <p className="text-xs text-[#526867] line-clamp-2">{g.tagline}</p>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-xs text-[#526867] pt-4 border-t border-[#DCE6E3]">
              <Info className="w-4 h-4 text-[#176B5B] shrink-0 mt-0.5" />
              <p>
                Lưu ý sư phạm: Đây là mô tả hành vi quan sát tạm thời trong tiết học để giáo viên chọn
                nhịp chuyển tiếp phù hợp, không phải kết luận hay chẩn đoán về năng lực của học sinh.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Matching Activities */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[#263B3A]">
            Hoạt động gợi ý cho biểu hiện “{activeExp.label}” ({matchingActivities.length})
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-48 rounded-2xl bg-white border border-[#DCE6E3] animate-pulse" />
            ))}
          </div>
        ) : matchingActivities.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#DCE6E3] p-8 text-center">
            <p className="text-base text-[#526867] mb-3">
              Hiện chưa có hoạt động đang hiển thị gắn với biểu hiện này.
            </p>
            <Link to="/hoat-dong" className="text-sm font-semibold text-[#176B5B] hover:underline">
              Xem tất cả hoạt động trong thư viện
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchingActivities.map((act) => (
              <ActivityCard key={act.id} activity={act} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
