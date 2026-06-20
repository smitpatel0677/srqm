import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { initStore, settingsStore, ownerStore, adminStore } from '@/store';
import { useTheme } from '@/hooks/useTheme';
import MaintenancePage from '@/components/common/MaintenancePage';

// Public pages
import HomePage from '@/pages/public/HomePage';
import RestaurantsPage from '@/pages/public/RestaurantsPage';
import RestaurantProfilePage from '@/pages/public/RestaurantProfilePage';
import MenuPage from '@/pages/public/MenuPage';
import CartPage from '@/pages/public/CartPage';
import OrderTrackingPage from '@/pages/public/OrderTrackingPage';
import PrivacyPolicyPage from '@/pages/public/PrivacyPolicyPage';
import CookiePolicyPage from '@/pages/public/CookiePolicyPage';

// Owner pages
import OwnerLoginPage from '@/pages/owner/OwnerLoginPage';
import VerifyPhonePage from '@/pages/owner/VerifyPhonePage';
import OwnerDashboard from '@/pages/owner/OwnerDashboard';
import OwnerRestaurantsPage from '@/pages/owner/OwnerRestaurantsPage';
import RestaurantFormPage from '@/pages/owner/RestaurantFormPage';
import MenuManagementPage from '@/pages/owner/MenuManagementPage';
import OrdersPage from '@/pages/owner/OrdersPage';
import QRPage from '@/pages/owner/QRPage';
import OwnerProfilePage from '@/pages/owner/OwnerProfilePage';
import OwnerLayout from '@/components/layouts/OwnerLayout';

// Admin pages
import AdminLoginPage from '@/pages/admin/AdminLoginPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminRestaurantsPage from '@/pages/admin/AdminRestaurantsPage';
import AdminOwnersPage from '@/pages/admin/AdminOwnersPage';
import AdminReviewsPage from '@/pages/admin/AdminReviewsPage';
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage';
import AdminLayout from '@/components/layouts/AdminLayout';

// Owner guard
function RequireOwner({ children }: { children: React.ReactNode }) {
  const owner = ownerStore.getCurrent();
  if (!owner) return <Navigate to="/owner/login" replace />;
  return <>{children}</>;
}

// Admin guard
function RequireAdmin({ children }: { children: React.ReactNode }) {
  const isAdmin = adminStore.getSession();
  if (!isAdmin) return <Navigate to="/admin1" replace />;
  return <>{children}</>;
}

// App hidden at /admin
function AdminNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-muted-foreground mt-2">Page not found</p>
      </div>
    </div>
  );
}

function AppInner() {
  useTheme(); // Apply theme on mount
  const settings = settingsStore.get();

  // Show maintenance page to non-admin visitors
  if (settings.maintenanceMode && !adminStore.getSession()) {
    const path = window.location.pathname;
    if (!path.startsWith('/admin1')) {
      return <MaintenancePage />;
    }
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/restaurants" element={<RestaurantsPage />} />
      <Route path="/r/:slug" element={<RestaurantProfilePage />} />
      <Route path="/m/:slug" element={<MenuPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/order/:orderId" element={<OrderTrackingPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/cookie-policy" element={<CookiePolicyPage />} />

      {/* Owner auth */}
      <Route path="/owner/login" element={<OwnerLoginPage />} />
      <Route path="/owner/verify-phone" element={<VerifyPhonePage />} />

      {/* Owner panel */}
      <Route
        path="/owner"
        element={<RequireOwner><OwnerLayout /></RequireOwner>}
      >
        <Route index element={<Navigate to="/owner/dashboard" replace />} />
        <Route path="dashboard" element={<OwnerDashboard />} />
        <Route path="restaurants" element={<OwnerRestaurantsPage />} />
        <Route path="restaurants/create" element={<RestaurantFormPage mode="create" />} />
        <Route path="restaurants/:id/edit" element={<RestaurantFormPage mode="edit" />} />
        <Route path="restaurants/:id/menu" element={<MenuManagementPage />} />
        <Route path="restaurants/:id/orders" element={<OrdersPage />} />
        <Route path="restaurants/:id/qr" element={<QRPage />} />
        <Route path="profile" element={<OwnerProfilePage />} />
      </Route>

      {/* Admin – /admin 404 */}
      <Route path="/admin" element={<AdminNotFound />} />

      {/* Admin login */}
      <Route path="/admin1" element={<AdminLoginPage />} />

      {/* Admin panel */}
      <Route
        path="/admin1"
        element={<RequireAdmin><AdminLayout /></RequireAdmin>}
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="restaurants" element={<AdminRestaurantsPage />} />
        <Route path="owners" element={<AdminOwnersPage />} />
        <Route path="reviews" element={<AdminReviewsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  useEffect(() => { initStore(); }, []);

  return (
    <Router>
      <AppInner />
      <Toaster richColors position="top-right" />
    </Router>
  );
}
