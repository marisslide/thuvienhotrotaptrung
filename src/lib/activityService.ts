import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { SEED_ACTIVITIES } from '../data/seedActivities';
import {
  Activity,
  ActivityGroupId,
  ActivityInput,
  ActivityScale,
  ActivityStatus,
  ActivityTiming,
  ExpressionId,
} from '../types/activity';
import { auth, db, handleFirestoreError, OperationType } from './firebase';

const ACTIVITIES_COLLECTION = 'activities';
const LIBRARY_META_DOC = 'library_meta/config';

const VALID_GROUPS: ActivityGroupId[] = [
  'van-dong',
  'quan-sat',
  'ghi-nho',
  'phan-xa',
  'tuong-tac',
  'thu-gian',
];

const VALID_EXPRESSIONS: ExpressionId[] = [
  'met-moi',
  'nhin-ra-ngoai',
  'noi-chuyen-rieng',
  'phan-hoi-cham',
  'it-tham-gia',
  'kho-duy-tri',
];

export function slugifyVietnamese(input: string): string {
  const normalized = input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  return (normalized || 'hoat-dong-tai-tap-trung').slice(0, 140);
}

function formatTimestamp(value: unknown): string | undefined {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (typeof value === 'string') {
    return value;
  }
  return undefined;
}

function mapDocToActivity(id: string, data: Record<string, unknown>): Activity {
  return {
    id,
    title: String(data.title || ''),
    slug: String(data.slug || ''),
    group: (VALID_GROUPS.includes(data.group as ActivityGroupId)
      ? data.group
      : 'van-dong') as ActivityGroupId,
    expressions: Array.isArray(data.expressions)
      ? (data.expressions.filter((e) =>
          VALID_EXPRESSIONS.includes(e as ExpressionId)
        ) as ExpressionId[])
      : ['met-moi'],
    durationMinutes: Number(data.durationMinutes) || 3,
    scale: (data.scale as ActivityScale) || 'Cả lớp',
    materials: String(data.materials || 'Không cần học cụ'),
    noMaterialsNeeded: Boolean(data.noMaterialsNeeded),
    shortDescription: String(data.shortDescription || ''),
    goal: String(data.goal || ''),
    steps: Array.isArray(data.steps) ? data.steps.map((s) => String(s)) : [],
    transitionBackTip: String(data.transitionBackTip || ''),
    teacherNotes: String(data.teacherNotes || ''),
    suitableTiming: (data.suitableTiming as ActivityTiming) || 'Linh hoạt',
    gradeRange: String(data.gradeRange || 'Lớp 6 – Lớp 9'),
    status: (data.status === 'hidden' ? 'hidden' : 'published') as ActivityStatus,
    authorId: String(data.authorId || ''),
    authorName: String(data.authorName || 'Giáo viên'),
    createdAt: formatTimestamp(data.createdAt),
    updatedAt: formatTimestamp(data.updatedAt),
  };
}

export function sanitizeActivityInput(input: ActivityInput): ActivityInput {
  const title = input.title.trim().slice(0, 140);
  const rawSlug = slugifyVietnamese(input.slug || title);
  const slug = rawSlug.length >= 3 ? rawSlug.slice(0, 160) : `hd-${Date.now()}`;
  const cleanSteps = input.steps
    .map((s) => s.trim().slice(0, 400))
    .filter((s) => s.length >= 3)
    .slice(0, 10);

  const cleanExpressions = Array.from(
    new Set(input.expressions.filter((e) => VALID_EXPRESSIONS.includes(e)))
  ).slice(0, 6);

  const materials = input.noMaterialsNeeded
    ? 'Không cần học cụ'
    : (input.materials.trim() || 'Bảng lớp và phấn').slice(0, 200);

  return {
    title,
    slug,
    group: VALID_GROUPS.includes(input.group) ? input.group : 'van-dong',
    expressions: cleanExpressions.length > 0 ? cleanExpressions : ['met-moi'],
    durationMinutes: Math.min(15, Math.max(1, Math.round(Number(input.durationMinutes) || 3))),
    scale: input.scale,
    materials,
    noMaterialsNeeded: Boolean(input.noMaterialsNeeded),
    shortDescription: input.shortDescription.trim().slice(0, 320),
    goal: input.goal.trim().slice(0, 400),
    steps: cleanSteps.length > 0 ? cleanSteps : ['Giáo viên hướng dẫn học sinh thực hiện tại chỗ.'],
    transitionBackTip: input.transitionBackTip.trim().slice(0, 300),
    teacherNotes: input.teacherNotes.trim().slice(0, 500),
    suitableTiming: input.suitableTiming,
    gradeRange: (input.gradeRange.trim() || 'Lớp 6 – Lớp 9').slice(0, 60),
    status: input.status === 'hidden' ? 'hidden' : 'published',
  };
}

