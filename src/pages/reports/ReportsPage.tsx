import React, { useState } from 'react';
import { useTransactions } from '../../hooks/useTransactions';
import { useOutlets } from '../../hooks/useOutlets';
import { formatCurrency, formatNumber } from '../../utils/calculations';
import { Card, Badge, Button } from '../../components/common';
import { Download, BarChart3, ShoppingCart, TrendingUp, DollarSign, Percent, ArrowUpRight } from 'lucide-react';
import { formatDate } from '../../utils/date';

export const ReportsPage: React.FC = () => {
  const { transactions } = useTransactions();
  const { outlets } = useOutlets();
  const [selectedOutlet, setSelectedOutlet] = useState('All');

  // Filter transactions
  const filteredTrx = transactions.filter(
    (t) => selectedOutlet === 'All' || t.outletId === selectedOutlet
  );

  // Stats calculation
  const totalSales = filteredTrx.reduce((acc, t) => acc + t.total, 0);
  const totalTrxCount = filteredTrx.length;
  const totalProfit = filteredTrx.reduce((acc, t) => acc + t.totalMargin, 0);
  const avgMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

  // Group by Product
  const productStats: Record<string, { name: string; qty: number; sales: number; profit: number }> = {};
  filteredTrx.forEach((t) => {
    t.items.forEach((item) => {
      if (!productStats[item.productId]) {
        productStats[item.productId] = { name: item.productName, qty: 0, sales: 0, profit: 0 };
      }
      productStats[item.productId].qty += item.quantity;
      productStats[item.productId].sales += item.subtotal;
      productStats[item.productId].profit += item.margin;
    });
  });

  // Group by Outlet
  const outletStats: Record<string, { name: string; sales: number; trx: number }> = {};
  outlets.forEach((o) => {
    outletStats[o.id] = { name: o.name, sales: 0, trx: 0 };
  });
  transactions.forEach((t) => {
    if (outletStats[t.outletId]) {
      outletStats[t.outletId].sales += t.total;
      outletStats[t.outletId].trx += 1;
    }
  });

  const handleExportCSV = () => {
    if (filteredTrx.length === 0) {
      alert('Tidak ada data untuk diexport.');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'No Transaksi,Tanggal,Kasir,Outlet,Subtotal,Total,Profit,Metode Pembayaran\n';

    filteredTrx.forEach((t) => {
      const outletName = outlets.find((o) => o.id === t.outletId)?.name || t.outletId;
      const row = [
        t.transactionNumber,
        formatDate(t.createdAt, 'yyyy-MM-dd HH:mm:ss'),
        t.kasirName,
        `"${outletName}"`,
        t.subtotal,
        t.total,
        t.totalMargin,
        t.paymentMethod.toUpperCase(),
      ].join(',');
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan_pos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Find max sales for progress bar percentage
  const maxOutletSales = Math.max(...Object.values(outletStats).map((o) => o.sales), 1);
  const maxProductSales = Math.max(...Object.values(productStats).map((p) => p.sales), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="h-6 w-6 mr-2 text-primary-500" />
            Laporan & Analitik
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Pantau dan analisis pendapatan, margin keuntungan, dan performa outlet PertamaGroup secara real-time
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={selectedOutlet}
            onChange={(e) => setSelectedOutlet(e.target.value)}
            className="rounded-lg border border-gray-300 text-sm px-3 py-2.5 focus:outline-none bg-white font-semibold text-gray-700 shadow-sm min-h-[44px]"
          >
            <option value="All">Semua Outlet</option>
            {outlets.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            onClick={handleExportCSV}
            leftIcon={<Download className="h-4 w-4" />}
            className="text-sm shadow-sm border-gray-300 bg-white hover:bg-gray-50 min-h-[44px]"
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Omset */}
        <Card className="flex items-center space-x-4 bg-gradient-to-br from-blue-50 to-white border-blue-100 p-5">
          <div className="p-3 bg-blue-500 text-white rounded-2xl shadow-md">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-blue-500 font-bold uppercase tracking-wider">Total Omset</p>
            <h3 className="text-xl font-black text-gray-900 mt-1">
              {formatCurrency(totalSales)}
            </h3>
          </div>
        </Card>

        {/* Transaksi */}
        <Card className="flex items-center space-x-4 bg-gradient-to-br from-amber-50 to-white border-amber-100 p-5">
          <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-md">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-amber-600 font-bold uppercase tracking-wider">Total Transaksi</p>
            <h3 className="text-xl font-black text-gray-900 mt-1">
              {formatNumber(totalTrxCount)} <span className="text-xs text-gray-500 font-normal">Trx</span>
            </h3>
          </div>
        </Card>

        {/* Profit */}
        <Card className="flex items-center space-x-4 bg-gradient-to-br from-emerald-50 to-white border-emerald-100 p-5">
          <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-md">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Total Profit</p>
            <h3 className="text-xl font-black text-emerald-600 mt-1">
              {formatCurrency(totalProfit)}
            </h3>
          </div>
        </Card>

        {/* Margin */}
        <Card className="flex items-center space-x-4 bg-gradient-to-br from-purple-50 to-white border-purple-100 p-5">
          <div className="p-3 bg-purple-500 text-white rounded-2xl shadow-md">
            <Percent className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-purple-600 font-bold uppercase tracking-wider">Rata-rata Margin</p>
            <h3 className="text-xl font-black text-purple-600 mt-1">
              {avgMargin.toFixed(0)}%
            </h3>
          </div>
        </Card>
      </div>

      {/* Main Reports Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Outlet */}
        <Card className="space-y-4 p-6" padding="none">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="font-extrabold text-gray-800 text-base flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-primary-500" />
              Kontribusi Penjualan per Outlet
            </h3>
            <Badge variant="info">Outlet Performa</Badge>
          </div>
          <div className="space-y-4">
            {Object.values(outletStats).map((stat, idx) => {
              const percentage = Math.round((stat.sales / maxOutletSales) * 100);
              return (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <p className="font-bold text-gray-800 flex items-center">
                        {stat.name}
                        <ArrowUpRight className="h-3 w-3 text-gray-400 ml-1" />
                      </p>
                      <p className="text-xs text-gray-500">{stat.trx} Transaksi tercatat</p>
                    </div>
                    <span className="font-extrabold text-gray-900">{formatCurrency(stat.sales)}</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Profit by Product */}
        <Card className="space-y-4 p-6" padding="none">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="font-extrabold text-gray-800 text-base flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-primary-500" />
              Profitabilitas Produk Terjual
            </h3>
            <Badge variant="success">Produk Terlaris</Badge>
          </div>
          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
            {Object.keys(productStats).length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">Belum ada transaksi produk terdaftar.</p>
            ) : (
              Object.values(productStats).map((stat, idx) => {
                const marginPct = stat.sales > 0 ? (stat.profit / stat.sales) * 100 : 0;
                const percentage = Math.round((stat.sales / maxProductSales) * 100);

                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <div>
                        <p className="font-bold text-gray-800">{stat.name}</p>
                        <p className="text-xs text-gray-500">Volume penjualan: {stat.qty} porsi</p>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-gray-900">{formatCurrency(stat.sales)}</p>
                        <p className="text-xs text-emerald-600 font-extrabold">
                          Margin: {formatCurrency(stat.profit)} ({marginPct.toFixed(0)}%)
                        </p>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* Transaction History Section */}
      <Card className="space-y-4 p-6" padding="none">
        <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
          <h3 className="font-extrabold text-gray-800 text-base flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-primary-500" />
            Riwayat Transaksi Terbaru
          </h3>
          <Badge variant="default">{filteredTrx.length} Transaksi</Badge>
        </div>

        {/* 1. LAYOUT MOBILE (Block on mobile, hidden on tablet/desktop) */}
        <div className="block sm:hidden space-y-3">
          {filteredTrx.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">Belum ada transaksi tercatat.</p>
          ) : (
            filteredTrx
              .slice()
              .reverse()
              .map((t) => {
                const outletName = outlets.find((o) => o.id === t.outletId)?.name || t.outletId;
                return (
                  <div
                    key={t.id}
                    className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-black text-gray-900">{t.transactionNumber}</span>
                      <Badge variant="info" size="sm">
                        {t.paymentMethod.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-gray-500">
                      <p>Waktu: {formatDate(t.createdAt, 'dd MMM yyyy HH:mm')}</p>
                      <p>Outlet: {outletName}</p>
                      <p>Kasir: {t.kasirName}</p>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-bold block">Profit</span>
                        <span className="font-extrabold text-emerald-600">{formatCurrency(t.totalMargin)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 uppercase font-bold block">Total Bayar</span>
                        <span className="font-black text-gray-900 text-sm">{formatCurrency(t.total)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>

        {/* 2. LAYOUT DESKTOP/TABLET (Hidden on mobile, block on tablet/desktop) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-gray-500 uppercase tracking-wider text-xs">No Transaksi</th>
                <th className="px-4 py-3 text-left font-bold text-gray-500 uppercase tracking-wider text-xs">Waktu</th>
                <th className="px-4 py-3 text-left font-bold text-gray-500 uppercase tracking-wider text-xs">Outlet</th>
                <th className="px-4 py-3 text-left font-bold text-gray-500 uppercase tracking-wider text-xs">Kasir</th>
                <th className="px-4 py-3 text-right font-bold text-gray-500 uppercase tracking-wider text-xs">Total</th>
                <th className="px-4 py-3 text-right font-bold text-gray-500 uppercase tracking-wider text-xs">Profit</th>
                <th className="px-4 py-3 text-center font-bold text-gray-500 uppercase tracking-wider text-xs">Metode</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100 text-xs">
              {filteredTrx.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    Belum ada transaksi tercatat.
                  </td>
                </tr>
              ) : (
                filteredTrx
                  .slice()
                  .reverse()
                  .map((t) => {
                    const outletName = outlets.find((o) => o.id === t.outletId)?.name || t.outletId;
                    return (
                      <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-gray-900 whitespace-nowrap">
                          {t.transactionNumber}
                        </td>
                        <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                          {formatDate(t.createdAt, 'dd MMM yyyy HH:mm:ss')}
                        </td>
                        <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{outletName}</td>
                        <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{t.kasirName}</td>
                        <td className="px-4 py-3.5 text-right font-black text-gray-900 whitespace-nowrap">
                          {formatCurrency(t.total)}
                        </td>
                        <td className="px-4 py-3.5 text-right font-bold text-emerald-600 whitespace-nowrap">
                          {formatCurrency(t.totalMargin)}
                        </td>
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          <Badge variant="info" size="sm">
                            {t.paymentMethod.toUpperCase()}
                          </Badge>
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
export default ReportsPage;
