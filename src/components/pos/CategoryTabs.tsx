import React from 'react';
import { clsx } from 'clsx';

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onSelect: (category: string) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  activeCategory,
  onSelect,
}) => {
  return (
    <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
      <button
        onClick={() => onSelect('Semua')}
        className={clsx(
          'px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors duration-150',
          activeCategory === 'Semua'
            ? 'bg-primary-500 text-white shadow-sm'
            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
        )}
      >
        Semua
      </button>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          className={clsx(
            'px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors duration-150',
            activeCategory === category
              ? 'bg-primary-500 text-white shadow-sm'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          )}
        >
          {category}
        </button>
      ))}
    </div>
  );
};
export default CategoryTabs;
