import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../types';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data } = await supabase.from('products').select('*').order('name');
    if (data) {
      setProducts(data.map((p: any) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        sellingPrice: p.selling_price,
        targetMargin: p.target_margin,
        imageUrl: p.image_url || '',
        stock: p.stock,
        minStock: p.min_stock,
        maxStock: p.max_stock,
        isActive: p.is_active,
        recipeId: undefined, // will be joined separately
        division: p.division,
        outletIds: p.outlet_ids || [],
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  async function addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data } = await supabase.from('products').insert({
      name: product.name,
      category: product.category,
      selling_price: product.sellingPrice,
      target_margin: product.targetMargin,
      image_url: product.imageUrl,
      stock: product.stock,
      min_stock: product.minStock,
      max_stock: product.maxStock,
      is_active: product.isActive,
      division: product.division,
      outlet_ids: product.outletIds,
    }).select().single();
    if (data) fetch();
    return data;
  }

  async function updateProduct(product: Product) {
    await supabase.from('products').update({
      name: product.name,
      category: product.category,
      selling_price: product.sellingPrice,
      target_margin: product.targetMargin,
      image_url: product.imageUrl,
      stock: product.stock,
      min_stock: product.minStock,
      max_stock: product.maxStock,
      is_active: product.isActive,
      division: product.division,
      outlet_ids: product.outletIds,
    }).eq('id', product.id);
    fetch();
  }

  async function deleteProduct(id: string) {
    await supabase.from('products').delete().eq('id', id);
    fetch();
  }

  async function adjustStock(id: string, amount: number) {
    await supabase.rpc('adjust_product_stock', { product_id: id, amount });
    fetch();
  }

  return { products, loading, addProduct, updateProduct, deleteProduct, adjustStock, refetch: fetch };
}
