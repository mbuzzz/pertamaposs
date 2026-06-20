import React, { useState } from 'react';
import { useIngredients } from '../../hooks/useIngredients';
import { useProducts } from '../../hooks/useProducts';
import { useRecipes } from '../../hooks/useRecipes';
import { formatCurrency } from '../../utils/calculations';
import { Card, Badge, Button, Modal, Input } from '../../components/common';
import { useUIStore } from '../../stores/uiStore';
import { Package, Search, PlusCircle, MinusCircle, AlertTriangle } from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const { ingredients, adjustStock: adjustIngStock } = useIngredients();
  const { products, adjustStock: adjustProdStock } = useProducts();
  const { recipes } = useRecipes();
  const { showToast } = useUIStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<{ id: string; name: string; type: 'product' | 'ingredient' } | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [isOpenModal, setIsOpenModal] = useState(false);

  const handleOpenAdjustment = (id: string, name: string, type: 'product' | 'ingredient') => {
    setSelectedItem({ id, name, type });
    setAdjustAmount('');
    setIsOpenModal(true);
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !adjustAmount) return;

    const amount = parseFloat(adjustAmount);
    if (isNaN(amount)) return;

    if (selectedItem.type === 'ingredient') {
      adjustIngStock(selectedItem.id, amount);
    } else {
      adjustProdStock(selectedItem.id, amount);
    }

    showToast(`Stok ${selectedItem.name} berhasil disesuaikan sebesar ${amount > 0 ? '+' : ''}${amount}!`, 'success');
    setIsOpenModal(false);
  };

  const filteredIngredients = ingredients.filter((i) =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Manajemen Inventory</h2>
        <p className="text-sm text-gray-500 mt-1">
          Memantau stok produk, bahan baku, alert stok kritis, dan penyesuaian manual
        </p>
      </div>

      <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2">
        <Search className="h-5 w-5 text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Cari produk atau bahan baku..."
          className="w-full text-sm focus:outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Stock Alert Summary */}
      {ingredients.some((i) => i.stock <= i.minStock) || products.some((p) => p.stock <= p.minStock) ? (
        <Card className="bg-red-50 border-red-200">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-red-800 font-bold">⚠️ Perhatian: Stok Kritis!</h3>
              <p className="text-red-700 text-sm mt-1">
                Beberapa produk atau bahan baku berada di bawah batas minimum. Segera lakukan penyesuaian atau pembelian.
              </p>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ingredients Column */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-gray-900 text-sm border-b border-gray-100 pb-2 flex items-center">
            <Package className="h-5 w-5 mr-2 text-primary-500" />
            BAHAN BAKU (INGREDIENTS)
          </h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {filteredIngredients.map((ing) => {
              const isLow = ing.stock <= ing.minStock;
              return (
                <Card key={ing.id} className="py-3 px-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">{ing.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Stok: {ing.stock} {ing.unit} (Min: {ing.minStock})
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={isLow ? 'danger' : 'success'} size="sm">
                      {isLow ? 'RENDAH' : 'OK'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenAdjustment(ing.id, ing.name, 'ingredient')}
                      className="text-xs px-2.5 min-h-[32px] font-bold"
                    >
                      Sesuaikan
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Products Column */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-gray-900 text-sm border-b border-gray-100 pb-2 flex items-center">
            <Package className="h-5 w-5 mr-2 text-primary-500" />
            PRODUK JADI (PRODUCTS)
          </h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {filteredProducts.map((prod) => {
              const isLow = prod.stock <= prod.minStock;
              return (
                <Card key={prod.id} className="py-3 px-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">{prod.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Stok: {prod.stock} unit (Min: {prod.minStock})
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={isLow ? 'danger' : 'success'} size="sm">
                      {isLow ? 'RENDAH' : 'OK'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenAdjustment(prod.id, prod.name, 'product')}
                      className="text-xs px-2.5 min-h-[32px] font-bold"
                    >
                      Sesuaikan
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        title="PENYESUAIAN STOK"
      >
        {selectedItem && (
          <form onSubmit={handleSaveAdjustment} className="space-y-4">
            <p className="text-sm text-gray-600">
              Menyesuaikan stok untuk <strong>{selectedItem.name}</strong> (tipe:{' '}
              {selectedItem.type === 'ingredient' ? 'Bahan Baku' : 'Produk Jadi'}).
            </p>

            <Input
              label="Jumlah Penyesuaian (Gunakan minus '-' untuk mengurangi)"
              id="adjustAmount"
              type="number"
              placeholder="Contoh: 100 atau -50"
              value={adjustAmount}
              onChange={(e) => setAdjustAmount(e.target.value)}
              required
            />

            <div className="pt-4 border-t border-gray-100 flex space-x-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsOpenModal(false)}
                className="flex-1"
              >
                Batal
              </Button>
              <Button type="submit" className="flex-1">
                Simpan Penyesuaian
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
export default InventoryPage;
