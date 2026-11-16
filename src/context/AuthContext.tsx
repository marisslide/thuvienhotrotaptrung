import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { checkIsTeacherAuthorized } from '../lib/teacherService';
import {
  getTeacherSession,
  logTeacherActivity,
  setTeacherSession,
} from '../lib/googleSyncService';
import { TeacherSession } from '../types/material';

interface AuthContextValue {
  user: User | null;
  teacherSession: TeacherSession | null;
  loading: boolean;
  isAuthorizedTeacher: boolean;
  isPrimaryAdmin: boolean;
  role: 'admin' | 'teacher' | null;
  authError: string | null;
  loginWithCredentials: (u: string, p: string) => boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshAuthRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [teacherSession, setTeacherSessionState] = useState<TeacherSession | null>(() =>
    getTeacherSession()
  );
  const [loading, setLoading] = useState(true);
  const [isAuthorizedTeacher, setIsAuthorizedTeacher] = useState(false);
  const [isPrimaryAdmin, setIsPrimaryAdmin] = useState(false);
  const [role, setRole] = useState<'admin' | 'teacher' | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const evaluateRole = useCallback(async (currentUser: User | null) => {
    // Ưu tiên session giáo viên mặc định (Dieuhien / 2026) nếu có
    const savedTeacher = getTeacherSession();
    if (savedTeacher) {
      setTeacherSessionState(savedTeacher);
      setIsAuthorizedTeacher(true);
      setIsPrimaryAdmin(true);
      setRole(savedTeacher.role);
      return;
    }

    if (!currentUser) {
      setIsAuthorizedTeacher(false);
      setIsPrimaryAdmin(false);
      setRole(null);
      return;
    }

    const res = await checkIsTeacherAuthorized(
      currentUser.uid,
      currentUser.email,
      currentUser.emailVerified
    );
    setIsAuthorizedTeacher(res.authorized);
    setIsPrimaryAdmin(res.isPrimaryAdmin);
    setRole(res.role);
  }, []);

  useEffect(() => {
    const saved = getTeacherSession();
    if (saved) {
      setTeacherSessionState(saved);
      setIsAuthorizedTeacher(true);
      setIsPrimaryAdmin(true);
      setRole(saved.role);
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      await evaluateRole(currentUser);
      setLoading(false);
    });
    return () => unsub();
  }, [evaluateRole]);

  const loginWithCredentials = useCallback(
    (u: string, p: string): boolean => {
      setAuthError(null);
      const cleanUser = u.trim().toLowerCase();
      const cleanPass = p.trim();

      if (cleanUser === 'dieuhien' && cleanPass === '2026') {
        const session: TeacherSession = {
          username: 'Dieuhien',
          displayName: 'Cô Diệu Hiền (Quản trị)',
          role: 'admin',
          loggedInAt: new Date().toISOString(),
        };
        setTeacherSession(session);
        setTeacherSessionState(session);
        setIsAuthorizedTeacher(true);
        setIsPrimaryAdmin(true);
        setRole('admin');
        logTeacherActivity('ĐĂNG NHẬP', 'Hệ thống Quản trị', 'Đăng nhập tài khoản Dieuhien');
        return true;
      }

      setAuthError('Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng thử lại.');
      return false;
    },
    []
  );

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      await evaluateRole(cred.user);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('popup-closed-by-user')) {
        setAuthError('Cửa sổ đăng nhập đã được đóng trước khi hoàn tất.');
      } else if (msg.includes('popup-blocked')) {
        setAuthError('Trình duyệt đang chặn cửa sổ bật lên. Vui lòng cho phép popup để đăng nhập Google.');
      } else {
        setAuthError('Không thể đăng nhập bằng Google lúc này. Vui lòng thử lại.');
      }
    }
  }, [evaluateRole]);

  const logout = useCallback(async () => {
    setAuthError(null);
    logTeacherActivity('ĐĂNG XUẤT', 'Hệ thống Quản trị');
    setTeacherSession(null);
    setTeacherSessionState(null);
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    setIsAuthorizedTeacher(false);
    setIsPrimaryAdmin(false);
    setRole(null);
  }, []);

  const refreshAuthRole = useCallback(async () => {
    await evaluateRole(auth.currentUser);
  }, [evaluateRole]);

  return (
    <AuthContext.Provider
      value={{
        user,
        teacherSession,
        loading,
        isAuthorizedTeacher,
        isPrimaryAdmin,
        role,
        authError,
        loginWithCredentials,
        signInWithGoogle,
        logout,
        refreshAuthRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
