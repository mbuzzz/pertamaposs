import React from 'react';
import { useAuth } from '../../lib/AuthContext';
import { useOutlets } from '../../hooks/useOutlets';
import { useUIStore } from '../../stores/uiStore';
import { LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const { profile, signOut } = useAuth();
  const { outlets } = useOutlets();
  const { selectedOutletId } = useUIStore();
  const outlet = outlets.find((o) => o.id === selectedOutletId);

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      signOut();
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        <img src="/logoicon.png" alt="Logo" className="h-8 w-8 rounded-lg object-contain tablet:hidden" />
        <h1 className="text-xl font-bold text-gray-900 tablet:text-2xl">
          {profile?.role === 'admin' ? 'PertamaGroup POS' : (outlet?.name || 'PertamaGroup POS')}
        </h1>
      </div>

      {profile && (
        <div className="flex items-center space-x-4">
          <div className="text-right hidden tablet:block">
            <p className="text-sm font-semibold text-gray-800">{profile.name}</p>
            <p className="text-xs text-gray-500 capitalize">{profile.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150 tablet:hidden"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      )}
    </header>
  );
};
export default Header;
