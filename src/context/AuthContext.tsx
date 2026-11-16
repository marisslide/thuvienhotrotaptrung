import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { checkIsTeacherAuthorized } from '../lib/teacherService';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthorizedTeacher: boolean;
  isPrimaryAdmin: boolean;
  role: 'admin' | 'teacher' | null;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshAuthRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorizedTeacher, setIsAuthorizedTeacher] = useState(false);
  const [isPrimaryAdmin, setIsPrimaryAdmin] = useState(false);
  const [role, setRole] = useState<'admin' | 'teacher' | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const evaluateRole = useCallback(async (currentUser: User | null) => {
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
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      await evaluateRole(currentUser);
      setLoading(false);
    });
    return () => unsub();
  }, [evaluateRole]);

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
    await signOut(auth);
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
        loading,
        isAuthorizedTeacher,
        isPrimaryAdmin,
        role,
        authError,
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
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return ctx;
}
