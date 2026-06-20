import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PaymentMethod } from '../types';

interface SettingsState {
  storeName: string;
  taxRate: number;
  currencyCode: string;
  printerWidth: '58mm' | '80mm';
  invoicePrefix: string;
  activePaymentMethods: PaymentMethod[];
  address: string;
  phone: string;
  updateSettings: (settings: Partial<SettingsState>) => void;
  resetAllStores: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      storeName: 'PertamaGroup POS',
      taxRate: 0,
      currencyCode: 'IDR',
      printerWidth: '58mm',
      invoicePrefix: 'TRX',
      activePaymentMethods: ['cash', 'qris', 'transfer'],
      address: 'Jl. Jenderal Sudirman No. 123, Jakarta',
      phone: '021-12345678',

      updateSettings: (newSettings) => {
        set((state) => ({ ...state, ...newSettings }));
      },

      resetAllStores: () => {
        localStorage.clear();
        window.location.reload();
      },
    }),
    {
      name: 'pos-settings-storage',
    }
  )
);
