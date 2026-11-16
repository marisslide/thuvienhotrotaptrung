import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Database,
  Edit3,
  Eye,
  EyeOff,
  LogOut,
  Plus,
  Search,
  Shield,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ConfirmModal } from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { ACTIVITY_GROUPS, GROUP_MAP, STUDENT_EXPRESSIONS } from '../data/taxonomy';
import {
  createActivity,
  deleteActivity,
  fetchAllAdminActivities,
  seedActivitiesToFirestore,
  slugifyVietnamese,
  toggleActivityStatus,
  updateActivity,
  validateActivityInput,
} from '../lib/activityService';
import {
  addAuthorizedTeacher,
  approveTeacherRequest,
  fetchAuthorizedTeachers,
  fetchTeacherRequests,
  rejectTeacherRequest,
  removeAuthorizedTeacher,
} from '../lib/teacherService';
import {
  Activity,
  ActivityGroupId,
  ActivityInput,
  ActivityScale,
  ActivityStatus,
  ActivityTiming,
  ExpressionId,
  TeacherAccessRequest,
  TeacherProfile,
} from '../types/activity';

const EMPTY_FORM: ActivityInput = {
  title: '',
  slug: '',
  group: 'van-dong',
  expressions: ['met-moi'],
  durationMinutes: 3,
  scale: 'Cả lớp',
  materials: 'Không cần học cụ',
  noMaterialsNeeded: true,
  shortDescription: '',
  goal: '',
  steps: ['', '', ''],
  transitionBackTip: '',
  teacherNotes: '',
  suitableTiming: 'Giữa tiết',
  gradeRange: 'Lớp 6 – Lớp 9',
  status: 'published',
};

