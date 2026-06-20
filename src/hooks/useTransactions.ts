import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Transaction, TransactionItem } from '../types';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from('transactions')
      .select('*, transaction_items(*)')
      .order('created_at', { ascending: false })
      .limit(100);
    if (data) {
      setTransactions(data.map((t: any) => ({
        id: t.id,
        transactionNumber: t.transaction_no,
        shiftId: t.shift_id,
        kasirId: t.kasir_id,
        kasirName: t.kasir_name,
        outletId: t.outlet_id,
        items: (t.transaction_items || []).map((ti: any) => ({
          productId: ti.product_id,
          productName: ti.product_name,
          quantity: ti.quantity,
          price: ti.price,
          cogs: ti.cogs,
          margin: ti.margin,
          subtotal: ti.subtotal,
        })),
        subtotal: t.subtotal,
        discount: t.discount,
        total: t.total,
        totalCOGS: t.total_cogs,
        totalMargin: t.total_margin,
        marginPercentage: t.margin_percentage,
        paymentMethod: t.payment_method,
        paymentAmount: t.payment_amount,
        changeAmount: t.change_amount,
        createdAt: t.created_at,
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  async function addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>, items: Omit<TransactionItem, 'id'>[]) {
    const { data: trxData, error } = await supabase
      .from('transactions')
      .insert({
        transaction_no: transaction.transactionNumber,
        shift_id: transaction.shiftId,
        kasir_id: transaction.kasirId,
        kasir_name: transaction.kasirName,
        outlet_id: transaction.outletId,
        subtotal: transaction.subtotal,
        discount: transaction.discount,
        total: transaction.total,
        total_cogs: transaction.totalCOGS,
        total_margin: transaction.totalMargin,
        margin_percentage: transaction.marginPercentage,
        payment_method: transaction.paymentMethod,
        payment_amount: transaction.paymentAmount,
        change_amount: transaction.changeAmount,
      })
      .select()
      .single();

    if (error || !trxData) return;

    const transactionItems = items.map((item) => ({
      transaction_id: trxData.id,
      product_id: item.productId,
      product_name: item.productName,
      quantity: item.quantity,
      price: item.price,
      cogs: item.cogs,
      margin: item.margin,
      subtotal: item.subtotal,
    }));

    await supabase.from('transaction_items').insert(transactionItems);
    fetch();
  }

  return { transactions, loading, addTransaction, refetch: fetch };
}
