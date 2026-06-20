import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { LoginPage } from './pages/auth/LoginPage';
import { MainLayout } from './components/layout';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { POSPage } from './pages/pos/POSPage';
import { InventoryPage } from './pages/inventory/InventoryPage';
import { RecipePage } from './pages/masterdata/RecipePage';
import { IngredientPage } from './pages/masterdata/IngredientPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { UserPage } from './pages/masterdata/UserPage';
import { ProductPage } from './pages/masterdata/ProductPage';
import { OutletPage } from './pages/masterdata/OutletPage';
import { ExpensePage } from './pages/finance/ExpensePage';
import { PurchasePage } from './pages/finance/PurchasePage';
import { ShiftPage } from './pages/ShiftPage';
import { BrewLogPage } from './pages/reports/BrewLogPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { Toast } from './components/common/Toast';
import { Button } from './components/common';

const MenuPageMobile: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Master Data Menu</h2>
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={() => navigate('/recipes')}
          className="py-6 flex flex-col items-center justify-center font-bold text-sm h-auto"
        >
          Kelola Resep
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/users')}
          className="py-6 flex flex-col items-center justify-center font-bold text-sm h-auto"
        >
          Manajemen User
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/products')}
          className="py-6 flex flex-col items-center justify-center font-bold text-sm h-auto"
        >
          Manajemen Produk
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/ingredients')}
          className="py-6 flex flex-col items-center justify-center font-bold text-sm h-auto"
        >
          Kelola Bahan
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/outlets')}
          className="py-6 flex flex-col items-center justify-center font-bold text-sm h-auto"
        >
          Kelola Outlet
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/expenses')}
          className="py-6 flex flex-col items-center justify-center font-bold text-sm h-auto"
        >
          Pengeluaran Operasional
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/purchases')}
          className="py-6 flex flex-col items-center justify-center font-bold text-sm h-auto"
        >
          Belanja Bahan
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/shifts')}
          className="py-6 flex flex-col items-center justify-center font-bold text-sm h-auto"
        >
          Manajemen Shift
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/brew-logs')}
          className="py-6 flex flex-col items-center justify-center font-bold text-sm h-auto"
        >
          Laporan Seduh
        </Button>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Memuat...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/pos" element={<POSPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/recipes" element={<RecipePage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/users" element={<UserPage />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/ingredients" element={<IngredientPage />} />
        <Route path="/outlets" element={<OutletPage />} />
        <Route path="/expenses" element={<ExpensePage />} />
        <Route path="/purchases" element={<PurchasePage />} />
        <Route path="/shifts" element={<ShiftPage />} />
        <Route path="/brew-logs" element={<BrewLogPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/menu" element={<MenuPageMobile />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </MainLayout>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
        <Toast />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
