import { Input } from '@heroui/react';
import { Search } from 'lucide-react';

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
      startContent={<Search size={16} className="text-default-400 flex-none" />}
      classNames={{
        base: 'max-w-full flex-1',
        input: 'text-foreground',
        inputWrapper: 'bg-transparent shadow-none border-none',
      }}
    />
  );
};

export default SearchBar;
