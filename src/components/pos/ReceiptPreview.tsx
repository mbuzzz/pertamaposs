import React, { useRef } from 'react';
import { Transaction } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import { formatDateTime } from '../../utils/date';
import { Button, Modal } from '../common';
import { Printer, Share2, PlusCircle, CheckCircle } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useOutlets } from '../../hooks/useOutlets';

interface ReceiptPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onNewTransaction: () => void;
}

export const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({
  isOpen,
  onClose,
  transaction,
  onNewTransaction,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const { showToast } = useUIStore();
  const { outlets } = useOutlets();

  const currentOutlet = transaction
    ? outlets.find((o) => o.id === transaction.outletId)
    : null;

  const handlePrint = () => {
    if (!receiptRef.current) return;
    const printContent = receiptRef.current.innerHTML;
    const originalContent = document.body.innerHTML;

    // Create a simple printing environment
    const printWindow = window.open('', '', 'height=600,width=400');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Print Receipt</title>');
      printWindow.document.write('<style>');
      printWindow.document.write(`
        body { font-family: 'Courier New', Courier, monospace; padding: 20px; font-size: 12px; }
        .text-center { text-align: center; }
        .divider { border-top: 1px dashed #000; margin: 10px 0; }
        .flex { display: flex; justify-content: space-between; }
        .font-bold { font-weight: bold; }
        .my-2 { margin-top: 8px; margin-bottom: 8px; }
      `);
      printWindow.document.write('</style></head><body>');
      printWindow.document.write(printContent);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  const handleWhatsApp = () => {
    if (!transaction) return;
    const text = `
*PERTAMAGROUP POS*
No: ${transaction.transactionNumber}
Waktu: ${formatDateTime(transaction.createdAt)}
Kasir: ${transaction.kasirName}
-------------------------
${transaction.items
  .map(
    (item) =>
      `${item.productName}\n  ${item.quantity}x ${formatCurrency(
        item.price
      )} -> ${formatCurrency(item.subtotal)}`
  )
  .join('\n')}
-------------------------
*Total: ${formatCurrency(transaction.total)}*
Bayar via: ${transaction.paymentMethod.toUpperCase()}
Terima kasih!
`;
    const encodedText = encodeURIComponent(text.trim());
    window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
    showToast('Link WhatsApp dibuka!', 'success');
  };

  if (!transaction) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="STRUK PEMBELIAN" showCloseButton={false}>
      <div className="space-y-4">
        {/* Success Icon */}
        <div className="flex flex-col items-center justify-center text-center space-y-2 py-2">
          <CheckCircle className="h-12 w-12 text-green-500" />
          <h3 className="font-bold text-gray-900 text-lg">Transaksi Berhasil!</h3>
        </div>

        {/* Printable Area Wrapper */}
        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex justify-center">
          {/* Main Receipt Content */}
          <div
            ref={receiptRef}
            className="w-full max-w-[280px] bg-white p-4 shadow-sm text-xs font-mono text-gray-800"
          >
            <div className="text-center font-sans space-y-1">
              {currentOutlet?.invoiceHeader ? (
                <div className="whitespace-pre-line text-center font-bold">
                  {currentOutlet.invoiceHeader}
                </div>
              ) : (
                <>
                  <h4 className="font-extrabold text-sm tracking-wide">PERTAMAGROUP POS</h4>
                  <p className="text-[10px] text-gray-500 leading-tight">
                    Outlet Es Teh - Jl. Main Street
                    <br />
                    (021) 1234-5678
                  </p>
                </>
              )}
            </div>

            <div className="border-t border-dashed border-gray-300 my-3" />

            <div className="space-y-1 leading-tight text-[10px]">
              <div className="flex justify-between">
                <span>No:</span>
                <span className="font-semibold">{transaction.transactionNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Waktu:</span>
                <span>{formatDateTime(transaction.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir:</span>
                <span>{transaction.kasirName}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-300 my-3" />

            {/* Items */}
            <div className="space-y-2">
              {transaction.items.map((item) => (
                <div key={item.productId} className="leading-tight">
                  <div className="flex justify-between font-semibold">
                    <span>{item.productName}</span>
                    <span>{formatCurrency(item.subtotal)}</span>
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {item.quantity} x {formatCurrency(item.price)}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-gray-300 my-3" />

            {/* Summary info */}
            <div className="space-y-1 leading-tight">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(transaction.subtotal)}</span>
              </div>
              {transaction.discount > 0 && (
                <div className="flex justify-between">
                  <span>Diskon:</span>
                  <span>-{formatCurrency(transaction.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-gray-900 pt-1 border-t border-gray-100 mt-1">
                <span>TOTAL:</span>
                <span>{formatCurrency(transaction.total)}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-300 my-3" />

            <div className="space-y-1 leading-tight text-[10px]">
              <div className="flex justify-between">
                <span>Pembayaran:</span>
                <span className="font-semibold uppercase">{transaction.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Uang:</span>
                <span>{formatCurrency(transaction.paymentAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Kembalian:</span>
                <span>{formatCurrency(transaction.changeAmount)}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-300 my-3" />

            {currentOutlet?.invoiceFooter ? (
              <div className="text-center font-sans text-[10px] text-gray-500 whitespace-pre-line space-y-1 mt-2">
                {currentOutlet.invoiceFooter}
              </div>
            ) : (
              <div className="text-center font-sans text-[10px] text-gray-500 space-y-1 mt-2">
                <p className="font-semibold">Terima kasih atas kunjungan Anda!</p>
                <p>© PERTAMAGROUP POS 2024</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button
            variant="outline"
            onClick={handlePrint}
            leftIcon={<Printer className="h-4 w-4" />}
          >
            Print Struk
          </Button>
          <Button
            variant="outline"
            onClick={handleWhatsApp}
            leftIcon={<Share2 className="h-4 w-4" />}
          >
            WhatsApp
          </Button>
        </div>

        <Button
          onClick={onNewTransaction}
          className="w-full flex items-center justify-center font-bold"
          leftIcon={<PlusCircle className="h-5 w-5" />}
        >
          Transaksi Baru
        </Button>
      </div>
    </Modal>
  );
};
export default ReceiptPreview;
