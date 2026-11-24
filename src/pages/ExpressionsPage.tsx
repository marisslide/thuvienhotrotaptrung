import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Eye,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Info,
  Play,
  Share2,
  Video,
  X,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { ActivityCard } from '../components/ActivityCard';
import { useLibrary } from '../context/LibraryContext';
import { GROUP_MAP, STUDENT_EXPRESSIONS } from '../data/taxonomy';
import { getAutoThumbnail } from '../data/seedMaterials';
import { getMaterialsList, logStudentActivity } from '../lib/googleSyncService';
import { ExpressionId } from '../types/activity';
import { MaterialItem } from '../types/material';

export function ExpressionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { activities, loading } = useLibrary();

  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [viewingMaterial, setViewingMaterial] = useState<MaterialItem | null>(null);

  const rawParam = (searchParams.get('chon') || searchParams.get('bieuHien') || searchParams.get('id')) as ExpressionId | null;
  const validInitial = STUDENT_EXPRESSIONS.some((e) => e.id === rawParam)
    ? (rawParam as ExpressionId)
    : STUDENT_EXPRESSIONS[0].id;

  const [selectedId, setSelectedId] = useState<ExpressionId>(validInitial);

  useEffect(() => {
    getMaterialsList()
      .then((data) => {
        setMaterials(data);
        setMaterialsLoading(false);
      })
      .catch(() => setMaterialsLoading(false));
  }, []);

  useEffect(() => {
    const currentParam = (searchParams.get('chon') || searchParams.get('bieuHien') || searchParams.get('id')) as ExpressionId | null;
    if (currentParam && STUDENT_EXPRESSIONS.some((e) => e.id === currentParam)) {
      setSelectedId(currentParam);
    }
  }, [searchParams]);

  const handleSelect = (id: ExpressionId) => {
    setSelectedId(id);
    setSearchParams({ chon: id });
  };

  const activeExp =
    STUDENT_EXPRESSIONS.find((e) => e.id === selectedId) || STUDENT_EXPRESSIONS[0];

  const matchingActivities = activities.filter((a) => a.expressions.includes(activeExp.id));

  // Lọc các học liệu thuộc các nhóm hoạt động được ưu tiên cho biểu hiện này
  const matchingMaterials = materials.filter((m) =>
    activeExp.recommendedGroups.includes(m.groupId as any)
  );

  const handleOpenMaterial = (item: MaterialItem) => {
    setViewingMaterial(item);
    logStudentActivity('XEM HỌC LIỆU TỪ BIỂU HIỆN', `${activeExp.label} - ${item.title}`);
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
    }
    if (url.includes('drive.google.com/file/d/')) {
      return url.replace(/\/view.*$/, '/preview');
    }
    if (url.includes('docs.google.com') && !url.includes('/preview')) {
      return url.replace(/\/edit.*$/, '/preview');
    }
    return url;
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-10 sm:py-12 space-y-12">
      {/* Header */}
      <div className="max-w-4xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#176B5B]/10 text-[#176B5B] text-xs font-bold uppercase tracking-wide">
          Bước 01 · Nhận diện & Kết nối Học liệu
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#263B3A] tracking-tight">
          Nhận diện biểu hiện & Học liệu tương ứng
        </h1>
        <p className="text-base text-[#526867] leading-relaxed">
          Chọn biểu hiện quan sát thấy ở học sinh để xem ngay <strong>học liệu trực quan (Video, PowerPoint, Canva trên Google Drive)</strong> và các hoạt động 2–5 phút phù hợp nhất để kéo học sinh quay lại nhiệm vụ học tập.
        </p>
      </div>

      {/* Expression Selector Tabs + Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left List of 6 Expressions */}
        <div className="lg:col-span-4 space-y-2.5" role="tablist" aria-label="6 biểu hiện lớp học">
          {STUDENT_EXPRESSIONS.map((exp) => {
            const isSelected = exp.id === activeExp.id;
            const matchCount = activities.filter((a) => a.expressions.includes(exp.id)).length;
            const materialCount = materials.filter((m) =>
              exp.recommendedGroups.includes(m.groupId as any)
            ).length;

            return (
              <button
                key={exp.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => handleSelect(exp.id)}
                className={`w-full text-left rounded-2xl border p-4 transition-all flex items-center justify-between gap-3 cursor-pointer ${
                  isSelected
                    ? 'bg-[#176B5B] text-white border-[#176B5B] shadow-md'
                    : 'bg-white text-[#263B3A] border-[#DCE6E3] hover:border-[#176B5B]/60 hover:bg-[#FAFBFB]'
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
                <div className="text-right shrink-0">
                  <span
                    className={`block text-xs font-bold tabular-nums ${
                      isSelected ? 'text-white' : 'text-[#176B5B]'
                    }`}
                  >
                    {matchCount} hoạt động
                  </span>
                  <span
                    className={`block text-[11px] tabular-nums ${
                      isSelected ? 'text-[#DDF3EA]' : 'text-[#526867]'
                    }`}
                  >
                    {materialCount} học liệu
                  </span>
                </div>
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
              Xem tất cả hoạt động <ArrowRight className="w-4 h-4" />
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
                Nhóm hoạt động được đề xuất ưu tiên
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {activeExp.recommendedGroups.map((groupId) => {
                  const g = GROUP_MAP[groupId];
                  if (!g) return null;
                  return (
                    <div
                      key={groupId}
                      className="rounded-xl border border-[#DCE6E3] p-4 bg-[#F6F9F8] hover:bg-white transition-all space-y-1"
                    >
                      <p className="text-xs font-bold" style={{ color: g.accentColor }}>
                        {g.order}. {g.name}
                      </p>
                      <p className="text-xs text-[#526867] line-clamp-2">{g.tagline}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-xs text-[#526867] pt-4 border-t border-[#DCE6E3]">
              <Info className="w-4 h-4 text-[#176B5B] shrink-0 mt-0.5" />
              <p>
                Lưu ý sư phạm: Biểu hiện quan sát tại lớp là gợi ý để giáo viên chuyển nhịp linh hoạt,
                không dùng để đánh giá hay phân loại học sinh.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: KHO HỌC LIỆU TRỰC QUAN GỢI Ý (VIDEO / PPTX / CANVA / DRIVE) */}
      <div className="space-y-6 pt-4 border-t border-[#DCE6E3]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#176B5B] text-white text-xs font-bold mb-2">
              <Video className="w-3.5 h-3.5" /> Học liệu trực quan tương ứng
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#263B3A]">
              Kho Học liệu (Video, PowerPoint, Canva trên Drive) cho “{activeExp.label}”
            </h2>
            <p className="text-xs sm:text-sm text-[#526867] mt-1">
              Các tài nguyên đa phương tiện thuộc các nhóm ưu tiên giúp lớp học chuyển nhịp ngay lập tức.
            </p>
          </div>

          <Link
            to="/hoc-lieu"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#DCE6E3] text-[#176B5B] text-xs font-bold hover:bg-[#F6F9F8] transition-colors whitespace-nowrap self-start sm:self-auto shadow-2xs"
          >
            <BookOpen className="w-4 h-4" /> Mở toàn bộ kho học liệu &rarr;
          </Link>
        </div>

        {materialsLoading ? (
          <div className="py-12 text-center text-sm text-[#526867] bg-white rounded-3xl border border-[#DCE6E3]">
            Đang tải học liệu tương ứng...
          </div>
        ) : matchingMaterials.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-[#DCE6E3] space-y-2">
            <BookOpen className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="text-sm font-semibold text-[#263B3A]">Chưa có học liệu riêng cho nhóm này</p>
            <p className="text-xs text-[#526867]">
              Giáo viên quản trị có thể tải thêm học liệu mới vào mục Học liệu để hiển thị tại đây.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {matchingMaterials.map((item) => {
              const isVideo = item.type === 'video' || item.url.includes('youtube.com') || item.url.includes('youtu.be');
              const displayThumb = item.thumbnailUrl || getAutoThumbnail(item.url, item.groupId);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-[#DCE6E3] overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-[#263B3A] overflow-hidden">
                      <img
                        src={displayThumb}
                        alt={item.title}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getAutoThumbnail('', item.groupId);
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#DDF3EA] text-[#176B5B] shadow-xs backdrop-blur-xs">
                          {item.groupName}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white uppercase backdrop-blur-xs">
                          {item.type}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenMaterial(item)}
                        className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-white/90 text-[#176B5B] flex items-center justify-center opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all shadow-lg cursor-pointer"
                        title="Xem học liệu hoặc phát video"
                      >
                        {isVideo ? <Play className="w-5 h-5 ml-0.5 fill-current" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-2.5">
                      <h4 className="text-base font-bold text-[#263B3A] line-clamp-2 group-hover:text-[#176B5B] transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[#526867] line-clamp-3 leading-relaxed">
                        {item.description}
                      </p>

                      {item.studentProductExample && (
                        <div className="p-2.5 rounded-xl bg-[#F6F9F8] border border-[#E7EFEC] text-xs space-y-0.5">
                          <span className="text-[10px] font-bold uppercase text-[#176B5B]">
                            Ví dụ sản phẩm học sinh:
                          </span>
                          <p className="text-[#263B3A] font-medium truncate">
                            {item.studentProductExample}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="px-5 py-3.5 border-t border-[#F0F4F2] bg-[#FAFBFB] flex items-center justify-between gap-2">
                    <span className="text-[11px] text-[#526867]">
                      Tác giả: <strong className="text-[#263B3A]">{item.author}</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenMaterial(item)}
                        className="px-3 py-1.5 rounded-xl bg-[#176B5B] text-white text-xs font-semibold hover:bg-[#125649] transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Xem
                      </button>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-xl bg-white border border-[#DCE6E3] text-[#526867] hover:text-[#176B5B] hover:border-[#176B5B] transition-colors"
                        title="Mở trong tab mới"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: DANH SÁCH HOẠT ĐỘNG 2-5 PHÚT TƯƠNG ỨNG */}
      <div className="space-y-6 pt-4 border-t border-[#DCE6E3]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7563B8] text-white text-xs font-bold mb-2">
              Hoạt động lớp học
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#263B3A]">
              Các hoạt động tái tập trung phù hợp ({matchingActivities.length})
            </h2>
          </div>
          <Link
            to="/hoat-dong"
            className="text-xs font-bold text-[#176B5B] hover:underline inline-flex items-center gap-1"
          >
            Xem tất cả 60 hoạt động &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-56 rounded-2xl bg-white border border-[#DCE6E3] animate-pulse" />
            ))}
          </div>
        ) : matchingActivities.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#DCE6E3] p-8 text-center">
            <p className="text-base text-[#526867] mb-3">
              Hiện chưa có hoạt động gắn với biểu hiện này.
            </p>
            <Link to="/hoat-dong" className="text-sm font-semibold text-[#176B5B] hover:underline">
              Xem tất cả hoạt động trong thư viện
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {matchingActivities.map((act) => (
              <ActivityCard key={act.id} activity={act} />
            ))}
          </div>
        )}
      </div>

      {/* MODAL XEM HỌC LIỆU NHÚNG (VIDEO / GOOGLE DRIVE / CANVA) */}
      {viewingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#DCE6E3] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-[#DCE6E3] flex items-center justify-between gap-4 bg-[#F8FAF9]">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#DDF3EA] text-[#176B5B]">
                  {viewingMaterial.groupName} • {viewingMaterial.type.toUpperCase()}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-[#263B3A] line-clamp-1">
                  {viewingMaterial.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingMaterial(null)}
                className="p-2 rounded-xl text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-inner">
                {viewingMaterial.url.includes('youtube.com') ||
                viewingMaterial.url.includes('youtu.be') ||
                viewingMaterial.url.includes('docs.google.com') ||
                viewingMaterial.url.includes('drive.google.com') ? (
                  <iframe
                    src={getEmbedUrl(viewingMaterial.url)}
                    title={viewingMaterial.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : viewingMaterial.type === 'image' || viewingMaterial.thumbnailUrl ? (
                  <img
                    src={viewingMaterial.url || viewingMaterial.thumbnailUrl}
                    alt={viewingMaterial.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-white text-center space-y-3">
                    <FileText className="w-12 h-12 text-[#176B5B]" />
                    <p className="text-sm font-semibold">Tài liệu văn bản / Tập tin Google Drive</p>
                    <a
                      href={viewingMaterial.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-xl bg-[#176B5B] text-white text-sm font-bold inline-flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" /> Mở trong tab mới
                    </a>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-[#263B3A]">Mô tả & hướng dẫn sử dụng trong tiết học:</h4>
                <p className="text-sm text-[#526867] leading-relaxed whitespace-pre-line">
                  {viewingMaterial.description}
                </p>

                {viewingMaterial.studentProductExample && (
                  <div className="p-3.5 rounded-2xl bg-[#EBF7F2] border border-[#B8E2D1] text-xs text-[#176B5B] space-y-1">
                    <strong className="block font-bold">Ví dụ sản phẩm học sinh cần đạt:</strong>
                    <span>{viewingMaterial.studentProductExample}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 border-t border-[#DCE6E3] bg-[#F8FAF9] flex items-center justify-between">
              <span className="text-xs text-[#526867]">
                Đang mở học liệu phù hợp cho biểu hiện: <strong>{activeExp.label}</strong>
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={viewingMaterial.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#176B5B] text-white text-xs font-semibold hover:bg-[#125649] transition-colors inline-flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Mở toàn màn hình
                </a>
                <button
                  type="button"
                  onClick={() => setViewingMaterial(null)}
                  className="px-4 py-2 rounded-xl border border-[#DCE6E3] text-xs font-semibold text-[#526867] hover:bg-white transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
