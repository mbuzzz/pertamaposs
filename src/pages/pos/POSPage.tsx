import React, { useState } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { useProducts } from '../../hooks/useProducts';
import { useRecipes } from '../../hooks/useRecipes';
import { useShifts } from '../../hooks/useShifts';
import { useTransactions } from '../../hooks/useTransactions';
import { useCartStore } from '../../stores/cartStore';
import { useUIStore } from '../../stores/uiStore';
import { SearchBar, CategoryTabs, ProductCard, Cart, PaymentModal, ReceiptPreview } from '../../components/pos';
import { ShiftBar } from '../../components/layout';
import { Transaction, PaymentMethod } from '../../types';
import { generateTransactionNumber, generateId } from '../../utils/calculations';

export const POSPage: React.FC = () => {
  const { profile } = useAuth();
  const { products, adjustStock } = useProducts();
  const { recipes } = useRecipes();
  const { activeShift } = useShifts(profile);
  const { addTransaction } = useTransactions();
  const { items, addItem, clearCart, getSubtotal, getTotalCOGS, getTotalMargin, getMarginPercentage } = useCartStore();
  const { showToast, selectedOutletId } = useUIStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);

  const categories = Array.from(new Set(products.map((p) => p.category)));
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'Semua' || p.category === activeCategory;
    const matchesDivision =
      !profile?.division || p.division === profile.division;
    const matchesOutlet = !p.outletIds || p.outletIds.length === 0 || p.outletIds.includes(selectedOutletId);
    return matchesSearch && matchesCategory && matchesDivision && matchesOutlet && p.isActive;
  });

  const getItemCOGS = (productId: string): number => {
    const recipe = recipes.find((r) => r.productId === productId);
    return recipe ? recipe.totalCOGS : 0;
  };

  const handlePaySuccess = async (paymentMethod: PaymentMethod, amountPaid: number, change: number) => {
    if (!activeShift || !profile) return;

    const subtotal = getSubtotal();
    const totalCOGS = getTotalCOGS();
    const totalMargin = getTotalMargin();
    const marginPct = getMarginPercentage();

    const transactionItems = items.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      price: item.product.sellingPrice,
      cogs: item.cogs / item.quantity,
      margin: item.margin / item.quantity,
      subtotal: item.subtotal,
    }));

    const transactionData = {
      transactionNumber: generateTransactionNumber(),
      shiftId: activeShift.id,
      kasirId: activeShift.kasirId,
      kasirName: activeShift.kasirName,
      outletId: activeShift.outletId,
      items: transactionItems,
      subtotal,
      discount: 0,
      total: subtotal,
      totalCOGS,
      totalMargin,
      marginPercentage: marginPct,
      paymentMethod,
      paymentAmount: amountPaid,
      changeAmount: change,
    };

    await addTransaction(transactionData, transactionItems);

    items.forEach((item) => {
      adjustStock(item.product.id, -item.quantity);
    });

    const newTransaction: Transaction = {
      id: '',
      ...transactionData,
      createdAt: new Date().toISOString(),
    };

    setCurrentTransaction(newTransaction);
    setIsPaymentOpen(false);
    setIsReceiptOpen(true);
    showToast('Transaksi berhasil diproses!', 'success');
  };

  const handleNewTransaction = () => {
    clearCart();
    setIsReceiptOpen(false);
    setCurrentTransaction(null);
  };

  return (
    <div className="space-y-4">
      <ShiftBar />

      <div className="flex flex-col tablet:flex-row gap-4 h-full">
        <div className="flex-1 space-y-4">
          <div className="flex flex-col gap-3">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
            <CategoryTabs
              categories={categories}
              activeCategory={activeCategory}
              onSelect={setActiveCategory}
            />
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white border border-gray-200 rounded-2xl">
              Produk tidak ditemukan.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={() => {
                    addItem(product, 1, getItemCOGS(product.id));
                    showToast(`${product.name} ditambahkan ke keranjang`, 'success');
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="w-full tablet:w-[320px] desktop:w-[360px] flex-shrink-0">
          <Cart onPay={() => setIsPaymentOpen(true)} />
        </div>

        <PaymentModal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          onSuccess={handlePaySuccess}
        />

        <ReceiptPreview
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          transaction={currentTransaction}
          onNewTransaction={handleNewTransaction}
        />
      </div>
    </div>
  );
};
export default POSPage;