export function AdminDashboardPage() {
  const { user, loading: authLoading, isAuthorizedTeacher, isPrimaryAdmin, logout } = useAuth();
  const { refreshLibrary } = useLibrary();

  const [tab, setTab] = useState<'activities' | 'teachers'>('activities');
  const [adminActivities, setAdminActivities] = useState<Activity[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | ActivityStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  // Modal Create / Edit state
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<ActivityInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Confirm delete modal
  const [deleteTarget, setDeleteTarget] = useState<Activity | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Teacher management state (primary admin)
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [requests, setRequests] = useState<TeacherAccessRequest[]>([]);
  const [newTeacherUid, setNewTeacherUid] = useState('');
  const [newTeacherName, setNewTeacherName] = useState('');
  const [addingTeacher, setAddingTeacher] = useState(false);

  const loadAdminData = useCallback(async () => {
    if (!user || !isAuthorizedTeacher) return;
    setLoadingList(true);
    setErrorMessage(null);
    try {
      const list = await fetchAllAdminActivities(isPrimaryAdmin, user.uid);
      setAdminActivities(list);

      if (isPrimaryAdmin) {
        const [teacherList, reqList] = await Promise.all([
          fetchAuthorizedTeachers(),
          fetchTeacherRequests(),
        ]);
        setTeachers(teacherList);
        setRequests(reqList);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Không thể tải dữ liệu quản trị từ Firestore.');
    } finally {
      setLoadingList(false);
    }
  }, [user, isAuthorizedTeacher, isPrimaryAdmin]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const filteredActivities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return adminActivities.filter((a) => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (q && !a.title.toLowerCase().includes(q) && !a.shortDescription.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [adminActivities, statusFilter, searchQuery]);

  const publishedCount = adminActivities.filter((a) => a.status === 'published').length;
  const hiddenCount = adminActivities.filter((a) => a.status === 'hidden').length;

  const openCreateModal = () => {
    setEditingId(null);
    setFormState(EMPTY_FORM);
    setFormError(null);
    setFormOpen(true);
  };

  const openEditModal = (act: Activity) => {
    setEditingId(act.id);
    setFormState({
      title: act.title,
      slug: act.slug,
      group: act.group,
      expressions: act.expressions,
      durationMinutes: act.durationMinutes,
      scale: act.scale,
      materials: act.materials,
      noMaterialsNeeded: act.noMaterialsNeeded,
      shortDescription: act.shortDescription,
      goal: act.goal,
      steps: act.steps.length > 0 ? act.steps : [''],
      transitionBackTip: act.transitionBackTip,
      teacherNotes: act.teacherNotes,
      suitableTiming: act.suitableTiming,
      gradeRange: act.gradeRange,
      status: act.status,
    });
    setFormError(null);
    setFormOpen(true);
  };

  const handleToggleExpression = (id: ExpressionId) => {
    setFormState((prev) => {
      const exists = prev.expressions.includes(id);
      const next = exists
        ? prev.expressions.filter((e) => e !== id)
        : [...prev.expressions, id];
      return { ...prev, expressions: next };
    });
  };

  const handleStepChange = (index: number, value: string) => {
    setFormState((prev) => {
      const next = [...prev.steps];
      next[index] = value;
      return { ...prev, steps: next };
    });
  };

  const addStepField = () => {
    if (formState.steps.length >= 10) return;
    setFormState((prev) => ({ ...prev, steps: [...prev.steps, ''] }));
  };

  const removeStepField = (index: number) => {
    if (formState.steps.length <= 1) return;
    setFormState((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }));
  };

  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const payload: ActivityInput = {
      ...formState,
      slug: slugifyVietnamese(formState.slug || formState.title),
    };

    const validationErr = validateActivityInput(payload);
    if (validationErr) {
      setFormError(validationErr);
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await updateActivity(editingId, payload);
        setBannerMessage(`Đã cập nhật hoạt động “${payload.title}”.`);
      } else {
        await createActivity(payload);
        setBannerMessage(`Đã thêm hoạt động mới “${payload.title}”.`);
      }
      setFormOpen(false);
      await loadAdminData();
      await refreshLibrary();
    } catch (err) {
      console.error(err);
      setFormError('Không thể lưu hoạt động lên Firestore. Vui lòng kiểm tra dữ liệu và quyền.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVisibility = async (act: Activity) => {
    const nextStatus: ActivityStatus = act.status === 'published' ? 'hidden' : 'published';
    try {
      await toggleActivityStatus(act.id, nextStatus);
      setBannerMessage(
        nextStatus === 'published'
          ? `Đã hiển thị hoạt động “${act.title}” trên thư viện công khai.`
          : `Đã ẩn hoạt động “${act.title}” khỏi thư viện công khai.`
      );
      await loadAdminData();
      await refreshLibrary();
    } catch (err) {
      console.error(err);
      setErrorMessage('Không thể thay đổi trạng thái hiển thị.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteActivity(deleteTarget.id);
      setBannerMessage(`Đã xóa hoạt động “${deleteTarget.title}”.`);
      setDeleteTarget(null);
      await loadAdminData();
      await refreshLibrary();
    } catch (err) {
      console.error(err);
      setErrorMessage('Không thể xóa hoạt động.');
    } finally {
      setDeleting(false);
    }
  };

  const handleSeedFirestore = async () => {
    setSeeding(true);
    setErrorMessage(null);
    try {
      const added = await seedActivitiesToFirestore();
      setBannerMessage(
        added > 0
          ? `Đã đồng bộ thành công ${added} hoạt động mẫu chuẩn THCS lên Firestore.`
          : 'Toàn bộ 18 hoạt động mẫu đã có sẵn trên Firestore.'
      );
      await loadAdminData();
      await refreshLibrary();
    } catch (err) {
      console.error(err);
      setErrorMessage('Không thể đồng bộ dữ liệu mẫu lên Firestore.');
    } finally {
      setSeeding(false);
    }
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingTeacher(true);
    setErrorMessage(null);
    try {
      await addAuthorizedTeacher(newTeacherUid, newTeacherName, 'teacher');
      setNewTeacherUid('');
      setNewTeacherName('');
      setBannerMessage('Đã cấp quyền biên tập cho giáo viên mới.');
      await loadAdminData();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Không thể thêm giáo viên.');
    } finally {
      setAddingTeacher(false);
    }
  };

  if (authLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-sm text-[#526867]">
        Đang xác thực quyền truy cập giáo viên...
      </div>
    );
  }

  if (!user || !isAuthorizedTeacher) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border border-[#DCE6E3] p-8 shadow-xs space-y-4">
          <Shield className="w-10 h-10 text-[#176B5B] mx-auto" />
          <h1 className="text-2xl font-bold text-[#263B3A]">
            Khu vực dành cho Giáo viên được cấp quyền
          </h1>
          <p className="text-sm text-[#526867]">
            Vui lòng đăng nhập bằng tài khoản giáo viên đã được cấp quyền để thêm, chỉnh sửa, ẩn
            hoặc xóa hoạt động trong thư viện.
          </p>
          <div className="pt-2">
            <Link
              to="/dang-nhap"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#176B5B] text-white text-sm font-semibold hover:bg-[#125649]"
            >
              Đi tới trang Đăng nhập Giáo viên
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#DCE6E3]">
        <div>
          <p className="text-xs font-semibold text-[#176B5B] mb-1">
            Quản trị Thư viện · {user.displayName || user.email}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#263B3A]">
            Khu vực Quản trị Giáo viên
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isPrimaryAdmin && (
            <div className="inline-flex rounded-xl bg-white border border-[#DCE6E3] p-1">
              <button
                type="button"
                onClick={() => setTab('activities')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  tab === 'activities'
                    ? 'bg-[#176B5B] text-white'
                    : 'text-[#526867] hover:text-[#263B3A]'
                }`}
              >
                Quản lý hoạt động
              </button>
              <button
                type="button"
                onClick={() => setTab('teachers')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  tab === 'teachers'
                    ? 'bg-[#176B5B] text-white'
                    : 'text-[#526867] hover:text-[#263B3A]'
                }`}
              >
                Phân quyền giáo viên ({requests.filter((r) => r.status === 'pending').length})
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#DCE6E3] text-sm font-medium text-[#526867] hover:text-[#263B3A] whitespace-nowrap shrink-0"
          >
            <LogOut className="w-4 h-4" /> Đăng xuất
          </button>
        </div>
      </div>

      {/* Feedback banners */}
      {bannerMessage && (
        <div className="rounded-2xl bg-[#DDF3EA] border border-[#B8E2D1] px-4 py-3 flex items-center justify-between gap-4 text-sm text-[#176B5B] font-medium">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {bannerMessage}
          </span>
          <button type="button" onClick={() => setBannerMessage(null)} aria-label="Đóng thông báo">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 flex items-center justify-between gap-4 text-sm text-red-700 font-medium">
          <span>{errorMessage}</span>
          <button type="button" onClick={() => setErrorMessage(null)} aria-label="Đóng thông báo lỗi">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {tab === 'activities' ? (
        <div className="space-y-6">
          {/* Metrics & Main Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div>
                <span className="text-[#526867]">Tổng trong Firestore: </span>
                <strong className="text-[#263B3A] tabular-nums">{adminActivities.length}</strong>
              </div>
              <div>
                <span className="text-[#526867]">Đang hiển thị công khai: </span>
                <strong className="text-[#176B5B] tabular-nums">{publishedCount}</strong>
              </div>
              <div>
                <span className="text-[#526867]">Đang ẩn: </span>
                <strong className="text-[#7563B8] tabular-nums">{hiddenCount}</strong>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSeedFirestore}
                disabled={seeding}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#DCE6E3] text-sm font-semibold text-[#263B3A] hover:bg-[#F6F9F8] transition-colors whitespace-nowrap shrink-0"
              >
                <Database className="w-4 h-4 text-[#7563B8]" />
                {seeding ? 'Đang đồng bộ...' : 'Đồng bộ 18 hoạt động mẫu'}
              </button>

              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#176B5B] text-white text-sm font-semibold hover:bg-[#125649] transition-colors whitespace-nowrap shrink-0"
              >
                <Plus className="w-4 h-4" /> Thêm hoạt động mới
              </button>
            </div>
          </div>

          {/* Search & Status Filter */}
          <div className="bg-white rounded-2xl border border-[#DCE6E3] p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#526867] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên hoặc mô tả hoạt động..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#DCE6E3] bg-[#F6F9F8] focus:bg-white text-sm"
              />
            </div>

            <div className="flex items-center gap-1.5">
              {(
                [
                  { id: 'all', label: 'Tất cả' },
                  { id: 'published', label: 'Đang hiển thị' },
                  { id: 'hidden', label: 'Đang ẩn' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setStatusFilter(item.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                    statusFilter === item.id
                      ? 'bg-[#176B5B] text-white'
                      : 'bg-[#F6F9F8] text-[#526867] hover:text-[#263B3A]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Table */}
          {loadingList ? (
            <div className="bg-white rounded-2xl border border-[#DCE6E3] p-8 text-center text-sm text-[#526867]">
              Đang tải dữ liệu hoạt động từ Firestore...
            </div>
          ) : adminActivities.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#DCE6E3] p-10 text-center space-y-4">
              <h2 className="text-lg font-bold text-[#263B3A]">
                Chưa có hoạt động nào được lưu trên Firestore
              </h2>
              <p className="text-sm text-[#526867] max-w-lg mx-auto">
                Thầy cô có thể bấm nút “Đồng bộ 18 hoạt động mẫu” để khởi tạo ngay bộ hoạt động
                chuẩn 6 nhóm vào cơ sở dữ liệu Firestore, hoặc thêm hoạt động mới thủ công.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={handleSeedFirestore}
                  disabled={seeding}
                  className="px-5 py-2.5 rounded-xl bg-[#176B5B] text-white text-sm font-semibold hover:bg-[#125649]"
                >
                  {seeding ? 'Đang đồng bộ...' : 'Đồng bộ 18 hoạt động mẫu ngay'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#DCE6E3] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-[#F6F9F8] border-b border-[#DCE6E3] text-xs font-semibold text-[#526867]">
                      <th className="py-3.5 px-5">Hoạt động</th>
                      <th className="py-3.5 px-4">Nhóm</th>
                      <th className="py-3.5 px-4">Thời lượng</th>
                      <th className="py-3.5 px-4">Trạng thái</th>
                      <th className="py-3.5 px-5 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCE6E3]">
                    {filteredActivities.map((act) => {
                      const g = GROUP_MAP[act.group];
                      const isPublished = act.status === 'published';
                      return (
                        <tr key={act.id} className="hover:bg-[#F6F9F8]/60 transition-colors">
                          <td className="py-4 px-5 max-w-md">
                            <Link
                              to={`/hoat-dong/${act.id}`}
                              className="font-bold text-[#263B3A] hover:text-[#176B5B] block mb-0.5"
                            >
                              {act.title}
                            </Link>
                            <p className="text-xs text-[#526867] line-clamp-1">
                              {act.scale} · {act.materials}
                            </p>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap font-medium text-[#263B3A]">
                            {g?.shortTitle || act.group}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap tabular-nums text-[#526867]">
                            {act.durationMinutes} phút
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                                isPublished ? 'text-[#176B5B]' : 'text-[#7563B8]'
                              }`}
                            >
                              {isPublished ? (
                                <>
                                  <Eye className="w-3.5 h-3.5" /> Đang hiển thị
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3.5 h-3.5" /> Đang ẩn
                                </>
                              )}
                            </span>
                          </td>
                          <td className="py-4 px-5 whitespace-nowrap text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleToggleVisibility(act)}
                                className="px-3 py-1.5 rounded-lg border border-[#DCE6E3] bg-white hover:bg-[#DDF3EA] text-xs font-semibold text-[#263B3A] transition-colors"
                              >
                                {isPublished ? 'Ẩn' : 'Hiển thị'}
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditModal(act)}
                                className="p-2 rounded-lg border border-[#DCE6E3] bg-white hover:bg-[#F6F9F8] text-[#176B5B]"
                                aria-label={`Chỉnh sửa ${act.title}`}
                                title="Chỉnh sửa"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(act)}
                                className="p-2 rounded-lg border border-[#DCE6E3] bg-white hover:bg-red-50 text-red-600"
                                aria-label={`Xóa ${act.title}`}
                                title="Xóa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Tab 2: Teacher Access Management */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl border border-[#DCE6E3] p-6 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-[#263B3A]">
                Yêu cầu cấp quyền từ giáo viên
              </h2>
              {requests.length === 0 ? (
                <p className="text-sm text-[#526867]">Chưa có yêu cầu mới nào.</p>
              ) : (
                <div className="space-y-3">
                  {requests.map((req) => (
                    <div
                      key={req.uid}
                      className="rounded-2xl border border-[#DCE6E3] bg-[#F6F9F8] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-[#263B3A]">
                          {req.displayName} · <span className="font-medium text-[#526867]">{req.schoolName}</span>
                        </p>
                        {req.note && <p className="text-xs text-[#526867]">{req.note}</p>}
                        <p className="text-xs font-mono text-[#526867]">UID: {req.uid}</p>
                        <p className="text-xs font-semibold text-[#7563B8]">
                          Trạng thái:{' '}
                          {req.status === 'pending'
                            ? 'Chờ duyệt'
                            : req.status === 'approved'
                            ? 'Đã duyệt'
                            : 'Đã từ chối'}
                        </p>
                      </div>

                      {req.status === 'pending' && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={async () => {
                              await approveTeacherRequest(req);
                              setBannerMessage(`Đã duyệt quyền giáo viên cho ${req.displayName}.`);
                              await loadAdminData();
                            }}
                            className="px-3.5 py-2 rounded-xl bg-[#176B5B] text-white text-xs font-semibold hover:bg-[#125649]"
                          >
                            Duyệt quyền
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              await rejectTeacherRequest(req.uid);
                              await loadAdminData();
                            }}
                            className="px-3.5 py-2 rounded-xl bg-white border border-[#DCE6E3] text-xs font-semibold text-red-600 hover:bg-red-50"
                          >
                            Từ chối
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-[#DCE6E3] p-6 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-[#263B3A]">
                Danh sách giáo viên đang có quyền ({teachers.length})
              </h2>
              {teachers.length === 0 ? (
                <p className="text-sm text-[#526867]">
                  Hiện chỉ có tài khoản Quản trị viên chính đang hoạt động.
                </p>
              ) : (
                <div className="divide-y divide-[#DCE6E3]">
                  {teachers.map((t) => (
                    <div key={t.uid} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-[#263B3A]">{t.displayName}</p>
                        <p className="text-xs font-mono text-[#526867]">{t.uid}</p>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          await removeAuthorizedTeacher(t.uid);
                          setBannerMessage(`Đã thu hồi quyền của ${t.displayName}.`);
                          await loadAdminData();
                        }}
                        className="px-3 py-1.5 rounded-lg border border-[#DCE6E3] text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        Thu hồi
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5">
            <form
              onSubmit={handleAddTeacher}
              className="bg-white rounded-3xl border border-[#DCE6E3] p-6 shadow-xs space-y-4"
            >
              <div className="flex items-center gap-2 text-[#176B5B]">
                <UserPlus className="w-5 h-5" />
                <h2 className="text-lg font-bold text-[#263B3A]">Cấp quyền nhanh bằng UID</h2>
              </div>
              <p className="text-xs text-[#526867] leading-relaxed">
                Giáo viên sau khi đăng nhập Google tại trang Đăng nhập Giáo viên có thể sao chép mã
                UID gửi cho quản trị viên để thêm trực tiếp tại đây.
              </p>

              <div>
                <label className="block text-xs font-semibold text-[#263B3A] mb-1">
                  Mã UID của giáo viên *
                </label>
                <input
                  type="text"
                  required
                  value={newTeacherUid}
                  onChange={(e) => setNewTeacherUid(e.target.value)}
                  placeholder="Dán mã UID Firebase..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE6E3] bg-[#F6F9F8] text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#263B3A] mb-1">
                  Tên hiển thị giáo viên *
                </label>
                <input
                  type="text"
                  required
                  value={newTeacherName}
                  onChange={(e) => setNewTeacherName(e.target.value)}
                  placeholder="VD: Thầy Trần Văn Bình"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE6E3] bg-[#F6F9F8] text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={addingTeacher}
                className="w-full py-2.5 rounded-xl bg-[#176B5B] text-white text-sm font-semibold hover:bg-[#125649] disabled:opacity-60"
              >
                {addingTeacher ? 'Đang thêm...' : 'Cấp quyền giáo viên'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create / Edit Activity Modal */}
      {formOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#263B3A]/50 backdrop-blur-[2px] flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label={editingId ? 'Chỉnh sửa hoạt động' : 'Thêm hoạt động mới'}
        >
          <div className="bg-white rounded-3xl border border-[#DCE6E3] w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl my-auto">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#DCE6E3] mb-6">
              <h2 className="text-xl font-bold text-[#263B3A]">
                {editingId ? 'Chỉnh sửa hoạt động' : 'Thêm hoạt động mới'}
              </h2>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="p-2 rounded-xl text-[#526867] hover:bg-[#F6F9F8]"
                aria-label="Đóng biểu mẫu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveActivity} className="space-y-5">
              {formError && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#263B3A] mb-1">
                    Tên hoạt động *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={140}
                    value={formState.title}
                    onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                    placeholder="VD: Vươn vai 3 nhịp – Đổi tư thế tại chỗ"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE6E3] bg-[#F6F9F8] focus:bg-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#263B3A] mb-1">
                    Nhóm hoạt động *
                  </label>
                  <select
                    value={formState.group}
                    onChange={(e) =>
                      setFormState({ ...formState, group: e.target.value as ActivityGroupId })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE6E3] bg-[#F6F9F8] text-sm"
                  >
                    {ACTIVITY_GROUPS.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#263B3A] mb-1">
                    Thời lượng (1–15 phút) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={15}
                    required
                    value={formState.durationMinutes}
                    onChange={(e) =>
                      setFormState({ ...formState, durationMinutes: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE6E3] bg-[#F6F9F8] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#263B3A] mb-1">
                    Quy mô tổ chức *
                  </label>
                  <select
                    value={formState.scale}
                    onChange={(e) =>
                      setFormState({ ...formState, scale: e.target.value as ActivityScale })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE6E3] bg-[#F6F9F8] text-sm"
                  >
                    <option value="Cả lớp">Cả lớp</option>
                    <option value="Theo nhóm">Theo nhóm</option>
                    <option value="Theo cặp">Theo cặp</option>
                    <option value="Cá nhân tại chỗ">Cá nhân tại chỗ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#263B3A] mb-1">
                    Thời điểm phù hợp *
                  </label>
                  <select
                    value={formState.suitableTiming}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        suitableTiming: e.target.value as ActivityTiming,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE6E3] bg-[#F6F9F8] text-sm"
                  >
                    <option value="Đầu tiết">Đầu tiết</option>
                    <option value="Giữa tiết">Giữa tiết</option>
                    <option value="Chuyển tiếp nhiệm vụ">Chuyển tiếp nhiệm vụ</option>
                    <option value="Cuối tiết">Cuối tiết</option>
                    <option value="Linh hoạt">Linh hoạt</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#263B3A] mb-1">
                    Khối lớp áp dụng
                  </label>
                  <input
                    type="text"
                    maxLength={60}
                    value={formState.gradeRange}
                    onChange={(e) => setFormState({ ...formState, gradeRange: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE6E3] bg-[#F6F9F8] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#263B3A] mb-1">
                    Trạng thái hiển thị *
                  </label>
                  <select
                    value={formState.status}
                    onChange={(e) =>
                      setFormState({ ...formState, status: e.target.value as ActivityStatus })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE6E3] bg-[#F6F9F8] text-sm"
                  >
                    <option value="published">Đang hiển thị (Công khai)</option>
                    <option value="hidden">Đang ẩn (Chỉ giáo viên xem)</option>
                  </select>
                </div>
              </div>

              {/* Materials */}
              <div className="space-y-2">
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#263B3A] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.noMaterialsNeeded}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        noMaterialsNeeded: e.target.checked,
                        materials: e.target.checked ? 'Không cần học cụ' : '',
                      })
                    }
                    className="w-4 h-4 rounded accent-[#176B5B]"
                  />
                  Không cần chuẩn bị học cụ
                </label>

                {!formState.noMaterialsNeeded && (
                  <input
                    type="text"
                    maxLength={200}
                    value={formState.materials}
                    onChange={(e) => setFormState({ ...formState, materials: e.target.value })}
                    placeholder="Ghi rõ dụng cụ cần thiết (VD: Bảng lớp và phấn)..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE6E3] bg-[#F6F9F8] text-sm"
                  />
                )}
              </div>

              {/* Expressions */}
              <div>
                <p className="text-xs font-semibold text-[#263B3A] mb-2">
                  Phù hợp với biểu hiện học sinh (chọn ít nhất 1) *
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {STUDENT_EXPRESSIONS.map((exp) => {
                    const checked = formState.expressions.includes(exp.id);
                    return (
                      <label
                        key={exp.id}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                          checked
                            ? 'bg-[#DDF3EA] border-[#176B5B] text-[#176B5B]'
                            : 'bg-[#F6F9F8] border-[#DCE6E3] text-[#263B3A]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleExpression(exp.id)}
                          className="accent-[#176B5B]"
                        />
                        <span>{exp.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#263B3A] mb-1">
                  Mô tả ngắn gọn (từ 10 ký tự) *
                </label>
                <textarea
                  rows={2}
                  required
                  maxLength={320}
                  value={formState.shortDescription}
                  onChange={(e) =>
                    setFormState({ ...formState, shortDescription: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE6E3] bg-[#F6F9F8] focus:bg-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#263B3A] mb-1">
                  Mục tiêu hỗ trợ lớp học *
                </label>
                <textarea
                  rows={2}
                  required
                  maxLength={400}
                  value={formState.goal}
                  onChange={(e) => setFormState({ ...formState, goal: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE6E3] bg-[#F6F9F8] focus:bg-white text-sm"
                />
              </div>

              {/* Steps */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#263B3A]">
                    Các bước tổ chức thực hiện (tối đa 10 bước) *
                  </label>
                  {formState.steps.length < 10 && (
                    <button
                      type="button"
                      onClick={addStepField}
                      className="text-xs font-semibold text-[#176B5B] hover:underline"
                    >
                      + Thêm bước
                    </button>
                  )}
                </div>

                {formState.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="w-7 h-9 rounded-lg bg-[#F6F9F8] border border-[#DCE6E3] text-xs font-bold flex items-center justify-center shrink-0 tabular-nums">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      maxLength={400}
                      value={step}
                      onChange={(e) => handleStepChange(idx, e.target.value)}
                      placeholder={`Nội dung bước ${idx + 1}...`}
                      className="flex-1 px-3.5 py-2 rounded-xl border border-[#DCE6E3] bg-[#F6F9F8] focus:bg-white text-sm"
                    />
                    {formState.steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStepField(idx)}
                        className="p-2 text-[#526867] hover:text-red-600"
                        aria-label={`Xóa bước ${idx + 1}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#263B3A] mb-1">
                  Câu dẫn chuyển tiếp quay lại nhiệm vụ học tập *
                </label>
                <input
                  type="text"
                  required
                  maxLength={300}
                  value={formState.transitionBackTip}
                  onChange={(e) =>
                    setFormState({ ...formState, transitionBackTip: e.target.value })
                  }
                  placeholder="VD: “Cả lớp đã tỉnh táo hơn rồi, mời các em mở trang 34 hoàn thành câu số 2.”"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE6E3] bg-[#F6F9F8] focus:bg-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#263B3A] mb-1">
                  Lưu ý thêm cho giáo viên
                </label>
                <textarea
                  rows={2}
                  maxLength={500}
                  value={formState.teacherNotes}
                  onChange={(e) => setFormState({ ...formState, teacherNotes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE6E3] bg-[#F6F9F8] focus:bg-white text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DCE6E3]">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#F6F9F8] text-sm font-medium text-[#263B3A] hover:bg-[#E7EFEC]"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-[#176B5B] text-white text-sm font-semibold hover:bg-[#125649] disabled:opacity-60"
                >
                  {saving ? 'Đang lưu...' : editingId ? 'Lưu cập nhật' : 'Tạo hoạt động'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Xác nhận xóa hoạt động"
        message={`Thầy cô có chắc chắn muốn xóa vĩnh viễn hoạt động “${deleteTarget?.title || ''}”? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa hoạt động"
        danger
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
