import React from 'react';
import { Home, ShoppingCart, Package, BarChart3, Settings, Users, LogOut, Coffee, TrendingUp, ShoppingBag, Clock } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { useOutlets } from '../../hooks/useOutlets';
import { useUIStore } from '../../stores/uiStore';
import { hasPermission } from '../../utils/rbac';
import { clsx } from 'clsx';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { outlets } = useOutlets();
  const { selectedOutletId } = useUIStore();
  const outlet = outlets.find((o) => o.id === selectedOutletId);

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      signOut();
    }
  };

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: Home, permission: null },
    { path: '/pos', label: 'Point of Sale', icon: ShoppingCart, permission: 'pos.view' },
    { path: '/inventory', label: 'Inventory', icon: Package, permission: 'inventory.view' },
    { path: '/products', label: 'Manajemen Produk', icon: Package, permission: 'masterdata.view' },
    { path: '/recipes', label: 'Kelola Resep', icon: Coffee, permission: 'recipe.view' },
    { path: '/outlets', label: 'Kelola Outlet', icon: Home, permission: 'masterdata.view' },
    { path: '/expenses', label: 'Pengeluaran', icon: TrendingUp, permission: 'finance.view' },
    { path: '/purchases', label: 'Belanja Bahan', icon: ShoppingBag, permission: 'finance.view' },
    { path: '/shifts', label: 'Manajemen Shift', icon: Clock, permission: 'reports.view' },
    { path: '/brew-logs', label: 'Laporan Seduh', icon: Coffee, permission: 'reports.view' },
    { path: '/reports', label: 'Laporan', icon: BarChart3, permission: 'reports.view' },
    { path: '/users', label: 'Manajemen User', icon: Users, permission: 'users.manage' },
    { path: '/settings', label: 'Pengaturan', icon: Settings, permission: 'settings.manage' },
  ];

  return (
    <aside className="hidden tablet:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-gray-200 flex items-center space-x-3">
        <img src="/logoicon.png" alt="Logo" className="h-10 w-10 rounded-xl object-contain shadow-sm" />
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-black text-gray-900 tracking-tight leading-none mb-1">
            Pertama<span className="text-primary-500">Group</span>
          </h2>
          <p className="text-xs text-gray-500 truncate">
            {profile?.role === 'admin' ? 'Global POS Admin' : (outlet?.name || 'POS System')}
          </p>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          if (item.permission && !hasPermission(profile, item.permission as any)) {
            return null;
          }

          const Icon = item.icon;
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={clsx(
                'flex items-center w-full px-4 py-3 rounded-lg text-sm font-semibold transition-colors duration-150',
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className="h-5 w-5 mr-3" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User Footer */}
      {profile && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="truncate mr-2">
              <p className="text-sm font-semibold text-gray-800 truncate">{profile.name}</p>
              <p className="text-xs text-gray-500 capitalize truncate">{profile.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors duration-150"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
export default Sidebar;
