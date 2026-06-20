import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Recipe, RecipeIngredient, BrewLog } from '../types';

interface RecipeRow {
  id: string;
  product_id: string;
  total_cogs: number;
  yield_per_batch: number;
  created_at: string;
  updated_at: string;
  recipe_ingredients: {
    id: string;
    ingredient_id: string;
    quantity: number;
    cost: number;
  }[];
}

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [brewLogs, setBrewLogs] = useState<BrewLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from('recipes')
      .select('*, recipe_ingredients(*)')
      .order('created_at');
    if (data) {
      setRecipes((data as RecipeRow[]).map((r) => ({
        id: r.id,
        productId: r.product_id,
        ingredients: (r.recipe_ingredients || []).map((ri) => ({
          ingredientId: ri.ingredient_id,
          quantity: ri.quantity,
          cost: ri.cost,
        })),
        totalCOGS: r.total_cogs,
        yieldPerBatch: r.yield_per_batch,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  async function fetchBrewLogs() {
    const { data } = await supabase
      .from('brew_logs')
      .select('*')
      .order('date', { ascending: false });
    if (data) {
      setBrewLogs(data.map((b: any) => ({
        id: b.id,
        recipeId: b.recipe_id,
        productName: b.product_name,
        batches: b.batches,
        yieldAmount: b.yield_amount,
        date: b.date,
        createdBy: b.created_by,
        outletId: b.outlet_id,
      })));
    }
  }

  async function addRecipe(recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data: recipeData, error } = await supabase
      .from('recipes')
      .insert({
        product_id: recipe.productId,
        total_cogs: recipe.totalCOGS,
        yield_per_batch: recipe.yieldPerBatch,
      })
      .select()
      .single();
    if (error || !recipeData) return;

    const recipeIngredients = recipe.ingredients.map((ing) => ({
      recipe_id: recipeData.id,
      ingredient_id: ing.ingredientId,
      quantity: ing.quantity,
      cost: ing.cost,
    }));
    await supabase.from('recipe_ingredients').insert(recipeIngredients);
    fetch();
  }

  async function updateRecipe(recipe: Recipe) {
    await supabase.from('recipes').update({
      product_id: recipe.productId,
      total_cogs: recipe.totalCOGS,
      yield_per_batch: recipe.yieldPerBatch,
    }).eq('id', recipe.id);

    await supabase.from('recipe_ingredients').delete().eq('recipe_id', recipe.id);
    const recipeIngredients = recipe.ingredients.map((ing) => ({
      recipe_id: recipe.id,
      ingredient_id: ing.ingredientId,
      quantity: ing.quantity,
      cost: ing.cost,
    }));
    await supabase.from('recipe_ingredients').insert(recipeIngredients);
    fetch();
  }

  async function deleteRecipe(id: string) {
    await supabase.from('recipes').delete().eq('id', id);
    fetch();
  }

  function getRecipeByProductId(productId: string) {
    return recipes.find((r) => r.productId === productId);
  }

  async function addBrewLog(log: Omit<BrewLog, 'id'>) {
    await supabase.from('brew_logs').insert({
      recipe_id: log.recipeId,
      product_name: log.productName,
      batches: log.batches,
      yield_amount: log.yieldAmount,
      date: log.date,
      created_by: log.createdBy,
      outlet_id: log.outletId,
    });
    fetchBrewLogs();
  }

  async function deleteBrewLog(id: string) {
    await supabase.from('brew_logs').delete().eq('id', id);
    fetchBrewLogs();
  }

  return {
    recipes, brewLogs, loading,
    addRecipe, updateRecipe, deleteRecipe,
    getRecipeByProductId,
    addBrewLog, deleteBrewLog,
    fetchBrewLogs,
    refetch: fetch,
  };
}
