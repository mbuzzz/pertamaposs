import React, { useState } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { useUIStore } from '../stores/uiStore';
import { Card, Button, Input, Select } from '../components/common';
import { PaymentMethod } from '../types';
import { Settings, ShieldAlert } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const settings = useSettingsStore();
  const { showToast } = useUIStore();

  const [storeName, setStoreName] = useState(settings.storeName);
  const [taxRate, setTaxRate] = useState(settings.taxRate.toString());
  const [printerWidth, setPrinterWidth] = useState<'58mm' | '80mm'>(settings.printerWidth);
  const [invoicePrefix, setInvoicePrefix] = useState(settings.invoicePrefix);
  const [activePayments, setActivePayments] = useState<PaymentMethod[]>(settings.activePaymentMethods);
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activePayments.length === 0) {
      showToast('Wajib mengaktifkan minimal 1 metode pembayaran!', 'error');
      return;
    }

    settings.updateSettings({
      storeName,
      taxRate: parseFloat(taxRate) || 0,
      printerWidth,
      invoicePrefix,
      activePaymentMethods: activePayments,
      address,
      phone,
    });

    showToast('Pengaturan sistem berhasil disimpan!', 'success');
  };

  const handleTogglePayment = (method: PaymentMethod) => {
    if (activePayments.includes(method)) {
      setActivePayments(activePayments.filter((m) => m !== method));
    } else {
      setActivePayments([...activePayments, method]);
    }
  };

  const handleResetApp = () => {
    if (
      window.confirm(
        'PERINGATAN: Tindakan ini akan menghapus semua riwayat transaksi, penyesuaian stok, serta mereset data pengguna dan bahan ke setelan default awal. Anda yakin ingin melanjutkan?'
      )
    ) {
      settings.resetAllStores();
    }
  };

  const printerOptions = [
    { value: '58mm', label: '58mm (Printer Kasir Standard)' },
    { value: '80mm', label: '80mm (Printer Kasir Lebar)' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Settings className="h-6 w-6 mr-2 text-primary-500" />
          Pengaturan Sistem
        </h2>
        <p className="text-sm text-gray-500 mt-1">Mengatur konfigurasi global, format invoice, cetak struk, dan pembayaran</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Form */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nama Toko / Perusahaan"
                  id="storeName"
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  required
                />
                <Input
                  label="Nomor Telepon Toko"
                  id="phone"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Alamat Perusahaan (Pusat)"
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Pajak (%)"
                  id="taxRate"
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  required
                />
                <Input
                  label="Prefix Invoice"
                  id="invoicePrefix"
                  type="text"
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value)}
                  required
                />
                <Select
                  label="Ukuran Kertas Printer"
                  id="printerWidth"
                  options={printerOptions}
                  value={printerWidth}
                  onChange={(e) => setPrinterWidth(e.target.value as '58mm' | '80mm')}
                  required
                />
              </div>

              {/* Payment Methods Config */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Metode Pembayaran yang Aktif di Kasir
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {([
                    { key: 'cash', label: '💵 Tunai' },
                    { key: 'qris', label: '📱 QRIS Manual' },
                    { key: 'transfer', label: '🔄 Transfer' },
                  ] as const).map((method) => {
                    const isChecked = activePayments.includes(method.key);
                    return (
                      <label
                        key={method.key}
                        className="flex items-center space-x-2 text-xs font-semibold text-gray-700 cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTogglePayment(method.key)}
                          className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span>{method.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <Button type="submit" className="w-full md:w-auto px-6">
                  Simpan Pengaturan
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Danger Zone Panel */}
        <div className="lg:col-span-1">
          <Card className="border-red-100 bg-red-50/50 p-6 space-y-4">
            <h3 className="font-extrabold text-red-800 text-sm flex items-center">
              <ShieldAlert className="h-5 w-5 mr-2" />
              ZONA BAHAYA
            </h3>
            <p className="text-xs text-red-700 leading-relaxed">
              Tindakan di bawah ini akan membersihkan seluruh setelan data yang tersimpan di memori browser Anda, termasuk data transaksi simulasi dan penyesuaian stok bahan.
            </p>
            <Button
              variant="danger"
              onClick={handleResetApp}
              className="w-full text-xs font-bold py-3 bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              Reset Database ke Setelan Awal
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default SettingsPage;
