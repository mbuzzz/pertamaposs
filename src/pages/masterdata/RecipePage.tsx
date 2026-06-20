import React, { useState } from 'react';
import { useRecipes } from '../../hooks/useRecipes';
import { useIngredients } from '../../hooks/useIngredients';
import { useProducts } from '../../hooks/useProducts';
import { useUIStore } from '../../stores/uiStore';
import { useAuth } from '../../lib/AuthContext';
import { Recipe, RecipeIngredient } from '../../types';
import { formatCurrency, calculateMarginPercentage, calculateSuggestedPrice } from '../../utils/calculations';
import { Card, Button, Select, Input, Badge } from '../../components/common';
import { Plus, Edit2, Trash2, Search, Coffee, ArrowLeft } from 'lucide-react';

export const RecipePage: React.FC = () => {
  const { recipes, addRecipe, updateRecipe, deleteRecipe, addBrewLog } = useRecipes();
  const { ingredients, adjustStock } = useIngredients();
  const { products, updateProduct } = useProducts();
  const { showToast } = useUIStore();
  const { profile } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [productId, setProductId] = useState('');
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([]);
  const [yieldPerBatch, setYieldPerBatch] = useState('10');

  // Add Ingredient to Recipe Form state
  const [selectedIngId, setSelectedIngId] = useState('');
  const [selectedQty, setSelectedQty] = useState('');

  // Brewing (Penyeduhan) Form state
  const [showBrewForm, setShowBrewForm] = useState(false);
  const [brewRecipeId, setBrewRecipeId] = useState('');
  const [brewBatchSize, setBrewBatchSize] = useState('1'); // number of batches to brew

  const handleOpenAdd = () => {
    const usedProductIds = recipes.map((r) => r.productId);
    const availableProducts = products.filter((p) => !usedProductIds.includes(p.id));

    if (availableProducts.length === 0) {
      showToast('Semua produk sudah memiliki resep!', 'error');
      return;
    }

    setEditingId(null);
    setProductId(availableProducts[0]?.id || '');
    setRecipeIngredients([]);
    setYieldPerBatch('10');
    setSelectedIngId(ingredients[0]?.id || '');
    setSelectedQty('');
    setShowForm(true);
  };

  const handleOpenEdit = (recipe: Recipe) => {
    setEditingId(recipe.id);
    setProductId(recipe.productId);
    setRecipeIngredients([...recipe.ingredients]);
    setYieldPerBatch(recipe.yieldPerBatch ? recipe.yieldPerBatch.toString() : '10');
    setSelectedIngId(ingredients[0]?.id || '');
    setSelectedQty('');
    setShowForm(true);
  };

  const handleAddIngredientRow = () => {
    if (!selectedIngId || !selectedQty) {
      showToast('Pilih bahan dan jumlah!', 'error');
      return;
    }

    const ing = ingredients.find((i) => i.id === selectedIngId);
    if (!ing) return;

    const qty = parseFloat(selectedQty);
    const cost = qty * ing.costPerUnit;

    const existingIndex = recipeIngredients.findIndex((ri) => ri.ingredientId === selectedIngId);
    if (existingIndex > -1) {
      const updated = [...recipeIngredients];
      updated[existingIndex].quantity += qty;
      updated[existingIndex].cost += cost;
      setRecipeIngredients(updated);
    } else {
      setRecipeIngredients([
        ...recipeIngredients,
        { ingredientId: selectedIngId, quantity: qty, cost },
      ]);
    }

    setSelectedQty('');
  };

  const handleRemoveIngredientRow = (index: number) => {
    setRecipeIngredients(recipeIngredients.filter((_, i) => i !== index));
  };

  const calculateTotalCOGS = (): number => {
    return recipeIngredients.reduce((total, ri) => total + ri.cost, 0);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!productId || recipeIngredients.length === 0) {
      showToast('Wajib memilih produk dan menambahkan minimal 1 bahan!', 'error');
      return;
    }

    const totalCOGS = calculateTotalCOGS();

    if (editingId) {
      const existing = recipes.find((r) => r.id === editingId);
      if (!existing) return;
      const updated: Recipe = {
        ...existing,
        productId,
        ingredients: recipeIngredients,
        totalCOGS,
        yieldPerBatch: parseInt(yieldPerBatch) || 10,
        updatedAt: new Date().toISOString(),
      };
      updateRecipe(updated);

      const prod = products.find((p) => p.id === productId);
      if (prod) {
        updateProduct({ ...prod, recipeId: updated.id });
      }

      showToast('Resep berhasil diperbarui!', 'success');
    } else {
      addRecipe({
        productId,
        ingredients: recipeIngredients,
        totalCOGS,
        yieldPerBatch: parseInt(yieldPerBatch) || 10,
      });

      showToast('Resep baru berhasil dibuat!', 'success');
    }

    setShowForm(false);
  };

  const handleDelete = (id: string, prodName: string) => {
    if (window.confirm(`Hapus resep untuk "${prodName}"?`)) {
      deleteRecipe(id);

      const prod = products.find((p) => p.recipeId === id);
      if (prod) {
        updateProduct({ ...prod, recipeId: undefined });
      }

      showToast('Resep berhasil dihapus!', 'success');
    }
  };

  const handleApplySuggestedPrice = (suggested: number) => {
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      const rounded = Math.ceil(suggested / 500) * 500;
      updateProduct({ ...prod, sellingPrice: rounded });
      showToast(`Harga jual produk diperbarui menjadi ${formatCurrency(rounded)}!`, 'success');
    }
  };

  // Process a Brew (Penyeduhan) action
  const handleBrew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brewRecipeId || !brewBatchSize) return;

    const recipe = recipes.find((r) => r.id === brewRecipeId);
    if (!recipe) return;

    const batches = parseFloat(brewBatchSize);
    if (isNaN(batches) || batches <= 0) {
      showToast('Jumlah takaran penyeduhan harus valid!', 'error');
      return;
    }

    // Verify stock availability
    let hasStock = true;
    const insufficientList: string[] = [];

    recipe.ingredients.forEach((ri) => {
      const ing = ingredients.find((i) => i.id === ri.ingredientId);
      const needed = ri.quantity * batches;
      if (!ing || ing.stock < needed) {
        hasStock = false;
        insufficientList.push(ing?.name || 'Bahan tidak dikenal');
      }
    });

    if (!hasStock) {
      showToast(`Bahan baku tidak mencukupi untuk penyeduhan ini: ${insufficientList.join(', ')}`, 'error');
      return;
    }

    // Deduct stock of ingredients
    recipe.ingredients.forEach((ri) => {
      adjustStock(ri.ingredientId, -(ri.quantity * batches));
    });

    // Auto-increase product stock
    // A single batch of recipe yields yieldPerBatch units
    const yieldAmount = recipe.yieldPerBatch || 10;
    const totalYield = yieldAmount * batches;
    const prod = products.find((p) => p.id === recipe.productId);
    if (prod) {
      updateProduct({ ...prod, stock: prod.stock + totalYield });
    }

    // Add Brew Log
    addBrewLog({
      recipeId: recipe.id,
      productName: prod ? prod.name : 'Produk',
      batches,
      yieldAmount: totalYield,
      date: new Date().toISOString(),
      createdBy: profile?.name || 'Kasir',
      outletId: useUIStore.getState().selectedOutletId || 'outlet-1',
    });

    showToast(`Penyeduhan teh sebanyak ${batches} takar berhasil! Menghasilkan ${totalYield} porsi es teh & stok bahan baku telah dikurangi.`, 'success');
    setShowBrewForm(false);
  };

  const filtered = recipes.filter((r) => {
    const prod = products.find((p) => p.id === r.productId);
    return prod ? prod.name.toLowerCase().includes(searchQuery.toLowerCase()) : false;
  });

  const selectedProduct = products.find((p) => p.id === productId);
  const currentTotalCOGS = calculateTotalCOGS();
  const currentSellingPrice = selectedProduct?.sellingPrice || 0;
  const currentMarginPercentage = calculateMarginPercentage(currentSellingPrice, currentTotalCOGS);
  const currentProfit = currentSellingPrice - currentTotalCOGS;
  const isBelowTarget = selectedProduct
    ? currentMarginPercentage < selectedProduct.targetMargin
    : false;
  const suggestedPrice = selectedProduct
    ? calculateSuggestedPrice(currentTotalCOGS, selectedProduct.targetMargin)
    : 0;

  if (showBrewForm) {
    const activeBrewRecipe = recipes.find((r) => r.id === brewRecipeId);
    const activeBrewProduct = activeBrewRecipe
      ? products.find((p) => p.id === activeBrewRecipe.productId)
      : null;

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowBrewForm(false)}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-bold text-gray-900">Seduh Teh & Siapkan Porsi (Brewing)</h2>
        </div>

        <Card className="max-w-xl">
          <form onSubmit={handleBrew} className="space-y-4">
            <Select
              label="Pilih Resep Penyeduhan"
              id="brewRecipeId"
              options={recipes.map((r) => {
                const p = products.find((prod) => prod.id === r.productId);
                return { value: r.id, label: p ? p.name : 'Resep' };
              })}
              value={brewRecipeId}
              onChange={(e) => setBrewRecipeId(e.target.value)}
              required
            />

            <Input
              label="Jumlah Takaran Seduh (Berapa Batch)"
              id="brewBatchSize"
              type="number"
              value={brewBatchSize}
              onChange={(e) => setBrewBatchSize(e.target.value)}
              helperText="Setiap 1 takar penyeduhan menghasilkan 10 porsi produk"
              required
            />

            {activeBrewRecipe && activeBrewProduct && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-2 text-xs text-blue-900">
                <p className="font-bold text-sm">Bahan Baku yang Akan Dikurangi:</p>
                {activeBrewRecipe.ingredients.map((ri, index) => {
                  const ing = ingredients.find((i) => i.id === ri.ingredientId);
                  const needed = ri.quantity * parseFloat(brewBatchSize || '0');
                  return ing ? (
                    <div key={index} className="flex justify-between">
                      <span>{ing.name}</span>
                      <span className="font-semibold text-right">
                        {needed} {ing.unit} (Stok: {ing.stock} {ing.unit})
                      </span>
                    </div>
                  ) : null;
                })}
                <p className="border-t border-blue-200 pt-2 font-bold mt-2">
                  Hasil Porsi Tambahan: {(activeBrewRecipe.yieldPerBatch || 10) * parseFloat(brewBatchSize || '0')} unit {activeBrewProduct.name}
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-gray-100 flex space-x-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => setShowBrewForm(false)}
                className="flex-1"
              >
                Batal
              </Button>
              <Button type="submit" className="flex-1">
                Proses Seduh
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

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
            {editingId ? 'Edit Resep Produk' : 'Buat Resep Baru'}
          </h2>
        </div>

        <Card className="max-w-xl">
          <form onSubmit={handleSave} className="space-y-4">
            <Select
              label="Pilih Produk"
              id="productId"
              options={products
                .filter((p) => editingId || !recipes.some((r) => r.productId === p.id))
                .map((p) => ({ value: p.id, label: p.name }))}
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              disabled={!!editingId}
              required
            />

            <Input
              label="Hasil Sekali Seduh (Porsi/Cup)"
              id="yieldPerBatch"
              type="number"
              placeholder="Contoh: 10"
              value={yieldPerBatch}
              onChange={(e) => setYieldPerBatch(e.target.value)}
              required
            />

            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-3">
              <h4 className="font-bold text-sm text-gray-800">Komposisi Bahan</h4>

              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Bahan Baku</label>
                  <select
                    value={selectedIngId}
                    onChange={(e) => setSelectedIngId(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 text-sm px-3 py-2 focus:outline-none"
                  >
                    {ingredients.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name} ({formatCurrency(i.costPerUnit)}/{i.unit})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <Input
                    label="Jumlah"
                    id="rowQty"
                    type="number"
                    placeholder="Qty"
                    value={selectedQty}
                    onChange={(e) => setSelectedQty(e.target.value)}
                    className="text-sm px-3 py-2 min-h-[38px]"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleAddIngredientRow}
                  className="px-3 min-h-[38px] text-sm"
                >
                  + Tambah
                </Button>
              </div>

              <div className="border-t border-gray-200 pt-3 space-y-2">
                {recipeIngredients.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">Belum ada bahan terpilih.</p>
                ) : (
                  recipeIngredients.map((ri, index) => {
                    const ing = ingredients.find((i) => i.id === ri.ingredientId);
                    return ing ? (
                      <div key={index} className="flex justify-between items-center text-xs bg-white rounded-lg p-2 border border-gray-100 shadow-sm">
                        <div className="flex-1">
                          <span className="font-bold text-gray-800">{ing.name}</span>
                          <span className="text-gray-500 ml-2">
                            ({ri.quantity} {ing.unit} @ {formatCurrency(ing.costPerUnit)})
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-900">{formatCurrency(ri.cost)}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveIngredientRow(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : null;
                  })
                )}
              </div>
            </div>

            {selectedProduct && (
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <h4 className="font-bold text-sm text-gray-800">Analisis Margin & HPP</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Harga Jual:</span>
                      <span className="font-bold">{formatCurrency(currentSellingPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Estimasi COGS:</span>
                      <span className="font-bold text-gray-900">{formatCurrency(currentTotalCOGS)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Profit:</span>
                      <span className="font-bold text-gray-900">{formatCurrency(currentProfit)}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 flex flex-col justify-center">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Target Margin:</span>
                      <span className="font-bold">{selectedProduct.targetMargin}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Margin Aktual:</span>
                      <span
                        className={`font-extrabold ${
                          isBelowTarget ? 'text-red-500' : 'text-green-600'
                        }`}
                      >
                        {currentMarginPercentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>

                {isBelowTarget && suggestedPrice > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs flex justify-between items-center text-amber-800">
                    <div>
                      <span className="font-semibold">⚠️ Margin di bawah target!</span>
                      <p className="text-[10px] text-amber-600 mt-0.5">
                        Harga yang disarankan: {formatCurrency(Math.ceil(suggestedPrice / 500) * 500)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleApplySuggestedPrice(suggestedPrice)}
                      className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 border-transparent py-1.5 min-h-[36px]"
                    >
                      Terapkan Saran
                    </Button>
                  </div>
                )}
              </div>
            )}

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
                Simpan Resep
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  // Helper to get category gradient for visual identity
  const getGradientClass = (cat: string) => {
    switch (cat) {
      case 'Es Teh':
        return 'from-blue-50 to-amber-100/50 text-blue-900';
      case 'Tahu':
        return 'from-yellow-50 to-amber-100/30 text-amber-800';
      case 'Roti Bakar':
        return 'from-orange-50 to-amber-100/40 text-orange-950';
      default:
        return 'from-gray-50 to-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Coffee className="h-6 w-6 mr-2 text-primary-500" />
            Resep & HPP (BOM)
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Mengelola resep produk, takaran sekali seduh, dan perhitungan profit margin otomatis
          </p>
        </div>
        <div className="flex space-x-2">
          {recipes.length > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                setBrewRecipeId(recipes[0].id);
                setBrewBatchSize('1');
                setShowBrewForm(true);
              }}
              className="text-sm shadow-sm border-gray-200 bg-white min-h-[44px] px-5"
            >
              Menu Seduh
            </Button>
          )}
          <Button
            onClick={handleOpenAdd}
            leftIcon={<Plus className="h-5 w-5" />}
            className="text-sm shadow-sm min-h-[44px]"
          >
            Buat Resep Baru
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex items-center bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <Search className="h-5 w-5 text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Cari resep produk..."
          className="w-full text-sm focus:outline-none bg-transparent"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Recipe Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map((item) => {
          const prod = products.find((p) => p.id === item.productId);
          if (!prod) return null;

          const marginPct = calculateMarginPercentage(prod.sellingPrice, item.totalCOGS);
          const profit = prod.sellingPrice - item.totalCOGS;
          const belowTarget = marginPct < prod.targetMargin;

          return (
            <Card
              key={item.id}
              className={`flex flex-col justify-between overflow-hidden border-none bg-gradient-to-br ${getGradientClass(
                prod.category
              )}`}
              padding="none"
            >
              <div className="p-6 space-y-4">
                {/* Header Card */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm text-lg font-black text-primary-600 select-none border border-gray-50">
                      {prod.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-gray-900 text-base">{prod.name}</h3>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                        {prod.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1.5">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 bg-white text-gray-500 hover:text-gray-900 rounded-xl shadow-sm border border-gray-100 transition-colors"
                      title="Edit Resep"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, prod.name)}
                      className="p-2 bg-white text-red-500 hover:bg-red-50 rounded-xl shadow-sm border border-gray-100 transition-colors"
                      title="Hapus Resep"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Ingredients Section */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/40 space-y-3">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Komposisi Bahan Baku (BOM)
                  </h4>
                  <div className="divide-y divide-gray-100/50 text-xs text-gray-700">
                    {item.ingredients.map((ri, index) => {
                      const ing = ingredients.find((i) => i.id === ri.ingredientId);
                      return ing ? (
                        <div key={index} className="flex justify-between py-2 first:pt-0 last:pb-0">
                          <span className="font-semibold text-gray-800">
                            {ing.name}{' '}
                            <span className="text-gray-400 font-normal">
                              ({ri.quantity} {ing.unit})
                            </span>
                          </span>
                          <span className="font-black text-gray-900">
                            {formatCurrency(ri.cost)}
                          </span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>

              {/* HPP & Margin Summary Section */}
              <div className="border-t border-gray-200/40 bg-white/90 p-6 space-y-4 rounded-b-2xl">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-bold">Harga Jual:</span>
                      <span className="font-extrabold text-gray-800">
                        {formatCurrency(prod.sellingPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-bold">Total HPP:</span>
                      <span className="font-extrabold text-gray-800">
                        {formatCurrency(item.totalCOGS)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5 border-l border-gray-100 pl-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-bold">Sekali Seduh:</span>
                      <span className="font-extrabold text-gray-800">
                        {item.yieldPerBatch || 10} Cup
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-bold">Target Margin:</span>
                      <span className="font-extrabold text-gray-800">
                        {prod.targetMargin}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-sm">
                  <span className="font-extrabold text-gray-800">Margin Aktual:</span>
                  <Badge variant={belowTarget ? 'danger' : 'success'} size="lg">
                    {marginPct.toFixed(0)}% ({formatCurrency(profit)})
                  </Badge>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
export default RecipePage;
