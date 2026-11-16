import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { fetchPublishedActivities } from '../lib/activityService';
import { Activity } from '../types/activity';

interface LibraryContextValue {
  activities: Activity[];
  loading: boolean;
  error: string | null;
  fromFirestore: boolean;
  refreshLibrary: () => Promise<void>;
}

const LibraryContext = createContext<LibraryContextValue | undefined>(undefined);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromFirestore, setFromFirestore] = useState(false);

  const refreshLibrary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPublishedActivities();
      setActivities(res.activities);
      setFromFirestore(res.fromFirestore);
    } catch (err) {
      console.error(err);
      setError('Không thể tải danh sách hoạt động từ máy chủ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshLibrary();
  }, [refreshLibrary]);

  return (
    <LibraryContext.Provider
      value={{
        activities,
        loading,
        error,
        fromFirestore,
        refreshLibrary,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) {
    throw new Error('useLibrary phải được sử dụng bên trong LibraryProvider');
  }
  return ctx;
}
