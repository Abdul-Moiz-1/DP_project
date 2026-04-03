// src/components/home/SearchBar.tsx
import { Input } from '@heroui/react';
import { SearchIcon } from '../Icons';

interface SearchBarProps {
  query: string;
  onChange: (value: string) => void;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SearchBar = ({
  query,
  onChange,
  placeholder = 'Search...',
  size = 'md',
}: SearchBarProps) => {
  return (
    <Input
      type="search"
      placeholder={placeholder}
      size={size}
      value={query}
      onChange={(e) => onChange(e.target.value)}
      endContent = {<SearchIcon />}
      classNames={{
        base: 'max-w-full flex-1',
        input: 'text-foreground',
        inputWrapper: 'bg-white dark:bg-gray-900 text-foreground shadow-lg',
      }}
    />
  );
};

export default SearchBar;