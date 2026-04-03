// src/components/Event/TicketCard.tsx
import { Divider } from '@heroui/react';


interface TicketCardProps {
  id: number;
  name: string;
  price: number;
  available: number;
  selected?: boolean;
  onSelect?: (id: string) => void;
}



export default function TicketCard({ id, name, price, available, selected, onSelect }: TicketCardProps) {
  return (
    <div
      onClick={() => available > 0 && onSelect?.(id.toString())}
      className={`p-4 border-2 rounded-xl transition-all cursor-pointer ${selected ? 'border-primary bg-primary-50' : 'border-default-200 hover:border-default-300'} ${available === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg">{name}</h3>
          <p className="text-sm text-default-500">{available === 0 ? 'Sold Out' : `${available} available`}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">${price}</p>
          <p className="text-xs text-default-500">per ticket</p>
        </div>
      </div>
      <Divider />
    </div>
  );
}
