import React from 'react';
import { Home, ShoppingCart, Package, BarChart3, Menu } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/pos', label: 'POS', icon: ShoppingCart },
    { path: '/inventory', label: 'Stok', icon: Package },
    { path: '/reports', label: 'Laporan', icon: BarChart3 },
    { path: '/menu', label: 'Menu', icon: Menu },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-tab-bar z-40 flex items-center justify-around pb-safe-bottom tablet:hidden">
      {navItems.map((item) => {
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
              'flex flex-col items-center justify-center flex-1 py-1 text-xs font-medium transition-colors duration-150',
              isActive ? 'text-primary-500' : 'text-gray-500 hover:text-gray-900'
            )}
          >
            <Icon className="h-5 w-5 mb-0.5" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
export default BottomNav;
