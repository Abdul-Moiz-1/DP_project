import { Link } from 'react-router-dom';
import { Button } from '@heroui/react';
import { Calendar, Clock, Ticket, DollarSign, Plus, ArrowRight } from 'lucide-react';
import { MetricCard } from './metric-card';
import EventRow from './EventRow';
import type { Event, OrganizerStats } from '@/api/types';
import type { User } from '@/api/types';

const HOUR = new Date().getHours();
const GREETING = HOUR < 12 ? 'Good morning' : HOUR < 18 ? 'Good afternoon' : 'Good evening';

interface OrganizerDashboardProps {
  user: User | null;
  stats: OrganizerStats;
  events: Event[];
  onDeleteClick: (id: number) => void;
}

const OrganizerDashboard = ({ user, stats, events, onDeleteClick }: OrganizerDashboardProps) => {
  const recentEvents = events.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {GREETING}, {user?.name ?? 'Organizer'} 👋
          </h1>
          <p className="text-default-500 mt-1 text-sm">
            Here's what's happening with your events.
          </p>
        </div>
        <Button
          as={Link}
          to="/dashboard/events/create"
          color="primary"
          size="sm"
          startContent={<Plus size={15} />}
          className="flex-none"
        >
          Create Event
        </Button>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Events"
          value={stats.totalEvents}
          icon={Calendar}
          color="primary"
        />
        <MetricCard
          title="Upcoming"
          value={stats.upcomingEvents}
          icon={Clock}
          color="secondary"
        />
        <MetricCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon={Ticket}
          color="success"
        />
        <MetricCard
          title="Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="warning"
        />
      </div>

      {/* Recent events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-lg font-semibold">Recent Events</h2>
            <p className="text-xs text-default-400 mt-0.5">Your latest {recentEvents.length} events</p>
          </div>
          <Button
            as={Link}
            to="/dashboard/events"
            variant="flat"
            size="sm"
            endContent={<ArrowRight size={14} />}
          >
            View all
          </Button>
        </div>

        {recentEvents.length === 0 ? (
          <div className="card-base p-10 text-center">
            <div className="rounded-full bg-primary/10 p-4 mx-auto w-fit mb-4">
              <Calendar size={28} className="text-primary" />
            </div>
            <p className="font-semibold text-sm mb-1">No events yet</p>
            <p className="text-xs text-default-400 mb-4">
              Create your first event to start selling tickets
            </p>
            <Button
              as={Link}
              to="/dashboard/events/create"
              color="primary"
              size="sm"
              startContent={<Plus size={14} />}
            >
              Create Event
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentEvents.map((event) => (
              <EventRow key={event.id} event={event} onDeleteClick={onDeleteClick} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerDashboard;