export function validateActivityInput(input: ActivityInput): string | null {
  if (input.title.trim().length < 3) return 'Tên hoạt động phải có ít nhất 3 ký tự.';
  if (input.expressions.length === 0) return 'Vui lòng chọn ít nhất 1 biểu hiện phù hợp.';
  if (input.shortDescription.trim().length < 10) return 'Mô tả ngắn phải có ít nhất 10 ký tự.';
  if (input.goal.trim().length < 5) return 'Mục tiêu hoạt động phải có ít nhất 5 ký tự.';
  const validSteps = input.steps.filter((s) => s.trim().length >= 3);
  if (validSteps.length === 0) return 'Vui lòng nhập ít nhất 1 bước thực hiện (từ 3 ký tự).';
  if (input.transitionBackTip.trim().length < 5) {
    return 'Vui lòng nhập câu dẫn quay lại nhiệm vụ học tập (từ 5 ký tự).';
  }
  return null;
}

export async function checkLibrarySeeded(): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, 'library_meta', 'config'));
    return snap.exists() && Boolean(snap.data()?.seeded);
  } catch {
    return false;
  }
}

export async function fetchPublishedActivities(): Promise<{
  activities: Activity[];
  fromFirestore: boolean;
}> {
  try {
    const q = query(
      collection(db, ACTIVITIES_COLLECTION),
      where('status', '==', 'published')
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const list = snapshot.docs.map((d) =>
        mapDocToActivity(d.id, d.data() as Record<string, unknown>)
      );
      list.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
      return { activities: list, fromFirestore: true };
    }

    // If empty, check if admin explicitly initialized & hid/removed all activities
    const seeded = await checkLibrarySeeded();
    if (seeded) {
      return { activities: [], fromFirestore: true };
    }

    // Initial public catalog before first admin Firestore sync
    return { activities: SEED_ACTIVITIES, fromFirestore: false };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, ACTIVITIES_COLLECTION);
  }
}

