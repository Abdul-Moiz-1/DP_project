// src/components/Event/EventInfoCard.tsx

import { Card, CardBody, Button, Divider, Progress } from '@heroui/react';
import { CalendarIcon, LocationIcon, TicketIcon } from '../Icons';



interface EventInfoCardProps {
  date: Date | string;
  endDate?: Date | string;
  location: string;
  address?: string;
  availableTickets: number;
  totalTickets: number;
}




export default function EventInfoCard({ date, endDate, location, address, availableTickets, totalTickets }: EventInfoCardProps) {
  const soldPercent = ((totalTickets - availableTickets) / totalTickets) * 100;
  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="flex items-start gap-3">
          <CalendarIcon />
          <div>
            <p className="font-semibold">Date & Time</p>
            <p className="text-default-600">{new Date(date).toLocaleString()}</p>
            {endDate && <p className="text-sm text-default-500">Ends: {new Date(endDate).toLocaleString()}</p>}
          </div>
        </div>
        <Divider />
        <div className="flex items-start gap-3">
          <LocationIcon />
          <div>
            <p className="font-semibold">Location</p>
            <p className="text-default-600">{location}</p>
            {address && <p className="text-sm text-default-500">{address}</p>}
          </div>
        </div>
        <Divider />
        <div className="flex items-start gap-3">
          <TicketIcon />
          <div className="flex-1">
            <p className="font-semibold">Availability</p>
            <div className="flex justify-between items-center mb-2">
              <span className="text-default-600">{availableTickets} of {totalTickets} tickets remaining</span>
              <span className="text-sm font-semibold">{soldPercent.toFixed(0)}% sold</span>
            </div>
            <Progress value={soldPercent} className="max-w-md" />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

