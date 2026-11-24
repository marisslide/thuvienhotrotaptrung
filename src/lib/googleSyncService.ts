import { ActivityGroupId, MaterialItem, StudentDirectoryItem, StudentProfile, TeacherSession } from '../types/material';
import { getAutoThumbnail, GROUP_DEFAULT_COVERS, SEED_MATERIALS } from '../data/seedMaterials';

const APPS_SCRIPT_STORAGE_KEY = 'google_apps_script_url';
const LOCAL_MATERIALS_KEY = 'local_materials_database';
const STUDENT_PROFILE_KEY = 'student_profile';
const USER_ROLE_KEY = 'app_user_role';
const STUDENT_ID_KEY = 'student_unique_id';
const STUDENT_DURATION_KEY = 'student_total_duration_minutes';
const TEACHER_AUTH_KEY = 'auth_teacher_session';
const STUDENT_LOGS_KEY = 'student_history_logs';
const TEACHER_LOGS_KEY = 'teacher_history_logs';
const CACHED_STUDENTS_KEY = 'cached_student_directory';

export type UserRole = 'teacher' | 'student' | null;

export function getUserRole(): UserRole {
  return (localStorage.getItem(USER_ROLE_KEY) as UserRole) || null;
}

export function setUserRole(role: UserRole): void {
  if (role) {
    localStorage.setItem(USER_ROLE_KEY, role);
  } else {
    localStorage.removeItem(USER_ROLE_KEY);
  }
}

export const DEFAULT_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbwyWvlc6f32RTL_c-efa1QmaU7emBj6zQj4qfTLmA_bAVS6flwqxyE1sCAMt-JdxmYLYw/exec';

export function getAppsScriptUrl(): string {
  const custom = localStorage.getItem(APPS_SCRIPT_STORAGE_KEY);
  if (custom && custom.trim().length > 0) {
    return custom.trim();
  }
  return (
    (import.meta.env.VITE_APPS_SCRIPT_URL as string) ||
    DEFAULT_APPS_SCRIPT_URL
  );
}

export function setAppsScriptUrl(url: string): void {
  localStorage.setItem(APPS_SCRIPT_STORAGE_KEY, url.trim());
}