export async function fetchAllAdminActivities(
  isPrimaryAdmin: boolean,
  uid: string
): Promise<Activity[]> {
  try {
    if (isPrimaryAdmin) {
      const q = query(
        collection(db, ACTIVITIES_COLLECTION),
        orderBy('updatedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) =>
        mapDocToActivity(d.id, d.data() as Record<string, unknown>)
      );
    }

    // Non-primary authorized teachers fetch published + their own hidden items (zero-lookup list rule)
    const [pubSnap, ownSnap] = await Promise.all([
      getDocs(query(collection(db, ACTIVITIES_COLLECTION), where('status', '==', 'published'))),
      getDocs(query(collection(db, ACTIVITIES_COLLECTION), where('authorId', '==', uid))),
    ]);

    const merged = new Map<string, Activity>();
    pubSnap.docs.forEach((d) => {
      merged.set(d.id, mapDocToActivity(d.id, d.data() as Record<string, unknown>));
    });
    ownSnap.docs.forEach((d) => {
      merged.set(d.id, mapDocToActivity(d.id, d.data() as Record<string, unknown>));
    });

    return Array.from(merged.values()).sort((a, b) =>
      (b.updatedAt || '').localeCompare(a.updatedAt || '')
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, ACTIVITIES_COLLECTION);
  }
}

export async function fetchActivityById(id: string): Promise<Activity | null> {
  const safeId = id.trim();
  if (!/^[a-zA-Z0-9_-]+$/.test(safeId)) {
    return null;
  }

  try {
    const snap = await getDoc(doc(db, ACTIVITIES_COLLECTION, safeId));
    if (snap.exists()) {
      return mapDocToActivity(snap.id, snap.data() as Record<string, unknown>);
    }
  } catch (error) {
    // Check fallback seed only if not seeded yet
    const seedMatch = SEED_ACTIVITIES.find((item) => item.id === safeId);
    if (seedMatch) return seedMatch;
    handleFirestoreError(error, OperationType.GET, `${ACTIVITIES_COLLECTION}/${safeId}`);
  }

  const seedMatch = SEED_ACTIVITIES.find((item) => item.id === safeId);
  return seedMatch || null;
}

export async function createActivity(input: ActivityInput): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('Vui lòng đăng nhập tài khoản giáo viên.');

  const clean = sanitizeActivityInput(input);
  const newRef = doc(collection(db, ACTIVITIES_COLLECTION));
  const path = `${ACTIVITIES_COLLECTION}/${newRef.id}`;

  try {
    await setDoc(newRef, {
      ...clean,
      authorId: user.uid,
      authorName: (user.displayName || user.email || 'Giáo viên THCS').slice(0, 100),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return newRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateActivity(id: string, input: ActivityInput): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Vui lòng đăng nhập tài khoản giáo viên.');

  const clean = sanitizeActivityInput(input);
  const path = `${ACTIVITIES_COLLECTION}/${id}`;

  try {
    await updateDoc(doc(db, ACTIVITIES_COLLECTION, id), {
      ...clean,
      authorName: (user.displayName || user.email || 'Giáo viên THCS').slice(0, 100),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function toggleActivityStatus(
  id: string,
  nextStatus: ActivityStatus
): Promise<void> {
  const path = `${ACTIVITIES_COLLECTION}/${id}`;
  try {
    await updateDoc(doc(db, ACTIVITIES_COLLECTION, id), {
      status: nextStatus,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteActivity(id: string): Promise<void> {
  const path = `${ACTIVITIES_COLLECTION}/${id}`;
  try {
    await deleteDoc(doc(db, ACTIVITIES_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function seedActivitiesToFirestore(): Promise<number> {
  const user = auth.currentUser;
  if (!user) throw new Error('Vui lòng đăng nhập giáo viên để đồng bộ dữ liệu.');

  try {
    const batch = writeBatch(db);
    let count = 0;

    for (const item of SEED_ACTIVITIES) {
      const ref = doc(db, ACTIVITIES_COLLECTION, item.id);
      const existingSnap = await getDoc(ref);
      if (!existingSnap.exists()) {
        const clean = sanitizeActivityInput({
          title: item.title,
          slug: item.slug,
          group: item.group,
          expressions: item.expressions,
          durationMinutes: item.durationMinutes,
          scale: item.scale,
          materials: item.materials,
          noMaterialsNeeded: item.noMaterialsNeeded,
          shortDescription: item.shortDescription,
          goal: item.goal,
          steps: item.steps,
          transitionBackTip: item.transitionBackTip,
          teacherNotes: item.teacherNotes,
          suitableTiming: item.suitableTiming,
          gradeRange: item.gradeRange,
          status: item.status,
        });
        batch.set(ref, {
          ...clean,
          authorId: user.uid,
          authorName: (user.displayName || 'Ban biên tập THCS').slice(0, 100),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        count++;
      }
    }

    batch.set(doc(db, 'library_meta', 'config'), {
      seeded: true,
      totalSeededCount: SEED_ACTIVITIES.length,
      updatedBy: user.uid,
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
    return count;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${ACTIVITIES_COLLECTION} & ${LIBRARY_META_DOC}`);
  }
}
