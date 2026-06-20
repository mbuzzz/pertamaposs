import React from 'react';
import { Product } from '../../types';
import { useRecipes } from '../../hooks/useRecipes';
import { formatCurrency, calculateMarginPercentage, isBelowTargetMargin } from '../../utils/calculations';
import { Card, Badge, Button } from '../common';
import { Plus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAdd: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd }) => {
  const { recipes } = useRecipes();

  const recipe = recipes.find((r) => r.productId === product.id);
  const cogs = recipe ? recipe.totalCOGS : product.sellingPrice * 0.5;
  const marginPercentage = calculateMarginPercentage(product.sellingPrice, cogs);
  const profit = product.sellingPrice - cogs;
  const isWarning = isBelowTargetMargin(marginPercentage, product.targetMargin);

  // Gradient colors helper based on category for modern F&B aesthetic
  const getGradientClass = (cat: string) => {
    switch (cat) {
      case 'Es Teh':
        return 'from-amber-200 to-orange-300 text-amber-900';
      case 'Tahu':
        return 'from-yellow-100 to-amber-200 text-amber-800';
      case 'Roti Bakar':
        return 'from-orange-200 to-amber-300 text-orange-950';
      default:
        return 'from-blue-100 to-indigo-200 text-blue-900';
    }
  };

  return (
    <Card hoverable className="flex flex-col justify-between h-full relative overflow-hidden group border-none" padding="sm">
      {/* Product Image representation with modern gradient or uploaded image */}
      <div className="flex-1">
        <div className={`relative w-full aspect-square rounded-2xl bg-gradient-to-tr ${getGradientClass(product.category)} flex flex-col items-center justify-center font-black mb-3 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] transition-transform duration-300 group-hover:scale-105`}>
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover rounded-2xl"
            />
          ) : (
            <span className="text-3xl tracking-wider select-none font-serif">{product.name.charAt(0)}</span>
          )}
          <Badge variant="default" size="sm" className="absolute top-2 left-2 text-[10px] uppercase font-bold tracking-wider opacity-90 border-transparent bg-white/95 text-gray-800 shadow-sm rounded-lg px-2 py-0.5">
            {product.category}
          </Badge>
        </div>
        <h4 className="font-bold text-gray-900 text-sm truncate px-1">{product.name}</h4>
        
        <div className="flex items-baseline justify-between mt-1 px-1">
          <p className="text-primary-600 font-extrabold text-base">
            {formatCurrency(product.sellingPrice)}
          </p>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
              product.stock <= product.minStock 
                ? 'bg-red-50 text-red-600' 
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            Stok: {product.stock}
          </span>
        </div>
      </div>

      <div className="mt-4 px-1 pb-1">
        <Button
          variant="primary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
          className="w-full text-xs font-black shadow-sm flex items-center justify-center py-2.5 min-h-[38px]"
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Tambah
        </Button>
      </div>
    </Card>
  );
};
export default ProductCard;
