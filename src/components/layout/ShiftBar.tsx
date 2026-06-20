import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { useShifts } from '../../hooks/useShifts';
import { useOutlets } from '../../hooks/useOutlets';
import { useCartStore } from '../../stores/cartStore';
import { useUIStore } from '../../stores/uiStore';
import { formatCurrency } from '../../utils/calculations';
import { Button, Modal, Input } from '../common';

export const ShiftBar: React.FC = () => {
  const { profile } = useAuth();
  const { activeShift, openShift, closeShift } = useShifts(profile);
  const { outlets } = useOutlets();
  const { selectedOutletId } = useUIStore();
  const outlet = outlets.find((o) => o.id === selectedOutletId);
  const { items } = useCartStore();
  const { showToast } = useUIStore();

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isCloseModal, setIsCloseModal] = useState(false);
  const [openingBalance, setOpeningBalance] = useState('');
  const [actualBalance, setActualBalance] = useState('');
  const [shiftNumber, setShiftNumber] = useState<'1' | '2' | '3'>('1');
  const [notes, setNotes] = useState('');

  // Auto-popup shift opening modal if shift is not active
  useEffect(() => {
    if (profile && !activeShift) {
      const timer = setTimeout(() => {
        setIsOpenModal(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [profile, activeShift]);

  const handleOpenShift = () => {
    if (!profile) return;
    const balance = parseFloat(openingBalance) || 0;
    openShift(parseInt(shiftNumber) as 1 | 2 | 3, balance, notes);
    showToast('Shift berhasil dibuka!', 'success');
    setIsOpenModal(false);
    setOpeningBalance('');
    setNotes('');
  };

  const handleCloseShift = () => {
    if (!activeShift) return;
    const actual = parseFloat(actualBalance) || 0;
    closeShift(actual, notes);
    showToast('Shift berhasil ditutup!', 'success');
    setIsCloseModal(false);
    setActualBalance('');
    setNotes('');
  };

  if (!profile) return null;

  return (
    <>
      <div className="bg-primary-600 text-white px-6 py-2 flex items-center justify-between text-sm rounded-xl shadow-sm mb-4">
        {activeShift ? (
          <>
            <div className="flex items-center space-x-4 overflow-x-auto py-1">
              <span className="font-semibold whitespace-nowrap">
                Shift {activeShift.shiftNumber} ({activeShift.kasirName})
              </span>
              <span className="opacity-75 hidden tablet:inline">|</span>
              <span className="whitespace-nowrap">
                Saldo Awal: {formatCurrency(activeShift.openingBalance)}
              </span>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (items.length > 0) {
                  showToast('Keranjang belanja harus kosong untuk menutup shift!', 'error');
                  return;
                }
                setIsCloseModal(true);
              }}
              className="text-xs bg-red-700 hover:bg-red-800 focus:ring-red-400 py-1 min-h-[32px] whitespace-nowrap"
            >
              Tutup Shift ⏻
            </Button>
          </>
        ) : (
          <>
            <span className="font-semibold">Shift tidak aktif. Buka shift untuk memulai transaksi.</span>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsOpenModal(true)}
              className="text-xs bg-primary-700 hover:bg-primary-800 focus:ring-primary-400 py-1 min-h-[32px] whitespace-nowrap"
            >
              Buka Shift
            </Button>
          </>
        )}
      </div>

      {/* Open Shift Modal */}
      <Modal
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        title="BUKA SHIFT"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Shift</label>
            <div className="grid grid-cols-3 gap-2">
              {(['1', '2', '3'] as const).map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setShiftNumber(num)}
                  className={`py-3 rounded-lg border text-center font-semibold text-sm transition-all duration-150 ${
                    shiftNumber === num
                      ? 'border-primary-500 bg-primary-50 text-primary-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Shift {num}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Saldo Awal (Rp)"
            id="openingBalance"
            type="number"
            placeholder="Contoh: 100000"
            value={openingBalance}
            onChange={(e) => setOpeningBalance(e.target.value)}
          />

          <Input
            label="Catatan (opsional)"
            id="openNotes"
            type="text"
            placeholder="Tambahkan catatan jika ada"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="pt-4 border-t border-gray-100 flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsOpenModal(false)}
              className="flex-1"
            >
              Batal
            </Button>
            <Button onClick={handleOpenShift} className="flex-1">
              Buka Shift
            </Button>
          </div>
        </div>
      </Modal>

      {/* Close Shift Modal */}
      <Modal
        isOpen={isCloseModal}
        onClose={() => setIsCloseModal(false)}
        title="TUTUP SHIFT"
      >
        {activeShift && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Kasir</span>
                <span className="font-semibold">{activeShift.kasirName}</span>
              </div>
              <div className="flex justify-between">
                <span>Outlet</span>
                <span className="font-semibold">{outlet?.name}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold">
                <span>Saldo Awal</span>
                <span>{formatCurrency(activeShift.openingBalance)}</span>
              </div>
            </div>

            <Input
              label="Saldo Sebenarnya di Kas (Rp)"
              id="actualBalance"
              type="number"
              placeholder="Masukkan total uang cash di laci"
              value={actualBalance}
              onChange={(e) => setActualBalance(e.target.value)}
              required
            />

            <Input
              label="Catatan Penutupan"
              id="closeNotes"
              type="text"
              placeholder="Tambahkan catatan jika ada selisih"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <div className="pt-4 border-t border-gray-100 flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsCloseModal(false)}
                className="flex-1"
              >
                Batal
              </Button>
              <Button variant="danger" onClick={handleCloseShift} className="flex-1">
                Tutup Shift
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
export default ShiftBar;
