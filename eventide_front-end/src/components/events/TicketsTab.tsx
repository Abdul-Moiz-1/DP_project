
// src/components/Event/TicketsTab.tsx
import React from 'react';
import { Card, CardBody } from '@heroui/react';
import TicketCard from './TicketsCard';

interface TicketType {
  id: number;
  name: string;
  price: number;
  salesStartDate: Date | string;
  salesEndDate: Date | string;
}

interface TicketsTabProps {
  ticketTypes: TicketType[] | undefined;
  selectedTicketId: string | null;
  onSelectTicket: (id: string) => void;
}

const TicketsTab: React.FC<TicketsTabProps> = ({
  ticketTypes,
  selectedTicketId,
  onSelectTicket,
}) => {
  return (
    <Card>
      <CardBody className="space-y-4">
        {ticketTypes && ticketTypes.map((ticket) => (
          <TicketCard
            key={ticket.id}
            id={ticket.id}
            name={ticket.name}
            price={ticket.price}
            available={10} // to be changed
            selected={ticket.id.toString() === selectedTicketId}
            onSelect={onSelectTicket}
          />
        ))}
      </CardBody>
    </Card>
  );
};

export default TicketsTab;
