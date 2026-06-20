import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '../common';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Cari produk...',
}) => {
  return (
    <Input
      id="search-products"
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      leftIcon={<Search className="h-5 w-5 text-gray-400" />}
      className="bg-white border-gray-200"
    />
  );
};
export default SearchBar;
