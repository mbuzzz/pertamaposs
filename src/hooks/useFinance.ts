import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Expense, Purchase } from '../types';

export function useFinance() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const [expData, purData] = await Promise.all([
      supabase.from('expenses').select('*').order('date', { ascending: false }),
      supabase.from('purchases').select('*').order('date', { ascending: false }),
    ]);
    if (expData.data) {
      setExpenses(expData.data.map((e: any) => ({
        id: e.id,
        description: e.description,
        amount: e.amount,
        outletId: e.outlet_id,
        category: e.category,
        date: e.date,
        createdBy: e.created_by,
      })));
    }
    if (purData.data) {
      setPurchases(purData.data.map((p: any) => ({
        id: p.id,
        ingredientId: p.ingredient_id,
        ingredientName: p.ingredient_name,
        quantity: p.quantity,
        unit: p.unit,
        cost: p.cost,
        outletId: p.outlet_id,
        supplier: p.supplier,
        date: p.date,
        createdBy: p.created_by,
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  async function addExpense(expense: Omit<Expense, 'id'>) {
    await supabase.from('expenses').insert({
      description: expense.description,
      amount: expense.amount,
      outlet_id: expense.outletId,
      category: expense.category,
      date: expense.date,
      created_by: expense.createdBy,
    });
    fetch();
  }

  async function updateExpense(expense: Expense) {
    await supabase.from('expenses').update({
      description: expense.description,
      amount: expense.amount,
      outlet_id: expense.outletId,
      category: expense.category,
      date: expense.date,
    }).eq('id', expense.id);
    fetch();
  }

  async function deleteExpense(id: string) {
    await supabase.from('expenses').delete().eq('id', id);
    fetch();
  }

  async function addPurchase(purchase: Omit<Purchase, 'id'>) {
    const { data } = await supabase.from('purchases').insert({
      ingredient_id: purchase.ingredientId,
      ingredient_name: purchase.ingredientName,
      quantity: purchase.quantity,
      unit: purchase.unit,
      cost: purchase.cost,
      outlet_id: purchase.outletId,
      supplier: purchase.supplier,
      date: purchase.date,
      created_by: purchase.createdBy,
    }).select().single();

    if (data) {
      await supabase.rpc('adjust_ingredient_stock', {
        ingredient_id: purchase.ingredientId,
        amount: purchase.quantity,
      });
    }
    fetch();
  }

  async function updatePurchase(purchase: Purchase) {
    await supabase.from('purchases').update({
      ingredient_id: purchase.ingredientId,
      ingredient_name: purchase.ingredientName,
      quantity: purchase.quantity,
      unit: purchase.unit,
      cost: purchase.cost,
      outlet_id: purchase.outletId,
      supplier: purchase.supplier,
      date: purchase.date,
    }).eq('id', purchase.id);
    fetch();
  }

  async function deletePurchase(id: string) {
    await supabase.from('purchases').delete().eq('id', id);
    fetch();
  }

  return { expenses, purchases, loading, addExpense, updateExpense, deleteExpense, addPurchase, updatePurchase, deletePurchase, refetch: fetch };
}
