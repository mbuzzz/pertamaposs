import React, { useState } from 'react';
import { useIngredients } from '../../hooks/useIngredients';
import { Ingredient } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import { Button, Card, Input } from '../../components/common';
import { Plus, Edit2, Trash2, Search, ArrowLeft } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';

export const IngredientPage: React.FC = () => {
  const { ingredients, addIngredient, updateIngredient, deleteIngredient } = useIngredients();
  const { showToast } = useUIStore();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('gr');
  const [costPerUnit, setCostPerUnit] = useState('');
  const [stock, setStock] = useState('');
  const [minStock, setMinStock] = useState('');
  const [supplier, setSupplier] = useState('');

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setUnit('gr');
    setCostPerUnit('');
    setStock('');
    setMinStock('');
    setSupplier('');
    setShowForm(true);
  };

  const handleOpenEdit = (ingredient: Ingredient) => {
    setEditingId(ingredient.id);
    setName(ingredient.name);
    setUnit(ingredient.unit);
    setCostPerUnit(ingredient.costPerUnit.toString());
    setStock(ingredient.stock.toString());
    setMinStock(ingredient.minStock.toString());
    setSupplier(ingredient.supplier || '');
    setShowForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !costPerUnit || !stock || !minStock) {
      showToast('Semua field wajib diisi!', 'error');
      return;
    }

    const cost = parseFloat(costPerUnit);
    const initialStock = parseFloat(stock);
    const minVal = parseFloat(minStock);

    if (editingId) {
      const existing = ingredients.find((i) => i.id === editingId);
      if (!existing) return;
      const updated: Ingredient = {
        ...existing,
        name,
        unit,
        costPerUnit: cost,
        stock: initialStock,
        minStock: minVal,
        supplier,
        updatedAt: new Date().toISOString(),
      };
      updateIngredient(updated);
      showToast('Bahan berhasil diperbarui!', 'success');
    } else {
      addIngredient({
        name,
        unit,
        costPerUnit: cost,
        stock: initialStock,
        minStock: minVal,
        supplier,
      });
      showToast('Bahan baru ditambahkan!', 'success');
    }

    setShowForm(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Hapus bahan "${name}"? Tindakan ini tidak dapat dibatalkan.`)) {
      deleteIngredient(id);
      showToast('Bahan berhasil dihapus!', 'success');
    }
  };

  const filtered = ingredients.filter((i) =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            {editingId ? 'Edit Bahan Baku' : 'Tambah Bahan Baku Baru'}
          </h2>
        </div>

        <Card className="max-w-xl">
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Nama Bahan"
              id="ingredientName"
              type="text"
              placeholder="Contoh: Susu, Gula Cair, Cup"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Satuan Unit"
                id="unit"
                type="text"
                placeholder="Contoh: gr, ml, pcs"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                required
              />

              <Input
                label="HPP per Unit (Rp)"
                id="costPerUnit"
                type="number"
                placeholder="Contoh: 100"
                value={costPerUnit}
                onChange={(e) => setCostPerUnit(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Stok Awal / Saat Ini"
                id="stock"
                type="number"
                placeholder="Contoh: 1000"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />

              <Input
                label="Min Stok (Batas Alert)"
                id="minStock"
                type="number"
                placeholder="Contoh: 100"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                required
              />
            </div>

            <Input
              label="Supplier (opsional)"
              id="supplier"
              type="text"
              placeholder="Nama Supplier"
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
                Simpan Bahan
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
          <h2 className="text-xl font-bold text-gray-900">Bahan-Bahan (Ingredients)</h2>
          <p className="text-sm text-gray-500 mt-1">Mengelola persediaan bahan baku dan cost per unit</p>
        </div>
        <Button onClick={handleOpenAdd} leftIcon={<Plus className="h-5 w-5" />}>
          Tambah Bahan
        </Button>
      </div>

      <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2">
        <Search className="h-5 w-5 text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Cari bahan..."
          className="w-full text-sm focus:outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <Card key={item.id} className="relative">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-900 text-base">{item.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Satuan: {item.unit}</p>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id, item.name)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="border-t border-gray-100 my-3" />

            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div>
                <p className="font-semibold">Harga HPP</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">
                  {formatCurrency(item.costPerUnit)}/{item.unit}
                </p>
              </div>
              <div>
                <p className="font-semibold">Stok Saat Ini</p>
                <p
                  className={`text-sm font-bold mt-0.5 ${
                    item.stock <= item.minStock ? 'text-red-500 font-extrabold' : 'text-gray-900'
                  }`}
                >
                  {item.stock} {item.unit}
                </p>
              </div>
            </div>

            {item.supplier && (
              <div className="mt-3 pt-2 border-t border-gray-50 text-[10px] text-gray-400">
                Supplier: {item.supplier}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
export default IngredientPage;
