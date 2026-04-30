import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@heroui/react";
import { ArrowRight, BarChart3, Calendar, DollarSign, Plus, Ticket } from "lucide-react";
import { Event, OrganizerStats } from "@/api/types";
import { eventService } from "@/services/eventService";
import { MetricCard } from "@/components/dashboard/metric-card";
import EventRow, { EventStatusChip } from "@/components/dashboard/EventRow";

const EMPTY_STATS: OrganizerStats = {
  totalEvents: 0,
  upcomingEvents: 0,
  ongoingEvents: 0,
  pastEvents: 0,
  totalRevenue: 0,
  totalBookings: 0,
};

export default function AnalyticsOverviewPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<OrganizerStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [eventsData, statsData] = await Promise.all([
          eventService.fetchMyEvents(),
          eventService.fetchOrganizerStats(),
        ]);

        setEvents(eventsData);
        setStats(statsData);
      } catch {
        setEvents([]);
        setStats(EMPTY_STATS);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const analyticsReadyEvents = useMemo(
    () =>
      [...events].sort(
        (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      ),
    [events],
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Analytics</h1>
          <p className="mt-1 text-sm text-default-500">
            Review revenue, bookings, and capacity across your events.
          </p>
        </div>
        <Button
          as={Link}
          to="/dashboard/events/create"
          color="primary"
          size="sm"
          startContent={<Plus size={15} />}
        >
          Create Event
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Tracked Events" value={stats.totalEvents} icon={Calendar} color="primary" />
        <MetricCard title="Total Bookings" value={stats.totalBookings} icon={Ticket} color="success" />
        <MetricCard title="Upcoming Events" value={stats.upcomingEvents} icon={BarChart3} color="secondary" />
        <MetricCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="warning"
        />
      </div>

      <div className="card-base p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">Event Analytics</h2>
            <p className="text-sm text-default-500">
              Open any event to see ticket sales and booking performance.
            </p>
          </div>
          <Button as={Link} to="/dashboard/events" variant="flat" size="sm" endContent={<ArrowRight size={14} />}>
            Manage events
          </Button>
        </div>

        {analyticsReadyEvents.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <BarChart3 className="h-7 w-7 text-primary" />
            </div>
            <p className="font-medium text-foreground">No event analytics yet</p>
            <p className="mt-1 text-sm text-default-500">
              Create an event first, then you will be able to inspect bookings and revenue here.
            </p>
            <Button
              as={Link}
              to="/dashboard/events/create"
              color="primary"
              size="sm"
              startContent={<Plus size={14} />}
              className="mt-4"
            >
              Create your first event
            </Button>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {analyticsReadyEvents.map((event) => (
              <div key={event.id} className="rounded-2xl border border-divider bg-content1 p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <p className="truncate text-base font-semibold text-foreground">{event.name}</p>
                      <EventStatusChip status={event.status} />
                    </div>
                    <div className="grid gap-3 text-sm text-default-500 sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-default-400">Date</p>
                        <p className="mt-1 text-foreground">
                          {new Date(event.startDate).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-default-400">Location</p>
                        <p className="mt-1 text-foreground">{event.location?.city || "TBD"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-default-400">Bookings</p>
                        <p className="mt-1 text-foreground">
                          {event.bookings ?? 0} / {event.capacity} capacity
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      as={Link}
                      to={`/dashboard/event/${event.id}/analytics`}
                      color="primary"
                      size="sm"
                      endContent={<ArrowRight size={14} />}
                    >
                      View analytics
                    </Button>
                    <Button as={Link} to={`/dashboard/event/${event.id}`} variant="flat" size="sm">
                      Edit event
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {analyticsReadyEvents.length > 0 && (
        <div>
          <h2 className="mb-3 font-display text-lg font-semibold text-foreground">Quick access</h2>
          <div className="space-y-2">
            {analyticsReadyEvents.slice(0, 3).map((event) => (
              <EventRow key={`quick-${event.id}`} event={event} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
