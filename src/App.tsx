import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AuthProvider } from './context/AuthContext';
import { LibraryProvider } from './context/LibraryContext';
import { ActivitiesPage } from './pages/ActivitiesPage';
import { ActivityDetailPage } from './pages/ActivityDetailPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ExpressionsPage } from './pages/ExpressionsPage';
import { GroupsPage } from './pages/GroupsPage';
import { GuidePage } from './pages/GuidePage';
import { HomePage } from './pages/HomePage';
import { TeacherLoginPage } from './pages/TeacherLoginPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F6F9F8] p-6 text-center">
          <div className="max-w-md bg-white rounded-3xl border border-[#DCE6E3] p-8 space-y-4">
            <h1 className="text-xl font-bold text-[#263B3A]">Đã xảy ra sự cố hiển thị</h1>
            <p className="text-sm text-[#526867]">
              Vui lòng tải lại trang để tiếp tục sử dụng Thư viện Hoạt động Hỗ trợ Tái tập trung.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl bg-[#176B5B] text-white text-sm font-semibold"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <LibraryProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/nhan-dien" element={<ExpressionsPage />} />
                <Route path="/nhom-hoat-dong" element={<GroupsPage />} />
                <Route path="/hoat-dong" element={<ActivitiesPage />} />
                <Route path="/hoat-dong/:id" element={<ActivityDetailPage />} />
                <Route path="/huong-dan" element={<GuidePage />} />
                <Route path="/dang-nhap" element={<TeacherLoginPage />} />
                <Route path="/quan-tri" element={<AdminDashboardPage />} />
                <Route path="*" element={<HomePage />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </LibraryProvider>
      </AuthProvider>
    </AppErrorBoundary>
  );
}
