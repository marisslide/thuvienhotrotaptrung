import { ActivityGroupId, MaterialItem, StudentProfile, TeacherSession } from '../types/material';
import { SEED_MATERIALS } from '../data/seedMaterials';

const APPS_SCRIPT_STORAGE_KEY = 'google_apps_script_url';
const LOCAL_MATERIALS_KEY = 'local_materials_database';
const STUDENT_PROFILE_KEY = 'student_profile';
const TEACHER_AUTH_KEY = 'auth_teacher_session';
const STUDENT_LOGS_KEY = 'student_history_logs';
const TEACHER_LOGS_KEY = 'teacher_history_logs';

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

export function saveStudentProfile(profile: StudentProfile): void {
  localStorage.setItem(STUDENT_PROFILE_KEY, JSON.stringify(profile));
  // Đồng bộ ngay thông tin đăng ký lên Google Sheet
  logStudentActivity('ĐĂNG KÝ THÔNG TIN', 'Học sinh bắt đầu phiên truy cập thư viện', `${profile.className} - ${profile.schoolName}`);
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
  const current = await getMaterialsList();
  const index = current.findIndex((m) => m.id === material.id);
  let updated: MaterialItem[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = material;
    logTeacherActivity('CẬP NHẬT HỌC LIỆU', material.title, `Nhóm: ${material.groupName} - Loại: ${material.type}`);
  } else {
    updated = [material, ...current];
    logTeacherActivity('THÊM HỌC LIỆU MỚI', material.title, `Nhóm: ${material.groupName} - Loại: ${material.type}`);
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
          payload: material,
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