export function getStudentProfile(): StudentProfile | null {
  try {
    const raw = localStorage.getItem(STUDENT_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getOrCreateStudentId(): string {
  let id = localStorage.getItem(STUDENT_ID_KEY);
  if (!id) {
    id = `HS-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    localStorage.setItem(STUDENT_ID_KEY, id);
  }
  return id;
}

export function saveStudentProfile(profile: StudentProfile): void {
  const studentId = profile.id || getOrCreateStudentId();
  const fullProfile: StudentProfile = { ...profile, id: studentId };
  localStorage.setItem(STUDENT_PROFILE_KEY, JSON.stringify(fullProfile));
  setUserRole('student');
  
  // Đồng bộ ngay thông tin đăng ký lên Google Sheet
  logStudentActivity('ĐĂNG KÝ THÔNG TIN', 'Học sinh bắt đầu phiên truy cập thư viện', `${profile.className} - ${profile.schoolName}`);
  
  // Tạo hoặc cập nhật thông tin trong DanhSach_HocVien
  syncStudentSessionDuration(0, true, 'Bắt đầu phiên');
}

/**
 * Cập nhật thời lượng truy cập của học sinh vào Sheet "DanhSach_HocVien"
 */
export async function syncStudentSessionDuration(
  durationMinutes: number = 0,
  isNewSession: boolean = false,
  status: string = 'Đang học tập'
): Promise<void> {
  const profile = getStudentProfile();
  if (!profile || !profile.fullName) return;

  const studentId = profile.id || getOrCreateStudentId();
  
  // Cộng dồn thời lượng cục bộ
  const currentTotal = Number(localStorage.getItem(STUDENT_DURATION_KEY) || '0');
  const newTotal = currentTotal + durationMinutes;
  localStorage.setItem(STUDENT_DURATION_KEY, newTotal.toFixed(1));

  const scriptUrl = getAppsScriptUrl();
  if (!scriptUrl) return;

  const payload = {
    studentId,
    fullName: profile.fullName,
    className: profile.className,
    schoolName: profile.schoolName,
    timestamp: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
    durationMinutes,
    isNewSession,
    status,
  };

  try {
    await fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'SYNC_STUDENT_SESSION',
        payload,
      }),
    });
  } catch (err) {
    console.warn('Lỗi đồng bộ thời lượng học sinh:', err);
  }
}

function cleanClassName(val: any): string {
  if (!val && val !== 0) return 'Chưa có lớp';
  const str = String(val).trim();
  // Nếu Google Sheet chuyển 8/7 thành ngày dạng ISO
  if (str.includes('T') && str.endsWith('Z')) {
    try {
      const d = new Date(str);
      const m = d.getUTCMonth() + 1;
      const day = d.getUTCDate();
      return `Lớp ${m}/${day}`;
    } catch {
      return str;
    }
  }
  return str.startsWith('Lớp ') || str.startsWith('9') || str.startsWith('8') || str.startsWith('7') || str.startsWith('6') ? str : `Lớp ${str}`;
}

/**
 * Lấy danh sách học viên và thời lượng từ Google Sheet (Dành cho Giáo viên & Admin)
 * Tự động làm sạch dữ liệu, ép kiểu chuỗi an toàn 100% để chống lỗi crash toLowerCase
 */
export async function fetchStudentDirectory(): Promise<StudentDirectoryItem[]> {
  const scriptUrl = getAppsScriptUrl();
  let rawList: any[] = [];

  if (scriptUrl) {
    try {
      const res = await fetch(`${scriptUrl}?action=GET_STUDENTS`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.students)) {
          rawList = data.students;
        }
      }
    } catch (e) {
      console.warn('Không thể tải danh sách học viên trực tiếp từ Google Sheet:', e);
    }
  }

  // Fallback sang bộ nhớ cache nếu chưa có dữ liệu mạng
  if (rawList.length === 0) {
    try {
      const cached = localStorage.getItem(CACHED_STUDENTS_KEY);
      if (cached) {
        rawList = JSON.parse(cached);
      }
    } catch {
      rawList = [];
    }
  }

  // Nếu trên thiết bị này có học sinh đã đăng ký thì luôn đảm bảo hiển thị
  const currentStudent = getStudentProfile();
  if (currentStudent && currentStudent.fullName) {
    const localTotal = Number(localStorage.getItem(STUDENT_DURATION_KEY) || '1');
    const existingIdx = rawList.findIndex(
      (r: any) => String(r.fullName).trim().toLowerCase() === currentStudent.fullName.trim().toLowerCase()
    );
    if (existingIdx === -1) {
      rawList.unshift({
        studentId: currentStudent.id || 'HS-HIEN-TAI',
        fullName: currentStudent.fullName,
        className: currentStudent.className,
        schoolName: currentStudent.schoolName,
        startTime: currentStudent.registeredAt || new Date().toLocaleString('vi-VN'),
        lastActiveTime: new Date().toLocaleString('vi-VN'),
        visitCount: 1,
        durationMinutes: localTotal,
        status: 'Đang học tập',
      });
    }
  }

  // Ép kiểu chuỗi an toàn 100% để không bao giờ bị lỗi toLowerCase
  const cleaned: StudentDirectoryItem[] = rawList.map((s: any, idx: number) => ({
    studentId: String(s.studentId || `HS-${idx + 1}`),
    fullName: String(s.fullName || 'Học sinh').trim(),
    className: cleanClassName(s.className),
    schoolName: String(s.schoolName || 'THCS').trim(),
    startTime: String(s.startTime || ''),
    lastActiveTime: String(s.lastActiveTime || ''),
    visitCount: Math.max(1, Number(s.visitCount) || 1),
    durationMinutes: Math.max(1, Number(s.durationMinutes) || 1),
    status: String(s.status || 'Đang học tập'),
  }));

  // Gộp các bản ghi trùng lặp của cùng 1 học sinh theo Tên + Lớp
  const map = new Map<string, StudentDirectoryItem>();
  for (const item of cleaned) {
    const key = `${item.fullName.toLowerCase()}__${item.className.toLowerCase()}`;
    if (!map.has(key)) {
      map.set(key, { ...item });
    } else {
      const exist = map.get(key)!;
      exist.visitCount = Math.max(exist.visitCount, item.visitCount) + 1;
      exist.durationMinutes = Math.max(exist.durationMinutes, item.durationMinutes);
      exist.lastActiveTime = item.lastActiveTime || exist.lastActiveTime;
      exist.status = item.status || exist.status;
    }
  }

  const result = Array.from(map.values()).sort(
    (a, b) => b.durationMinutes - a.durationMinutes
  );

  try {
    localStorage.setItem(CACHED_STUDENTS_KEY, JSON.stringify(result));
  } catch {}

  return result;
}

export function getTeacherSession(): TeacherSession | null {
  try {
    const raw = localStorage.getItem(TEACHER_AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setTeacherSession(session: TeacherSession | null): void {
  if (session) {
    localStorage.setItem(TEACHER_AUTH_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(TEACHER_AUTH_KEY);
  }
}

/**
 * Ghi log học sinh vào Tab "HocSinh_LichSu" của Google Sheet qua Apps Script
 */
export async function logStudentActivity(
  action: string,
  detail: string,
  notes?: string
): Promise<void> {
  const profile = getStudentProfile();
  const logEntry = {
    timestamp: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
    fullName: profile?.fullName || 'Học sinh chưa định danh',
    className: profile?.className || 'Chưa cập nhật',
    schoolName: profile?.schoolName || 'Chưa cập nhật',
    action,
    detail,
    notes: notes || '',
  };

  // Lưu bản sao cục bộ để không bao giờ mất dữ liệu
  try {
    const existing = JSON.parse(localStorage.getItem(STUDENT_LOGS_KEY) || '[]');
    existing.unshift(logEntry);
    localStorage.setItem(STUDENT_LOGS_KEY, JSON.stringify(existing.slice(0, 200)));
  } catch (e) {
    console.warn('Lỗi ghi bộ nhớ cục bộ học sinh:', e);
  }

  const scriptUrl = getAppsScriptUrl();
  if (!scriptUrl) return;

  try {
    // Dùng mode no-cors để đảm bảo request gửi đến Google Apps Script luôn thông suốt
    await fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'LOG_STUDENT',
        payload: logEntry,
      }),
    });
  } catch (err) {
    console.warn('Không thể gửi log học sinh lên Google Sheet:', err);
  }
}

/**
 * Ghi log giáo viên vào Tab "GiaoVien_LichSu" của Google Sheet qua Apps Script
 */
export async function logTeacherActivity(
  action: string,
  targetTitle: string,
  details?: string
): Promise<void> {
  const teacher = getTeacherSession();
  const logEntry = {
    timestamp: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
    teacherName: teacher?.displayName || 'Cô Diệu Hiền (Quản trị)',
    action,
    targetTitle,
    details: details || '',
  };

  // Lưu bản sao cục bộ
  try {
    const existing = JSON.parse(localStorage.getItem(TEACHER_LOGS_KEY) || '[]');
    existing.unshift(logEntry);
    localStorage.setItem(TEACHER_LOGS_KEY, JSON.stringify(existing.slice(0, 200)));
  } catch (e) {
    console.warn('Lỗi ghi bộ nhớ cục bộ giáo viên:', e);
  }

  const scriptUrl = getAppsScriptUrl();
  if (!scriptUrl) return;

  try {
    await fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'LOG_TEACHER',
        payload: logEntry,
      }),
    });
  } catch (err) {
    console.warn('Không thể gửi log giáo viên lên Google Sheet:', err);
  }
}

/**
 * Lấy toàn bộ danh sách học liệu (kết hợp seed data + dữ liệu tạo mới + Google Sheet)
 */
export async function getMaterialsList(): Promise<MaterialItem[]> {
  let localItems: MaterialItem[] = [];
  try {
    const raw = localStorage.getItem(LOCAL_MATERIALS_KEY);
    localItems = raw ? JSON.parse(raw) : [];
  } catch {
    localItems = [];
  }

  // Nếu có Web App URL thì thử đồng bộ từ Google Sheet
  const scriptUrl = getAppsScriptUrl();
  if (scriptUrl) {
    try {
      const res = await fetch(`${scriptUrl}?action=GET_MATERIALS`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.materials) && data.materials.length > 0) {
          // Lưu cache và trả về
          localStorage.setItem(LOCAL_MATERIALS_KEY, JSON.stringify(data.materials));
          return mergeMaterials(SEED_MATERIALS, data.materials);
        }
      }
    } catch (e) {
      console.warn('Đang sử dụng dữ liệu học liệu lưu cục bộ:', e);
    }
  }

  return mergeMaterials(SEED_MATERIALS, localItems);
}

function mergeMaterials(defaults: MaterialItem[], custom: MaterialItem[]): MaterialItem[] {
  const map = new Map<string, MaterialItem>();
  defaults.forEach((item) => map.set(item.id, item));
  custom.forEach((item) => map.set(item.id, item));
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Thêm hoặc chỉnh sửa học liệu
 */
export async function saveMaterialItem(material: MaterialItem): Promise<void> {
  const itemToSave: MaterialItem = {
    ...material,
    thumbnailUrl: material.thumbnailUrl || getAutoThumbnail(material.url, material.groupId),
  };
  const current = await getMaterialsList();
  const index = current.findIndex((m) => m.id === itemToSave.id);
  let updated: MaterialItem[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = itemToSave;
    logTeacherActivity('CẬP NHẬT HỌC LIỆU', itemToSave.title, `Nhóm: ${itemToSave.groupName} - Loại: ${itemToSave.type}`);
  } else {
    updated = [itemToSave, ...current];
    logTeacherActivity('THÊM HỌC LIỆU MỚI', itemToSave.title, `Nhóm: ${itemToSave.groupName} - Loại: ${itemToSave.type}`);
  }

  localStorage.setItem(LOCAL_MATERIALS_KEY, JSON.stringify(updated));

  const scriptUrl = getAppsScriptUrl();
  if (scriptUrl) {
    try {
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SAVE_MATERIAL',
          payload: itemToSave,
        }),
      });
    } catch (err) {
      console.warn('Lỗi đồng bộ học liệu lên Google Sheet:', err);
    }
  }
}

/**
 * Xóa học liệu
 */
export async function deleteMaterialItem(id: string): Promise<void> {
  const current = await getMaterialsList();
  const target = current.find((m) => m.id === id);
  const updated = current.filter((m) => m.id !== id);
  localStorage.setItem(LOCAL_MATERIALS_KEY, JSON.stringify(updated));

  if (target) {
    logTeacherActivity('XÓA HỌC LIỆU', target.title, `Nhóm: ${target.groupName}`);
  }

  const scriptUrl = getAppsScriptUrl();
  if (scriptUrl) {
    try {
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DELETE_MATERIAL',
          payload: { id },
        }),
      });
    } catch (err) {
      console.warn('Lỗi đồng bộ xóa học liệu lên Google Sheet:', err);
    }
  }
}

/**
 * Upload file lên Google Drive qua Apps Script (hoặc tạo DataURL nếu chưa gắn Script)
 */
export async function uploadFileToGoogleDrive(
  file: File,
  meta: {
    title: string;
    groupId: ActivityGroupId;
    groupName: string;
    type: MaterialItem['type'];
    description: string;
    studentProductExample?: string;
  }
): Promise<MaterialItem> {
  const scriptUrl = getAppsScriptUrl();
  const base64Data = await fileToBase64(file);

  let finalUrl = '';
  let driveId = '';

  if (scriptUrl) {
    try {
      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'UPLOAD_FILE',
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          fileData: base64Data.split(',')[1] || base64Data,
          title: meta.title,
          groupName: meta.groupName,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.fileUrl) {
          finalUrl = result.fileUrl;
          driveId = result.fileId || '';
        }
      }
    } catch (err) {
      console.warn('Apps Script chưa phản hồi trực tiếp, chuyển sang lưu trữ cục bộ:', err);
    }
  }

  // Fallback nếu chưa kết nối hoặc offline: sử dụng Blob/Data URL hoặc link Google Drive mô phỏng
  if (!finalUrl) {
    finalUrl = base64Data;
  }

  const newMaterial: MaterialItem = {
    id: `mat-${Date.now()}`,
    title: meta.title,
    groupId: meta.groupId,
    groupName: meta.groupName,
    type: meta.type,
    url: finalUrl,
    thumbnailUrl: getAutoThumbnail(finalUrl, meta.groupId),
    description: meta.description,
    studentProductExample: meta.studentProductExample || 'Tài liệu tải lên từ giáo viên',
    driveFileId: driveId || undefined,
    author: getTeacherSession()?.displayName || 'Cô Diệu Hiền',
    createdAt: new Date().toISOString().slice(0, 10),
    fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
    isPriority: true,
  };

  await saveMaterialItem(newMaterial);
  return newMaterial;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
