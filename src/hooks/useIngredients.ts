import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Ingredient } from '../types';

export function useIngredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data } = await supabase.from('ingredients').select('*').order('name');
    if (data) {
      setIngredients(data.map((i: any) => ({
        id: i.id,
        name: i.name,
        unit: i.unit,
        costPerUnit: i.cost_per_unit,
        stock: i.stock,
        minStock: i.min_stock,
        supplier: i.supplier || '',
        createdAt: i.created_at,
        updatedAt: i.updated_at,
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  async function addIngredient(ingredient: Omit<Ingredient, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data } = await supabase.from('ingredients').insert({
      name: ingredient.name,
      unit: ingredient.unit,
      cost_per_unit: ingredient.costPerUnit,
      stock: ingredient.stock,
      min_stock: ingredient.minStock,
      supplier: ingredient.supplier,
    }).select().single();
    if (data) fetch();
    return data;
  }

  async function updateIngredient(ingredient: Ingredient) {
    await supabase.from('ingredients').update({
      name: ingredient.name,
      unit: ingredient.unit,
      cost_per_unit: ingredient.costPerUnit,
      stock: ingredient.stock,
      min_stock: ingredient.minStock,
      supplier: ingredient.supplier,
    }).eq('id', ingredient.id);
    fetch();
  }

  async function deleteIngredient(id: string) {
    await supabase.from('ingredients').delete().eq('id', id);
    fetch();
  }

  async function adjustStock(id: string, amount: number) {
    await supabase.rpc('adjust_ingredient_stock', { ingredient_id: id, amount });
    fetch();
  }

  return { ingredients, loading, addIngredient, updateIngredient, deleteIngredient, adjustStock, refetch: fetch };
}
