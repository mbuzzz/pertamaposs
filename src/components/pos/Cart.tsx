import React from 'react';
import { useCartStore } from '../../stores/cartStore';
import { useShifts } from '../../hooks/useShifts';
import { useAuth } from '../../lib/AuthContext';
import { useUIStore } from '../../stores/uiStore';
import { formatCurrency } from '../../utils/calculations';
import { Button, Card } from '../common';
import { Trash2, ShoppingBag } from 'lucide-react';

interface CartProps {
  onPay: () => void;
}

export const Cart: React.FC<CartProps> = ({ onPay }) => {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    getSubtotal,
    getTotalMargin,
    getMarginPercentage,
  } = useCartStore();

  const { profile } = useAuth();
  const { activeShift } = useShifts(profile);
  const { showToast } = useUIStore();

  const subtotal = getSubtotal();
  const totalMargin = getTotalMargin();
  const marginPercentage = getMarginPercentage();

  const handleCheckout = () => {
    if (!activeShift) {
      showToast('Anda harus membuka shift terlebih dahulu!', 'error');
      return;
    }
    if (items.length === 0) {
      showToast('Keranjang belanja kosong!', 'error');
      return;
    }
    onPay();
  };

  if (items.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center py-12 text-gray-500 h-full">
        <ShoppingBag className="h-12 w-12 text-gray-300 mb-4" />
        <p className="font-semibold text-sm">Keranjang Belanja Kosong</p>
        <p className="text-xs text-gray-400 mt-1">Pilih produk untuk ditambahkan ke keranjang</p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full bg-white max-h-[calc(100vh-220px)] tablet:max-h-[none]" padding="none">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-bold text-gray-800 text-sm flex items-center">
          <ShoppingBag className="h-4 w-4 mr-2 text-primary-500" />
          KERANJANG ({items.length} item)
        </h3>
        <button
          onClick={clearCart}
          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
          title="Kosongkan Keranjang"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-4 space-y-3">
        {items.map((item) => (
          <div key={item.product.id} className="pt-3 first:pt-0">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-gray-800 text-sm leading-tight">
                  {item.product.name}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatCurrency(item.product.sellingPrice)} / unit
                </p>
              </div>
              <div className="text-right">
                <span className="font-bold text-sm text-gray-900">
                  {formatCurrency(item.subtotal)}
                </span>
              </div>
            </div>

            {/* Qty & Margin Row */}
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">
                Margin: {formatCurrency(item.margin)} ({((item.margin / item.subtotal) * 100).toFixed(0)}%)
              </span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center font-bold text-gray-500 hover:bg-gray-50 active:scale-95 transition-all touch-target"
                >
                  −
                </button>
                <span className="w-8 text-center font-bold text-sm text-gray-800">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center font-bold text-gray-500 hover:bg-gray-50 active:scale-95 transition-all touch-target"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      <div className="border-t border-gray-100 p-4 bg-gray-50/50 rounded-b-2xl space-y-3">
        <div className="space-y-1.5 text-xs text-gray-500">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-gray-800">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-primary-600">
            <span>Estimasi Margin</span>
            <span className="font-extrabold">
              {formatCurrency(totalMargin)} ({marginPercentage.toFixed(0)}%)
            </span>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-2 flex justify-between items-center">
          <span className="text-sm font-black text-gray-800">TOTAL</span>
          <span className="text-xl font-black text-primary-500">
            {formatCurrency(subtotal)}
          </span>
        </div>

        <Button onClick={handleCheckout} className="w-full">
          Bayar Sekarang
        </Button>
      </div>
    </Card>
  );
};
export default Cart;
