import React, { useState } from 'react';
import { useOutlets } from '../../hooks/useOutlets';
import { Outlet } from '../../types';
import { Button, Card, Input } from '../../components/common';
import { Plus, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';

export const OutletPage: React.FC = () => {
  const { outlets, addOutlet, updateOutlet, deleteOutlet } = useOutlets();
  const { showToast } = useUIStore();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [invoiceHeader, setInvoiceHeader] = useState('');
  const [invoiceFooter, setInvoiceFooter] = useState('');

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setAddress('');
    setPhone('');
    setIsActive(true);
    setInvoiceHeader('');
    setInvoiceFooter('');
    setShowForm(true);
  };

  const handleOpenEdit = (outlet: Outlet) => {
    setEditingId(outlet.id);
    setName(outlet.name);
    setAddress(outlet.address);
    setPhone(outlet.phone);
    setIsActive(outlet.isActive);
    setInvoiceHeader(outlet.invoiceHeader || '');
    setInvoiceFooter(outlet.invoiceFooter || '');
    setShowForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !address || !phone) {
      showToast('Semua field wajib diisi!', 'error');
      return;
    }

    if (editingId) {
      const existing = outlets.find((o) => o.id === editingId);
      if (!existing) return;
      const updated: Outlet = {
        ...existing,
        name,
        address,
        phone,
        isActive,
        invoiceHeader,
        invoiceFooter,
      };
      updateOutlet(updated);
      showToast('Outlet berhasil diperbarui!', 'success');
    } else {
      addOutlet({
        name,
        address,
        phone,
        isActive,
        invoiceHeader,
        invoiceFooter,
      });
      showToast('Outlet baru berhasil ditambahkan!', 'success');
    }

    setShowForm(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Hapus outlet "${name}"?`)) {
      deleteOutlet(id);
      showToast('Outlet berhasil dihapus!', 'success');
    }
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowForm(false)}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-bold text-gray-900">
            {editingId ? 'Edit Outlet' : 'Tambah Outlet Baru'}
          </h2>
        </div>

        <Card className="max-w-xl">
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Nama Outlet"
              id="outletName"
              type="text"
              placeholder="Contoh: Outlet Es Teh Kebon Jeruk"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Alamat Lengkap"
              id="outletAddress"
              type="text"
              placeholder="Contoh: Jl. Kebon Jeruk Raya No. 45"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />

            <Input
              label="Nomor Telepon"
              id="outletPhone"
              type="text"
              placeholder="Contoh: 08123456789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />

            <div>
              <label htmlFor="invoiceHeader" className="block text-sm font-medium text-gray-700 mb-1">
                Header Struk/Invoice
              </label>
              <textarea
                id="invoiceHeader"
                placeholder="Contoh:&#10;ES TEH PERTAMA CABANG KEBON JERUK&#10;Segar & Nikmat!"
                rows={3}
                value={invoiceHeader}
                onChange={(e) => setInvoiceHeader(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 text-base px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label htmlFor="invoiceFooter" className="block text-sm font-medium text-gray-700 mb-1">
                Footer Struk/Invoice
              </label>
              <textarea
                id="invoiceFooter"
                placeholder="Contoh:&#10;Terima kasih telah berbelanja!&#10;Follow IG: @esteh.pertama"
                rows={3}
                value={invoiceFooter}
                onChange={(e) => setInvoiceFooter(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 text-base px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="outletActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="outletActive" className="text-sm font-semibold text-gray-700">
                Outlet Aktif
              </label>
            </div>

            <div className="pt-4 border-t border-gray-100 flex space-x-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1"
              >
                Batal
              </Button>
              <Button type="submit" className="flex-1">
                Simpan Outlet
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Manajemen Outlet</h2>
          <p className="text-sm text-gray-500 mt-1">Mengelola daftar outlet waralaba PertamaGroup</p>
        </div>
        <Button onClick={handleOpenAdd} leftIcon={<Plus className="h-5 w-5" />}>
          Tambah Outlet
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {outlets.map((o) => (
          <Card key={o.id} className="relative flex flex-col justify-between p-6">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg">{o.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">Status: {o.isActive ? '✓ Aktif' : '✗ Nonaktif'}</p>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleOpenEdit(o)}
                    className="p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(o.id, o.name)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-100 my-4" />

              <div className="space-y-2 text-sm text-gray-700">
                <p>
                  <strong className="text-gray-500">Alamat:</strong> {o.address}
                </p>
                <p>
                  <strong className="text-gray-500">Telepon:</strong> {o.phone}
                </p>
                {o.invoiceHeader && (
                  <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                    <strong className="text-gray-500 block mb-1">Header Invoice:</strong>
                    <span className="whitespace-pre-line">{o.invoiceHeader}</span>
                  </div>
                )}
                {o.invoiceFooter && (
                  <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                    <strong className="text-gray-500 block mb-1">Footer Invoice:</strong>
                    <span className="whitespace-pre-line">{o.invoiceFooter}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
export default OutletPage;
