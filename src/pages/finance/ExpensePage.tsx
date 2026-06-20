import React, { useState } from 'react';
import { useFinance } from '../../hooks/useFinance';
import { useOutlets } from '../../hooks/useOutlets';
import { useAuth } from '../../lib/AuthContext';
import { useUIStore } from '../../stores/uiStore';
import { Expense } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import { formatDate } from '../../utils/date';
import { Button, Card, Input, Select } from '../../components/common';
import { Plus, Edit2, Trash2, Search, DollarSign, ArrowLeft } from 'lucide-react';

export const ExpensePage: React.FC = () => {
  const { expenses, addExpense, updateExpense, deleteExpense } = useFinance();
  const { outlets } = useOutlets();
  const { profile } = useAuth();
  const { showToast } = useUIStore();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [outletId, setOutletId] = useState('');
  const [category, setCategory] = useState('Operasional');

  const handleOpenAdd = () => {
    setEditingId(null);
    setDescription('');
    setAmount('');
    setOutletId(outlets[0]?.id || '');
    setCategory('Operasional');
    setShowForm(true);
  };

  const handleOpenEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setDescription(expense.description);
    setAmount(expense.amount.toString());
    setOutletId(expense.outletId);
    setCategory(expense.category);
    setShowForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description || !amount || !outletId) {
      showToast('Deskripsi, jumlah nominal, dan outlet wajib diisi!', 'error');
      return;
    }

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      showToast('Nominal harus berupa angka valid di atas 0!', 'error');
      return;
    }

    if (editingId) {
      const existing = expenses.find((exp) => exp.id === editingId);
      if (!existing) return;
      const updated: Expense = {
        ...existing,
        description,
        amount: amt,
        outletId,
        category,
        date: existing.date,
        createdBy: existing.createdBy,
      };
      updateExpense(updated);
      showToast('Pengeluaran berhasil diperbarui!', 'success');
    } else {
      addExpense({
        description,
        amount: amt,
        outletId,
        category,
        date: new Date().toISOString(),
        createdBy: profile?.name || 'Sistem',
      });
      showToast('Pengeluaran operasional dicatat!', 'success');
    }

    setShowForm(false);
  };

  const handleDelete = (id: string, desc: string) => {
    if (window.confirm(`Hapus pengeluaran "${desc}"?`)) {
      deleteExpense(id);
      showToast('Catatan pengeluaran dihapus!', 'success');
    }
  };

  const filtered = expenses.filter((e) =>
    e.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalExpenseSum = filtered.reduce((acc, curr) => acc + curr.amount, 0);

  const categoryOptions = [
    { value: 'Operasional', label: 'Operasional' },
    { value: 'Sewa', label: 'Sewa Ruko/Gedung' },
    { value: 'Gaji', label: 'Gaji Karyawan' },
    { value: 'Lainnya', label: 'Lain-lain' },
  ];

  const outletOptions = outlets.map((o) => ({
    value: o.id,
    label: o.name,
  }));

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
            {editingId ? 'Edit Catatan Pengeluaran' : 'Catat Pengeluaran Baru'}
          </h2>
        </div>

        <Card className="max-w-xl">
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Deskripsi Biaya"
              id="description"
              type="text"
              placeholder="Contoh: Pembayaran Listrik Januari"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />

            <Input
              label="Nominal Biaya (Rp)"
              id="amount"
              type="number"
              placeholder="Contoh: 150000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />

            <Select
              label="Kategori Pengeluaran"
              id="category"
              options={categoryOptions}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />

            <Select
              label="Outlet Terkait"
              id="outletId"
              options={outletOptions}
              value={outletId}
              onChange={(e) => setOutletId(e.target.value)}
              required
            />

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
                Simpan Catatan
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
          <h2 className="text-xl font-bold text-gray-900">Pengeluaran Operasional</h2>
          <p className="text-sm text-gray-500 mt-1">
            Mencatat biaya listrik, gaji karyawan, sewa ruko, dan biaya tak terduga lainnya
          </p>
        </div>
        <Button onClick={handleOpenAdd} leftIcon={<Plus className="h-5 w-5" />}>
          Catat Pengeluaran
        </Button>
      </div>

      {/* Summary Box */}
      <Card className="flex items-center space-x-4 max-w-sm">
        <div className="p-3 bg-red-100 text-red-600 rounded-xl">
          <DollarSign className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase">Total Pengeluaran (Terfilter)</p>
          <h3 className="text-lg font-bold text-red-600 mt-1">{formatCurrency(totalExpenseSum)}</h3>
        </div>
      </Card>

      <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2">
        <Search className="h-5 w-5 text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Cari deskripsi pengeluaran..."
          className="w-full text-sm focus:outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => {
          const outletName = outlets.find((o) => o.id === item.outletId)?.name || item.outletId;
          return (
            <Card key={item.id} className="relative flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{item.description}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{formatDate(item.date, 'dd MMM yyyy HH:mm')}</p>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.description)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-100 my-3" />

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nominal:</span>
                    <span className="font-bold text-red-600">{formatCurrency(item.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Kategori:</span>
                    <span className="font-semibold text-gray-800">{item.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Outlet:</span>
                    <span className="font-semibold text-gray-800">{outletName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Dicatat oleh:</span>
                    <span className="text-gray-500 italic">{item.createdBy}</span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
export default ExpensePage;
