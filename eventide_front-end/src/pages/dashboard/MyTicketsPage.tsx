import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button, Chip } from '@heroui/react';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import { Booking } from '@/api/types';
import { eventService } from '@/services/eventService';
import { useToast } from '@/components/toast-provider';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200';

function TicketItem({ booking }: { booking: Booking }) {
  const eventDate = new Date(booking.event.startDate);
  const isPast = eventDate < new Date();
  const isCancelled = booking.status === 'CANCELLED';

  return (
    <div className="card-base p-4 flex gap-4">
      <div className="h-16 w-16 rounded-xl overflow-hidden flex-none">
        <img
          src={booking.event.images?.[0]?.imageUrl || FALLBACK_IMG}
          alt={booking.event.name}
          className="h-full w-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{booking.event.name}</p>
        <div className="flex items-center gap-1 text-xs text-default-400 mt-1">
          <Calendar size={11} />
          {eventDate.toLocaleDateString(undefined, {
            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
          })}
        </div>
        <p className="text-xs text-default-400 mt-0.5">
          {booking.ticket.name} · ${booking.ticket.price}
        </p>
      </div>

      <div className="flex flex-col items-end gap-2 flex-none">
        <Chip
          size="sm"
          variant="flat"
          color={isCancelled ? 'danger' : isPast ? 'default' : 'success'}
        >
          {isCancelled ? 'Cancelled' : isPast ? 'Past' : 'Upcoming'}
        </Chip>
        <Button
          as={Link}
          to={`/events/${booking.event.id}`}
          size="sm"
          variant="flat"
        >
          View
        </Button>
      </div>
    </div>
  );
}

export default function MyTicketsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading]   = useState(true);
  const { success, error } = useToast();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.bookingSuccess) {
      success('Booking completed successfully!');
      window.history.replaceState({}, document.title);
    }
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await eventService.fetchMyBookings();
      setBookings(res?.items || []);
    } catch {
      error('Failed to load your tickets');
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const upcoming  = bookings.filter((b) => b.status === 'CONFIRMED' && new Date(b.event.startDate) >= now);
  const past      = bookings.filter((b) => b.status === 'CONFIRMED' && new Date(b.event.startDate) < now);
  const cancelled = bookings.filter((b) => b.status === 'CANCELLED');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">My Tickets</h1>
        <p className="text-default-400 text-sm mt-0.5">
          {bookings.length} ticket{bookings.length !== 1 ? 's' : ''} total
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="card-base p-12 text-center">
          <div className="rounded-full bg-primary/10 p-4 mx-auto w-fit mb-4">
            <Ticket size={28} className="text-primary" />
          </div>
          <p className="font-semibold text-sm mb-1">No tickets yet</p>
          <p className="text-xs text-default-400 mb-4">
            Book an event to see your tickets here
          </p>
          <Button as={Link} to="/events" color="primary" size="sm">
            Browse Events
          </Button>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section>
              <h2 className="font-display text-base font-semibold mb-3">
                Upcoming <span className="text-default-400 font-normal text-sm">({upcoming.length})</span>
              </h2>
              <div className="space-y-2">
                {upcoming.map((b) => <TicketItem key={b.id} booking={b} />)}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2 className="font-display text-base font-semibold mb-3">
                Past <span className="text-default-400 font-normal text-sm">({past.length})</span>
              </h2>
              <div className="space-y-2">
                {past.map((b) => <TicketItem key={b.id} booking={b} />)}
              </div>
            </section>
          )}

          {cancelled.length > 0 && (
            <section>
              <h2 className="font-display text-base font-semibold mb-3 text-default-500">
                Cancelled <span className="font-normal text-sm">({cancelled.length})</span>
              </h2>
              <div className="space-y-2">
                {cancelled.map((b) => <TicketItem key={b.id} booking={b} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
