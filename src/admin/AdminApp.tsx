import type { ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth';
import AdminLayout from './components/AdminLayout';
import LoginPage from './pages/LoginPage';
import OverviewPage from './pages/OverviewPage';

import LeadsPage from './pages/LeadPage';
import ProductsPage from './pages/ProductsPage';
import ProductFormPage from '../admin/pages/ProductFromPage';
import PostsPage from './pages/PostsPage';
import PostFormPage from './pages/PostFrom';

function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <BrowserRouter basename="admin">
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<RequireAuth><AdminLayout /></RequireAuth>}>
            <Route index element={<OverviewPage />} />
            <Route path="leads" element={<LeadsPage  />} />
                      <Route path="products" element={<ProductsPage />} />
<Route path="products/new" element={<ProductFormPage />} />
<Route path="products/edit" element={<ProductFormPage />} />
<Route path="posts" element={<PostsPage />} />
<Route path="posts/new" element={<PostFormPage />} />
<Route path="posts/edit" element={<PostFormPage />} />
                      </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}