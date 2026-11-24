import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Check,
  ChevronRight,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  FileCheck,
  FileCode,
  FileSpreadsheet,
  FileText,
  Filter,
  FolderOpen,
  GraduationCap,
  Info,
  Link as LinkIcon,
  Plus,
  Play,
  RotateCcw,
  Search,
  Settings,
  Share2,
  Trash2,
  Upload,
  Users,
  Video,
  X,
  Youtube,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  deleteMaterialItem,
  fetchStudentDirectory,
  getAppsScriptUrl,
  getMaterialsList,
  logStudentActivity,
  logTeacherActivity,
  saveMaterialItem,
  setAppsScriptUrl,
  uploadFileToGoogleDrive,
} from '../lib/googleSyncService';
import { ActivityGroupId, MaterialItem, MaterialType, StudentDirectoryItem } from '../types/material';
import { getAutoThumbnail } from '../data/seedMaterials';

const GROUP_OPTIONS: { id: ActivityGroupId; label: string; color: string; bg: string }[] = [
  { id: 'van-dong', label: 'Vận động', color: '#176B5B', bg: '#DDF3EA' },
  { id: 'quan-sat', label: 'Quan sát', color: '#0284C7', bg: '#E0F2FE' },
  { id: 'ghi-nho', label: 'Ghi nhớ', color: '#7C3AED', bg: '#EDE9FE' },
  { id: 'phan-xa', label: 'Phản xạ', color: '#D97706', bg: '#FEF3C7' },
  { id: 'tuong-tac', label: 'Tương tác', color: '#059669', bg: '#D1FAE5' },
  { id: 'thu-gian', label: 'Thư giãn', color: '#0D9488', bg: '#CCFBF1' },
];

const TYPE_OPTIONS: { id: string; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'Tất cả định dạng', icon: <FolderOpen className="w-4 h-4" /> },
  { id: 'video', label: 'Video (YouTube / MP4)', icon: <Video className="w-4 h-4" /> },
  { id: 'powerpoint', label: 'PowerPoint / Slide', icon: <FileSpreadsheet className="w-4 h-4" /> },
  { id: 'word', label: 'Word / Văn bản', icon: <FileText className="w-4 h-4" /> },
  { id: 'pdf', label: 'PDF', icon: <FileCheck className="w-4 h-4" /> },
  { id: 'canva', label: 'Canva Thiết kế', icon: <Share2 className="w-4 h-4" /> },
  { id: 'image', label: 'Hình ảnh / Thẻ động tác', icon: <Eye className="w-4 h-4" /> },
];

