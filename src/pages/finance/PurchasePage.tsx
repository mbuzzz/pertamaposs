import React, { useState } from 'react';
import { useFinance } from '../../hooks/useFinance';
import { useOutlets } from '../../hooks/useOutlets';
import { useIngredients } from '../../hooks/useIngredients';
import { useAuth } from '../../lib/AuthContext';
import { useUIStore } from '../../stores/uiStore';
import { Purchase } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import { formatDate } from '../../utils/date';
import { Button, Card, Input, Select } from '../../components/common';
import { Plus, Edit2, Trash2, Search, ShoppingBag, ArrowLeft } from 'lucide-react';

export const PurchasePage: React.FC = () => {
  const { purchases, addPurchase, updatePurchase, deletePurchase } = useFinance();
  const { outlets } = useOutlets();
  const { profile } = useAuth();
  const { ingredients } = useIngredients();
  const { showToast } = useUIStore();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [ingredientId, setIngredientId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [cost, setCost] = useState('');
  const [outletId, setOutletId] = useState('');
  const [supplier, setSupplier] = useState('');

  const handleOpenAdd = () => {
    setEditingId(null);
    setIngredientId(ingredients[0]?.id || '');
    setQuantity('');
    setCost('');
    setOutletId(outlets[0]?.id || '');
    setSupplier('');
    setShowForm(true);
  };

  const handleOpenEdit = (purchase: Purchase) => {
    setEditingId(purchase.id);
    setIngredientId(purchase.ingredientId);
    setQuantity(purchase.quantity.toString());
    setCost(purchase.cost.toString());
    setOutletId(purchase.outletId);
    setSupplier(purchase.supplier || '');
    setShowForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!ingredientId || !quantity || !cost || !outletId) {
      showToast('Bahan baku, jumlah qty, biaya, dan outlet wajib diisi!', 'error');
      return;
    }

    const qty = parseFloat(quantity);
    const cst = parseFloat(cost);

    if (isNaN(qty) || qty <= 0 || isNaN(cst) || cst <= 0) {
      showToast('Jumlah qty dan nominal biaya harus bernilai positif!', 'error');
      return;
    }

    const ing = ingredients.find((i) => i.id === ingredientId);
    if (!ing) return;

    if (editingId) {
      const existing = purchases.find((p) => p.id === editingId);
      if (!existing) return;
      const updated: Purchase = {
        ...existing,
        ingredientId,
        ingredientName: ing.name,
        quantity: qty,
        unit: ing.unit,
        cost: cst,
        outletId,
        supplier,
      };
      updatePurchase(updated);
      showToast('Catatan belanja diperbarui & stok disesuaikan!', 'success');
    } else {
      addPurchase({
        ingredientId,
        ingredientName: ing.name,
        quantity: qty,
        unit: ing.unit,
        cost: cst,
        outletId,
        supplier,
        date: new Date().toISOString(),
        createdBy: profile?.name || 'Sistem',
      });
      showToast('Belanja bahan baku dicatat & stok bertambah!', 'success');
    }

    setShowForm(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Hapus catatan belanja "${name}"? Stok bahan baku akan dikurangi sesuai dengan qty yang dihapus.`)) {
      deletePurchase(id);
      showToast('Catatan belanja dihapus & stok dikurangi!', 'success');
    }
  };

  const filtered = purchases.filter((p) =>
    p.ingredientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPurchaseSum = filtered.reduce((acc, curr) => acc + curr.cost, 0);

  const ingredientOptions = ingredients.map((i) => ({
    value: i.id,
    label: `${i.name} (${i.unit})`,
  }));

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
            {editingId ? 'Edit Catatan Belanja Bahan' : 'Catat Belanja Bahan Baru'}
          </h2>
        </div>

        <Card className="max-w-xl">
          <form onSubmit={handleSave} className="space-y-4">
            <Select
              label="Pilih Bahan Baku"
              id="ingredientId"
              options={ingredientOptions}
              value={ingredientId}
              onChange={(e) => setIngredientId(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Jumlah Qty"
                id="quantity"
                type="number"
                placeholder="Contoh: 1000"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />

              <Input
                label="Total Biaya Belanja (Rp)"
                id="cost"
                type="number"
                placeholder="Contoh: 150000"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                required
              />
            </div>

            <Select
              label="Outlet Penerima Stok"
              id="outletId"
              options={outletOptions}
              value={outletId}
              onChange={(e) => setOutletId(e.target.value)}
              required
            />

            <Input
              label="Nama Supplier (opsional)"
              id="supplier"
              type="text"
              placeholder="Contoh: Toko Sembako Jaya"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
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
          <h2 className="text-xl font-bold text-gray-900">Belanja Bahan Baku (Purchases)</h2>
          <p className="text-sm text-gray-500 mt-1">
            Mencatat pembelian bahan baku produk. Pembelian akan otomatis menambah stok persediaan.
          </p>
        </div>
        <Button onClick={handleOpenAdd} leftIcon={<Plus className="h-5 w-5" />}>
          Catat Belanja Bahan
        </Button>
      </div>

      {/* Summary Box */}
      <Card className="flex items-center space-x-4 max-w-sm">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
          <ShoppingBag className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase">Total Belanja Bahan</p>
          <h3 className="text-lg font-bold text-primary-500 mt-1">{formatCurrency(totalPurchaseSum)}</h3>
        </div>
      </Card>

      <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2">
        <Search className="h-5 w-5 text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Cari nama bahan baku..."
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
                    <h3 className="font-bold text-gray-900 text-base">{item.ingredientName}</h3>
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
                      onClick={() => handleDelete(item.id, item.ingredientName)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-100 my-3" />

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Jumlah/Qty:</span>
                    <span className="font-bold text-gray-800">{item.quantity} {item.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Biaya:</span>
                    <span className="font-bold text-primary-500">{formatCurrency(item.cost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Outlet Penerima:</span>
                    <span className="font-semibold text-gray-800">{outletName}</span>
                  </div>
                  {item.supplier && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Supplier:</span>
                      <span className="font-semibold text-gray-800">{item.supplier}</span>
                    </div>
                  )}
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
export default PurchasePage;
