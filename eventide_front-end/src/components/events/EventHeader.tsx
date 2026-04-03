
// src/components/Event/EventHeader.tsx

import { Chip } from '@heroui/react';
import { StarIcon } from '../Icons';
import { BookImageIcon, TicketIcon } from 'lucide-react';



interface EventHeaderProps {
  title: string;
  category: string;
  tags?: string[];
  rating?: number;
  reviewsCount?: number;
  attendees?: number;
  isVerified?: boolean;
}


export default function EventHeader({ title, category, tags = [], rating, reviewsCount, attendees, isVerified }: EventHeaderProps) {
  return (
    <div>
      <div className="flex flex-wrap flex-col gap-2 mb-4">
        <div className='flex gap-3'>
            <Chip color="primary" variant="flat">{category}</Chip>
            {isVerified && <Chip color="success" variant="flat">Verified</Chip>}
        </div>
        <div>
            {tags.slice(0,5).map(t => <Chip key={t} size="sm" variant="bordered">{t}</Chip>)}
        </div>     
      </div>
      <h1 className="text-4xl font-display font-bold mb-4">{title}</h1>
      <div className="flex items-center gap-4 text-default-600">
        <div className="flex items-center gap-1"><StarIcon/> <span className="font-semibold">{rating}</span> <span className="text-sm">({reviewsCount} reviews)</span></div>
        <span>•</span>
        <span> <TicketIcon className='inline mr-2'/> {attendees} bookings done</span>
      </div>
    </div>
  );
}
