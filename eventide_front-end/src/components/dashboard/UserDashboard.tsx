import { Link } from 'react-router-dom';
import { Button, Chip } from '@heroui/react';
import { Ticket, Calendar, Clock, DollarSign, ArrowRight, Compass } from 'lucide-react';
import { MetricCard } from './metric-card';
import type { Booking, User } from '@/api/types';

interface UserStats {
  totalBookings: number;
  upcomingEvents: number;
  pastEvents: number;
  totalSpent: number;
}

interface UserDashboardProps {
  user: User | null;
  stats: UserStats;
  bookings: Booking[];
}

const HOUR = new Date().getHours();
const GREETING = HOUR < 12 ? 'Good morning' : HOUR < 18 ? 'Good afternoon' : 'Good evening';

const UserDashboard = ({ user, stats, bookings }: UserDashboardProps) => {
  const upcomingBookings = bookings.filter(
    (b) => b.status === 'CONFIRMED' && new Date(b.event.startDate) > new Date(),
  );

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          {GREETING}, {user?.name ?? 'there'} 👋
        </h1>
        <p className="text-default-500 mt-1 text-sm">
          Ready to discover your next adventure?
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Upcoming Tickets"
          value={stats.upcomingEvents}
          icon={Ticket}
          color="primary"
        />
        <MetricCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon={Calendar}
          color="secondary"
        />
        <MetricCard
          title="Past Events"
          value={stats.pastEvents}
          icon={Clock}
          color="success"
        />
        <MetricCard
          title="Total Spent"
          value={`$${stats.totalSpent.toLocaleString()}`}
          icon={DollarSign}
          color="warning"
        />
      </div>

      {/* Upcoming events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold">Your Upcoming Events</h2>
          <Button
            as={Link}
            to="/dashboard/my-tickets"
            variant="flat"
            size="sm"
            endContent={<ArrowRight size={14} />}
          >
            All tickets
          </Button>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="card-base p-10 text-center">
            <div className="rounded-full bg-primary/10 p-4 mx-auto w-fit mb-4">
              <Compass size={28} className="text-primary" />
            </div>
            <p className="font-semibold text-sm mb-1">No upcoming events</p>
            <p className="text-xs text-default-400 mb-4">
              Discover events happening near you
            </p>
            <Button as={Link} to="/events" color="primary" size="sm">
              Browse Events
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingBookings.slice(0, 5).map((booking) => (
              <div key={booking.id} className="card-base p-4 flex gap-4">
                {/* Color bar */}
                <div className="w-1 rounded-full gradient-primary flex-none" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{booking.event.name}</p>
                  <p className="text-xs text-default-400 mt-0.5">
                    {new Date(booking.event.startDate).toLocaleDateString(undefined, {
                      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </p>
                  <p className="text-xs text-default-400">{booking.event.city}</p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-none">
                  <Chip size="sm" color="success" variant="flat">
                    Confirmed
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
