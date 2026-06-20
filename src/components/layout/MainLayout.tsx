import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ShiftBar } from './ShiftBar';
import { BottomNav } from './BottomNav';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar - desktop only */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <Header />

        {/* Page Body */}
        <main className="flex-1 p-4 pb-[80px] tablet:pb-4 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Bottom Navigation - mobile only */}
        <BottomNav />
      </div>
    </div>
  );
};
export default MainLayout;
