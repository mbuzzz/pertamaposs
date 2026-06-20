import React, { useState, useEffect } from 'react';
import { useRecipes } from '../../hooks/useRecipes';
import { useOutlets } from '../../hooks/useOutlets';
import { useProducts } from '../../hooks/useProducts';
import { useIngredients } from '../../hooks/useIngredients';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabase';
import { useUIStore } from '../../stores/uiStore';
import { formatDate } from '../../utils/date';
import { Card, Button, Input, Select } from '../../components/common';
import { Search, Coffee, Plus, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import { BrewLog, Outlet, User, Recipe } from '../../types';

export const BrewLogPage: React.FC = () => {
  const { brewLogs, recipes, addBrewLog, deleteBrewLog, fetchBrewLogs } = useRecipes();
  const { outlets } = useOutlets();
  const { profile } = useAuth();
  const { products, updateProduct } = useProducts();
  const { ingredients, adjustStock } = useIngredients();
  const { showToast } = useUIStore();
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('profiles').select('*').then(({ data }) => {
      if (data) setUsers(data);
    });
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOutlet, setSelectedOutlet] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [recipeId, setRecipeId] = useState('');
  const [batches, setBatches] = useState('1');
  const [yieldAmount, setYieldAmount] = useState('');
  const [outletId, setOutletId] = useState('');
  const [createdBy, setCreatedBy] = useState('');

  const handleOpenAdd = () => {
    if (recipes.length === 0) {
      showToast('Buat resep produk terlebih dahulu!', 'error');
      return;
    }
    setEditingId(null);
    setRecipeId(recipes[0].id);
    setBatches('1');
    const firstRecipeYield = recipes[0].yieldPerBatch || 10;
    setYieldAmount(firstRecipeYield.toString());
    setOutletId(outlets[0]?.id || '');
    setCreatedBy(profile?.name || users[0]?.name || '');
    setShowForm(true);
  };

  const handleOpenEdit = (log: BrewLog) => {
    setEditingId(log.id);
    setRecipeId(log.recipeId);
    setBatches(log.batches.toString());
    setYieldAmount(log.yieldAmount.toString());
    setOutletId(log.outletId);
    setCreatedBy(log.createdBy);
    setShowForm(true);
  };

  const handleRecipeChange = (rId: string) => {
    setRecipeId(rId);
    const recipe = recipes.find((r) => r.id === rId);
    if (recipe) {
      const multiplier = parseFloat(batches) || 1;
      setYieldAmount(((recipe.yieldPerBatch || 10) * multiplier).toString());
    }
  };

  const handleBatchesChange = (bVal: string) => {
    setBatches(bVal);
    const recipe = recipes.find((r) => r.id === recipeId);
    if (recipe) {
      const multiplier = parseFloat(bVal) || 0;
      setYieldAmount(((recipe.yieldPerBatch || 10) * multiplier).toString());
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipeId || !batches || !yieldAmount || !outletId || !createdBy) {
      showToast('Semua field form wajib diisi!', 'error');
      return;
    }

    const recipe = recipes.find((r) => r.id === recipeId);
    if (!recipe) return;

    const prod = products.find((p) => p.id === recipe.productId);
    const prodName = prod ? prod.name : 'Produk';

    const bCount = parseFloat(batches) || 1;
    const yAmount = parseFloat(yieldAmount) || 10;

    if (editingId) {
      const existing = brewLogs.find((l) => l.id === editingId);
      if (!existing) return;

      // Adjust stocks: reverse old log yield first, then apply new
      const oldProd = products.find((p) => p.id === recipe.productId);
      if (oldProd) {
        updateProduct({ ...oldProd, stock: Math.max(0, oldProd.stock - existing.yieldAmount + yAmount) });
      }

      // Re-adjust ingredient stocks based on the difference
      recipe.ingredients.forEach((ri) => {
        const diffQty = (ri.quantity * bCount) - (ri.quantity * existing.batches);
        adjustStock(ri.ingredientId, -diffQty);
      });

      await supabase.from('brew_logs').update({
        recipe_id: recipeId,
        product_name: prodName,
        batches: bCount,
        yield_amount: yAmount,
        outlet_id: outletId,
        created_by: createdBy,
      }).eq('id', editingId);
      fetchBrewLogs();
      showToast('Laporan seduh berhasil diperbarui & stok disesuaikan!', 'success');
    } else {
      // Stock verification for new log
      let hasStock = true;
      const insufficientList: string[] = [];

      recipe.ingredients.forEach((ri) => {
        const ing = ingredients.find((i) => i.id === ri.ingredientId);
        const needed = ri.quantity * bCount;
        if (!ing || ing.stock < needed) {
          hasStock = false;
          insufficientList.push(ing?.name || 'Bahan');
        }
      });

      if (!hasStock) {
        showToast(`Stok bahan tidak cukup untuk penyeduhan: ${insufficientList.join(', ')}`, 'error');
        return;
      }

      // Deduct ingredients stock
      recipe.ingredients.forEach((ri) => {
        adjustStock(ri.ingredientId, -(ri.quantity * bCount));
      });

      // Increase product stock
      if (prod) {
        updateProduct({ ...prod, stock: prod.stock + yAmount });
      }

      addBrewLog({
        recipeId,
        productName: prodName,
        batches: bCount,
        yieldAmount: yAmount,
        date: new Date().toISOString(),
        createdBy,
        outletId,
      });
      showToast('Penyeduhan dicatat & stok produk terupdate!', 'success');
    }

    setShowForm(false);
  };

  const handleDelete = (log: BrewLog) => {
    if (window.confirm(`Hapus laporan seduh "${log.productName}"? Stok produk jadi akan dikurangi sebesar ${log.yieldAmount} cup/porsi.`)) {
      // Reverse product stock addition
      const recipe = recipes.find((r) => r.id === log.recipeId);
      if (recipe) {
        const prod = products.find((p) => p.id === recipe.productId);
        if (prod) {
          updateProduct({ ...prod, stock: Math.max(0, prod.stock - log.yieldAmount) });
        }
        // Refund ingredient stocks
        recipe.ingredients.forEach((ri) => {
          adjustStock(ri.ingredientId, (ri.quantity * log.batches));
        });
      }

      deleteBrewLog(log.id);
      showToast('Laporan seduh dihapus & stok dikembalikan!', 'success');
    }
  };

  const filtered = brewLogs.filter((log: BrewLog) => {
    const matchesSearch = log.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOutlet = selectedOutlet === 'All' || log.outletId === selectedOutlet;
    return matchesSearch && matchesOutlet;
  });

  const recipeOptions = recipes.map((r) => {
    const p = products.find((prod) => prod.id === r.productId);
    return { value: r.id, label: p ? p.name : 'Resep' };
  });

  const outletOptions = outlets.map((o) => ({
    value: o.id,
    label: o.name,
  }));

  const userOptions = users.map((u) => ({
    value: u.name,
    label: `${u.name} (${u.role})`,
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
            {editingId ? 'Edit Laporan Penyeduhan' : 'Catat Penyeduhan Baru (Manual)'}
          </h2>
        </div>

        <Card className="max-w-xl">
          <form onSubmit={handleSave} className="space-y-4">
            <Select
              label="Pilih Resep / Produk"
              id="recipeId"
              options={recipeOptions}
              value={recipeId}
              onChange={(e) => handleRecipeChange(e.target.value)}
              required
            />

            <Select
              label="Outlet Cabang"
              id="outletId"
              options={outletOptions}
              value={outletId}
              onChange={(e) => setOutletId(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Jumlah Takaran Seduh (Batch)"
                id="batches"
                type="number"
                value={batches}
                onChange={(e) => handleBatchesChange(e.target.value)}
                required
              />

              <Input
                label="Porsi Dihasilkan (Cup/Porsi)"
                id="yieldAmount"
                type="number"
                value={yieldAmount}
                onChange={(e) => setYieldAmount(e.target.value)}
                required
              />
            </div>

            <Select
              label="Kasir / Penanggung Jawab"
              id="createdBy"
              options={userOptions}
              value={createdBy}
              onChange={(e) => setCreatedBy(e.target.value)}
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
          <h2 className="text-xl font-bold text-gray-900">Laporan Penyeduhan (Brewing Logs)</h2>
          <p className="text-sm text-gray-500 mt-1">
            Melacak riwayat penyeduhan, jumlah porsi yang dihasilkan, dan pemakaian bahan baku
          </p>
        </div>
        <div className="flex space-x-2">
          <select
            value={selectedOutlet}
            onChange={(e) => setSelectedOutlet(e.target.value)}
            className="rounded-lg border border-gray-300 text-sm px-3 py-2.5 focus:outline-none bg-white font-semibold text-gray-700 shadow-sm"
          >
            <option value="All">Semua Outlet</option>
            {outlets.map((o: Outlet) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
          <Button onClick={handleOpenAdd} leftIcon={<Plus className="h-5 w-5" />}>
            Catat Seduh
          </Button>
        </div>
      </div>

      <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2">
        <Search className="h-5 w-5 text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Cari nama produk..."
          className="w-full text-sm focus:outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Card className="space-y-4">
        <h3 className="font-extrabold text-gray-900 text-sm border-b border-gray-100 pb-2 flex items-center">
          <Coffee className="h-4 w-4 mr-2 text-primary-500" />
          RIWAYAT PENYEDUHAN
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-gray-500 uppercase">Waktu</th>
                <th className="px-4 py-3 text-left font-bold text-gray-500 uppercase">Outlet</th>
                <th className="px-4 py-3 text-left font-bold text-gray-500 uppercase">Produk</th>
                <th className="px-4 py-3 text-center font-bold text-gray-500 uppercase">Takaran (Batch)</th>
                <th className="px-4 py-3 text-center font-bold text-gray-500 uppercase">Porsi Dihasilkan</th>
                <th className="px-4 py-3 text-left font-bold text-gray-500 uppercase">Kasir</th>
                <th className="px-4 py-3 text-center font-bold text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    Belum ada riwayat penyeduhan.
                  </td>
                </tr>
              ) : (
                filtered
                  .slice()
                  .reverse()
                  .map((log: BrewLog) => {
                    const outletName = outlets.find((o: Outlet) => o.id === log.outletId)?.name || log.outletId;
                    return (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                          {formatDate(log.date, 'dd MMM yyyy HH:mm:ss')}
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{outletName}</td>
                        <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                          {log.productName}
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-gray-900 whitespace-nowrap">
                          {log.batches} takar
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-primary-600 whitespace-nowrap">
                          +{log.yieldAmount} cup/porsi
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{log.createdBy}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <div className="flex justify-center space-x-1.5">
                            <button
                              onClick={() => handleOpenEdit(log)}
                              className="p-1 text-gray-500 hover:text-gray-900 rounded"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(log)}
                              className="p-1 text-red-500 hover:text-red-700 rounded"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
export default BrewLogPage;