export function MaterialsPage() {
  const { isAuthorizedTeacher, teacherSession } = useAuth();

  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [studentsList, setStudentsList] = useState<StudentDirectoryItem[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [editingItem, setEditingItem] = useState<MaterialItem | null>(null);
  const [viewingItem, setViewingItem] = useState<MaterialItem | null>(null);

  // Form states
  const [formData, setFormData] = useState<{
    title: string;
    groupId: ActivityGroupId;
    type: MaterialType;
    url: string;
    description: string;
    studentProductExample: string;
  }>({
    title: '',
    groupId: 'van-dong',
    type: 'video',
    url: '',
    description: '',
    studentProductExample: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [scriptUrlInput, setScriptUrlInput] = useState(getAppsScriptUrl());
  const [configSaved, setConfigSaved] = useState(false);

  const loadMaterials = async () => {
    setLoading(true);
    const data = await getMaterialsList();
    setMaterials(data);
    setLoading(false);
  };

  const loadStudents = async () => {
    setStudentsLoading(true);
    const data = await fetchStudentDirectory();
    setStudentsList(data);
    setStudentsLoading(false);
  };

  useEffect(() => {
    loadMaterials();
    if (isAuthorizedTeacher) {
      loadStudents();
    }
  }, [isAuthorizedTeacher]);

  const handleOpenStudentsModal = () => {
    loadStudents();
    setShowStudentsModal(true);
  };

  const filteredMaterials = materials.filter((item) => {
    const matchesGroup = selectedGroup === 'all' || item.groupId === selectedGroup;
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.studentProductExample &&
        item.studentProductExample.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesGroup && matchesType && matchesSearch;
  });

  const handleOpenAddModal = (editTarget?: MaterialItem) => {
    if (editTarget) {
      setEditingItem(editTarget);
      setFormData({
        title: editTarget.title,
        groupId: editTarget.groupId,
        type: editTarget.type,
        url: editTarget.url,
        description: editTarget.description,
        studentProductExample: editTarget.studentProductExample || '',
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        groupId: 'van-dong',
        type: 'video',
        url: '',
        description: '',
        studentProductExample: '',
      });
    }
    setSelectedFile(null);
    setShowAddModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    const groupMeta = GROUP_OPTIONS.find((g) => g.id === formData.groupId);
    const groupName = groupMeta ? groupMeta.label : 'Vận động';

    try {
      if (selectedFile) {
        // Tải file lên Google Drive qua Apps Script
        await uploadFileToGoogleDrive(selectedFile, {
          title: formData.title,
          groupId: formData.groupId,
          groupName,
          type: formData.type,
          description: formData.description,
          studentProductExample: formData.studentProductExample,
        });
      } else {
        // Lưu qua đường dẫn trực tiếp (YouTube, Google Drive, Canva...)
        const newOrUpdate: MaterialItem = {
          id: editingItem ? editingItem.id : `mat-${Date.now()}`,
          title: formData.title,
          groupId: formData.groupId,
          groupName,
          type: formData.type,
          url: formData.url,
          thumbnailUrl: getAutoThumbnail(formData.url, formData.groupId),
          description: formData.description,
          studentProductExample: formData.studentProductExample,
          author: teacherSession?.displayName || 'Cô Diệu Hiền',
          createdAt: editingItem ? editingItem.createdAt : new Date().toISOString().slice(0, 10),
          isPriority: true,
        };
        await saveMaterialItem(newOrUpdate);
      }

      await loadMaterials();
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi khi lưu học liệu. Vui lòng thử lại!');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item: MaterialItem) => {
    if (window.confirm(`Thầy cô có chắc chắn muốn xóa học liệu: "${item.title}"?`)) {
      await deleteMaterialItem(item.id);
      await loadMaterials();
    }
  };

  const handleViewMaterial = (item: MaterialItem) => {
    setViewingItem(item);
    // Ghi log học sinh xem học liệu
    logStudentActivity('XEM HỌC LIỆU', item.title, `Nhóm: ${item.groupName} - Loại: ${item.type}`);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setAppsScriptUrl(scriptUrlInput);
    setConfigSaved(true);
    setTimeout(() => {
      setConfigSaved(false);
      setShowConfigModal(false);
      loadMaterials();
    }, 1200);
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    // YouTube
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
    }
    // Google Drive
    if (url.includes('drive.google.com/file/d/')) {
      return url.replace(/\/view.*$/, '/preview');
    }
    // Google Docs/Slides/Sheets
    if (url.includes('docs.google.com') && !url.includes('/preview')) {
      return url.replace(/\/edit.*$/, '/preview');
    }
    return url;
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8 sm:py-10 space-y-8">
      {/* Top Header Banner */}
      <div className="bg-linear-to-r from-[#176B5B] via-[#1A5C4F] to-[#263B3A] rounded-3xl p-6 sm:p-8 lg:p-10 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-xs text-white">
              <BookOpen className="w-3.5 h-3.5 text-amber-300" />
              Đề án Website – Thư viện Hoạt động Hỗ trợ Tái tập trung
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              III. Video, PowerPoint và Nguồn Học Liệu
            </h1>
            <p className="text-sm sm:text-base text-white/85 leading-relaxed">
              Kho tài nguyên đa phương tiện ưu tiên theo 6 nhóm hành vi: <strong>Vận động, Quan sát, Ghi nhớ, Phản xạ, Tương tác, Thư giãn</strong>.
              Được đồng bộ trực tiếp với Google Drive và Google Sheet qua Google Apps Script.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-white/90">
              <span className="px-2.5 py-1 rounded-lg bg-white/10 font-medium">
                🎯 {materials.length} học liệu sẵn có
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/10 font-medium">
                ⚡ Tự động ghi nhật ký học viên & giáo viên
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/10 font-medium">
                ☁️ Kết nối Google Drive lưu trữ
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {isAuthorizedTeacher ? (
              <>
                <button
                  type="button"
                  onClick={() => handleOpenStudentsModal()}
                  className="px-4 py-3 rounded-2xl bg-white/20 text-white text-sm font-bold hover:bg-white/30 transition-all border border-white/25 inline-flex items-center gap-2 shadow-sm"
                  title="Xem danh sách học viên và tổng thời lượng từ Google Sheet"
                >
                  <Users className="w-4 h-4 text-emerald-300" />
                  Danh sách học viên ({studentsList.length})
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenAddModal()}
                  className="px-5 py-3 rounded-2xl bg-white text-[#176B5B] text-sm font-bold hover:bg-[#F0FDF4] transition-all shadow-md inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Thêm / Tải lên học liệu
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfigModal(true)}
                  className="p-3 rounded-2xl bg-white/15 text-white hover:bg-white/25 transition-colors border border-white/20"
                  title="Cấu hình Google Apps Script URL"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="rounded-2xl bg-white/10 border border-white/20 p-4 text-xs text-white/90 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-200">
                  <GraduationCap className="w-4 h-4" /> Giao diện Học viên (Chỉ xem)
                </div>
                <p>Em có thể xem trực tiếp video, tài liệu hoặc mở trình chiếu trên lớp.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Thông tin quy tắc & nguồn tham khảo bám sát ảnh đề án */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-[#DCE6E3] p-5 shadow-2xs space-y-2.5">
          <div className="text-xs font-bold text-[#176B5B] uppercase flex items-center gap-1.5">
            <Video className="w-4 h-4" /> 1. Học liệu ưu tiên theo nhóm
          </div>
          <p className="text-xs text-[#526867] leading-relaxed">
            Mỗi nhóm hoạt động được ghép cặp với dạng học liệu trực quan nhất: <strong>Vận động</strong> (Video 5 động tác), <strong>Quan sát</strong> (Tìm điểm khác biệt), <strong>Ghi nhớ</strong> (Slide 5 hình), <strong>Phản xạ</strong> (Đúng màu hành động), <strong>Tương tác</strong> (Hỏi nhanh đáp nhanh), <strong>Thư giãn</strong> (Video hít thở).
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#DCE6E3] p-5 shadow-2xs space-y-2.5">
          <div className="text-xs font-bold text-[#0284C7] uppercase flex items-center gap-1.5">
            <Share2 className="w-4 h-4" /> 2. Nguồn tham khảo & Bản quyền
          </div>
          <p className="text-xs text-[#526867] leading-relaxed">
            Ưu tiên nhúng video từ YouTube cho phép nhúng; video minh họa chuyển động Pexels/Pixabay; mẫu trò chơi Canva/PowerPoint tự thiết kế và tệp Google Drive cấp quyền xem phù hợp.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#DCE6E3] p-5 shadow-2xs space-y-2.5">
          <div className="text-xs font-bold text-[#7C3AED] uppercase flex items-center gap-1.5">
            <FileCheck className="w-4 h-4" /> 3. Quy tắc chọn học liệu
          </div>
          <p className="text-xs text-[#526867] leading-relaxed">
            Ngắn, rõ, âm thanh phù hợp lớp học; kiểm tra đường dẫn và quyền chia sẻ trước giờ lên lớp; chuẩn bị phương án khi mất mạng (tệp tải sẵn); không bắt buộc mỗi hoạt động đều có video.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar (Optimized Horizontal Space) */}
      <div className="bg-white rounded-2xl border border-[#DCE6E3] p-4 sm:p-5 shadow-2xs space-y-4">
        {/* Row 1: Search + Group tabs */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full lg:w-96 shrink-0">
            <Search className="w-4 h-4 text-[#526867] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm học liệu, video, slide, bài tập..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DCE6E3] bg-[#F6F9F8] focus:bg-white focus:outline-none focus:border-[#176B5B] text-sm text-[#263B3A]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Group Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedGroup('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedGroup === 'all'
                  ? 'bg-[#176B5B] text-white'
                  : 'bg-[#F6F9F8] text-[#526867] hover:bg-[#E7EFEC]'
              }`}
            >
              Tất cả nhóm ({materials.length})
            </button>
            {GROUP_OPTIONS.map((g) => {
              const count = materials.filter((m) => m.groupId === g.id).length;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setSelectedGroup(g.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    selectedGroup === g.id
                      ? 'bg-[#176B5B] text-white'
                      : 'bg-[#F6F9F8] text-[#526867] hover:bg-[#E7EFEC]'
                  }`}
                >
                  <span>{g.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      selectedGroup === g.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Format pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-[#F0F4F2] scrollbar-none">
          <span className="text-xs font-bold text-[#526867] shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Định dạng:
          </span>
          {TYPE_OPTIONS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedType(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors inline-flex items-center gap-1.5 ${
                selectedType === t.id
                  ? 'bg-[#DDF3EA] text-[#176B5B] font-bold border border-[#B8E2D1]'
                  : 'text-[#526867] hover:bg-[#F6F9F8]'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Materials Grid (Full width optimized: 1 col on mobile, 2 col on tablet, 3 col on desktop, 4 col on wide screens) */}
      {loading ? (
        <div className="py-20 text-center text-sm text-[#526867] bg-white rounded-3xl border border-[#DCE6E3]">
          Đang tải danh sách học liệu và kiểm tra kết nối Google Sheet...
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-[#DCE6E3] p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#F6F9F8] flex items-center justify-center mx-auto text-[#526867]">
            <FolderOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#263B3A]">Không tìm thấy học liệu phù hợp</h3>
          <p className="text-sm text-[#526867] max-w-md mx-auto">
            Không có kết quả nào cho tiêu chí lọc hiện tại. Thầy cô và các em có thể xóa bộ lọc hoặc tìm kiếm bằng từ khóa khác.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedGroup('all');
              setSelectedType('all');
              setSearchQuery('');
            }}
            className="px-5 py-2.5 rounded-xl bg-[#176B5B] text-white text-sm font-semibold"
          >
            Hiển thị toàn bộ học liệu
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMaterials.map((item) => {
            const groupMeta = GROUP_OPTIONS.find((g) => g.id === item.groupId);
            const isVideo = item.type === 'video' || item.url.includes('youtube.com') || item.url.includes('youtu.be');

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-[#DCE6E3] overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Card Thumbnail / Header Preview */}
                  <div className="relative aspect-video bg-[#263B3A] overflow-hidden">
                    <img
                      src={item.thumbnailUrl || getAutoThumbnail(item.url, item.groupId)}
                      alt={item.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getAutoThumbnail('', item.groupId);
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Group Badge Overlay */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-bold shadow-xs backdrop-blur-xs"
                        style={{
                          backgroundColor: groupMeta ? groupMeta.bg : '#DDF3EA',
                          color: groupMeta ? groupMeta.color : '#176B5B',
                        }}
                      >
                        {item.groupName}
                      </span>
                    </div>

                    {/* Format pill */}
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/60 text-white backdrop-blur-xs uppercase">
                        {item.type}
                      </span>
                    </div>

                    {/* Play/View Overlay button */}
                    <button
                      type="button"
                      onClick={() => handleViewMaterial(item)}
                      className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-white/90 text-[#176B5B] flex items-center justify-center opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all shadow-lg"
                      title="Xem chi tiết hoặc trình chiếu"
                    >
                      {isVideo ? <Play className="w-5 h-5 ml-0.5 fill-current" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-3">
                    <h3 className="text-base font-bold text-[#263B3A] line-clamp-2 group-hover:text-[#176B5B] transition-colors">
                      {item.title}
                    </h3>

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

                {/* Card Footer Actions */}
                <div className="px-5 py-4 border-t border-[#F0F4F2] bg-[#FAFBFB] flex items-center justify-between gap-2">
                  <div className="text-[11px] text-[#526867]">
                    Tác giả: <strong className="text-[#263B3A]">{item.author}</strong>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleViewMaterial(item)}
                      className="px-3 py-1.5 rounded-xl bg-[#176B5B] text-white text-xs font-semibold hover:bg-[#125649] transition-colors inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Xem
                    </button>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        logStudentActivity('MỞ ĐƯỜNG DẪN NGOÀI', item.title, item.url);
                      }}
                      className="p-1.5 rounded-xl bg-white border border-[#DCE6E3] text-[#526867] hover:text-[#176B5B] hover:border-[#176B5B] transition-colors"
                      title="Mở liên kết gốc"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {/* Teacher-only Edit / Delete */}
                    {isAuthorizedTeacher && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenAddModal(item)}
                          className="p-1.5 rounded-xl bg-white border border-[#DCE6E3] text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Sửa học liệu"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="p-1.5 rounded-xl bg-white border border-[#DCE6E3] text-red-600 hover:bg-red-50 transition-colors"
                          title="Xóa học liệu"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Xem / Trình chiếu Học liệu */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#DCE6E3] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-[#DCE6E3] flex items-center justify-between gap-4 bg-[#F8FAF9]">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#DDF3EA] text-[#176B5B]">
                  {viewingItem.groupName} • {viewingItem.type.toUpperCase()}
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-[#263B3A] line-clamp-1">
                  {viewingItem.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setViewingItem(null)}
                className="p-2 rounded-xl text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Embedded Preview */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-inner">
                {viewingItem.url.includes('youtube.com') ||
                viewingItem.url.includes('youtu.be') ||
                viewingItem.url.includes('docs.google.com') ||
                viewingItem.url.includes('drive.google.com') ? (
                  <iframe
                    src={getEmbedUrl(viewingItem.url)}
                    title={viewingItem.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : viewingItem.type === 'image' || viewingItem.thumbnailUrl ? (
                  <img
                    src={viewingItem.url || viewingItem.thumbnailUrl}
                    alt={viewingItem.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-white text-center space-y-3">
                    <FileText className="w-12 h-12 text-[#176B5B]" />
                    <p className="text-sm font-semibold">Tài liệu văn bản / Tập tin Google Drive</p>
                    <a
                      href={viewingItem.url}
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
                <h4 className="text-sm font-bold text-[#263B3A]">Mô tả học liệu & hướng dẫn sử dụng:</h4>
                <p className="text-sm text-[#526867] leading-relaxed whitespace-pre-line">
                  {viewingItem.description}
                </p>

                {viewingItem.studentProductExample && (
                  <div className="p-3.5 rounded-2xl bg-[#EBF7F2] border border-[#B8E2D1] text-xs text-[#176B5B] space-y-1">
                    <strong className="block font-bold">Ví dụ sản phẩm học sinh cần đạt:</strong>
                    <span>{viewingItem.studentProductExample}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-[#DCE6E3] bg-[#F8FAF9] flex items-center justify-between">
              <span className="text-xs text-[#526867]">
                Đã ghi nhận nhật ký xem của học sinh vào Google Sheet.
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={viewingItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#176B5B] text-white text-xs font-semibold hover:bg-[#125649] transition-colors inline-flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Mở toàn màn hình
                </a>
                <button
                  type="button"
                  onClick={() => setViewingItem(null)}
                  className="px-4 py-2 rounded-xl border border-[#DCE6E3] text-xs font-semibold text-[#526867] hover:bg-white transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm / Chỉnh sửa Học liệu (Chỉ dành cho Giáo viên) */}
      {showAddModal && isAuthorizedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#DCE6E3] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-5 sm:p-6 border-b border-[#DCE6E3] flex items-center justify-between gap-4 bg-[#F8FAF9]">
              <div className="space-y-0.5">
                <h2 className="text-lg font-bold text-[#263B3A]">
                  {editingItem ? 'Chỉnh sửa học liệu' : 'Thêm mới hoặc Tải học liệu lên Google Drive'}
                </h2>
                <p className="text-xs text-[#526867]">
                  Tài liệu tải lên sẽ được đẩy tự động vào thư mục Google Drive thông qua Apps Script.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-xl text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#263B3A] mb-1.5">
                  Tiêu đề học liệu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ví dụ: Video 5 động tác tái tập trung tại chỗ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE6E3] bg-[#F6F9F8] focus:bg-white focus:outline-none focus:border-[#176B5B] text-sm text-[#263B3A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#263B3A] mb-1.5">
                    Nhóm hoạt động <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.groupId}
                    onChange={(e) => setFormData({ ...formData, groupId: e.target.value as ActivityGroupId })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE6E3] bg-[#F6F9F8] focus:bg-white focus:outline-none focus:border-[#176B5B] text-sm text-[#263B3A]"
                  >
                    {GROUP_OPTIONS.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#263B3A] mb-1.5">
                    Định dạng học liệu <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as MaterialType })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE6E3] bg-[#F6F9F8] focus:bg-white focus:outline-none focus:border-[#176B5B] text-sm text-[#263B3A]"
                  >
                    <option value="video">Video (YouTube / MP4)</option>
                    <option value="powerpoint">PowerPoint / Google Slides</option>
                    <option value="word">Word / Google Docs</option>
                    <option value="pdf">PDF</option>
                    <option value="canva">Canva Thiết kế</option>
                    <option value="image">Hình ảnh / Infographic</option>
                    <option value="link">Đường dẫn liên kết khác</option>
                  </select>
                </div>
              </div>

              {/* Tải tệp lên Google Drive */}
              <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-dashed border-[#B8E2D1] space-y-2">
                <label className="block text-xs font-bold text-[#176B5B] flex items-center gap-1.5">
                  <Upload className="w-4 h-4" /> Tải tệp từ máy tính lên Google Drive (Video, Word, PPTX, PDF, Ảnh):
                </label>
                <input
                  type="file"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setSelectedFile(f);
                      if (!formData.title) {
                        setFormData((prev) => ({ ...prev, title: f.name.replace(/\.[^/.]+$/, '') }));
                      }
                    }
                  }}
                  className="w-full text-xs text-[#526867] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#176B5B] file:text-white hover:file:bg-[#125649] cursor-pointer"
                />
                {selectedFile && (
                  <p className="text-xs text-[#176B5B] font-medium">
                    ✓ Đã chọn: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                )}
              </div>

              {/* Hoặc dán link trực tiếp */}
              <div>
                <label className="block text-xs font-bold text-[#263B3A] mb-1.5">
                  Hoặc dán đường dẫn trực tiếp (YouTube, Google Drive, Canva, Docs...)
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE6E3] bg-[#F6F9F8] focus:bg-white focus:outline-none focus:border-[#176B5B] text-sm text-[#263B3A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#263B3A] mb-1.5">
                  Mô tả nội dung & lưu ý thực hiện
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả cách học sinh thực hiện, thời lượng ước tính..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE6E3] bg-[#F6F9F8] focus:bg-white focus:outline-none focus:border-[#176B5B] text-sm text-[#263B3A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#263B3A] mb-1.5">
                  Ví dụ sản phẩm học sinh (theo đề án)
                </label>
                <input
                  type="text"
                  value={formData.studentProductExample}
                  onChange={(e) => setFormData({ ...formData, studentProductExample: e.target.value })}
                  placeholder="VD: Video 5 động tác tại chỗ; slide hiệu lệnh"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE6E3] bg-[#F6F9F8] focus:bg-white focus:outline-none focus:border-[#176B5B] text-sm text-[#263B3A]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#DCE6E3] text-sm font-semibold text-[#526867] hover:bg-[#F6F9F8]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2.5 rounded-xl bg-[#176B5B] text-white text-sm font-bold hover:bg-[#125649] transition-colors shadow-xs inline-flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" /> Đang đẩy lên Google Drive...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> {editingItem ? 'Lưu thay đổi' : 'Đăng tải học liệu'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cấu hình Google Apps Script URL */}
      {showConfigModal && isAuthorizedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#DCE6E3] w-full max-w-lg p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#DCE6E3] pb-4">
              <div className="flex items-center gap-2 text-[#176B5B]">
                <Settings className="w-5 h-5" />
                <h3 className="text-base font-bold text-[#263B3A]">
                  Cấu hình Google Sheet & Drive API
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#263B3A] mb-1.5">
                  URL ứng dụng web (Google Apps Script Web App URL)
                </label>
                <input
                  type="url"
                  required
                  value={scriptUrlInput}
                  onChange={(e) => setScriptUrlInput(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE6E3] bg-[#F6F9F8] focus:bg-white focus:outline-none focus:border-[#176B5B] text-xs font-mono text-[#263B3A]"
                />
              </div>

              <div className="rounded-xl bg-[#F8FAF9] p-3 text-xs text-[#526867] space-y-1">
                <p className="font-semibold text-[#176B5B]">Cách lấy URL:</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Tạo Google Sheet ➔ Tiện ích mở rộng ➔ Apps Script.</li>
                  <li>Dán mã trong thư mục <code>google-apps-script/Code.gs</code>.</li>
                  <li>Nhấn <strong>Triển khai (Deploy)</strong> ➔ Ứng dụng web ➔ Ai có quyền truy cập: <strong>Bất kỳ ai</strong>.</li>
                  <li>Sao chép URL dán vào ô trên.</li>
                </ol>
              </div>

              {configSaved && (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold">
                  ✓ Đã lưu cấu hình Google Apps Script thành công!
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#DCE6E3] text-xs font-semibold text-[#526867]"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#176B5B] text-white text-xs font-bold hover:bg-[#125649]"
                >
                  Lưu cấu hình
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Danh sách Học viên & Thời lượng sử dụng (Tab: DanhSach_HocVien) */}
      {showStudentsModal && isAuthorizedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#DCE6E3] w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-[#DCE6E3] flex items-center justify-between gap-4 bg-[#F8FAF9]">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#176B5B] uppercase">
                  <Users className="w-4 h-4" /> Bảng theo dõi học viên (Google Sheet: DanhSach_HocVien)
                </div>
                <h2 className="text-xl font-bold text-[#263B3A]">
                  Danh sách học sinh & Thời lượng truy cập App
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadStudents}
                  className="px-3 py-1.5 rounded-xl border border-[#DCE6E3] text-xs font-semibold text-[#176B5B] hover:bg-white inline-flex items-center gap-1.5"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${studentsLoading ? 'animate-spin' : ''}`} /> Làm mới
                </button>
                <button
                  type="button"
                  onClick={() => setShowStudentsModal(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter */}
            <div className="p-4 border-b border-[#F0F4F2] bg-white flex items-center justify-between gap-4">
              <div className="relative w-full max-w-sm">
                <Search className="w-4 h-4 text-[#526867] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Tìm học sinh theo tên hoặc lớp..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#DCE6E3] bg-[#F6F9F8] text-xs"
                />
              </div>
              <span className="text-xs text-[#526867] whitespace-nowrap">
                Tổng số học viên: <strong>{studentsList.length}</strong> em
              </span>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {studentsLoading ? (
                <div className="py-16 text-center text-sm text-[#526867]">
                  Đang đồng bộ dữ liệu từ Google Sheet...
                </div>
              ) : studentsList.length === 0 ? (
                <div className="py-16 text-center space-y-2">
                  <Users className="w-10 h-10 text-gray-400 mx-auto" />
                  <p className="text-sm font-semibold text-[#263B3A]">Chưa có học sinh nào trong bảng theo dõi</p>
                  <p className="text-xs text-[#526867]">
                    Khi học sinh điền thông tin và tham gia hoạt động, dữ liệu và thời lượng sẽ tự động xuất hiện tại đây và trên Google Sheet.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-[#DCE6E3]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#EBF7F2] text-[#176B5B] uppercase font-bold border-b border-[#DCE6E3]">
                      <tr>
                        <th className="py-3 px-4">Mã HS</th>
                        <th className="py-3 px-4">Họ và tên</th>
                        <th className="py-3 px-4">Lớp</th>
                        <th className="py-3 px-4">Trường THCS</th>
                        <th className="py-3 px-4">Lần truy cập cuối</th>
                        <th className="py-3 px-4 text-center">Số lần vào</th>
                        <th className="py-3 px-4 text-center">Tổng thời lượng</th>
                        <th className="py-3 px-4 text-center">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0F4F2]">
                      {studentsList
                        .filter((s) => {
                          const query = String(studentSearch || '').toLowerCase().trim();
                          if (!query) return true;
                          const name = String(s.fullName || '').toLowerCase();
                          const cls = String(s.className || '').toLowerCase();
                          const school = String(s.schoolName || '').toLowerCase();
                          return name.includes(query) || cls.includes(query) || school.includes(query);
                        })
                        .map((st, idx) => (
                          <tr key={st.studentId || idx} className="hover:bg-[#F8FAF9]">
                            <td className="py-3 px-4 font-mono text-[11px] text-[#526867]">{st.studentId}</td>
                            <td className="py-3 px-4 font-bold text-[#263B3A]">{st.fullName}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-md bg-[#DDF3EA] text-[#176B5B] font-bold text-[11px]">
                                {st.className}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-[#526867]">{st.schoolName}</td>
                            <td className="py-3 px-4 text-[#526867]">{st.lastActiveTime}</td>
                            <td className="py-3 px-4 text-center font-bold text-[#263B3A]">{st.visitCount}</td>
                            <td className="py-3 px-4 text-center font-bold text-[#176B5B]">
                              {st.durationMinutes} phút
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                {st.status || 'Đang học tập'}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#DCE6E3] bg-[#F8FAF9] flex items-center justify-between text-xs text-[#526867]">
              <span>Dữ liệu được cập nhật tự động mỗi phút qua Google Apps Script.</span>
              <button
                type="button"
                onClick={() => setShowStudentsModal(false)}
                className="px-4 py-2 rounded-xl bg-[#176B5B] text-white font-semibold hover:bg-[#125649]"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
