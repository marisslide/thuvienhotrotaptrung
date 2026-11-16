import { ArrowRight, Clock, Layers, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SafeImage } from '../components/SafeImage';
import { useLibrary } from '../context/LibraryContext';
import { ACTIVITY_GROUPS, EXPRESSION_MAP } from '../data/taxonomy';

export function GroupsPage() {
  const { activities } = useLibrary();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
      {/* Header Split with Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-12">
        <div className="lg:col-span-7">
          <p className="text-xs font-semibold text-[#176B5B] mb-2">Bước 02 · Lựa chọn nhóm phù hợp</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#263B3A] mb-4">
            Sáu nhóm hoạt động hỗ trợ tái tập trung
          </h1>
          <p className="text-base text-[#526867] leading-relaxed max-w-2xl">
            Thư viện được tổ chức thành 6 nhóm rõ ràng theo mục tiêu điều phối nhịp lớp học THCS:
            từ đánh thức thể chất nhẹ nhàng, kéo ánh nhìn về bảng đến lắng dịu nhịp thở trước bài học mới.
          </p>
        </div>

        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          <div className="rounded-2xl overflow-hidden border border-[#DCE6E3] bg-[#DDF3EA] aspect-[4/3]">
            <SafeImage
              src="/src/assets/images/group_movement_card_1794556736227.jpg"
              alt="Minh họa hoạt động vận động và vỗ tay theo nhịp trong lớp học"
              fallbackTitle="Vận động & Phản xạ"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="rounded-2xl overflow-hidden border border-[#DCE6E3] bg-[#F6F9F8] aspect-[4/3]">
            <SafeImage
              src="/src/assets/images/group_focus_memory_card_1794556734639.jpg"
              alt="Minh họa quan sát, ghi nhớ chuỗi từ khóa và thư giãn điều hòa nhịp thở"
              fallbackTitle="Quan sát, Ghi nhớ & Thư giãn"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* 6 Groups Detailed Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {ACTIVITY_GROUPS.map((group) => {
          const groupActivities = activities.filter((a) => a.group === group.id);
          return (
            <section
              key={group.id}
              className="bg-white rounded-3xl border border-[#DCE6E3] p-6 sm:p-8 flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#DCE6E3] mb-5">
                  <div className="flex items-center gap-3">
                    <span
                      className="px-3 py-1 rounded-lg text-xs font-bold tabular-nums"
                      style={{
                        backgroundColor: group.softBg,
                        color: group.accentColor,
                      }}
                    >
                      Nhóm {group.order}
                    </span>
                    <h2 className="text-xl font-bold text-[#263B3A]">{group.name}</h2>
                  </div>

                  <span className="text-sm font-semibold text-[#176B5B] tabular-nums">
                    {groupActivities.length} hoạt động đang mở
                  </span>
                </div>

                <p className="text-base font-semibold text-[#263B3A] mb-2">{group.tagline}</p>
                <p className="text-sm text-[#526867] leading-relaxed mb-5">
                  {group.pedagogicalPurpose}
                </p>

                <div className="space-y-3 text-sm text-[#526867] bg-[#F6F9F8] rounded-2xl p-4 border border-[#DCE6E3] mb-5">
                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-[#176B5B] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-[#263B3A]">Thời điểm gợi ý: </span>
                      {group.bestTiming}
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Users className="w-4 h-4 text-[#176B5B] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-[#263B3A]">Cách tổ chức: </span>
                      {group.classroomArrangement}
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Layers className="w-4 h-4 text-[#7563B8] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-[#263B3A]">Phù hợp khi thấy: </span>
                      {group.recommendedFor
                        .map((id) => EXPRESSION_MAP[id]?.label)
                        .filter(Boolean)
                        .join(' · ')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-xs text-[#526867] truncate max-w-xs">
                  {groupActivities[0] ? `Ví dụ: ${groupActivities[0].title}` : ''}
                </div>
                <Link
                  to={`/hoat-dong?nhom=${group.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#176B5B] text-white text-sm font-semibold hover:bg-[#125649] transition-colors whitespace-nowrap shrink-0"
                >
                  Xem danh sách nhóm {group.shortTitle}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
