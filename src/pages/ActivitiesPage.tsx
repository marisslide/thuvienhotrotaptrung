import { useEffect, useMemo, useState } from 'react';
import { Filter, RotateCcw, Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { ActivityCard } from '../components/ActivityCard';
import { useLibrary } from '../context/LibraryContext';
import { ACTIVITY_GROUPS, STUDENT_EXPRESSIONS } from '../data/taxonomy';
import { ActivityGroupId, ActivityScale, ExpressionId } from '../types/activity';

type DurationFilter = 'all' | 'short' | 'medium' | 'long';

export function ActivitiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { activities, loading, error, refreshLibrary } = useLibrary();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [groupFilter, setGroupFilter] = useState<ActivityGroupId | 'all'>(
    (searchParams.get('nhom') as ActivityGroupId) || 'all'
  );
  const [expressionFilter, setExpressionFilter] = useState<ExpressionId | 'all'>(
    (searchParams.get('bieuHien') as ExpressionId) || 'all'
  );
  const [durationFilter, setDurationFilter] = useState<DurationFilter>('all');
  const [scaleFilter, setScaleFilter] = useState<ActivityScale | 'all'>('all');
  const [onlyNoMaterials, setOnlyNoMaterials] = useState(false);

  useEffect(() => {
    const nhom = searchParams.get('nhom') as ActivityGroupId | null;
    const bieuHien = searchParams.get('bieuHien') as ExpressionId | null;
    if (nhom && ACTIVITY_GROUPS.some((g) => g.id === nhom)) {
      setGroupFilter(nhom);
    } else if (!nhom) {
      setGroupFilter('all');
    }
    if (bieuHien && STUDENT_EXPRESSIONS.some((e) => e.id === bieuHien)) {
      setExpressionFilter(bieuHien);
    } else if (!bieuHien) {
      setExpressionFilter('all');
    }
  }, [searchParams]);

  const updateUrlParams = (nextGroup: ActivityGroupId | 'all', nextExp: ExpressionId | 'all') => {
    const params: Record<string, string> = {};
    if (nextGroup !== 'all') params.nhom = nextGroup;
    if (nextExp !== 'all') params.bieuHien = nextExp;
    setSearchParams(params);
  };

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return activities.filter((act) => {
      if (groupFilter !== 'all' && act.group !== groupFilter) return false;
      if (expressionFilter !== 'all' && !act.expressions.includes(expressionFilter)) return false;
      if (scaleFilter !== 'all' && act.scale !== scaleFilter) return false;
      if (onlyNoMaterials && !act.noMaterialsNeeded) return false;
      if (durationFilter === 'short' && act.durationMinutes > 2) return false;
      if (durationFilter === 'medium' && (act.durationMinutes < 3 || act.durationMinutes > 4)) {
        return false;
      }
      if (durationFilter === 'long' && act.durationMinutes < 5) return false;

      if (q) {
        const haystack = [
          act.title,
          act.shortDescription,
          act.goal,
          act.materials,
          ...act.steps,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [
    activities,
    searchTerm,
    groupFilter,
    expressionFilter,
    durationFilter,
    scaleFilter,
    onlyNoMaterials,
  ]);

  const hasActiveFilters =
    searchTerm !== '' ||
    groupFilter !== 'all' ||
    expressionFilter !== 'all' ||
    durationFilter !== 'all' ||
    scaleFilter !== 'all' ||
    onlyNoMaterials;

  const resetAll = () => {
    setSearchTerm('');
    setGroupFilter('all');
    setExpressionFilter('all');
    setDurationFilter('all');
    setScaleFilter('all');
    setOnlyNoMaterials(false);
    setSearchParams({});
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-10 sm:py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold text-[#176B5B] mb-1.5">Kho học liệu công khai</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#263B3A]">
            Danh sách hoạt động tái tập trung
          </h1>
        </div>
        <p className="text-sm font-medium text-[#526867] tabular-nums">
          Đang hiển thị {filtered.length} / {activities.length} hoạt động công khai
        </p>
      </div>

      {/* Filter Panel */}
      <div className="bg-white rounded-3xl border border-[#DCE6E3] p-5 sm:p-6 mb-8 space-y-5 shadow-xs">
        {/* Search & Secondary dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-[#526867] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm tên hoạt động, từ khóa, mục tiêu..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DCE6E3] bg-[#F6F9F8] focus:bg-white text-sm text-[#263B3A] placeholder:text-[#526867]/70"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={expressionFilter}
              onChange={(e) => {
                const val = e.target.value as ExpressionId | 'all';
                setExpressionFilter(val);
                updateUrlParams(groupFilter, val);
              }}
              aria-label="Lọc theo biểu hiện"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE6E3] bg-[#F6F9F8] text-sm text-[#263B3A]"
            >
              <option value="all">Tất cả 6 biểu hiện</option>
              {STUDENT_EXPRESSIONS.map((exp) => (
                <option key={exp.id} value={exp.id}>
                  {exp.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={durationFilter}
              onChange={(e) => setDurationFilter(e.target.value as DurationFilter)}
              aria-label="Lọc theo thời lượng"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE6E3] bg-[#F6F9F8] text-sm text-[#263B3A]"
            >
              <option value="all">Mọi thời lượng</option>
              <option value="short">1 – 2 phút</option>
              <option value="medium">3 – 4 phút</option>
              <option value="long">Từ 5 phút trở lên</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={scaleFilter}
              onChange={(e) => setScaleFilter(e.target.value as ActivityScale | 'all')}
              aria-label="Lọc theo quy mô"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE6E3] bg-[#F6F9F8] text-sm text-[#263B3A]"
            >
              <option value="all">Mọi quy mô</option>
              <option value="Cả lớp">Cả lớp</option>
              <option value="Theo nhóm">Theo nhóm</option>
              <option value="Theo cặp">Theo cặp</option>
              <option value="Cá nhân tại chỗ">Cá nhân tại chỗ</option>
            </select>
          </div>
        </div>

        {/* Group Filter Buttons + Zero-Material Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#DCE6E3]">
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Lọc theo nhóm hoạt động">
            <button
              type="button"
              onClick={() => {
                setGroupFilter('all');
                updateUrlParams('all', expressionFilter);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                groupFilter === 'all'
                  ? 'bg-[#176B5B] text-white'
                  : 'bg-[#F6F9F8] text-[#526867] hover:text-[#263B3A] hover:bg-[#E7EFEC]'
              }`}
            >
              Tất cả nhóm
            </button>
            {ACTIVITY_GROUPS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => {
                  setGroupFilter(g.id);
                  updateUrlParams(g.id, expressionFilter);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  groupFilter === g.id
                    ? 'bg-[#176B5B] text-white'
                    : 'bg-[#F6F9F8] text-[#526867] hover:text-[#263B3A] hover:bg-[#E7EFEC]'
                }`}
              >
                {g.shortTitle}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#263B3A] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyNoMaterials}
                onChange={(e) => setOnlyNoMaterials(e.target.checked)}
                className="w-4 h-4 rounded accent-[#176B5B]"
              />
              Không cần học cụ
            </label>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAll}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7563B8] hover:underline whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Xóa bộ lọc
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      {error ? (
        <div className="bg-white rounded-2xl border border-red-200 p-8 text-center">
          <p className="text-base text-red-700 mb-3">{error}</p>
          <button
            type="button"
            onClick={refreshLibrary}
            className="px-4 py-2 rounded-xl bg-[#176B5B] text-white text-sm font-semibold"
          >
            Thử tải lại
          </button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="h-56 rounded-2xl bg-white border border-[#DCE6E3] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#DCE6E3] p-12 text-center">
          <Filter className="w-10 h-10 text-[#526867]/50 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-[#263B3A] mb-2">
            Không tìm thấy hoạt động phù hợp bộ lọc
          </h2>
          <p className="text-sm text-[#526867] mb-5">
            Thầy cô có thể bỏ bớt điều kiện lọc hoặc tìm với từ khóa rộng hơn.
          </p>
          <button
            type="button"
            onClick={resetAll}
            className="px-5 py-2.5 rounded-xl bg-[#176B5B] text-white text-sm font-semibold hover:bg-[#125649]"
          >
            Hiển thị tất cả hoạt động
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((act) => (
            <ActivityCard key={act.id} activity={act} />
          ))}
        </div>
      )}
    </div>
  );
}
