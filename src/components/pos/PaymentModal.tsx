import React, { useState, useEffect } from 'react';
import { PaymentMethod } from '../../types';
import { useCartStore } from '../../stores/cartStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { formatCurrency } from '../../utils/calculations';
import { Button, Modal, Input } from '../common';
import { Wallet, CreditCard, Banknote, RefreshCw } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentMethod: PaymentMethod, amountPaid: number, change: number) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { getSubtotal, getTotalMargin, getMarginPercentage } = useCartStore();
  const { activePaymentMethods } = useSettingsStore();
  const [method, setMethod] = useState<PaymentMethod>(activePaymentMethods[0] || 'cash');
  const [payAmount, setPayAmount] = useState('');
  const [change, setChange] = useState(0);

  // Set default method when active payment options change or modal opens
  useEffect(() => {
    if (isOpen && activePaymentMethods.length > 0) {
      setMethod(activePaymentMethods[0]);
    }
  }, [isOpen, activePaymentMethods]);

  const subtotal = getSubtotal();
  const totalMargin = getTotalMargin();
  const marginPercentage = getMarginPercentage();

  // Set default pay amount for non-cash options
  useEffect(() => {
    if (method !== 'cash') {
      setPayAmount(subtotal.toString());
    } else {
      setPayAmount('');
    }
  }, [method, subtotal]);

  // Calculate change
  useEffect(() => {
    const paid = parseFloat(payAmount) || 0;
    if (paid >= subtotal) {
      setChange(paid - subtotal);
    } else {
      setChange(0);
    }
  }, [payAmount, subtotal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const paid = parseFloat(payAmount) || 0;
    if (paid < subtotal) {
      alert('Nominal pembayaran kurang dari total pesanan!');
      return;
    }
    onSuccess(method, paid, change);
  };

  const quickCashOptions = [
    subtotal,
    subtotal + 5000 - (subtotal % 5000), // round to next 5k
    subtotal + 10000 - (subtotal % 10000), // round to next 10k
    50000,
    100000,
  ].filter((val, index, self) => val >= subtotal && self.indexOf(val) === index);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="PEMBAYARAN">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Info Box */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm text-gray-700">
          <div className="flex justify-between">
            <span>Total Pesanan</span>
            <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-green-600">
            <span>Total Margin</span>
            <span className="font-bold">
              {formatCurrency(totalMargin)} ({marginPercentage.toFixed(0)}%)
            </span>
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Metode Pembayaran
          </label>
          <div className="grid grid-cols-2 gap-2">
            {activePaymentMethods.includes('cash') && (
              <button
                type="button"
                onClick={() => setMethod('cash')}
                className={`p-3 rounded-lg border flex items-center justify-center font-bold text-xs transition-all duration-150 ${
                  method === 'cash'
                    ? 'border-primary-500 bg-primary-50 text-primary-600 shadow-sm'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Banknote className="h-4 w-4 mr-2" />
                💵 Tunai
              </button>
            )}
            {activePaymentMethods.includes('qris') && (
              <button
                type="button"
                onClick={() => setMethod('qris')}
                className={`p-3 rounded-lg border flex items-center justify-center font-bold text-xs transition-all duration-150 ${
                  method === 'qris'
                    ? 'border-primary-500 bg-primary-50 text-primary-600 shadow-sm'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Wallet className="h-4 w-4 mr-2" />
                📱 QRIS Manual
              </button>
            )}
            {activePaymentMethods.includes('transfer') && (
              <button
                type="button"
                onClick={() => setMethod('transfer')}
                className={`p-3 rounded-lg border flex items-center justify-center font-bold text-xs transition-all duration-150 ${
                  method === 'transfer'
                    ? 'border-primary-500 bg-primary-50 text-primary-600 shadow-sm'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                🔄 Transfer
              </button>
            )}
          </div>
        </div>

        {/* Cash options */}
        {method === 'cash' && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Uang Pas</label>
            <div className="flex flex-wrap gap-1.5">
              {quickCashOptions.map((cash) => (
                <button
                  key={cash}
                  type="button"
                  onClick={() => setPayAmount(cash.toString())}
                  className="px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold"
                >
                  {formatCurrency(cash)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input paid amount */}
        <Input
          label="Nominal Bayar (Rp)"
          id="payAmount"
          type="number"
          placeholder="Masukkan nominal bayar"
          value={payAmount}
          onChange={(e) => setPayAmount(e.target.value)}
          required
          disabled={method !== 'cash'}
        />

        {/* Change */}
        {method === 'cash' && (
          <div className="flex justify-between items-center bg-emerald-50 border border-emerald-100 rounded-lg p-3">
            <span className="text-sm font-semibold text-emerald-800">Kembalian:</span>
            <span className="text-lg font-bold text-emerald-600">{formatCurrency(change)}</span>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="pt-4 border-t border-gray-100 flex space-x-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Batal
          </Button>
          <Button type="submit" className="flex-1">
            Proses Pembayaran
          </Button>
        </div>
      </form>
    </Modal>
  );
};
export default PaymentModal;
