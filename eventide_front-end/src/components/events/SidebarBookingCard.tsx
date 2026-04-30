import { useState } from 'react';
import { Button } from '@heroui/react';
import { Heart, Ticket, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TicketType {
  id: number;
  name: string;
  price: number;
  salesStartDate: string | Date;
  salesEndDate: string | Date;
}

interface SidebarBookingCardProps {
  tickets: TicketType[];
  availableSpots: number;
  capacity: number;
  eventEndDate: string | Date;
  onBook: (ticketId: number, qty: number) => void;
  isSaved: boolean;
  savingWishlist: boolean;
  onWishlist: () => void;
}

export default function SidebarBookingCard({
  tickets,
  availableSpots,
  capacity,
  eventEndDate,
  onBook,
  isSaved,
  savingWishlist,
  onWishlist,
}: SidebarBookingCardProps) {
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(
    tickets[0] ?? null,
  );
  const [qty, setQty] = useState(1);

  const hasEnded = new Date(eventEndDate) < new Date();
  const soldOut  = availableSpots <= 0;
  const isDisabled = hasEnded || soldOut;
  const soldPct  = capacity > 0
    ? Math.round(((capacity - availableSpots) / capacity) * 100)
    : 0;

  const total  = (selectedTicket?.price ?? 0) * qty;
  const isFree = selectedTicket?.price === 0;

  return (
    <div className="card-base p-5">
      {/* Price header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          {selectedTicket ? (
            isFree ? (
              <span className="font-display text-2xl font-bold text-success">Free</span>
            ) : (
              <span className="font-display text-2xl font-bold text-foreground">
                ${selectedTicket.price}
                <span className="text-sm font-normal text-default-400 ml-1">/ ticket</span>
              </span>
            )
          ) : (
            <span className="font-display text-lg font-semibold text-default-400">
              Select a ticket
            </span>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-default-500">{availableSpots} spots left</p>
          <p className="text-xs text-default-400">{soldPct}% sold</p>
        </div>
      </div>

      {/* Ticket type selector */}
      {tickets.length > 0 ? (
        <div className="space-y-2 mb-4">
          {tickets.map((ticket) => {
            const now = new Date();
            const saleActive =
              new Date(ticket.salesStartDate) <= now &&
              new Date(ticket.salesEndDate)   >= now;
            const isSelected = selectedTicket?.id === ticket.id;

            return (
              <button
                key={ticket.id}
                disabled={!saleActive}
                onClick={() => saleActive && setSelectedTicket(ticket)}
                className={cn(
                  'w-full flex items-center justify-between p-3 rounded-xl border transition-colors text-left',
                  isSelected
                    ? 'border-primary bg-primary/8'
                    : saleActive
                      ? 'border-divider hover:border-default-400'
                      : 'border-divider opacity-40 cursor-not-allowed',
                )}
              >
                <div>
                  <p className="text-sm font-medium">{ticket.name}</p>
                  <p className="text-xs text-default-400">
                    {saleActive
                      ? `Sales end ${new Date(ticket.salesEndDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
                      : 'Sales closed'}
                  </p>
                </div>
                <span
                  className={cn(
                    'font-semibold text-sm flex-none',
                    isSelected ? 'text-primary' : 'text-foreground',
                  )}
                >
                  {ticket.price === 0 ? 'Free' : `$${ticket.price}`}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-4 mb-4 text-sm text-default-400 border border-dashed border-divider rounded-xl">
          No tickets available
        </div>
      )}

      {/* Quantity stepper */}
      {selectedTicket && !isDisabled && (
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">Quantity</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="h-8 w-8 rounded-full border border-divider flex items-center justify-center text-default-600 hover:bg-default-100 transition-colors"
            >
              <Minus size={14} />
            </button>
            <span className="w-6 text-center font-semibold text-sm">{qty}</span>
            <button
              onClick={() => setQty((q) => Math.min(availableSpots, q + 1))}
              className="h-8 w-8 rounded-full border border-divider flex items-center justify-center text-default-600 hover:bg-default-100 transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Total */}
      {selectedTicket && (
        <div className="flex items-center justify-between py-3 border-t border-divider mb-4">
          <span className="text-sm text-default-500">Total</span>
          <span className="font-bold text-lg">
            {isFree ? 'Free' : `$${total}`}
          </span>
        </div>
      )}

      {/* CTA */}
      <Button
        color="primary"
        className="w-full h-11 font-semibold"
        startContent={<Ticket size={16} />}
        onPress={() => selectedTicket && onBook(selectedTicket.id, qty)}
        isDisabled={isDisabled || !selectedTicket}
      >
        {hasEnded ? 'Event Ended' : soldOut ? 'Sold Out' : 'Reserve spot'}
      </Button>

      <p className="text-xs text-default-400 text-center mt-2">
        No payment required until confirmation
      </p>

      {/* Wishlist */}
      <button
        onClick={onWishlist}
        disabled={savingWishlist}
        className={cn(
          'w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-colors',
          isSaved
            ? 'border-danger/30 bg-danger/8 text-danger'
            : 'border-divider text-default-600 hover:bg-default-100',
        )}
      >
        <Heart size={15} className={isSaved ? 'fill-danger' : ''} />
        {isSaved ? 'Saved to Wishlist' : 'Save to Wishlist'}
      </button>
    </div>
  );
}
