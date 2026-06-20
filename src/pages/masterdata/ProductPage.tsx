import React, { useState } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { useRecipes } from '../../hooks/useRecipes';
import { useOutlets } from '../../hooks/useOutlets';
import { Product } from '../../types';
import { Button, Card, Input, Select, Badge } from '../../components/common';
import { Plus, Edit2, Trash2, Search, ArrowLeft } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { formatCurrency } from '../../utils/calculations';

export const ProductPage: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { recipes } = useRecipes();
  const { outlets } = useOutlets();
  const { showToast } = useUIStore();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Es Teh');
  const [sellingPrice, setSellingPrice] = useState('');
  const [targetMargin, setTargetMargin] = useState('70');
  const [stock, setStock] = useState('100');
  const [minStock, setMinStock] = useState('10');
  const [maxStock, setMaxStock] = useState('200');
  const [division, setDivision] = useState('Es Teh');
  const [selectedOutlets, setSelectedOutlets] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setCategory('Es Teh');
    setSellingPrice('');
    setTargetMargin('70');
    setStock('100');
    setMinStock('10');
    setMaxStock('200');
    setDivision('Es Teh');
    setSelectedOutlets(outlets.map((o) => o.id));
    setImageUrl('');
    setIsActive(true);
    setShowForm(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setCategory(product.category);
    setSellingPrice(product.sellingPrice.toString());
    setTargetMargin(product.targetMargin.toString());
    setStock(product.stock.toString());
    setMinStock(product.minStock.toString());
    setMaxStock(product.maxStock.toString());
    setDivision(product.division || 'Es Teh');
    setSelectedOutlets(product.outletIds || []);
    setImageUrl(product.imageUrl || '');
    setIsActive(product.isActive);
    setShowForm(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !sellingPrice || !targetMargin) {
      showToast('Wajib memasukkan nama, harga jual, dan target margin!', 'error');
      return;
    }

    if (selectedOutlets.length === 0) {
      showToast('Pilih minimal 1 outlet penugasan!', 'error');
      return;
    }

    const price = parseFloat(sellingPrice);
    const margin = parseFloat(targetMargin);
    const currentStock = parseFloat(stock) || 0;
    const minVal = parseFloat(minStock) || 0;
    const maxVal = parseFloat(maxStock) || 0;

    if (editingId) {
      const existing = products.find((p) => p.id === editingId);
      if (!existing) return;
      const updated: Product = {
        ...existing,
        name,
        category,
        sellingPrice: price,
        targetMargin: margin,
        stock: currentStock,
        minStock: minVal,
        maxStock: maxVal,
        division,
        outletIds: selectedOutlets,
        imageUrl,
        isActive,
        updatedAt: new Date().toISOString(),
      };
      updateProduct(updated);
      showToast('Produk berhasil diperbarui!', 'success');
    } else {
      addProduct({
        name,
        category,
        sellingPrice: price,
        targetMargin: margin,
        stock: currentStock,
        minStock: minVal,
        maxStock: maxVal,
        division,
        outletIds: selectedOutlets,
        imageUrl,
        isActive,
      });
      showToast('Produk baru ditambahkan!', 'success');
    }

    setShowForm(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Hapus produk "${name}"?`)) {
      deleteProduct(id);
      showToast('Produk berhasil dihapus!', 'success');
    }
  };

  const categoryOptions = [
    { value: 'Es Teh', label: 'Es Teh' },
    { value: 'Tahu', label: 'Tahu' },
    { value: 'Roti Bakar', label: 'Roti Bakar' },
    { value: 'Lainnya', label: 'Lainnya' },
  ];

  const divisionOptions = [
    { value: 'Es Teh', label: 'Es Teh' },
    { value: 'Tahu', label: 'Tahu' },
    { value: 'Roti Bakar', label: 'Roti Bakar' },
    { value: 'Lainnya', label: 'Lainnya' },
  ];

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
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
            {editingId ? 'Edit Produk' : 'Tambah Produk Baru'}
          </h2>
        </div>

        <Card className="max-w-xl">
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Nama Produk"
              id="productName"
              type="text"
              placeholder="Contoh: Es Teh Manis Jumbo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Select
              label="Kategori"
              id="category"
              options={categoryOptions}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />

            <Select
              label="Divisi / Bidang Outlet"
              id="division"
              options={divisionOptions}
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Harga Jual (Rp)"
                id="sellingPrice"
                type="number"
                placeholder="Contoh: 5000"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                required
              />

              <Input
                label="Target Margin (%)"
                id="targetMargin"
                type="number"
                placeholder="Contoh: 70"
                value={targetMargin}
                onChange={(e) => setTargetMargin(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Input
                label="Stok Awal"
                id="productStock"
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />

              <Input
                label="Min Stok"
                id="minProdStock"
                type="number"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
              />

              <Input
                label="Max Stok"
                id="maxProdStock"
                type="number"
                value={maxStock}
                onChange={(e) => setMaxStock(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Penugasan Outlet (Multi-select)
              </label>
              <div className="grid grid-cols-2 gap-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                {outlets.map((o) => {
                  const isChecked = selectedOutlets.includes(o.id);
                  return (
                    <label key={o.id} className="flex items-center space-x-2 text-xs font-semibold text-gray-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setSelectedOutlets(selectedOutlets.filter((id) => id !== o.id));
                          } else {
                            setSelectedOutlets([...selectedOutlets, o.id]);
                          }
                        }}
                        className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span>{o.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Upload Gambar Produk
              </label>
              <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-16 h-16 rounded-xl object-cover shadow-sm border border-gray-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center text-xs text-gray-400 font-bold">
                    No Image
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="productActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="productActive" className="text-sm font-semibold text-gray-700">
                Produk Aktif (Dijual)
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
                Simpan Produk
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
          <h2 className="text-xl font-bold text-gray-900">Manajemen Produk</h2>
          <p className="text-sm text-gray-500 mt-1">Mengelola produk yang dijual beserta harga, stok, dan target margin</p>
        </div>
        <Button onClick={handleOpenAdd} leftIcon={<Plus className="h-5 w-5" />}>
          Tambah Produk
        </Button>
      </div>

      <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2">
        <Search className="h-5 w-5 text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Cari produk..."
          className="w-full text-sm focus:outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => {
          const hasRecipe = recipes.some((r) => r.productId === p.id);
          return (
            <Card key={p.id} className="relative flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-12 h-12 rounded-xl object-cover border border-gray-100 shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-400">
                        {p.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">{p.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Kategori: {p.category}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-100 my-3" />

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Harga Jual:</span>
                    <span className="font-bold text-gray-900">{formatCurrency(p.sellingPrice)}</span>
                  </div>
                  {p.division && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Divisi:</span>
                      <span className="font-semibold text-gray-800">{p.division}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Target Margin:</span>
                    <span className="font-semibold text-gray-800">{p.targetMargin}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Resep (BOM):</span>
                    <Badge variant={hasRecipe ? 'success' : 'warning'} size="sm">
                      {hasRecipe ? 'Terhubung' : 'Belum Ada'}
                    </Badge>
                  </div>
                  <div className="flex flex-col space-y-1 pt-1.5 border-t border-gray-50">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Aktif di Outlet:</span>
                    <div className="flex flex-wrap gap-1">
                      {p.outletIds && p.outletIds.length > 0 ? (
                        p.outletIds.map((oId) => {
                          const oName = outlets.find((o) => o.id === oId)?.name || oId;
                          return (
                            <span key={oId} className="bg-blue-50 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-semibold whitespace-nowrap">
                              {oName.replace('Outlet ', '')}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-red-500 text-[10px] italic">Tidak ada outlet</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <Badge variant={p.isActive ? 'success' : 'default'} size="sm">
                      {p.isActive ? 'Aktif' : 'Nonaktif'}
                    </Badge>
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
export default ProductPage;
