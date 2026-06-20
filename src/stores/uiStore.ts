import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Transaction } from '../types';

interface UIState {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  toast: {
    message: string;
    type: 'success' | 'error' | 'info';
    isOpen: boolean;
  };
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
  selectedOutletId: string;
  setSelectedOutletId: (id: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      activeTab: 'dashboard',
      setActiveTab: (tab) => set({ activeTab: tab }),
      toast: {
        message: '',
        type: 'success',
        isOpen: false,
      },
      showToast: (message, type = 'success') => {
        set({
          toast: {
            message,
            type,
            isOpen: true,
          },
        });
        setTimeout(() => {
          set((state) => ({
            toast: { ...state.toast, isOpen: false },
          }));
        }, 3000);
      },
      hideToast: () =>
        set((state) => ({
          toast: { ...state.toast, isOpen: false },
        })),
      selectedOutletId: '',
      setSelectedOutletId: (id) => set({ selectedOutletId: id }),
    }),
    {
      name: 'pos-ui-storage',
      partialize: (state) => ({ selectedOutletId: state.selectedOutletId }),
    }
  )
);
