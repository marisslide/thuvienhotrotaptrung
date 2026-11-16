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
} from 'firebase/firestore';
import { TeacherAccessRequest, TeacherProfile } from '../types/activity';
import { auth, BOOTSTRAPPED_ADMIN_EMAIL, db, handleFirestoreError, OperationType } from './firebase';

function toIso(val: unknown): string | undefined {
  if (val instanceof Timestamp) return val.toDate().toISOString();
  return undefined;
}

export async function checkIsTeacherAuthorized(
  uid: string,
  email?: string | null,
  emailVerified?: boolean
): Promise<{ authorized: boolean; isPrimaryAdmin: boolean; role: 'admin' | 'teacher' | null }> {
  if (!emailVerified) {
    return { authorized: false, isPrimaryAdmin: false, role: null };
  }

  if (email && email.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()) {
    return { authorized: true, isPrimaryAdmin: true, role: 'admin' };
  }

  try {
    const snap = await getDoc(doc(db, 'teachers', uid));
    if (snap.exists()) {
      const role = snap.data()?.role === 'admin' ? 'admin' : 'teacher';
      return { authorized: true, isPrimaryAdmin: false, role };
    }
    return { authorized: false, isPrimaryAdmin: false, role: null };
  } catch {
    return { authorized: false, isPrimaryAdmin: false, role: null };
  }
}

export async function fetchMyTeacherRequest(uid: string): Promise<TeacherAccessRequest | null> {
  try {
    const snap = await getDoc(doc(db, 'teacher_requests', uid));
    if (!snap.exists()) return null;
    const d = snap.data();
    return {
      uid: String(d.uid),
      displayName: String(d.displayName || ''),
      schoolName: String(d.schoolName || ''),
      note: String(d.note || ''),
      status: d.status as 'pending' | 'approved' | 'rejected',
      createdAt: toIso(d.createdAt),
      updatedAt: toIso(d.updatedAt),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `teacher_requests/${uid}`);
  }
}

export async function submitTeacherAccessRequest(
  displayName: string,
  schoolName: string,
  note: string
): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Vui lòng đăng nhập trước.');

  const path = `teacher_requests/${user.uid}`;
  try {
    await setDoc(doc(db, 'teacher_requests', user.uid), {
      uid: user.uid,
      displayName: displayName.trim().slice(0, 100),
      schoolName: schoolName.trim().slice(0, 140),
      note: note.trim().slice(0, 300),
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function fetchAuthorizedTeachers(): Promise<TeacherProfile[]> {
  try {
    const snap = await getDocs(query(collection(db, 'teachers'), orderBy('createdAt', 'desc')));
    return snap.docs.map((docSnap) => {
      const d = docSnap.data();
      return {
        uid: String(d.uid),
        displayName: String(d.displayName || ''),
        role: d.role === 'admin' ? 'admin' : 'teacher',
        addedBy: String(d.addedBy || ''),
        createdAt: toIso(d.createdAt),
        updatedAt: toIso(d.updatedAt),
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'teachers');
  }
}

export async function fetchTeacherRequests(): Promise<TeacherAccessRequest[]> {
  try {
    const snap = await getDocs(
      query(collection(db, 'teacher_requests'), orderBy('createdAt', 'desc'))
    );
    return snap.docs.map((docSnap) => {
      const d = docSnap.data();
      return {
        uid: String(d.uid),
        displayName: String(d.displayName || ''),
        schoolName: String(d.schoolName || ''),
        note: String(d.note || ''),
        status: d.status as 'pending' | 'approved' | 'rejected',
        createdAt: toIso(d.createdAt),
        updatedAt: toIso(d.updatedAt),
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'teacher_requests');
  }
}

export async function addAuthorizedTeacher(
  uid: string,
  displayName: string,
  role: 'teacher' | 'admin' = 'teacher'
): Promise<void> {
  const admin = auth.currentUser;
  if (!admin) throw new Error('Chưa đăng nhập.');
  const safeUid = uid.trim();
  if (!/^[a-zA-Z0-9_-]+$/.test(safeUid)) {
    throw new Error('Mã UID không hợp lệ (chỉ gồm chữ, số, gạch dưới, gạch ngang).');
  }

  try {
    await setDoc(doc(db, 'teachers', safeUid), {
      uid: safeUid,
      displayName: displayName.trim().slice(0, 100) || 'Giáo viên THCS',
      role,
      addedBy: admin.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `teachers/${safeUid}`);
  }
}

export async function approveTeacherRequest(req: TeacherAccessRequest): Promise<void> {
  await addAuthorizedTeacher(req.uid, req.displayName, 'teacher');
  try {
    await updateDoc(doc(db, 'teacher_requests', req.uid), {
      status: 'approved',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `teacher_requests/${req.uid}`);
  }
}

export async function rejectTeacherRequest(uid: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'teacher_requests', uid), {
      status: 'rejected',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `teacher_requests/${uid}`);
  }
}

export async function removeAuthorizedTeacher(uid: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'teachers', uid));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `teachers/${uid}`);
  }
}
