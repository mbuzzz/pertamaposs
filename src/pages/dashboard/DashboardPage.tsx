import React from 'react';
import { useAuth } from '../../lib/AuthContext';
import { useShifts } from '../../hooks/useShifts';
import { useTransactions } from '../../hooks/useTransactions';
import { formatCurrency, formatNumber } from '../../utils/calculations';
import { Card, Button, Badge } from '../../components/common';
import { ShoppingCart, Package, BarChart3, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { formatDate } from '../../utils/date';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { profile } = useAuth();
  const { activeShift } = useShifts(profile);
  const { transactions } = useTransactions();
  const navigate = useNavigate();

  const todaySales = transactions.reduce((acc, t) => acc + t.total, 0);
  const transactionCount = transactions.length;
  const totalProfit = transactions.reduce((acc, t) => acc + t.totalMargin, 0);
  const avgMargin = todaySales > 0 ? (totalProfit / todaySales) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Halo, {profile?.name}!
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Hari ini: {formatDate(new Date(), 'EEEE, dd MMMM yyyy')}
          </p>
        </div>
        <div>
          <Badge variant={activeShift ? 'success' : 'warning'} size="lg">
            {activeShift ? 'Shift Aktif' : 'Shift Belum Dibuka'}
          </Badge>
        </div>
      </div>

      {/* Shift status card (if not active) */}
      {!activeShift && (
        <Card className="bg-amber-50 border-amber-200">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-amber-800 font-bold">Shift Belum Aktif</h3>
              <p className="text-amber-700 text-sm mt-1">
                Silakan klik tombol <strong>"Buka Shift"</strong> di bilah biru di atas terlebih dahulu untuk memulai mencatat transaksi POS.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 tablet:grid-cols-3">
        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-primary-100 text-primary-600 rounded-xl">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase">Total Penjualan</p>
            <h3 className="text-lg font-bold text-gray-900 mt-1">
              {formatCurrency(todaySales)}
            </h3>
          </div>
        </Card>

        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase">Transaksi</p>
            <h3 className="text-lg font-bold text-gray-900 mt-1">
              {formatNumber(transactionCount)} Transaksi
            </h3>
          </div>
        </Card>

        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase">Total Profit (Margin %)</p>
            <h3 className="text-lg font-bold text-gray-900 mt-1">
              {formatCurrency(totalProfit)} ({avgMargin.toFixed(0)}%)
            </h3>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Aksi Cepat
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => navigate('/pos')}
            className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gray-200 active:scale-95 transition-transform"
          >
            <ShoppingCart className="h-6 w-6 text-primary-500 mb-2" />
            <span className="text-xs font-semibold text-gray-700">POS</span>
          </button>
          <button
            onClick={() => navigate('/inventory')}
            className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gray-200 active:scale-95 transition-transform"
          >
            <Package className="h-6 w-6 text-primary-500 mb-2" />
            <span className="text-xs font-semibold text-gray-700">Stok</span>
          </button>
          <button
            onClick={() => navigate('/reports')}
            className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gray-200 active:scale-95 transition-transform"
          >
            <BarChart3 className="h-6 w-6 text-primary-500 mb-2" />
            <span className="text-xs font-semibold text-gray-700">Laporan</span>
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Transaksi Terakhir
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/reports')}
            className="text-xs font-bold text-primary-500 py-1 px-2"
          >
            Lihat Semua
          </Button>
        </div>

        {transactions.length === 0 ? (
          <Card className="text-center py-8 text-gray-500 text-sm">
            Belum ada transaksi hari ini.
          </Card>
        ) : (
          <div className="space-y-2">
            {transactions
              .slice()
              .slice(0, 5)
              .map((trx) => (
                <Card
                  key={trx.id}
                  className="flex items-center justify-between py-3 px-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {trx.transactionNumber}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {trx.items.map((i) => `${i.productName} x${i.quantity}`).join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      {formatCurrency(trx.total)}
                    </p>
                    <Badge variant="success" size="sm" className="mt-1">
                      {trx.paymentMethod.toUpperCase()}
                    </Badge>
                  </div>
                </Card>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default DashboardPage;
